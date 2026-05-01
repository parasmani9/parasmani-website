import { NextResponse } from 'next/server';

import { getSupabaseServerClient } from '@/lib/supabase/server';

interface RegisterBody {
  eventId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  notes?: string;
  consent?: boolean;
  sessionIds?: string[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const { eventId, fullName, email, phone, city, notes, consent, sessionIds } = body;

    if (!eventId || !fullName || !email) {
      return NextResponse.json(
        { error: 'eventId, fullName, and email are required' },
        { status: 400 }
      );
    }

    if (consent !== true) {
      return NextResponse.json({ error: 'Consent is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient('service');
    const { data, error } = await supabase.rpc('create_event_registration', {
      p_event_id: eventId,
      p_full_name: fullName.trim(),
      p_email: email.trim().toLowerCase(),
      p_phone: phone?.trim() || null,
      p_city: city?.trim() || null,
      p_notes: notes?.trim() || null,
      p_consent: true,
      p_session_ids: sessionIds && sessionIds.length > 0 ? sessionIds : null,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, registrationId: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 }
    );
  }
}
