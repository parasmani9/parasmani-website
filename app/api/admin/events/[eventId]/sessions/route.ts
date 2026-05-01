import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

interface SessionInput {
  sessionName?: string;
  startAt?: string;
  endAt?: string;
  isActive?: boolean;
}

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const isAuthorized = await isAdminAuthorized();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await params;
    const body = (await request.json()) as SessionInput;
    const sessionName = body.sessionName?.trim();

    if (!sessionName || !body.startAt || !body.endAt) {
      return NextResponse.json(
        { error: 'sessionName, startAt, and endAt are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient('service');
    const { data, error } = await supabase
      .from('event_sessions')
      .insert({
        event_id: eventId,
        session_name: sessionName,
        start_at: body.startAt,
        end_at: body.endAt,
        is_active: body.isActive ?? true,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 }
    );
  }
}
