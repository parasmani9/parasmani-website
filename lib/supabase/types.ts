export type EventType = 'virtual' | 'in-person' | 'hybrid';

export interface EventRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  event_type: EventType;
  image_url: string | null;
  image_urls: string[];
  location: string | null;
  is_published: boolean;
  event_start_at: string | null;
  event_end_at: string | null;
  registration_open_at: string | null;
  registration_close_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventSessionRow {
  id: string;
  event_id: string;
  session_name: string;
  start_at: string;
  end_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type InventoryUnit = 'pcs' | 'meters' | 'rolls' | 'boxes' | 'packets' | 'kg' | 'liters' | 'sets';

export interface InventoryItemRow {
  id: string;
  name: string;
  category: string;
  unit: string;
  current_stock: number;
  min_alert_stock?: number;
  expiry_date: string | null;
  expiry_alert_days: number;
  batch_number: string | null;
  cost_per_unit: number;
  supplier_name: string | null;
  supplier_contact: string | null;
  location: string | null;
  image_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryLogRow {
  id: string;
  item_id: string;
  change_type: 'stock_in' | 'stock_out' | 'set';
  quantity_change: number;
  resulting_stock: number;
  reason: string | null;
  recorded_by: string | null;
  created_at: string;
}

