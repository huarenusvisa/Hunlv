-- 华人婚姻绿卡网用户模块数据库
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 40),
  birth_date date not null,
  gender text not null check (gender in ('female','male','nonbinary','private')),
  city text not null,
  state text,
  occupation text,
  bio text check (char_length(coalesce(bio,'')) <= 1000),
  interests text[] not null default '{}',
  avatar_url text,
  status text not null default 'draft' check (status in ('draft','pending','approved','rejected','hidden')),
  is_public boolean not null default false,
  adult_confirmed boolean not null default false,
  identity_confirmed boolean not null default false,
  photo_rights_confirmed boolean not null default false,
  public_consent boolean not null default false,
  consent_version text not null default '2026-07-29',
  consent_at timestamptz,
  moderation_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reporter_id uuid references auth.users(id) on delete set null,
  reason text not null check (reason in ('fake','harassment','underage','stolen_photo','spam','other')),
  details text check (char_length(coalesce(details,'')) <= 2000),
  status text not null default 'open' check (status in ('open','reviewing','closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.profile_reports enable row level security;
alter table public.admin_users enable row level security;

create policy "Public approved profiles are readable"
on public.profiles for select
using (status = 'approved' and is_public = true);

create policy "Users read own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Users update own non-approved fields"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Authenticated users create reports"
on public.profile_reports for insert
to authenticated
with check (reporter_id = auth.uid());

create policy "Admins read all profiles"
on public.profiles for select
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins moderate profiles"
on public.profiles for update
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins read reports"
on public.profile_reports for select
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('profile-photos','profile-photos',true)
on conflict (id) do nothing;

create policy "Users upload own profile photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users update own profile photos"
on storage.objects for update
to authenticated
using (bucket_id = 'profile-photos' and owner = auth.uid());

create policy "Public reads profile photos"
on storage.objects for select
using (bucket_id = 'profile-photos');
