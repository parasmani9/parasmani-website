import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await isAdminAuthorized();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseServerClient('service');
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await isAdminAuthorized();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      category,
      unit,
      min_alert_stock,
      expiry_date,
      expiry_alert_days,
      batch_number,
      cost_per_unit,
      supplier_name,
      supplier_contact,
      location,
      image_url,
      notes,
    } = body;

    const updates: Record<string, any> = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof category === 'string' && category.trim()) updates.category = category.trim();
    if (typeof unit === 'string' && unit.trim()) updates.unit = unit.trim().toLowerCase();
    if (min_alert_stock !== undefined) updates.min_alert_stock = Math.max(0, Number(min_alert_stock) || 0);
    if (expiry_date !== undefined) updates.expiry_date = expiry_date ? String(expiry_date).slice(0, 10) : null;
    if (expiry_alert_days !== undefined) updates.expiry_alert_days = Math.max(1, Number(expiry_alert_days) || 30);
    if (batch_number !== undefined) updates.batch_number = batch_number ? String(batch_number).trim() : null;
    if (cost_per_unit !== undefined) updates.cost_per_unit = Math.max(0, Number(cost_per_unit) || 0);
    if (supplier_name !== undefined) updates.supplier_name = supplier_name ? String(supplier_name).trim() : null;
    if (supplier_contact !== undefined) updates.supplier_contact = supplier_contact ? String(supplier_contact).trim() : null;
    if (location !== undefined) updates.location = location ? location.trim() : null;
    if (image_url !== undefined) updates.image_url = image_url || null;
    if (notes !== undefined) updates.notes = notes ? notes.trim() : null;

    const supabase = getSupabaseServerClient('service');
    const { data, error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id)
      .select()
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthorized = await isAdminAuthorized();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseServerClient('service');
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 }
    );
  }
}
