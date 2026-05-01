-- Minimal event management schema for Parasmani
create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  event_type text not null check (event_type in ('residential', 'virtual', 'in-person')),
  image_url text,
  location text,
  is_published boolean not null default false,
  registration_open_at timestamptz,
  registration_close_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_sessions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  session_name text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, session_name)
);

create table if not exists public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  city text,
  notes text,
  consent boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.event_registration_sessions (
  registration_id uuid not null references public.event_registrations(id) on delete cascade,
  session_id uuid not null references public.event_sessions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (registration_id, session_id)
);

create unique index if not exists idx_event_registrations_event_email_unique
on public.event_registrations (event_id, lower(email));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at
before update on public.events
for each row execute function public.set_updated_at();

drop trigger if exists trg_event_sessions_updated_at on public.event_sessions;
create trigger trg_event_sessions_updated_at
before update on public.event_sessions
for each row execute function public.set_updated_at();

create or replace function public.create_event_registration(
  p_event_id uuid,
  p_full_name text,
  p_email text,
  p_phone text default null,
  p_city text default null,
  p_notes text default null,
  p_consent boolean default true,
  p_session_ids uuid[] default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_registration_id uuid;
  v_session_count int;
begin
  if p_consent is distinct from true then
    raise exception 'Consent is required';
  end if;

  if not exists (
    select 1
    from public.events e
    where e.id = p_event_id
      and e.is_published = true
      and (e.registration_open_at is null or now() >= e.registration_open_at)
      and (e.registration_close_at is null or now() <= e.registration_close_at)
  ) then
    raise exception 'Event is not open for registration';
  end if;

  insert into public.event_registrations (event_id, full_name, email, phone, city, notes, consent)
  values (p_event_id, p_full_name, lower(trim(p_email)), p_phone, p_city, p_notes, true)
  returning id into v_registration_id;

  if p_session_ids is null or cardinality(p_session_ids) = 0 then
    insert into public.event_registration_sessions (registration_id, session_id)
    select v_registration_id, s.id
    from public.event_sessions s
    where s.event_id = p_event_id
      and s.is_active = true;
  else
    select count(*)
    into v_session_count
    from public.event_sessions s
    where s.event_id = p_event_id
      and s.id = any(p_session_ids)
      and s.is_active = true;

    if v_session_count = 0 then
      raise exception 'No valid sessions selected';
    end if;

    insert into public.event_registration_sessions (registration_id, session_id)
    select v_registration_id, s.id
    from public.event_sessions s
    where s.event_id = p_event_id
      and s.id = any(p_session_ids)
      and s.is_active = true;
  end if;

  return v_registration_id;
exception
  when unique_violation then
    raise exception 'You are already registered for this event';
end;
$$;

revoke all on function public.create_event_registration(uuid, text, text, text, text, text, boolean, uuid[]) from public;
grant execute on function public.create_event_registration(uuid, text, text, text, text, text, boolean, uuid[]) to anon, authenticated;

alter table public.events enable row level security;
alter table public.event_sessions enable row level security;
alter table public.event_registrations enable row level security;
alter table public.event_registration_sessions enable row level security;

drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events
for select
to anon, authenticated
using (is_published = true);

drop policy if exists sessions_public_read on public.event_sessions;
create policy sessions_public_read on public.event_sessions
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.events e
    where e.id = event_sessions.event_id
      and e.is_published = true
  )
);
