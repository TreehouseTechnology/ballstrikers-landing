# AGENTS.md

Repository guide for AI agents working in `ballstrikers-landing`.

This file is intentionally repo-specific. Follow the root-level global agent guidance you were given, then use this document for local architecture, constraints, and working agreements inside this repository.

## 1. Repository Summary

- App type: small Next.js App Router landing page for a waitlist signup flow.
- Runtime split:
  - `app/page.tsx`: client-side landing page and form UI.
  - `app/api/waitlist/route.ts`: server route for validation, captcha verification, persistence, and analytics.
  - `lib/*.ts`: thin integration helpers for Supabase, Turnstile, analytics, and env validation.
- Data store: Supabase table defined in [`docs/supabase-schema.sql`](/Users/justinmakaila/Developer/ballstrikers-landing/docs/supabase-schema.sql).
- Primary user outcome: accept a waitlist email, prevent obvious bot traffic, and record analytics around success, duplicate signup, and failures.

## 2. Current Audit Findings

These are present in the repo as of March 10, 2026. Do not assume the project is fully wired up.

- The project now uses an explicit ESLint flat config in [`eslint.config.mjs`](/Users/justinmakaila/Developer/ballstrikers-landing/eslint.config.mjs) with `eslint-config-next/core-web-vitals`, which is the correct lint path for Next.js 16.
- [`README.md`](/Users/justinmakaila/Developer/ballstrikers-landing/README.md) references `.env.example`, but no `.env.example` file exists in the repository.
- The landing page still uses a placeholder Turnstile token and does not mount a real widget in [`app/page.tsx`](/Users/justinmakaila/Developer/ballstrikers-landing/app/page.tsx).
- The waitlist API includes a TODO for sending confirmation email via Resend in [`app/api/waitlist/route.ts`](/Users/justinmakaila/Developer/ballstrikers-landing/app/api/waitlist/route.ts).
- There are currently no tests in the repository.

If your task is unrelated to these issues, do not silently “fix everything.” Only change what the task requires, but account for these blockers when choosing validation steps.

## 3. File Map

- [`app/layout.tsx`](/Users/justinmakaila/Developer/ballstrikers-landing/app/layout.tsx): root layout and metadata.
- [`app/page.tsx`](/Users/justinmakaila/Developer/ballstrikers-landing/app/page.tsx): landing page UI, client form state, POST to `/api/waitlist`.
- [`app/api/waitlist/route.ts`](/Users/justinmakaila/Developer/ballstrikers-landing/app/api/waitlist/route.ts): request validation with `zod`, Turnstile verification, Supabase write, PostHog-style server capture.
- [`lib/waitlist.ts`](/Users/justinmakaila/Developer/ballstrikers-landing/lib/waitlist.ts): Supabase insert logic and duplicate-email handling.
- [`lib/captcha.ts`](/Users/justinmakaila/Developer/ballstrikers-landing/lib/captcha.ts): Cloudflare Turnstile siteverify request.
- [`lib/analytics.ts`](/Users/justinmakaila/Developer/ballstrikers-landing/lib/analytics.ts): best-effort event capture; failures should not block signup.
- [`lib/env.ts`](/Users/justinmakaila/Developer/ballstrikers-landing/lib/env.ts): `zod` schema for required environment variables. Not currently imported anywhere, but should be the source of truth when env validation is introduced.
- [`docs/supabase-schema.sql`](/Users/justinmakaila/Developer/ballstrikers-landing/docs/supabase-schema.sql): expected database schema.

## 4. Existing Coding Patterns

Match these patterns unless the task is explicitly a refactor.

- Use TypeScript everywhere with strict typing.
- Keep integration boundaries thin and local to `lib/`.
- Validate request bodies at the route boundary with `zod`.
- Normalize emails before uniqueness checks and analytics identity use.
- Prefer small, direct modules over abstraction-heavy architecture. This codebase is intentionally simple.
- Preserve graceful degradation for non-critical integrations:
  - Analytics should not block signup.
  - Missing required infrastructure for core flows should fail explicitly.
- For API responses, use the existing status vocabulary unless a task intentionally expands it:
  - `created`
  - `already_exists`
  - `invalid_input`
  - `captcha_failed`
  - `error`

## 5. Development Constraints

