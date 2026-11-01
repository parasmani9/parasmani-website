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
    const expiryFilter = searchParams.get('expiryFilter')?.trim();
    const sortBy = searchParams.get('sortBy')?.trim() || 'updated_desc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '6', 10) || 6));

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const supabase = getSupabaseServerClient('service');

    let query = supabase
      .from('inventory_items')
      .select('*', { count: 'exact' });

    // Category filter
    if (category && category !== 'All' && category !== 'All Categories') {
      query = query.eq('category', category);
    }

    // Search filter across name, location, and batch_number
    if (search) {
      const sanitized = search.replace(/[,()]/g, ' ').trim();
      if (sanitized) {
        query = query.or(`name.ilike.%${sanitized}%,location.ilike.%${sanitized}%,batch_number.ilike.%${sanitized}%`);
      }
    }

    // Expiry filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);

    if (expiryFilter === 'expired') {
      query = query.not('expiry_date', 'is', null).lt('expiry_date', todayStr);
    } else if (expiryFilter === 'non_perishable') {
      query = query.is('expiry_date', null);
    } else if (expiryFilter === 'expiring') {
      const alertWindow = new Date();
      alertWindow.setDate(alertWindow.getDate() + 30);
      const alertWindowStr = alertWindow.toISOString().slice(0, 10);
      query = query.gte('expiry_date', todayStr).lte('expiry_date', alertWindowStr);
    }

    // Sorting
    switch (sortBy) {
      case 'name_asc':
        query = query.order('name', { ascending: true });
        break;
      case 'name_desc':
        query = query.order('name', { ascending: false });
        break;
      case 'stock_asc':
        query = query.order('current_stock', { ascending: true });
        break;
      case 'stock_desc':
        query = query.order('current_stock', { ascending: false });
        break;
      case 'expiry_asc':
        query = query.order('expiry_date', { ascending: true, nullsFirst: false });
        break;
      case 'expiry_desc':
        query = query.order('expiry_date', { ascending: false, nullsFirst: false });
        break;
      case 'updated_desc':
      default:
        query = query.order('updated_at', { ascending: false });
        break;
    }

    // Pagination slice
    query = query.range(from, to);

    // Parallel fetch: current page items + metadata for global stats
    const [{ data, count, error }, { data: allItems }] = await Promise.all([
      query,
      supabase.from('inventory_items').select('expiry_date, expiry_alert_days'),
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate global stats across all catalog items
    const totalCount = allItems?.length || 0;
    let expiredCount = 0;
    let expiringCount = 0;
    let nonPerishableCount = 0;

    allItems?.forEach((item) => {
      if (!item.expiry_date) {
        nonPerishableCount++;
        return;
      }
      const exp = new Date(item.expiry_date);
      exp.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const alertDays = item.expiry_alert_days || 30;

      if (diffDays < 0) {
        expiredCount++;
      } else if (diffDays <= alertDays) {
        expiringCount++;
      }
    });

    const totalFiltered = count ?? 0;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;

    return NextResponse.json({
      data: data ?? [],
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages,
      },
      stats: {
        total: totalCount,
        expiredCount,
        expiringCount,
        nonPerishableCount,
      },
    });
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
