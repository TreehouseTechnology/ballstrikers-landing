import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { captureServerEvent } from "@/lib/analytics";
import { verifyTurnstileToken } from "@/lib/captcha";
import { upsertWaitlistSignup } from "@/lib/waitlist";

const requestSchema = z.object({
  email: z.string().email(),
  consentMarketing: z.boolean(),
  source: z.string().optional(),
  campaign: z.string().optional(),
  referrer: z.string().optional(),
  turnstileToken: z.string().min(1)
});

function getClientIp(request: NextRequest): string | undefined {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
}

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ status: "invalid_input" }, { status: 400 });
  }

  const ip = getClientIp(request);
  const captchaOk = await verifyTurnstileToken(parsed.data.turnstileToken, ip);
  if (!captchaOk) {
    return NextResponse.json({ status: "captcha_failed" }, { status: 400 });
  }

  try {
    const result = await upsertWaitlistSignup(parsed.data);

    if (result.status === "already_exists") {
      await captureServerEvent("waitlist_duplicate", parsed.data.email.toLowerCase(), {
        source: parsed.data.source ?? "landing_page"
      });
      return NextResponse.json({ status: "already_exists" }, { status: 200 });
    }

    await captureServerEvent("waitlist_submit_success", parsed.data.email.toLowerCase(), {
      source: parsed.data.source ?? "landing_page"
    });

    // TODO(board): send confirmation/welcome email via Resend.
    return NextResponse.json({ status: "created" }, { status: 201 });
  } catch (error) {
    await captureServerEvent("waitlist_submit_failed", parsed.data.email.toLowerCase(), {
      reason: "server_error"
    });
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
