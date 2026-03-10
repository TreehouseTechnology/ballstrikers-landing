# Ballstrikers Landing Scaffold

Minimal scaffold for the Ballstrikers waitlist landing page with:

- Next.js app shell
- Waitlist API route
- Supabase write placeholder
- Turnstile CAPTCHA verification hook
- PostHog capture hooks (self-hosted compatible)
- `.env.example` for required credentials

## Quick Start

1. `cp .env.example .env.local`
2. Fill in all required values in `.env.local`
3. `pnpm install`
4. `pnpm dev`

## Notes for Board Setup

- Replace placeholder Turnstile token in `app/page.tsx` with widget-generated token.
- Add Resend email send in `app/api/waitlist/route.ts` where TODO is marked.
- Run `docs/supabase-schema.sql` in Supabase SQL editor.
- For self-hosted PostHog, set `NEXT_PUBLIC_POSTHOG_HOST` and `NEXT_PUBLIC_POSTHOG_KEY` from your deployment.
- Bot traffic analysis starter:
  - enable Turnstile analytics dashboard
  - log per-request risk metadata to a `bot_events` table (IP hash, UA hash, result, timestamp)
  - create a daily report on captcha failures and signup conversion by traffic source
