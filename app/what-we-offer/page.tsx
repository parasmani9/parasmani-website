"use client";

import { Navbar } from "@/components/Navbar";
import { Sparkles, Brain, Clock, HelpCircle, House, CalendarRange, Heart } from "lucide-react";

const offerings = [
  {
    id: "raja-yoga",
    title: "Raja Yoga Meditation",
    desc: "A spiritual philosophy that leads to self-mastery and inner peace without complex physical postures.",
    icon: Sparkles,
    href: "#raja-yoga"
  },
  {
    id: "why-meditate",
    title: "Why Meditate?",
    desc: "Understand the deep psychological and spiritual benefits of consistent mindfulness.",
    icon: Brain,
    href: "#why-meditate"
  },
  {
    id: "how-to-meditate",
    title: "How to Meditate",
    desc: "Practical steps and open-eyed techniques for the modern busy schedule.",
    icon: Heart,
    href: "#how-to-meditate"
  },
  {
    id: "when-to-meditate",
    title: "When to Meditate",
    desc: "Synchronizing your inner practice with the natural rhythms of the day.",
    icon: Clock,
    href: "#when-to-meditate"
  },
  {
    id: "faq",
    title: "Meditation FAQ",
    desc: "Answers to common questions about spiritual practice and the Brahma Kumaris.",
    icon: HelpCircle,
    href: "#faq"
  },
  {
    id: "personal-retreat",
    title: "Personal Retreat (Residential)",
    desc: "Immersive residential stays for deep contemplation and renewal in Lonavala.",
    icon: House,
    href: "#personal-retreat"
  },
  {
    id: "programs",
    title: "Programs & Events",
    desc: "Structured residential programs and thematic workshops for all groups.",
    icon: CalendarRange,
    href: "/events"
  }
];

export default function WhatWeOfferPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-48 pb-24 bg-surface/50 border-b border-border-subtle">
        <div className="container mx-auto px-6 text-center">
          <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-primary mb-6 block">Holistic Services</span>
          <h1 className="text-5xl md:text-7xl font-serif mb-8 italic">What we offer</h1>
          <p className="text-lg font-light opacity-60 max-w-2xl mx-auto leading-relaxed">
            From the core philosophy of Raja Yoga to immersive residential retreats, 
            explore the tools we provide for your spiritual journey.
          </p>
        </div>
      </section>

      {/* Grid of Hub */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {offerings.map((item, i) => (
              <div 
                key={i} 
                className="bg-background p-10 rounded-[40px] border border-border-subtle hover:border-primary/40 hover:shadow-2xl transition-all group flex flex-col items-start"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-8 transition-transform group-hover:scale-110">
                  <item.icon size={28} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-serif mb-4 italic">{item.title}</h3>
                <p className="text-sm opacity-60 font-light leading-relaxed mb-10 flex-1">
                  {item.desc}
                </p>
                <button className="text-xs font-bold uppercase tracking-[0.2em] text-primary hover:opacity-70 transition-all flex items-center gap-2">
                  Learn More <div className="w-6 h-[1px] bg-primary" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Callout */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <h2 className="text-3xl font-serif italic mb-8">All our services are offered free of charge.</h2>
          <p className="opacity-60 font-light leading-relaxed mb-12">
            As a non-profit organization, we believe spiritual wisdom should be accessible 
            to everyone. We are supported solely by voluntary contributions.
          </p>
          <div className="flex justify-center gap-8">
            <div className="h-[1px] w-12 bg-primary/40 self-center" />
            <span className="text-xs uppercase tracking-widest font-bold text-primary">Service to humanity</span>
            <div className="h-[1px] w-12 bg-primary/40 self-center" />
          </div>
        </div>
      </section>
    </main>
  );
}
