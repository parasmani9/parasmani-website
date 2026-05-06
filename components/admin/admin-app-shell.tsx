'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, ExternalLink, LayoutDashboard, Menu, X } from 'lucide-react';

import { LogoutButton } from '@/components/admin/logout-button';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Manage Events', href: '/dashboard/events', icon: Calendar },
];

export function AdminAppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  const handleCloseMobileNav = () => {
    setMobileNavOpen(false);
  };

  return (
    <div className="flex min-h-dvh bg-[#F0F2F5] lg:h-screen lg:min-h-0">
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] lg:hidden"
          aria-label="Close navigation"
          onClick={handleCloseMobileNav}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(17.5rem,90vw)] flex-col bg-[#1E293B] text-white shadow-xl transition-transform duration-200 ease-out lg:relative lg:z-0 lg:w-64 lg:max-w-none lg:translate-x-0 lg:shadow-none',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-6 pt-[max(1.5rem,env(safe-area-inset-top))] sm:p-8">
          <Link href="/" className="flex items-center gap-2" onClick={handleCloseMobileNav}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-background">
              P
            </div>
            <span className="text-lg font-semibold tracking-tight">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleCloseMobileNav}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
            >
              <item.icon size={18} aria-hidden />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/5 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Link
            href="/"
            onClick={handleCloseMobileNav}
            className="flex items-center gap-3 px-4 py-3 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ExternalLink size={16} aria-hidden />
            View Site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:min-h-0">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 sm:h-20 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-zinc-700 hover:bg-zinc-100 lg:hidden"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileNavOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
            </button>
            <h2 className="truncate text-sm font-bold text-zinc-900 sm:text-base">
              Parasmani Facilitator Portal
            </h2>
          </div>
          <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Admin
          </span>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
