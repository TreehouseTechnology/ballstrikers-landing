create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null,
  consent_marketing boolean not null default false,
  source text,
  campaign text,
  referrer text,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_signups_email_normalized_uniq
  on public.waitlist_signups (email_normalized);
