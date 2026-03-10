export type WaitlistEvent =
  | "waitlist_form_started"
  | "waitlist_submit_success"
  | "waitlist_submit_failed"
  | "waitlist_duplicate";

export async function captureServerEvent(event: WaitlistEvent, distinctId: string, properties: Record<string, unknown>) {
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (!host || !key) {
    // Do not hard fail signup if analytics is not configured yet.
    return;
  }

  await fetch(`${host}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      event,
      distinct_id: distinctId,
      properties
    })
  });
}
