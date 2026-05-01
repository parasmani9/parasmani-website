export type EventType = 'residential' | 'virtual' | 'in-person';

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
