import { createClient } from "@supabase/supabase-js";

export type WaitlistPayload = {
  email: string;
  consentMarketing: boolean;
  source?: string;
  campaign?: string;
  referrer?: string;
  turnstileToken: string;
};

export async function upsertWaitlistSignup(payload: WaitlistPayload) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const client = createClient(url, key, { auth: { persistSession: false } });
  const emailNormalized = payload.email.trim().toLowerCase();

  // NOTE: create a unique index in Supabase on email_normalized.
  const { error } = await client.from("waitlist_signups").insert({
    email: payload.email,
    email_normalized: emailNormalized,
    consent_marketing: payload.consentMarketing,
    source: payload.source ?? null,
    campaign: payload.campaign ?? null,
    referrer: payload.referrer ?? null
  });

  if (!error) {
    return { status: "created" as const };
  }

  if (error.code === "23505") {
    return { status: "already_exists" as const };
  }

  throw error;
}
