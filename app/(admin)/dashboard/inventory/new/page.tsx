'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  Calendar,
  Camera,
  CheckCircle2,
  DollarSign,
  Loader2,
  Package,
  ShieldAlert,
  Tag,
  Upload,
  X,
} from 'lucide-react';

import { compressImageClient } from '@/lib/image-compress';

const CATEGORIES = [
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

const UNITS = [
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'meters', label: 'Meters (m)' },
  { value: 'rolls', label: 'Rolls' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'packets', label: 'Packets' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'liters', label: 'Liters (L)' },
  { value: 'sets', label: 'Sets' },
  { value: 'bags', label: 'Bags' },
  { value: 'cans', label: 'Cans / Tins' },
];

export default function NewInventoryItemPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Civil & Electrical');
  const [unit, setUnit] = useState('pcs');
  const [currentStock, setCurrentStock] = useState<string>('');
  const [location, setLocation] = useState('Main Godown');

  // Expiry Alert Focus
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryAlertDays, setExpiryAlertDays] = useState('30');

  // Cost & Supplier (Optional)
  const [costPerUnit, setCostPerUnit] = useState<string>('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [notes, setNotes] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    try {
      // Auto-resize & compress to ~50-80KB WebP
      const compressedFile = await compressImageClient(file, 800, 0.8);

      const formData = new FormData();
      formData.append('file', compressedFile);

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload photo');

      setImageUrl(data.url);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Photo upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Product name is required');
      return;
    }

    if (hasExpiry && !expiryDate) {
      setErrorMsg('Please select an expiry date or uncheck the expiry option');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const payload = {
        name: name.trim(),
        category,
        unit,
        current_stock: Number(currentStock) || 0,
        expiry_date: hasExpiry && expiryDate ? expiryDate : null,
        expiry_alert_days: Number(expiryAlertDays) || 30,
        cost_per_unit: Number(costPerUnit) || 0,
        supplier_name: supplierName.trim() || null,
        supplier_contact: supplierContact.trim() || null,
        location: location.trim() || null,
        image_url: imageUrl || null,
        notes: notes.trim() || null,
      };

      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      router.push(`/dashboard/inventory/${data.data.id}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error creating product');
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/inventory"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Add New Product
          </h1>
          <p className="text-sm text-slate-500">
            Register civil items, linen, paints, or provisions with smart expiry tracking.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 border border-rose-200">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Product Photo & Basic Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Product Details
          </h2>

          <div className="flex flex-col gap-6 sm:flex-row">
            {/* Photo Card */}
            <div className="flex flex-col items-center justify-center sm:w-48 shrink-0">
              <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
                {imageUrl ? (
                  <>
                    <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1 text-white hover:bg-slate-900"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <Camera className="h-8 w-8 text-slate-300" />
                    <span className="text-xs font-medium text-slate-500">No Photo</span>
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>

              <label className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                <Upload className="h-3.5 w-3.5" />
                <span>{imageUrl ? 'Change Photo' : 'Upload / Snap Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Polycab 1.5mm Wire Red, Asian Paints White 20L, White Double Chadar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Measuring Unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Current Stock Quantity
                  </label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0"
                      value={currentStock}
                      onChange={(e) => setCurrentStock(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase">
                      {unit}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Storage Location / Godown Rack
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Godown Shelf 2, Workshop, Block A"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: EXPIRY & EXPIRY ALERT (FRONT & CENTER) */}
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/40 p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-amber-200/70 pb-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BellRing className="h-5 w-5 text-amber-600" />
                Expiry Date &amp; Expiry Alert
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically alerts staff before materials (paints, chemicals, groceries, medicines) spoil.
              </p>
            </div>

            <label className="inline-flex items-center gap-2.5 cursor-pointer rounded-xl bg-white border border-amber-300 px-3.5 py-2 text-xs font-bold text-amber-900 shadow-sm">
              <input
                type="checkbox"
                checked={hasExpiry}
                onChange={(e) => setHasExpiry(e.target.checked)}
                className="h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
              />
              <span>Has Expiry Date</span>
            </label>
          </div>

          {hasExpiry ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-800">
                  Expiry Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800">
                  Alert Me Before Expiry
                </label>
                <select
                  value={expiryAlertDays}
                  onChange={(e) => setExpiryAlertDays(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="15">15 days before</option>
                  <option value="30">30 days before (Standard)</option>
                  <option value="60">60 days before</option>
                  <option value="90">90 days before</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="py-2 text-center text-xs text-slate-500">
              ⚡ This item has no expiration date (e.g. wires, chadars, plastic chairs, nails). Check the box above if it expires.
            </div>
          )}
        </div>

        {/* SECTION 3: Cost & Supplier Information (Optional) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Cost &amp; Supplier Details (Optional)
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Cost Per Unit (₹)</label>
              <div className="relative mt-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={costPerUnit}
                  onChange={(e) => setCostPerUnit(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Supplier Name</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Hardware Store"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Supplier Contact</label>
              <input
                type="text"
                placeholder="e.g. +91 9876543210"
                value={supplierContact}
                onChange={(e) => setSupplierContact(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Notes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block text-xs font-semibold text-slate-700">
            Specifications &amp; Handling Notes
          </label>
          <textarea
            rows={2}
            placeholder="Colors, sizes, or special handling notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/dashboard/inventory"
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition hover:opacity-95 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Product...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Save to Inventory</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
