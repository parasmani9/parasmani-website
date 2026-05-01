-- Update event_type check constraint to remove 'residential' and add 'hybrid'
alter table public.events drop constraint if exists events_event_type_check;

-- Update existing 'residential' events to 'hybrid' if any exist
update public.events set event_type = 'hybrid' where event_type = 'residential';

-- Add the new constraint
alter table public.events add constraint events_event_type_check check (event_type in ('virtual', 'in-person', 'hybrid'));
