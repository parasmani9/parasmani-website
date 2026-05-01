import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

interface UpdateEventInput {
  title?: string;
  slug?: string;
  description?: string | null;
  eventType?: 'residential' | 'virtual' | 'in-person';
  imageUrl?: string | null;
  imageUrls?: string[];
  location?: string | null;
  isPublished?: boolean;
}

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const isAuthorized = await isAdminAuthorized();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = await params;
    const body = (await request.json()) as UpdateEventInput;

    const sanitizedImageUrls =
      body.imageUrls !== undefined
        ? body.imageUrls.map((value) => value.trim()).filter((value) => value.length > 0)
        : undefined;
    const fallbackImageUrl =
      body.imageUrl !== undefined ? body.imageUrl?.trim() || null : undefined;
    const primaryImageUrl =
      sanitizedImageUrls !== undefined ? (sanitizedImageUrls[0] ?? null) : fallbackImageUrl;

    const updatePayload = {
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
      ...(body.slug !== undefined ? { slug: body.slug.trim().toLowerCase() } : {}),
      ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
      ...(body.eventType !== undefined ? { event_type: body.eventType } : {}),
      ...(primaryImageUrl !== undefined ? { image_url: primaryImageUrl } : {}),
      ...(sanitizedImageUrls !== undefined ? { image_urls: sanitizedImageUrls } : {}),
      ...(body.location !== undefined ? { location: body.location?.trim() || null } : {}),
      ...(body.isPublished !== undefined ? { is_published: body.isPublished } : {}),
    };

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No update fields provided' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient('service');
    const { data, error } = await supabase
      .from('events')
      .update(updatePayload)
      .eq('id', eventId)
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
