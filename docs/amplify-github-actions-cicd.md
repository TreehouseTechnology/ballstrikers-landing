# AWS Amplify + GitHub Actions CI/CD

This document stages the deployment pipeline for hosting this landing page on AWS Amplify with GitHub Actions.

## Overview

- CI (`verify` job): on every pull request and push, run lint, typecheck, and build.
- CD (`deploy` job): on `main` pushes (or manual `workflow_dispatch`), trigger an Amplify `RELEASE` job.
- Deployment workflow file: `.github/workflows/amplify-ci-cd.yml`

## 1. AWS Setup

1. Create or confirm an Amplify app for this repository.
2. Note the Amplify App ID and branch that should deploy (`main` by default).
3. Create an IAM role for GitHub OIDC deploys with:
   - Trust policy allowing `token.actions.githubusercontent.com` to assume the role from this GitHub repo.
   - Permissions for Amplify deploy trigger calls:
     - `amplify:StartJob`
     - `amplify:GetJob`
     - `amplify:ListJobs`

## 2. GitHub Repository Setup

Add these repository variables (`Settings -> Secrets and variables -> Actions -> Variables`):

- `AWS_REGION` (example: `us-east-1`)
- `AMPLIFY_APP_ID` (example: `d123example`)
- `AMPLIFY_BRANCH` (example: `main`)

Add this repository secret (`Settings -> Secrets and variables -> Actions -> Secrets`):

- `AWS_AMPLIFY_DEPLOY_ROLE_ARN` (IAM role ARN created for GitHub OIDC)

## 3. Amplify App Environment Variables

Set the application runtime environment variables in Amplify (App settings -> Environment variables), using values from `.env.example`:

- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `POSTHOG_PERSONAL_API_KEY`
- `WAITLIST_RATE_LIMIT_WINDOW_MS` (optional)
- `WAITLIST_RATE_LIMIT_MAX` (optional)

## 4. Local Developer Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in local values for app runtime variables.
3. Run:
   - `pnpm install`
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm build`

Local development does not require AWS credentials unless you want to manually trigger Amplify jobs from your machine.

## 5. Manual Deployment Trigger (Optional)

You can manually run the GitHub workflow from the Actions tab (`workflow_dispatch`) or trigger directly with AWS CLI:

```bash
aws amplify start-job \
  --app-id "$AMPLIFY_APP_ID" \
  --branch-name "$AMPLIFY_BRANCH" \
  --job-type RELEASE
```

## 6. Rollback

- In Amplify Console, redeploy the previous successful build from deployment history.
- If needed, disable or revert the GitHub Actions workflow in a follow-up commit.
