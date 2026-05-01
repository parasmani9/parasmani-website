import { randomUUID } from 'node:crypto';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await isAdminAuthorized();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are supported' }, { status: 400 });
    }

    const fileBuffer = await file.arrayBuffer();
    const fileExtension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
    const filePath = `events/${Date.now()}-${randomUUID()}.${fileExtension}`;
    const supabase = getSupabaseServerClient('service');
    const { error } = await supabase.storage
      .from('event-media')
      .upload(filePath, fileBuffer, { contentType: file.type, upsert: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { data } = supabase.storage.from('event-media').getPublicUrl(filePath);
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 }
    );
  }
}
