"use client";

import { FormEvent, useState } from "react";

type ApiResult = {
  status: "created" | "already_exists" | "invalid_input" | "captcha_failed" | "error";
};

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    // TODO(board): Replace this placeholder with actual Turnstile token from widget.
    const turnstileToken = "placeholder-token";

    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        consentMarketing: consent,
        source: "landing_page",
        turnstileToken
      })
    });

    const data = (await response.json()) as ApiResult;
    if (data.status === "created") {
      setMessage("You are on the list. Check your inbox for confirmation.");
      setEmail("");
      return;
    }

    if (data.status === "already_exists") {
      setMessage("You are already on the waitlist.");
      return;
    }

    if (data.status === "captcha_failed") {
      setMessage("Captcha validation failed. Please retry.");
      return;
    }

    setMessage("Something went wrong. Please retry.");
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <section style={{ width: "100%", maxWidth: 520, background: "#fff", borderRadius: 16, padding: "2rem", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
        <h1 style={{ marginTop: 0 }}>Ballstrikers early access</h1>
        <p>Get updates as we roll out the first release.</p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
          />

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
            I consent to receive product updates.
          </label>

          {/* TODO(board): mount Turnstile widget here with NEXT_PUBLIC_TURNSTILE_SITE_KEY */}
          <button type="submit" style={{ padding: 12, borderRadius: 8, border: 0, background: "#0f766e", color: "#fff", cursor: "pointer" }}>
            Join waitlist
          </button>
        </form>

        {message ? <p style={{ marginTop: 12 }}>{message}</p> : null}
      </section>
    </main>
  );
}
