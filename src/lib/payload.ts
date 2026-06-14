import { getPayload } from "payload";
import config from "@payload-config";

let cached: Awaited<ReturnType<typeof getPayload>> | null = null;

export async function getPayloadClient() {
  if (cached) return cached;
  cached = await getPayload({ config });
  return cached;
}

/**
 * Wrap a Payload query so the page still renders if the database isn't
 * configured / reachable yet (placeholder fallbacks take over).
 */
export async function safePayloadQuery<T>(
  fn: (payload: Awaited<ReturnType<typeof getPayload>>) => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    const payload = await getPayloadClient();
    return await fn(payload);
  } catch (err) {
    console.error("[payload] query failed, using fallback:", (err as Error).message);
    return fallback;
  }
}
