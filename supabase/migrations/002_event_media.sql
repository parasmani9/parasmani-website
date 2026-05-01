alter table public.events
add column if not exists image_urls text[] not null default '{}',
add column if not exists video_url text;

update public.events
set image_urls = case
  when image_url is not null and image_url <> '' then array[image_url]
  else '{}'
end
where image_urls = '{}';

insert into storage.buckets (id, name, public)
values ('event-media', 'event-media', true)
on conflict (id) do nothing;
