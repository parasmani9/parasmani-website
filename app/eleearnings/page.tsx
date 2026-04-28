"use client";

import { Navbar } from "@/components/Navbar";
import { PlayCircle, BookOpen, Podcast, ExternalLink } from "lucide-react";

export default function ELearningsPage() {
  const courses = [
    { 
      t: "24/7 Practical Meditation", 
      d: "Integrating mindfulness into every moment of your day.",
      type: "Self-Paced" 
    },
    { 
      t: "Developing Spiritual Awareness", 
      d: "Deepen your understanding of your true identity.",
      type: "Certificate" 
    },
    { 
      t: "This Thing Called Mind", 
      d: "Understanding the thoughts and emotions that shape your life.",
      type: "Video Series" 
    },
    { 
      t: "Exploring Eternal Reality", 
      d: "Wisdom on the nature of time and eternity.",
      type: "Knowledge" 
    },
    { 
      t: "Meditation in Action", 
      d: "How to stay peaceful while being active in the world.",
      type: "Interactive" 
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <section className="pt-48 pb-24 bg-primary/5">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <span className="uppercase tracking-[0.4em] text-[10px] font-bold text-primary mb-6 block">e-Learnings Portal</span>
            <h1 className="text-5xl md:text-7xl font-serif mb-8 italic">Courses you can do in your own time</h1>
            <p className="text-lg font-light opacity-70 leading-relaxed">
              Explore our curated digital curriculum. Learn at your own pace from the 
              comfort of your home, with audio and video guidance.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="divide-y divide-border-subtle border-t border-border-subtle">
            {courses.map((course, i) => (
              <div key={i} className="py-12 flex flex-col md:flex-row items-start md:items-center justify-between group cursor-pointer hover:bg-surface/30 px-4 transition-all rounded-2xl">
                <div className="flex gap-8 items-center mb-6 md:mb-0">
                   <div className="w-16 h-16 rounded-2xl bg-background border border-border-subtle flex items-center justify-center text-primary transition-all group-hover:bg-primary group-hover:text-background shadow-sm">
                      <PlayCircle size={24} />
                   </div>
                   <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1 block">{course.type}</span>
                      <h4 className="text-2xl font-serif italic">{course.t}</h4>
                   </div>
                </div>
                <div className="max-w-md md:text-right">
                   <p className="text-sm opacity-60 font-light mb-4">{course.d}</p>
                   <button className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 group-hover:opacity-100 flex items-center gap-2 md:justify-end transition-all">
                      Access Course <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Resource Teaser */}
      <section className="py-32 bg-surface">
        <div className="container mx-auto px-6 text-center">
            <BookOpen className="text-primary/20 mx-auto mb-8" size={60} />
            <h2 className="text-4xl font-serif italic mb-10">Global Resources</h2>
            <p className="max-w-2xl mx-auto opacity-60 font-light mb-12">
              For a wider library of spiritual content, explore our global platforms 
              including Brahma Kumaris Official and Thoughts for the Day.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
               <button className="bg-background border border-border-subtle p-6 rounded-3xl flex items-center justify-between hover:border-primary/40 transition-all group">
                  <span className="font-serif italic text-lg">Daily Murli</span>
                  <ExternalLink size={16} className="opacity-20 group-hover:opacity-100 transition-all" />
               </button>
               <button className="bg-background border border-border-subtle p-6 rounded-3xl flex items-center justify-between hover:border-primary/40 transition-all group">
                  <span className="font-serif italic text-lg">Spiritual Tools App</span>
                  <ExternalLink size={16} className="opacity-20 group-hover:opacity-100 transition-all" />
               </button>
            </div>
        </div>
      </section>
    </main>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  );
}
