"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Video, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const events = [
  {
    id: 1,
    title: "Self-Transformation Bhatti",
    date: "November 26, 2026",
    type: "residential",
    desc: "A deep spiritual intensive (Bhatti) for self-realization and power.",
    image: "https://images.unsplash.com/photo-1518191775783-da09f70da60b?auto=format&fit=crop&q=80&w=800",
    location: "Main Auditorium, Parasmani"
  },
  {
    id: 2,
    title: "Nightly Relax & Rejuvenate",
    date: "Every Night, 08:00 PM",
    type: "virtual",
    desc: "Guided meditation for nightly renewal from the Sahyadri hills to your home.",
    image: "https://images.unsplash.com/photo-1517245315814-137747625afa?auto=format&fit=crop&q=80&w=800",
    location: "Zoom Online"
  },
  {
    id: 3,
    title: "Sahyadri Nature Walk & Meditate",
    date: "June 05, 2026",
    type: "in-person",
    desc: "Combine trekking with deep reflection in the hills of Lonavala.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
    location: "Parasmani Campus"
  },
  {
    id: 4,
    title: "Stress Management Retreat",
    date: "Coming Soon",
    type: "residential",
    desc: "Practical Raja Yoga tools to overcome modern challenges.",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=800",
    location: "Parasmani Center"
  }
];

export default function EventsPage() {
  const [filter, setFilter] = useState<"all" | "residential" | "virtual" | "in-person">("all");

  const filteredEvents = events.filter(e => filter === "all" || e.type === filter);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-40 pb-20 bg-surface">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-serif mb-6 leading-tight">Upcoming <br /><span className="text-primary italic">Spiritual Journeys</span></h1>
            <p className="text-lg opacity-60 font-light">
              Join our community of seekers. Whether online or in the serene hills 
              of Lonavala, find a space to reconnect with your truth.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-[80px] z-30 bg-background/80 backdrop-blur-md border-y border-border-subtle py-4">
        <div className="container mx-auto px-6 flex items-center gap-4 overflow-x-auto no-scrollbar">
          {(["all", "residential", "virtual", "in-person"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all",
                filter === f 
                  ? "bg-primary text-background shadow-lg shadow-primary/20" 
                  : "bg-surface text-foreground/50 hover:bg-border-subtle"
              )}
            >
              {f.replace("-", " ")}
            </button>
          ))}
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event) => (
                <motion.div
                  layout
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="bg-surface rounded-[32px] overflow-hidden border border-border-subtle hover:border-primary/20 hover:shadow-2xl transition-all group"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                      style={{ backgroundImage: `url(${event.image})` }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md",
                        event.type === 'virtual' ? "bg-blue-500 text-white" : "bg-primary text-white"
                      )}>
                        {event.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex items-center gap-2 text-primary mb-3">
                      <Calendar size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{event.date}</span>
                    </div>
                    <h3 className="text-2xl font-serif mb-4 group-hover:text-primary transition-colors">{event.title}</h3>
                    <p className="text-sm opacity-60 font-light mb-8 line-clamp-2">
                      {event.desc}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-border-subtle">
                      <div className="flex items-center gap-2 text-[10px] uppercase font-bold opacity-40">
                        {event.type === 'virtual' ? <Video size={14} /> : <MapPin size={14} />}
                        {event.location}
                      </div>
                      <button className="text-primary font-bold text-xs flex items-center gap-2 group/btn">
                        Register 
                        <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-surface border-t border-border-subtle text-center">
        <p className="text-sm opacity-40 font-light">Looking for past retreat materials? Visit our <span className="text-primary cursor-pointer hover:underline">E-Learnings</span> portal.</p>
      </footer>
    </main>
  );
}
