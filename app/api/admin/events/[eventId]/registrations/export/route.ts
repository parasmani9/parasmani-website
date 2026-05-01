import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

function csvEscape(value: string | null | undefined) {
  const normalizedValue = value ?? '';
  if (normalizedValue.includes(',') || normalizedValue.includes('"') || normalizedValue.includes('\n')) {
    return `"${normalizedValue.replaceAll('"', '""')}"`;
  }
  return normalizedValue;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const isAuthorized = await isAdminAuthorized();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await params;
    const supabase = getSupabaseServerClient('service');

    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('title, slug')
      .eq('id', eventId)
      .single();

    if (eventError || !eventData) {
      return NextResponse.json({ error: eventError?.message ?? 'Event not found' }, { status: 404 });
    }

    const { data: registrations, error: registrationsError } = await supabase
      .from('event_registrations')
      .select('id, full_name, email, phone, city, notes, consent, created_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (registrationsError) {
      return NextResponse.json({ error: registrationsError.message }, { status: 400 });
    }

    const registrationIds = (registrations ?? []).map((registration) => registration.id);
    const sessionsByRegistration = new Map<string, string[]>();

    if (registrationIds.length > 0) {
      const { data: registrationSessions, error: registrationSessionsError } = await supabase
        .from('event_registration_sessions')
        .select('registration_id, event_sessions(session_name)')
        .in('registration_id', registrationIds);

      if (registrationSessionsError) {
        return NextResponse.json({ error: registrationSessionsError.message }, { status: 400 });
      }

      (registrationSessions ?? []).forEach((row) => {
        const registrationId = row.registration_id as string;
        const sessionData = row.event_sessions as { session_name?: string } | { session_name?: string }[] | null;
        const sessionName = Array.isArray(sessionData)
          ? (sessionData[0]?.session_name ?? '').trim()
          : (sessionData?.session_name ?? '').trim();

        if (!sessionName) {
          return;
        }

        const existing = sessionsByRegistration.get(registrationId) ?? [];
        existing.push(sessionName);
        sessionsByRegistration.set(registrationId, existing);
      });
    }

    const header = [
      'full_name',
      'email',
      'phone',
      'city',
      'notes',
      'consent',
      'selected_sessions',
      'registered_at',
    ];
    const rows = (registrations ?? []).map((registration) => [
      registration.full_name,
      registration.email,
      registration.phone,
      registration.city,
      registration.notes,
      registration.consent ? 'true' : 'false',
      (sessionsByRegistration.get(registration.id) ?? []).join(' | '),
      registration.created_at,
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => csvEscape(cell as string | null | undefined)).join(','))
      .join('\n');

    const dateStamp = new Date().toISOString().split('T')[0];
    const safeSlug = eventData.slug?.replace(/[^a-z0-9-_]/gi, '-') ?? 'event';
    const fileName = `${safeSlug}-registrations-${dateStamp}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 }
    );
  }
}
