import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

interface DeleteBody {
  url?: string;
}

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

function getStoragePathFromPublicUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const marker = '/storage/v1/object/public/event-media/';
    const markerIndex = parsedUrl.pathname.indexOf(marker);
    if (markerIndex === -1) {
      return null;
    }
    return parsedUrl.pathname.slice(markerIndex + marker.length);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await isAdminAuthorized();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as DeleteBody;
    const url = body.url?.trim();
    if (!url) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const storagePath = getStoragePathFromPublicUrl(url);
    if (!storagePath) {
      return NextResponse.json({ error: 'Unsupported image URL for delete' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient('service');
    const { error } = await supabase.storage.from('event-media').remove([storagePath]);
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
