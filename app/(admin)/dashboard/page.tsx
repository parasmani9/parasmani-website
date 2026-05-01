import Link from 'next/link';
import { Calendar, Users } from 'lucide-react';

import { getSupabaseServerClient } from '@/lib/supabase/server';

interface RegistrationWithEvent {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  events: { title: string } | { title: string }[] | null;
}

function getInitials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((namePart) => namePart[0]?.toUpperCase() ?? '')
    .join('');
}

function getEventTitle(registration: RegistrationWithEvent) {
  if (Array.isArray(registration.events)) {
    return registration.events[0]?.title ?? 'Event';
  }
  return registration.events?.title ?? 'Event';
}

export default async function AdminDashboard() {
  const supabase = getSupabaseServerClient('service');
  const [eventsCountResult, activeEventsCountResult, registrationsCountResult, recentRegistrationsResult] =
    await Promise.all([
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('is_published', true),
      supabase.from('event_registrations').select('id', { count: 'exact', head: true }),
      supabase
        .from('event_registrations')
        .select('id, full_name, email, created_at, events(title)')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

  const totalEvents = eventsCountResult.count ?? 0;
  const activeEvents = activeEventsCountResult.count ?? 0;
  const totalRegistrations = registrationsCountResult.count ?? 0;
  const recentRegistrations = (recentRegistrationsResult.data ?? []) as RegistrationWithEvent[];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'Total Registrations',
            value: totalRegistrations.toLocaleString('en-IN'),
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Published Events',
            value: activeEvents.toLocaleString('en-IN'),
            icon: Calendar,
            color: 'text-green-600',
            bg: 'bg-green-50',
          },
          {
            label: 'Total Events',
            value: totalEvents.toLocaleString('en-IN'),
            icon: Calendar,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color} mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-bold">Recent Registrations</h3>
            <span className="text-xs text-zinc-500">Latest 10</span>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentRegistrations.length === 0 ? (
              <p className="p-6 text-sm text-zinc-600">No registrations yet.</p>
            ) : null}
            {recentRegistrations.map((registration) => (
              <div
                key={registration.id}
                className="p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-400 text-xs text-center leading-none">
                    {getInitials(registration.full_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{registration.full_name}</p>
                    <p className="text-xs text-zinc-500">{getEventTitle(registration)}</p>
                    <p className="text-xs text-zinc-400">{registration.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400">
                    {new Date(registration.created_at).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          <h3 className="font-bold mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/events"
              className="block w-full text-left p-4 rounded-xl border border-zinc-100 hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <p className="text-sm font-bold group-hover:text-primary transition-colors">Create New Event</p>
              <p className="text-xs text-zinc-400">Create or edit event content.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
