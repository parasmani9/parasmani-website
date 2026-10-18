-- ============================================================
-- Migration: 006_inventory_management.sql
-- Description: Simple, flexible Inventory & Stock Tracker for V1
-- ============================================================

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'General',
  unit text not null default 'pcs',
  current_stock numeric not null default 0 check (current_stock >= 0),
  min_alert_stock numeric default 0,
  location text,
  image_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_inventory_items_category on public.inventory_items(category);
create index if not exists idx_inventory_items_name on public.inventory_items(name);

drop trigger if exists trg_inventory_items_updated_at on public.inventory_items;
create trigger trg_inventory_items_updated_at
before update on public.inventory_items
for each row execute function public.set_updated_at();

-- Inventory transaction logs
create table if not exists public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  change_type text not null check (change_type in ('stock_in', 'stock_out', 'set')),
  quantity_change numeric not null,
  resulting_stock numeric not null,
  reason text,
  recorded_by text,
  created_at timestamptz not null default now()
);

create index if not exists idx_inventory_logs_item_id on public.inventory_logs(item_id);
create index if not exists idx_inventory_logs_created_at on public.inventory_logs(created_at desc);

-- Storage bucket for product photos
insert into storage.buckets (id, name, public)
values ('inventory-media', 'inventory-media', true)
on conflict (id) do nothing;

-- Enable RLS
alter table public.inventory_items enable row level security;
alter table public.inventory_logs enable row level security;
