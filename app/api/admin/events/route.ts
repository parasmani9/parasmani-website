import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

interface EventInput {
  title?: string;
  slug?: string;
  description?: string | null;
  eventType?: 'virtual' | 'in-person' | 'hybrid';
  imageUrl?: string | null;
  imageUrls?: string[];
  location?: string | null;
  isPublished?: boolean;
  eventStartAt?: string | null;
  eventEndAt?: string | null;
  sessions?: Array<{
    sessionName?: string;
    startAt?: string;
    endAt?: string;
    isActive?: boolean;
  }>;
}

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function GET() {
  try {
    const isAuthorized = await isAdminAuthorized();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseServerClient('service');
    const { data, error } = await supabase
      .from('events')
      .select('*, event_sessions(*)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await isAdminAuthorized();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as EventInput;
    const title = body.title?.trim();
    const slug = body.slug?.trim().toLowerCase();

    const sanitizedImageUrls = (body.imageUrls ?? [])
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
    const fallbackImageUrl = body.imageUrl?.trim() || null;
    const primaryImageUrl = sanitizedImageUrls[0] ?? fallbackImageUrl;

    if (!title || !slug || !body.eventType) {
      return NextResponse.json(
        { error: 'title, slug, and eventType are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServerClient('service');
    const { data, error } = await supabase
      .from('events')
      .insert({
        title,
        slug,
        event_type: body.eventType,
        description: body.description?.trim() || null,
        image_url: primaryImageUrl,
        image_urls: sanitizedImageUrls,
        location: body.location?.trim() || null,
        is_published: body.isPublished ?? false,
        event_start_at: body.eventStartAt ?? null,
        event_end_at: body.eventEndAt ?? null,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const validSessions = (body.sessions ?? []).filter(
      (session) => session.sessionName && session.startAt && session.endAt
    );

    if (validSessions.length > 0) {
      const { error: sessionInsertError } = await supabase.from('event_sessions').insert(
        validSessions.map((session) => ({
          event_id: data.id,
          session_name: session.sessionName?.trim() ?? '',
          start_at: session.startAt,
          end_at: session.endAt,
          is_active: session.isActive ?? true,
        }))
      );

      if (sessionInsertError) {
        if (sessionInsertError.code === '23505') {
          return NextResponse.json(
            { error: 'Duplicate session names are not allowed for the same event' },
            { status: 400 }
          );
        }
        return NextResponse.json({ error: sessionInsertError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 }
    );
  }
}
