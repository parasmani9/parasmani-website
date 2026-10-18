-- ============================================================
-- Migration: 007_inventory_expiry_and_pro_fields.sql
-- Description: Add expiry date, customizable expiry alert window, batch, cost & vendor
-- ============================================================

alter table public.inventory_items 
add column if not exists expiry_date date,
add column if not exists expiry_alert_days integer default 30,
add column if not exists batch_number text,
add column if not exists cost_per_unit numeric default 0,
add column if not exists supplier_name text,
add column if not exists supplier_contact text;

create index if not exists idx_inventory_items_expiry on public.inventory_items(expiry_date);
