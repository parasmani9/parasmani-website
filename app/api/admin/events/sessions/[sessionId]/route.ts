import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

interface SessionUpdateInput {
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const isAuthorized = await isAdminAuthorized();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;
    const body = (await request.json()) as SessionUpdateInput;
    const updatePayload = {
      ...(body.sessionName !== undefined ? { session_name: body.sessionName.trim() } : {}),
      ...(body.startAt !== undefined ? { start_at: body.startAt } : {}),
      ...(body.endAt !== undefined ? { end_at: body.endAt } : {}),
      ...(body.isActive !== undefined ? { is_active: body.isActive } : {}),
    };

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No session update fields provided' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient('service');
    const { data, error } = await supabase
      .from('event_sessions')
      .update(updatePayload)
      .eq('id', sessionId)
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const isAuthorized = await isAdminAuthorized();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;
    const supabase = getSupabaseServerClient('service');
    const { error } = await supabase.from('event_sessions').delete().eq('id', sessionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 }
    );
  }
}
