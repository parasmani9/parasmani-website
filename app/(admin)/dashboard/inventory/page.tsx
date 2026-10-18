'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BellRing,
  Boxes,
  CheckCircle2,
  Clock,
  Edit2,
  Filter,
  Layers,
  Loader2,
  MapPin,
  Minus,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';

import type { InventoryItemRow } from '@/lib/supabase/types';

const CATEGORIES = [
  'All Categories',
  'Civil & Electrical',
  'Linen & Bedding',
  'Paints & Chemicals',
  'Hardware & Tools',
  'Housekeeping & Cleaning',
  'Kitchen & Dining',
  'Safety & Medical',
  'Furniture & Fixtures',
  'General',
];

export default function InventoryDashboardPage() {
  const [items, setItems] = useState<InventoryItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'expiring' | 'expired' | 'non_perishable'>('all');

  // Quick adjust modal
  const [adjustingItem, setAdjustingItem] = useState<InventoryItemRow | null>(null);
  const [adjustType, setAdjustType] = useState<'stock_in' | 'stock_out'>('stock_in');
  const [adjustQuantity, setAdjustQuantity] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchItems = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch('/api/admin/inventory');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load inventory');
      setItems(json.data || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error loading inventory', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Expiry check logic
  const getExpiryDetails = (expiryDate: string | null, alertDays = 30) => {
    if (!expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    exp.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'expired',
        badge: 'Expired',
        label: `Expired ${Math.abs(diffDays)}d ago`,
        fullDate: exp.toLocaleDateString('en-IN'),
        isExpired: true,
        isExpiringSoon: false,
      };
    }
    if (diffDays <= alertDays) {
      return {
        status: 'expiring',
        badge: 'Expiring Soon',
        label: `Expires in ${diffDays}d`,
        fullDate: exp.toLocaleDateString('en-IN'),
        isExpired: false,
        isExpiringSoon: true,
      };
    }
    return {
      status: 'valid',
      badge: 'Valid',
      label: `Exp: ${exp.toLocaleDateString('en-IN')}`,
      fullDate: exp.toLocaleDateString('en-IN'),
      isExpired: false,
      isExpiringSoon: false,
    };
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All Categories' || item.category === selectedCategory;
      const matchesSearch =
        search.trim() === '' ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(search.toLowerCase()));

      const exp = getExpiryDetails(item.expiry_date, item.expiry_alert_days);

      let matchesExpiry = true;
      if (expiryFilter === 'expiring') matchesExpiry = !!exp?.isExpiringSoon;
      else if (expiryFilter === 'expired') matchesExpiry = !!exp?.isExpired;
      else if (expiryFilter === 'non_perishable') matchesExpiry = !item.expiry_date;

      return matchesCategory && matchesSearch && matchesExpiry;
    });
  }, [items, selectedCategory, search, expiryFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const total = items.length;
    let expiredCount = 0;
    let expiringCount = 0;
    let nonPerishableCount = 0;

    items.forEach((item) => {
      if (!item.expiry_date) {
        nonPerishableCount++;
      } else {
        const exp = getExpiryDetails(item.expiry_date, item.expiry_alert_days);
        if (exp?.isExpired) expiredCount++;
        else if (exp?.isExpiringSoon) expiringCount++;
      }
    });

    return { total, expiredCount, expiringCount, nonPerishableCount };
  }, [items]);

  // Quick adjust submit
  const handleSubmitAdjust = async (e: FormEvent) => {
    e.preventDefault();
    if (!adjustingItem) return;

    const qty = Number(adjustQuantity);
    if (!qty || qty <= 0) {
      showToast('Please enter a valid quantity', 'error');
      return;
    }

    setIsAdjusting(true);
    try {
      const res = await fetch(`/api/admin/inventory/${adjustingItem.id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          change_type: adjustType,
          quantity: qty,
          reason: adjustReason.trim() || (adjustType === 'stock_in' ? 'Stock Added' : 'Stock Issued'),
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to adjust stock');

      showToast(
        adjustType === 'stock_in'
          ? `Added +${qty} ${adjustingItem.unit}`
          : `Issued -${qty} ${adjustingItem.unit}`
      );

      setAdjustingItem(null);
      fetchItems(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Stock adjust failed', 'error');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleDeleteItem = async (item: InventoryItemRow, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/inventory/${item.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Delete failed');
      }
      showToast(`Deleted "${item.name}"`);
      fetchItems(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-7 pb-20">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl transition-all ${
            toastMessage.type === 'error' ? 'bg-rose-600 text-white' : 'bg-zinc-900 text-white'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="h-4 w-4 text-rose-300" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
            Inventory &amp; Materials
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track civil materials, linen, wires, paints, and smart expiry date alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchItems(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:bg-zinc-50 active:scale-95"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/dashboard/inventory/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Stat KPI Cards (Consistent, Harmonious White Cards with Tinted Badges) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Card 1: Total Products */}
        <button
          type="button"
          onClick={() => setExpiryFilter('all')}
          className={`group flex flex-col justify-between rounded-2xl bg-white p-5 text-left border shadow-sm transition-all hover:shadow-md active:scale-[0.99] ${
            expiryFilter === 'all'
              ? 'border-blue-500 ring-2 ring-blue-500/20'
              : 'border-zinc-200/80 hover:border-zinc-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Total Products
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-900">
              {stats.total}
            </span>
            <span className="text-xs font-medium text-zinc-400">All Catalog</span>
          </div>
        </button>

        {/* Card 2: Expired Items */}
        <button
          type="button"
          onClick={() => setExpiryFilter(expiryFilter === 'expired' ? 'all' : 'expired')}
          className={`group flex flex-col justify-between rounded-2xl bg-white p-5 text-left border shadow-sm transition-all hover:shadow-md active:scale-[0.99] ${
            expiryFilter === 'expired'
              ? 'border-rose-500 ring-2 ring-rose-500/20'
              : 'border-zinc-200/80 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">
              Expired Items
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold tracking-tight ${stats.expiredCount > 0 ? 'text-rose-600' : 'text-zinc-900'}`}>
              {stats.expiredCount}
            </span>
            <span className="text-xs font-medium text-zinc-400">Action Required</span>
          </div>
        </button>

        {/* Card 3: Expiring Soon */}
        <button
          type="button"
          onClick={() => setExpiryFilter(expiryFilter === 'expiring' ? 'all' : 'expiring')}
          className={`group flex flex-col justify-between rounded-2xl bg-white p-5 text-left border shadow-sm transition-all hover:shadow-md active:scale-[0.99] ${
            expiryFilter === 'expiring'
              ? 'border-amber-500 ring-2 ring-amber-500/20'
              : 'border-zinc-200/80 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
              Expiring Soon
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <BellRing className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className={`text-3xl font-extrabold tracking-tight ${stats.expiringCount > 0 ? 'text-amber-600' : 'text-zinc-900'}`}>
              {stats.expiringCount}
            </span>
            <span className="text-xs font-medium text-zinc-400">Needs Usage</span>
          </div>
        </button>

        {/* Card 4: Non-Perishable */}
        <button
          type="button"
          onClick={() => setExpiryFilter(expiryFilter === 'non_perishable' ? 'all' : 'non_perishable')}
          className={`group flex flex-col justify-between rounded-2xl bg-white p-5 text-left border shadow-sm transition-all hover:shadow-md active:scale-[0.99] ${
            expiryFilter === 'non_perishable'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-zinc-200/80 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Non-Perishable
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight text-zinc-900">
              {stats.nonPerishableCount}
            </span>
            <span className="text-xs font-medium text-zinc-400">Linen, Wires, Tools</span>
          </div>
        </button>
      </div>

      {/* Unified Search & Category Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or storage rack..."
            className="w-full rounded-xl border-0 bg-zinc-50 py-2.5 pl-10 pr-8 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-primary/20"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category Dropdown & Active Filter badge */}
        <div className="flex items-center gap-2">
          {expiryFilter !== 'all' && (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-800">
              <span>
                {expiryFilter === 'expired' && 'Expired'}
                {expiryFilter === 'expiring' && 'Expiring Soon'}
                {expiryFilter === 'non_perishable' && 'Non-Perishable'}
              </span>
              <button
                onClick={() => setExpiryFilter('all')}
                className="rounded-full p-0.5 hover:bg-zinc-200"
                title="Clear filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white py-2.5 pl-3.5 pr-8 text-xs font-semibold text-zinc-700 shadow-sm outline-none transition hover:bg-zinc-50 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product Content Area */}
      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-sm font-medium text-zinc-500">Loading inventory items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
            <Package className="h-7 w-7" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-base font-bold text-zinc-900">No products found</h3>
            <p className="mt-1 text-xs text-zinc-500">
              {search || selectedCategory !== 'All Categories' || expiryFilter !== 'all'
                ? 'Try adjusting your search query or reset the active filter.'
                : 'Your inventory is currently empty. Start by adding your first product!'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {(search || selectedCategory !== 'All Categories' || expiryFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All Categories');
                  setExpiryFilter('all');
                }}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Reset Filters
              </button>
            )}

            <Link
              href="/dashboard/inventory/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-hover"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add First Product</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const exp = getExpiryDetails(item.expiry_date, item.expiry_alert_days);

            return (
              <div
                key={item.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                  exp?.isExpired
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : exp?.isExpiringSoon
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-zinc-200/80 hover:border-zinc-300'
                }`}
              >
                <div>
                  {/* Top Row: Category Tag + Expiry Badge */}
                  <div className="flex items-center justify-between gap-1 mb-3">
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                      {item.category}
                    </span>

                    {/* Expiry Pill */}
                    {exp ? (
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          exp.isExpired
                            ? 'bg-rose-100 text-rose-700'
                            : exp.isExpiringSoon
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {exp.isExpired ? '⚠️ Expired' : exp.isExpiringSoon ? '⏳ ' + exp.label : exp.label}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-zinc-400">
                        No Expiry
                      </span>
                    )}
                  </div>

                  {/* Header: Photo + Info */}
                  <Link href={`/dashboard/inventory/${item.id}`} className="flex items-start gap-3.5">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-zinc-300">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3
                        className="truncate text-base font-bold text-zinc-900 group-hover:text-primary transition-colors"
                        title={item.name}
                      >
                        {item.name}
                      </h3>

                      {item.location ? (
                        <p className="mt-1 flex items-center gap-1 truncate text-xs text-zinc-500">
                          <MapPin className="h-3 w-3 shrink-0 text-zinc-400" />
                          <span className="truncate">{item.location}</span>
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-zinc-400">Location not set</p>
                      )}
                    </div>
                  </Link>

                  {/* Stock Quantity Highlight */}
                  <div className="mt-4 flex items-baseline justify-between rounded-xl bg-zinc-50/80 px-3.5 py-3">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        Current Stock
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-extrabold tracking-tight text-zinc-900">
                          {Number(item.current_stock).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs font-bold text-zinc-500 uppercase">
                          {item.unit}
                        </span>
                      </div>
                    </div>

                    {item.cost_per_unit > 0 && (
                      <div className="text-right">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          Unit Cost
                        </span>
                        <p className="text-xs font-bold text-zinc-700 mt-0.5">₹{item.cost_per_unit}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 space-y-2 border-t border-zinc-100 pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAdjustingItem(item);
                        setAdjustType('stock_out');
                        setAdjustQuantity('');
                        setAdjustReason('Issued for maintenance / room');
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 active:scale-95"
                    >
                      <Minus className="h-3.5 w-3.5" />
                      <span>Issue Stock</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAdjustingItem(item);
                        setAdjustType('stock_in');
                        setAdjustQuantity('');
                        setAdjustReason('Purchased / Received');
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ Add Stock</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href={`/dashboard/inventory/${item.id}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View Details &amp; History &rarr;
                    </Link>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/dashboard/inventory/${item.id}/edit`}
                        className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                        title="Edit Item"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={(e) => handleDeleteItem(item, e)}
                        className="rounded-lg p-1 text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK STOCK ADJUST MODAL */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  {adjustType === 'stock_in' ? 'Receive / Add Stock' : 'Issue / Use Stock'}
                </h2>
                <p className="truncate text-xs text-zinc-500">{adjustingItem.name}</p>
              </div>
              <button
                onClick={() => setAdjustingItem(null)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdjust} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-100 p-1">
                <button
                  type="button"
                  onClick={() => setAdjustType('stock_in')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                    adjustType === 'stock_in'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>+ Add Stock</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('stock_out')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                    adjustType === 'stock_out'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <ArrowDownRight className="h-4 w-4" />
                  <span>- Issue Stock</span>
                </button>
              </div>

              <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-center">
                <span className="text-xs text-zinc-400">Current Balance:</span>
                <p className="text-xl font-extrabold text-zinc-900">
                  {Number(adjustingItem.current_stock).toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-semibold text-zinc-500 uppercase">
                    {adjustingItem.unit}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700">
                  Quantity ({adjustingItem.unit}) <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    autoFocus
                    required
                    placeholder="Enter quantity..."
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-base font-bold text-zinc-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 uppercase">
                    {adjustingItem.unit}
                  </span>
                </div>

                <div className="mt-2 flex gap-1.5">
                  {[1, 5, 10, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAdjustQuantity(String(preset))}
                      className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700">
                  Purpose / Reference Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Purchased from market, Room 104 repair"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="flex-1 rounded-xl border border-zinc-200 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className={`flex-1 rounded-xl py-2.5 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50 ${
                    adjustType === 'stock_in'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isAdjusting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </span>
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
      )}
    </div>
  );
}