- Package manager: `pnpm` is present and should be preferred over `npm`.
- Framework: Next.js App Router, React 19, TypeScript 5.
- Linting: use `pnpm lint` for ESLint and `pnpm typecheck` for TypeScript.
- Styling: current UI uses inline styles only. Do not introduce a new styling system unless the task requires it.
- Imports: `@/*` path alias imports are configured in [`tsconfig.json`](/Users/justinmakaila/Developer/ballstrikers-landing/tsconfig.json).
- Secrets:
  - Never commit `.env`, `.env.local`, service role keys, or production credentials.
  - `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to client code.
- Networked integrations are real external dependencies:
  - Supabase
  - Cloudflare Turnstile
  - PostHog-compatible capture endpoint
  - Resend

## 6. Environment Contract

The current expected env vars come from [`lib/env.ts`](/Users/justinmakaila/Developer/ballstrikers-landing/lib/env.ts):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_POSTHOG_KEY`

Important nuance:

- Not every variable is used yet. `RESEND_*` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` are planned but not fully wired into runtime behavior.
- When adding env usage, keep server-only variables out of client bundles.
- If you add or change env requirements, update both this file and [`README.md`](/Users/justinmakaila/Developer/ballstrikers-landing/README.md).

## 7. How To Validate Changes

Use the lightest validation that actually proves the change.

Current reality:

- `pnpm lint` runs ESLint through the flat config in [`eslint.config.mjs`](/Users/justinmakaila/Developer/ballstrikers-landing/eslint.config.mjs).
- `pnpm typecheck` runs `tsc --noEmit`.
- `pnpm build` currently succeeds.
- There is no test suite yet.

Validation guidance:

- For documentation-only changes, no build is required.
- For code changes, prefer:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm build` for app-level verification
  - new tests if you introduce non-trivial logic
- If you cannot run meaningful verification because of pre-existing repo issues or missing external configuration, say so explicitly in your final report.

## 8. Change Guidance By Area

### Landing Page

- Keep the form submission UX simple and readable.
- Preserve existing statuses and user-facing messages unless the task is explicitly about UX copy or flow.
- If adding analytics on the client, make sure it does not block submit.
- If integrating Turnstile, replace the placeholder token flow cleanly and document any required script/widget behavior.

### API Route

- Validate all external input with `zod` before side effects.
- Be careful with error semantics:
  - invalid body -> 400
  - captcha failure -> 400
  - duplicate signup -> 200 with `already_exists`
  - successful create -> 201 with `created`
  - unexpected server failure -> 500 with `error`
- Do not leak secrets or raw infrastructure errors to the client.

### Supabase Layer

- Preserve email normalization behavior.
- Respect the unique index on `email_normalized`.
- Keep the service role key server-side only.
- If schema changes are required, update [`docs/supabase-schema.sql`](/Users/justinmakaila/Developer/ballstrikers-landing/docs/supabase-schema.sql) and note any migration implications.

### Analytics

- Current behavior is best-effort fire-and-forget style. Do not make analytics a hard dependency unless the task explicitly requires it.
- Avoid recording unnecessary personal data beyond the current distinct-id usage.

## 9. Product Quality Expectations For This Repo

User-visible changes should answer these questions before merge:

- What does the visitor now experience differently on the landing page?
- What error states can occur, and what recovery path is shown?
- Does the change increase or reduce signup conversion risk?
- Are bot-mitigation changes observable and supportable?
- If a new integration is added, what happens when it is unavailable?

Operational changes should cover:

- required env vars
- schema changes
- third-party configuration
- rollback path if signup flow breaks

## 10. Recommended Agent Workflow

1. Read the files directly involved in your task plus any integration helpers they touch.
2. Check whether your task is blocked by the known `tsconfig.json` or lint-script issues.
3. Make the smallest coherent change.
4. Update docs when behavior, setup, or env requirements change.
5. Report both:
   - what you changed
   - what you could not verify because of existing repo limitations

## 11. Avoid These Mistakes

- Do not assume `.env.example` exists.
- Do not assume Turnstile is already integrated in the UI.
- Do not expose service-role or secret env vars to client components.
- Do not introduce a large design-system or state-management layer into this tiny codebase without a clear need.
- Do not make analytics failures block signup submission.
- Do not “clean up” status names or HTTP semantics casually; the current contract is simple and intentional.

## 12. When Updating This File

Keep this document factual and repository-specific.

Update it when any of the following change:

- architecture or file layout
- validation and build commands
- env contract
- current blockers
- external integrations
- schema ownership or operational setup
