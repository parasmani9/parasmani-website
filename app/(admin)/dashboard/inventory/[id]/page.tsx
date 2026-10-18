'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BellRing,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2,
  Layers,
  Loader2,
  MapPin,
  Minus,
  Package,
  Plus,
  ShieldAlert,
  Tag,
  Trash2,
  User,
} from 'lucide-react';

import type { InventoryItemRow, InventoryLogRow } from '@/lib/supabase/types';

export default function InventoryItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<InventoryItemRow | null>(null);
  const [logs, setLogs] = useState<InventoryLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick adjust form state
  const [adjustType, setAdjustType] = useState<'stock_in' | 'stock_out'>('stock_in');
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = async () => {
    if (!id) return;
    try {
      const [itemRes, logsRes] = await Promise.all([
        fetch(`/api/admin/inventory/${id}`),
        fetch(`/api/admin/inventory/${id}/logs`),
      ]);

      const itemData = await itemRes.json();
      const logsData = await logsRes.json();

      if (!itemRes.ok) throw new Error(itemData.error || 'Failed to load item');

      setItem(itemData.data);
      setLogs(logsData.data || []);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error fetching item data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAdjustStock = async (e: FormEvent) => {
    e.preventDefault();
    if (!item) return;

    const qty = Number(adjustQuantity);
    if (!qty || qty <= 0) {
      showToast('Please enter a valid quantity');
      return;
    }

    setIsAdjusting(true);
    try {
      const res = await fetch(`/api/admin/inventory/${id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          change_type: adjustType,
          quantity: qty,
          reason: adjustReason.trim() || (adjustType === 'stock_in' ? 'Stock Added' : 'Stock Issued / Used'),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to adjust stock');

      showToast(
        adjustType === 'stock_in'
          ? `Added +${qty} ${item.unit} to stock`
          : `Removed ${qty} ${item.unit} from stock`
      );

      setAdjustQuantity('');
      setAdjustReason('');
      loadData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Adjustment failed');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${item?.name}"? All transaction logs will be permanently removed.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/inventory/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to delete');
      }
      router.push('/dashboard/inventory');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-slate-500">Loading item details...</p>
      </div>
    );
  }

  if (errorMsg || !item) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h2 className="mt-3 text-lg font-bold text-slate-800">Product Not Found</h2>
        <p className="mt-1 text-sm text-slate-500">{errorMsg || 'Could not find the requested item.'}</p>
        <Link
          href="/dashboard/inventory"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Inventory
        </Link>
      </div>
    );
  }

  // Calculate Expiry Status based on item's custom alert window
  const getExpiryInfo = () => {
    if (!item.expiry_date) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(item.expiry_date);
    exp.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const alertDays = item.expiry_alert_days || 30;

    if (diffDays < 0) {
      return {
        status: 'expired',
        badge: 'Expired',
        color: 'bg-rose-100 text-rose-800 border-rose-200',
        label: `Expired ${Math.abs(diffDays)} days ago (${exp.toLocaleDateString('en-IN')})`,
      };
    }
    if (diffDays <= alertDays) {
      return {
        status: 'expiring_soon',
        badge: 'Expiring Soon',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        label: `Expiring in ${diffDays} days (${exp.toLocaleDateString('en-IN')})`,
      };
    }
    return {
      status: 'valid',
      badge: 'Valid',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      label: `Expires on ${exp.toLocaleDateString('en-IN')} (${diffDays} days left)`,
    };
  };

  const expiryInfo = getExpiryInfo();
  const totalValue = (Number(item.current_stock) || 0) * (Number(item.cost_per_unit) || 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-24">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/inventory"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              {item.category}
            </span>
            <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">{item.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/inventory/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Product</span>
          </Link>

          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 shadow-sm hover:bg-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Expiry Alert Hero Banner */}
      {expiryInfo && expiryInfo.status !== 'valid' && (
        <div
          className={`flex items-center gap-3 rounded-2xl border p-4 shadow-sm ${
            expiryInfo.status === 'expired'
              ? 'border-rose-300 bg-rose-50 text-rose-900'
              : 'border-amber-300 bg-amber-50 text-amber-900'
          }`}
        >
          <ShieldAlert className="h-6 w-6 shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-bold">
              {expiryInfo.status === 'expired' ? '⛔ PRODUCT EXPIRED' : '⏳ EXPIRY ALERT'}
            </h4>
            <p className="text-xs">{expiryInfo.label}. Check product usability before issuance.</p>
          </div>
        </div>
      )}

      {/* Main Grid: Photo + Specifications + Stock Ledger */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Image & Specifications */}
        <div className="space-y-6 lg:col-span-1">
          {/* Photo */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
            {item.image_url ? (
              <Image src={item.image_url} alt={item.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-slate-300">
                <Package className="h-16 w-16" />
                <span className="mt-2 text-xs font-medium text-slate-400">No Photo</span>
              </div>
            )}
          </div>

          {/* Details Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Details &amp; Storage
            </h3>

            <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Storage Location</span>
              <span className="font-semibold text-slate-800">
                {item.location ? `📍 ${item.location}` : 'Unassigned'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Measuring Unit</span>
              <span className="font-semibold uppercase text-slate-800">{item.unit}</span>
            </div>

            {/* Expiry Details */}
            <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Expiry Status</span>
              {expiryInfo ? (
                <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${expiryInfo.color}`}>
                  {new Date(item.expiry_date!).toLocaleDateString('en-IN')}
                </span>
              ) : (
                <span className="text-xs text-slate-400">No Expiry Date</span>
              )}
            </div>

            {item.cost_per_unit > 0 && (
              <div className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Cost / Unit</span>
                <span className="font-semibold text-slate-800">₹{item.cost_per_unit}</span>
              </div>
            )}

            {item.supplier_name && (
              <div className="flex items-center justify-between text-sm py-1.5">
                <span className="text-slate-500">Supplier</span>
                <span className="font-semibold text-slate-800 text-right">
                  {item.supplier_name}
                  {item.supplier_contact && (
                    <span className="block text-xs text-slate-400 font-normal">
                      {item.supplier_contact}
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {item.notes && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Specifications / Notes
              </h3>
              <p className="text-xs text-slate-600 whitespace-pre-wrap">{item.notes}</p>
            </div>
          )}
        </div>

        {/* Right Column: Stock Balance & Ledger */}
        <div className="space-y-6 lg:col-span-2">
          {/* Stock KPI Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Current Stock Available
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-black text-slate-900 sm:text-5xl">
                    {Number(item.current_stock).toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-bold uppercase text-slate-500">{item.unit}</span>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1">
                {totalValue > 0 && (
                  <span className="text-xs text-slate-500">
                    Estimated Value:{' '}
                    <strong className="text-slate-800">₹{totalValue.toLocaleString('en-IN')}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Movement Inline Form */}
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                Quick Stock Movement (In / Out)
              </h4>

              <form onSubmit={handleAdjustStock} className="space-y-3">
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-200/60 p-1">
                  <button
                    type="button"
                    onClick={() => setAdjustType('stock_in')}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
                      adjustType === 'stock_in'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    <span>+ Add Stock (Received)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType('stock_out')}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
                      adjustType === 'stock_out'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ArrowDownRight className="h-4 w-4" />
                    <span>- Use / Issue Stock</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      required
                      placeholder={`Quantity in ${item.unit}...`}
                      value={adjustQuantity}
                      onChange={(e) => setAdjustQuantity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                      {item.unit}
                    </span>
                  </div>

                  <input
                    type="text"
                    placeholder="Reason (e.g. Bought from store, Room 104 repair)"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Quick amount chips */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-1.5">
                    {[1, 5, 10, 50].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAdjustQuantity(String(preset))}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        +{preset}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={isAdjusting}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md transition disabled:opacity-50 ${
                      adjustType === 'stock_in'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {isAdjusting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : adjustType === 'stock_in' ? (
                      'Confirm Stock In'
                    ) : (
                      'Confirm Stock Out'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Stock Movement Ledger Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Stock Movement Ledger</h3>
                <p className="text-xs text-slate-500">Chronological history of additions and usages.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {logs.length} Entries
              </span>
            </div>

            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Clock className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-2 text-xs font-medium">No transactions recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Date & Time</th>
                      <th className="px-5 py-3">Movement</th>
                      <th className="px-5 py-3">Change</th>
                      <th className="px-5 py-3">Resulting Stock</th>
                      <th className="px-5 py-3">Reason / Purpose</th>
                      <th className="px-5 py-3">User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {logs.map((log) => {
                      const isPositive = log.quantity_change > 0;
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </td>

                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-bold ${
                                isPositive
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                              {log.change_type === 'stock_in' ? 'Stock Added' : 'Stock Used'}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 font-bold whitespace-nowrap">
                            <span className={isPositive ? 'text-emerald-700' : 'text-rose-700'}>
                              {isPositive ? `+${log.quantity_change}` : log.quantity_change}{' '}
                              <span className="uppercase text-[10px] text-slate-400">
                                {item.unit}
                              </span>
                            </span>
                          </td>

                          <td className="px-5 py-3.5 font-black text-slate-900 whitespace-nowrap">
                            {log.resulting_stock}{' '}
                            <span className="uppercase text-[10px] text-slate-400 font-semibold">
                              {item.unit}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                            {log.reason || '—'}
                          </td>

                          <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                            {log.recorded_by || 'Admin'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
