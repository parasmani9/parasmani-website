import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function GET(request: Request) {
  try {
    const isAuthorized = await isAdminAuthorized();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim().toLowerCase();
    const category = searchParams.get('category')?.trim();

    const supabase = getSupabaseServerClient('service');
    let query = supabase
      .from('inventory_items')
      .select('*')
      .order('updated_at', { ascending: false });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

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

    const body = await request.json();
    const {
      name,
      category = 'General',
      unit = 'pcs',
      current_stock = 0,
      min_alert_stock = 0,
      expiry_date = null,
      expiry_alert_days = 30,
      batch_number = null,
      cost_per_unit = 0,
      supplier_name = null,
      supplier_contact = null,
      location = null,
      image_url = null,
      notes = null,
      recorded_by = 'Admin',
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    const stockNumber = Number(current_stock) || 0;
    const minAlertNumber = Number(min_alert_stock) || 0;
    const costNumber = Number(cost_per_unit) || 0;
    const alertDaysNumber = Number(expiry_alert_days) || 30;

    const supabase = getSupabaseServerClient('service');

    const { data: item, error: itemError } = await supabase
      .from('inventory_items')
      .insert({
        name: name.trim(),
        category: category.trim(),
        unit: unit.trim().toLowerCase(),
        current_stock: Math.max(0, stockNumber),
        min_alert_stock: Math.max(0, minAlertNumber),
        expiry_date: expiry_date ? String(expiry_date).slice(0, 10) : null,
        expiry_alert_days: Math.max(1, alertDaysNumber),
        batch_number: batch_number ? String(batch_number).trim() : null,
        cost_per_unit: Math.max(0, costNumber),
        supplier_name: supplier_name ? String(supplier_name).trim() : null,
        supplier_contact: supplier_contact ? String(supplier_contact).trim() : null,
        location: location ? location.trim() : null,
        image_url: image_url || null,
        notes: notes ? notes.trim() : null,
      })
      .select()
      .single();

    if (itemError) {
      return NextResponse.json({ error: itemError.message }, { status: 400 });
    }

    // If starting with stock, log the initial entry
    if (stockNumber > 0 && item?.id) {
      await supabase.from('inventory_logs').insert({
        item_id: item.id,
        change_type: 'stock_in',
        quantity_change: stockNumber,
        resulting_stock: stockNumber,
        reason: 'Initial stock entry',
        recorded_by: recorded_by || 'Admin',
      });
    }

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 }
    );
  }
}
