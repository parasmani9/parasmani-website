import { ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Calendar, Users, Settings, LogOut, ExternalLink } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F0F2F5]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E293B] text-white flex flex-col">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-background font-bold">
              P
            </div>
            <span className="font-serif text-xl tracking-wide">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "Manage Events", href: "/dashboard/events", icon: Calendar },
            { name: "Registrations", href: "/dashboard/registrations", icon: Users },
            { name: "Settings", href: "/dashboard/settings", icon: Settings },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all text-sm font-medium text-white/70 hover:text-white"
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-sm text-white/50 hover:text-white transition-colors">
            <ExternalLink size={16} />
            View Site
          </Link>
          <button className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 transition-colors">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-white border-b border-zinc-200 px-8 flex items-center justify-between">
          <h2 className="font-bold text-zinc-900">Parasmani Facilitator Portal</h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">Active Session</span>
            <div className="w-10 h-10 rounded-full bg-zinc-200" />
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
