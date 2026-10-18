import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/admin-auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

async function isAdminAuthorized() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export async function POST(
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
    const { change_type, quantity, reason = '', recorded_by = 'Admin' } = body;

    if (!['stock_in', 'stock_out', 'set'].includes(change_type)) {
      return NextResponse.json({ error: 'Invalid change_type' }, { status: 400 });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || (change_type !== 'set' && qty <= 0) || (change_type === 'set' && qty < 0)) {
      return NextResponse.json({ error: 'Valid quantity is required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient('service');

    // Fetch current item stock
    const { data: item, error: fetchError } = await supabase
      .from('inventory_items')
      .select('id, name, current_stock')
      .eq('id', id)
      .single();

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const currentStock = Number(item.current_stock) || 0;
    let resultingStock = currentStock;
    let effectiveChange = qty;

    if (change_type === 'stock_in') {
      resultingStock = currentStock + qty;
      effectiveChange = qty;
    } else if (change_type === 'stock_out') {
      if (qty > currentStock) {
        return NextResponse.json(
          { error: `Cannot remove ${qty}. Current available stock is ${currentStock}` },
          { status: 400 }
        );
      }
      resultingStock = currentStock - qty;
      effectiveChange = -qty;
    } else if (change_type === 'set') {
      resultingStock = qty;
      effectiveChange = qty - currentStock;
    }

    // Update item current_stock
    const { data: updatedItem, error: updateError } = await supabase
      .from('inventory_items')
      .update({ current_stock: resultingStock })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Log the transaction
    const { error: logError } = await supabase.from('inventory_logs').insert({
      item_id: id,
      change_type,
      quantity_change: effectiveChange,
      resulting_stock: resultingStock,
      reason: reason?.trim() || (change_type === 'stock_in' ? 'Stock Added' : 'Stock Used/Issued'),
      recorded_by: recorded_by?.trim() || 'Admin',
    });

    if (logError) {
      console.error('Failed to log inventory transaction:', logError);
    }

    return NextResponse.json({ data: updatedItem });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 }
    );
  }
}
