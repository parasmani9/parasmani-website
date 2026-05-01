import { NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { EventRow, EventSessionRow } from '@/lib/supabase/types';

type EventWithSessions = EventRow & {
  event_sessions: EventSessionRow[];
};

export async function GET() {
  try {
    const supabase = getSupabaseServerClient('anon');
    const { data, error } = await supabase
      .from('events')
      .select('*, event_sessions(*)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const events = ((data ?? []) as EventWithSessions[]).map((event) => ({
      ...event,
      event_sessions: [...(event.event_sessions ?? [])].sort(
        (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
      ),
    }));

    return NextResponse.json({ data: events });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 }
    );
  }
}
