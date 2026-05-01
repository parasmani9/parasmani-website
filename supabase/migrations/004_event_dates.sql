alter table public.events
add column if not exists event_start_at timestamptz,
add column if not exists event_end_at timestamptz;
