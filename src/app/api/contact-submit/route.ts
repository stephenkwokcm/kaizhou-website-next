import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

// In-memory fixed-window rate limiter. NOTE: this is per-instance state — fine
// for a single standalone deployment, but if this app is ever horizontally
// scaled the counts won't be shared across instances and a shared store
// (Redis / Upstash) would be required instead.
//
// DEPLOYMENT REQUIREMENT: the client IP is read from `x-forwarded-for`, which a
// client can forge unless a trusted reverse proxy OVERWRITES it with the real
// peer address. Deploy this app behind such a proxy. Without one, both the rate
// limit and the per-IP keying can be bypassed by spoofing the header.
const RATE_LIMIT_MAX = 5; // submissions allowed per window per IP
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
// Hard cap on distinct buckets, so a flood of (possibly forged) IPs within a
// single window can't grow the map without bound. At capacity, new IPs are
// rejected (fail-closed) until expired buckets are pruned.
const RATE_LIMIT_MAX_BUCKETS = 10_000;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function pruneExpired(now: number) {
  for (const [ip, bucket] of rateLimitBuckets) {
    if (bucket.resetAt <= now) rateLimitBuckets.delete(ip);
  }
}

/** Returns true if this IP is over its limit for the current window. */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  // Keep the map memory-bounded by dropping expired buckets each call.
  pruneExpired(now);

  const bucket = rateLimitBuckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    // Memory guard: if we're at capacity with live buckets, fail closed rather
    // than allocate an unbounded number of entries.
    if (rateLimitBuckets.size >= RATE_LIMIT_MAX_BUCKETS) return true;
    rateLimitBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (bucket.count >= RATE_LIMIT_MAX) return true;
  bucket.count += 1;
  return false;
}

export async function POST(req: Request) {
  // Rate-limit first, before reading the body, so abusive callers can't make
  // us pay the cost of parsing/processing large payloads.
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { message: "提交過於頻繁，請稍後再試。" },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot: a hidden field humans never see. If it's filled, treat the
  // request as spam — silently return success WITHOUT creating an enquiry so
  // we don't reveal the trap to bots.
  if (String(body.company || "").trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const phone = body.phone ? String(body.phone).trim() : undefined;
  const message = String(body.message || "").trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { message: "請填寫必填欄位 (name, email, message)" },
      { status: 422 },
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ message: "電郵格式不正確" }, { status: 422 });
  }
  // Length caps (after trimming, before persisting) to prevent DB / memory
  // exhaustion via oversized fields.
  if (
    name.length > 100 ||
    email.length > 254 ||
    (phone && phone.length > 40) ||
    message.length > 5000
  ) {
    return NextResponse.json({ message: "輸入內容過長" }, { status: 422 });
  }

  try {
    const payload = await getPayloadClient();
    const created = await payload.create({
      collection: "enquiries",
      data: { name, email, phone, message, readStatus: false },
    });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (err) {
    console.error("[contact-submit] failed:", err);
    return NextResponse.json(
      { message: "伺服器暫時無法處理請求，請稍後再試。" },
      { status: 500 },
    );
  }
}
