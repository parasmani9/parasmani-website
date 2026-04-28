"use client";

import { Navbar } from "@/components/Navbar";
import { FileText, Download, Link as LinkIcon, Music } from "lucide-react";

export default function ResourcesPage() {
  const resources = [
    { title: "Meditation Commentary (Audio)", desc: "Guided sessions for beginners and advanced practitioners.", icon: Music },
    { title: "Introduction to Raja Yoga", desc: "A comprehensive PDF guide to our core philosophy.", icon: FileText },
    { title: "Inner Power Workshop Material", desc: "Student workbook for self-transformation.", icon: Download },
    { title: "Brahma Kumaris Global Wall", desc: "Access the latest spiritual news and wisdom globally.", icon: LinkIcon },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-48 pb-24 bg-surface/50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl">
            <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-primary mb-6 block">Knowledge Hub</span>
            <h1 className="text-5xl md:text-7xl font-serif mb-8 italic">Resources</h1>
            <p className="text-lg font-light opacity-60 leading-relaxed">
              Downloadable tools, guides, and links to support your daily practice. 
              Everything you need to turn peace into a way of life.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {resources.map((item, i) => (
              <div key={i} className="flex gap-8 p-10 bg-background border border-border-subtle rounded-[40px] hover:border-primary/40 hover:shadow-2xl transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-all">
                  <item.icon size={28} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-serif italic mb-2">{item.title}</h3>
                  <p className="text-sm opacity-50 font-light leading-relaxed mb-6">{item.desc}</p>
                  <button className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-1">Download Material</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
