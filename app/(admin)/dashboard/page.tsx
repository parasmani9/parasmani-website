import { Users, Calendar, MousePointer2, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Registrations", value: "1,284", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Events", value: "8", icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Form Conversions", value: "24%", icon: MousePointer2, color: "text-green-600", bg: "bg-green-50" },
          { label: "Growth", value: "+12%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color} mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Registrations */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-bold">Recent Registrations</h3>
            <button className="text-xs text-primary font-bold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-zinc-100">
            {[
              { name: "Ananya Sharma", event: "Silence Retreat", date: "2 mins ago", status: "confirmed" },
              { name: "Rahul Verma", event: "Youth Workshop", date: "1 hour ago", status: "pending" },
              { name: "Priya Singh", event: "Silence Retreat", date: "3 hours ago", status: "confirmed" },
            ].map((reg, i) => (
              <div key={i} className="p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-400 text-xs text-center leading-none">
                    {reg.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{reg.name}</p>
                    <p className="text-xs text-zinc-500">{reg.event}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400 mb-1">{reg.date}</p>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    reg.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {reg.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          <h3 className="font-bold mb-6">Facilitator Tools</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-4 rounded-xl border border-zinc-100 hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <p className="text-sm font-bold group-hover:text-primary transition-colors">Create New Event</p>
              <p className="text-xs text-zinc-400">Launch a new virtual or in-person session.</p>
            </button>
            <button className="w-full text-left p-4 rounded-xl border border-zinc-100 hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <p className="text-sm font-bold group-hover:text-primary transition-colors">Export All Leads</p>
              <p className="text-xs text-zinc-400">Download registration data (CSV).</p>
            </button>
            <button className="w-full text-left p-4 rounded-xl border border-zinc-100 hover:border-primary/50 hover:bg-primary/5 transition-all group">
              <p className="text-sm font-bold group-hover:text-primary transition-colors">Email Participants</p>
              <p className="text-xs text-zinc-400">Send updates via Resend integration.</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
