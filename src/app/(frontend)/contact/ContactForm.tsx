"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    try {
      const res = await fetch("/api/contact-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }
      setStatus("success");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg((err as Error).message);
    }
  }

  if (status === "success") {
    return (
      <div className="border border-vermillion/40 bg-vermillion/5 p-6 text-center">
        <p className="font-calligraphy text-2xl text-vermillion mb-2">已收到您的訊息</p>
        <p className="font-serif-zh text-sm text-ink-soft/85">
          感謝您的聯絡，本會將盡快與您聯繫。
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 font-sans-zh text-xs tracking-widest text-vermillion underline"
        >
          再傳送一則訊息 →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Honeypot: hidden from humans, bots tend to fill it. Off-screen rather
          than display:none (which some bots detect). Submissions with a value
          are silently dropped server-side. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <input
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <Field label="姓名 Name" name="name" required />
      <Field label="電郵 Email" name="email" type="email" required />
      <Field label="電話 Phone" name="phone" type="tel" />
      <Field label="留言 Message" name="message" textarea required />

      {status === "error" && (
        <p className="font-sans-zh text-xs text-vermillion">
          傳送失敗：{errorMsg || "請稍後再試"}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-vermillion text-paper py-4 font-sans-zh tracking-[0.3em] text-sm hover:bg-vermillion-deep disabled:opacity-60 transition-colors"
      >
        {status === "submitting" ? "傳送中…" : "傳送訊息 →"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const base =
    "w-full bg-paper border border-stone/30 px-4 py-3 font-serif-zh text-ink placeholder:text-stone/50 focus:border-vermillion focus:outline-none transition-colors";
  return (
    <label className="block">
      <span className="block font-sans-zh text-[10px] tracking-[0.3em] uppercase text-stone mb-2">
        {label} {required && <span className="text-vermillion">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} required={required} rows={5} className={base} />
      ) : (
        <input name={name} type={type} required={required} className={base} />
      )}
    </label>
  );
}
