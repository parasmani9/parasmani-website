'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpDown,
  ArrowUpRight,
  BellRing,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit2,
  LayoutGrid,
  Loader2,
  MapPin,
  Minus,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Table as TableIcon,
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

const SORT_OPTIONS = [
  { value: 'updated_desc', label: 'Recently Updated' },
  { value: 'name_asc', label: 'Name: A → Z' },
  { value: 'name_desc', label: 'Name: Z → A' },
  { value: 'stock_asc', label: 'Stock: Low → High' },
  { value: 'stock_desc', label: 'Stock: High → Low' },
  { value: 'expiry_asc', label: 'Expiry: Earliest First' },
  { value: 'expiry_desc', label: 'Expiry: Latest First' },
];

const PAGE_SIZE_OPTIONS = [6, 12, 24, 48];

export default function InventoryDashboardPage() {
  const [items, setItems] = useState<InventoryItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Controls
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'expiring' | 'expired' | 'non_perishable'>('all');
  const [sortBy, setSortBy] = useState('updated_desc');

  // Pagination (default 6 items per page)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Global Catalog Stats (independent of current page)
  const [stats, setStats] = useState({
    total: 0,
    expiredCount: 0,
    expiringCount: 0,
    nonPerishableCount: 0,
  });

  // View Mode: defaults to 'table' (row view); 'grid' (gallery view) only if explicitly selected
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Load saved view mode preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('inventory_view_mode');
      if (saved === 'grid' || saved === 'table') {
        setViewMode(saved);
      } else {
        setViewMode('table');
      }
    }
  }, []);

  const handleToggleView = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('inventory_view_mode', mode);
    }
  };

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

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1); // Reset to page 1 on new search
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch paginated inventory from API
  const fetchItems = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      else setRefreshing(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageSize),
          sortBy,
        });

        if (debouncedSearch) params.set('search', debouncedSearch);
        if (selectedCategory && selectedCategory !== 'All Categories') {
          params.set('category', selectedCategory);
        }
        if (expiryFilter !== 'all') {
          params.set('expiryFilter', expiryFilter);
        }

        const res = await fetch(`/api/admin/inventory?${params.toString()}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load inventory');

        setItems(json.data || []);
        if (json.pagination) {
          setTotalCount(json.pagination.total || 0);
          setTotalPages(json.pagination.totalPages || 1);
        }
        if (json.stats) {
          setStats(json.stats);
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Error loading inventory', 'error');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, pageSize, debouncedSearch, selectedCategory, expiryFilter, sortBy]
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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

  // Smart page numbers calculation
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (page >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', page - 1, page, page + 1, '...', totalPages];
  }, [page, totalPages]);

  const hasActiveFilters = search || selectedCategory !== 'All Categories' || expiryFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedCategory('All Categories');
    setExpiryFilter('all');
    setSortBy('updated_desc');
    setPage(1);
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

      {/* Stat KPI Cards (Global Catalog Metrics) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Card 1: Total Products */}
        <button
          type="button"
          onClick={() => {
            setExpiryFilter('all');
            setPage(1);
          }}
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
              {stats.total.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-medium text-zinc-400">All Catalog</span>
          </div>
        </button>

        {/* Card 2: Expired Items */}
        <button
          type="button"
          onClick={() => {
            setExpiryFilter(expiryFilter === 'expired' ? 'all' : 'expired');
            setPage(1);
          }}
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
            <span
              className={`text-3xl font-extrabold tracking-tight ${
                stats.expiredCount > 0 ? 'text-rose-600' : 'text-zinc-900'
              }`}
            >
              {stats.expiredCount.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-medium text-zinc-400">Action Required</span>
          </div>
        </button>

        {/* Card 3: Expiring Soon */}
        <button
          type="button"
          onClick={() => {
            setExpiryFilter(expiryFilter === 'expiring' ? 'all' : 'expiring');
            setPage(1);
          }}
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
            <span
              className={`text-3xl font-extrabold tracking-tight ${
                stats.expiringCount > 0 ? 'text-amber-600' : 'text-zinc-900'
              }`}
            >
              {stats.expiringCount.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-medium text-zinc-400">Needs Usage</span>
          </div>
        </button>

        {/* Card 4: Non-Perishable */}
        <button
          type="button"
          onClick={() => {
            setExpiryFilter(expiryFilter === 'non_perishable' ? 'all' : 'non_perishable');
            setPage(1);
          }}
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
              {stats.nonPerishableCount.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-medium text-zinc-400">Linen, Wires, Tools</span>
          </div>
        </button>
      </div>

      {/* Toolbar: Search, Filters, Sorting, and View Toggle */}
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Search input */}
        <div className="relative flex-1 lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, rack, or batch #..."
            className="w-full rounded-xl border-0 bg-zinc-50 py-2.5 pl-10 pr-8 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:bg-white focus:ring-2 focus:ring-primary/20"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-zinc-600"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Right: Filters, Sorting, and View Modes */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Filter Pill */}
          {expiryFilter !== 'all' && (
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-800">
              <span>
                {expiryFilter === 'expired' && 'Expired'}
                {expiryFilter === 'expiring' && 'Expiring Soon'}
                {expiryFilter === 'non_perishable' && 'Non-Perishable'}
              </span>
              <button
                onClick={() => {
                  setExpiryFilter('all');
                  setPage(1);
                }}
                className="rounded-full p-0.5 hover:bg-zinc-200"
                title="Clear filter"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-zinc-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-zinc-700 shadow-sm outline-none transition hover:bg-zinc-50 focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-2 py-0.5 shadow-sm">
            <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="border-0 bg-transparent py-1.5 pl-1 pr-6 text-xs font-semibold text-zinc-700 outline-none hover:text-zinc-900 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle: Row/Table View (Default) vs Gallery/Grid View */}
          <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-100/70 p-1">
            <button
              type="button"
              onClick={() => handleToggleView('table')}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                viewMode === 'table'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Row / Table View (Default)"
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleToggleView('grid')}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Gallery / Card View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex min-h-[340px] flex-col items-center justify-center gap-3 rounded-2xl border border-zinc-200/80 bg-white p-8 text-center shadow-sm">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-sm font-medium text-zinc-500">Loading inventory items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-[340px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
            <Package className="h-7 w-7" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-base font-bold text-zinc-900">No products found</h3>
            <p className="mt-1 text-xs text-zinc-500">
              {hasActiveFilters
                ? 'No inventory matches your current search, category, or expiry filter.'
                : 'Your inventory catalog is currently empty. Start by adding your first product!'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
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
      ) : viewMode === 'grid' ? (
        /* GRID / CARD VIEW */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
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
      ) : (
        /* HIGH-DENSITY TABLE VIEW (Warehouse Mode) */
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50/75 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  <th className="py-3.5 pl-5 pr-3">Product</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Location</th>
                  <th className="py-3.5 px-3">Stock Level</th>
                  <th className="py-3.5 px-3">Unit Cost</th>
                  <th className="py-3.5 px-3">Expiry / Status</th>
                  <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {items.map((item) => {
                  const exp = getExpiryDetails(item.expiry_date, item.expiry_alert_days);
                  const isLowStock =
                    item.min_alert_stock && item.min_alert_stock > 0
                      ? item.current_stock <= item.min_alert_stock
                      : false;

                  return (
                    <tr
                      key={item.id}
                      className="group transition hover:bg-zinc-50/80"
                    >
                      {/* Product Name + Thumbnail */}
                      <td className="py-3.5 pl-5 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="44px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-zinc-300">
                                <Package className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/dashboard/inventory/${item.id}`}
                              className="font-bold text-zinc-900 group-hover:text-primary transition-colors hover:underline block truncate max-w-[220px]"
                              title={item.name}
                            >
                              {item.name}
                            </Link>
                            {item.batch_number && (
                              <span className="text-[11px] font-mono text-zinc-400">
                                Batch: {item.batch_number}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600">
                          {item.category}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-3">
                        {item.location ? (
                          <div className="flex items-center gap-1 text-xs text-zinc-600">
                            <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                            <span className="truncate max-w-[140px]">{item.location}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-baseline gap-1.5">
                          <span
                            className={`text-base font-extrabold tracking-tight ${
                              isLowStock ? 'text-amber-600' : 'text-zinc-900'
                            }`}
                          >
                            {Number(item.current_stock).toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-bold text-zinc-400 uppercase">
                            {item.unit}
                          </span>
                        </div>
                        {isLowStock && (
                          <span className="text-[10px] font-semibold text-amber-600 block">
                            Low Stock Alert
                          </span>
                        )}
                      </td>

                      {/* Unit Cost */}
                      <td className="py-3.5 px-3 text-xs font-semibold text-zinc-700">
                        {item.cost_per_unit > 0 ? `₹${item.cost_per_unit}` : '—'}
                      </td>

                      {/* Expiry Pill */}
                      <td className="py-3.5 px-3">
                        {exp ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold ${
                              exp.isExpired
                                ? 'bg-rose-100 text-rose-700'
                                : exp.isExpiringSoon
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {exp.isExpired
                              ? '⚠️ Expired'
                              : exp.isExpiringSoon
                              ? '⏳ ' + exp.label
                              : exp.label}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-zinc-400">
                            No Expiry
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-3 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustingItem(item);
                              setAdjustType('stock_out');
                              setAdjustQuantity('');
                              setAdjustReason('Issued for maintenance / room');
                            }}
                            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700"
                            title="Issue Stock"
                          >
                            - Issue
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAdjustingItem(item);
                              setAdjustType('stock_in');
                              setAdjustQuantity('');
                              setAdjustReason('Purchased / Received');
                            }}
                            className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                            title="Add Stock"
                          >
                            + Add
                          </button>
                          <Link
                            href={`/dashboard/inventory/${item.id}/edit`}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={(e) => handleDeleteItem(item, e)}
                            className="rounded-lg p-1.5 text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {!loading && totalCount > 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          {/* Info text + Page Size selector */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <span>
              Showing{' '}
              <strong className="font-bold text-zinc-900">
                {(page - 1) * pageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="font-bold text-zinc-900">
                {Math.min(page * pageSize, totalCount)}
              </strong>{' '}
              of <strong className="font-bold text-zinc-900">{totalCount}</strong> products
            </span>

            <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-200">
              <span className="text-zinc-400">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-700 outline-none hover:bg-zinc-50 cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1 self-center sm:self-auto">
            {/* First Page */}
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            {/* Previous Page */}
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 px-1">
              {pageNumbers.map((num, idx) =>
                num === '...' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex h-8 w-6 items-center justify-center text-xs text-zinc-400 select-none"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${num}`}
                    type="button"
                    onClick={() => setPage(Number(num))}
                    className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                      page === num
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    {num}
                  </button>
                )
              )}
            </div>

            {/* Next Page */}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
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

