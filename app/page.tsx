"use client";

import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Clock, MapPin, Mountain, Sun, Zap, Heart, Mail, Phone, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { InstagramIcon, YoutubeIcon, FacebookIcon, XIcon } from "@/components/SocialIcons";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <Hero />

      {/* Program Highlights */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-24 text-center">
            <span className="uppercase tracking-[0.3em] text-[10px] font-bold text-primary mb-4 p-2 px-4 bg-primary/5 rounded-full">
              Brahma Kumaris Mulund Sub Zone
            </span>
            <h2 className="text-4xl md:text-6xl font-serif italic">Nurture Your Inner World</h2>
            <div className="w-24 h-1 bg-primary/20 mt-8 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                title: "In-Person Programs", 
                desc: "Residential retreats and workshops in the serene Sahyadri hills.",
                tag: "Lonavala",
                img: "https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80&w=800"
              },
              { 
                title: "Virtual Sessions", 
                desc: "Join our global community through live webinars and guided meditations.",
                tag: "Online",
                img: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800"
              },
              { 
                title: "Raja Yoga Study", 
                desc: "A systematic study of consciousness and spiritual laws.",
                tag: "Knowledge",
                img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800"
              },
              { 
                title: "Corporate Wellness", 
                desc: "Mindfulness tools tailored for modern professionals and leaders.",
                tag: "Workshops",
                img: "https://images.unsplash.com/photo-1499209974431-9eaa37a11144?auto=format&fit=crop&q=80&w=800"
              },
            ].map((item, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-[3/4] rounded-[40px] overflow-hidden mb-8 shadow-xl transition-all duration-700 bg-surface group-hover:shadow-2xl">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                    style={{ backgroundImage: `url(${item.img})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/70 mb-2 block">{item.tag}</span>
                    <h3 className="text-xl font-serif text-white">{item.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Weekday Meditation Banner */}
      <section className="py-20 bg-primary text-background">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-serif italic mb-6">Monday to Thursday Meditation</h2>
            <p className="text-lg opacity-80 font-light mb-10 max-w-2xl mx-auto tracking-wide">
               Join our collective silence every Monday through Thursday. 
               Dedicated hours for deep reflection and spiritual rejuvenation.
            </p>
            <div className="flex justify-center gap-12 font-bold uppercase tracking-widest text-xs">
               <div className="flex items-center gap-3">
                  <Clock size={16} /> 04:30 AM - 05:30 AM
               </div>
               <div className="flex items-center gap-3">
                  <Clock size={16} /> 07:00 PM - 08:00 PM
               </div>
            </div>
        </div>
      </section>

      {/* Join Us Lead Capture */}
      <section className="py-32 bg-surface">
         <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               <div>
                  <h2 className="text-5xl font-serif italic mb-8">Join the community</h2>
                  <p className="text-lg opacity-60 font-light leading-relaxed mb-10">
                     Be the first to hear about our new retreats, e-learning courses, 
                     and local events in Lonavala.
                  </p>
                  <div className="space-y-6">
                     <div className="flex items-center gap-6 p-6 rounded-3xl bg-background shadow-sm">
                        <Users className="text-primary" size={24} />
                        <div>
                           <p className="font-bold text-sm uppercase tracking-widest text-primary">Mulund Sanctuary</p>
                           <p className="text-xs opacity-50">Local community center access</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-background rounded-[50px] p-10 md:p-12 shadow-2xl border border-border-subtle">
                  <form className="space-y-6">
                     <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="Full Name" className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                        <input type="email" placeholder="Email Address" className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                     </div>
                     <input type="text" placeholder="Location (City)" className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                     <input type="tel" placeholder="Mobile Number" className="w-full px-6 py-4 rounded-2xl bg-surface border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                     <button className="w-full py-5 rounded-2xl bg-primary text-background font-bold tracking-[0.2em] uppercase shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                        Join our family
                     </button>
                  </form>
               </div>
            </div>
         </div>
      </section>

      {/* Follow Us / Socials */}
      <section className="py-32 bg-background border-t border-border-subtle/30">
         <div className="container mx-auto px-6 text-center">
            <h3 className="text-[10px] uppercase tracking-[0.5em] font-bold opacity-30 mb-16">Follow Our Journey</h3>
            <div className="flex justify-center gap-6 md:gap-8">
               {[
                  { name: "YouTube", icon: YoutubeIcon, bg: "hover:bg-[#FF0000]", shadow: "hover:shadow-[#FF0000]/20" },
                  { name: "Instagram", icon: InstagramIcon, bg: "hover:bg-[#E1306C]", shadow: "hover:shadow-[#E1306C]/20" },
                  { name: "X (Twitter)", icon: XIcon, bg: "hover:bg-[#000000]", shadow: "hover:shadow-black/20" },
                  { name: "Facebook", icon: FacebookIcon, bg: "hover:bg-[#1877F2]", shadow: "hover:shadow-[#1877F2]/20" },
               ].map((social, i) => (
                  <button 
                    key={i} 
                    className={cn(
                      "group relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-surface border border-border-subtle flex items-center justify-center transition-all duration-500",
                      social.bg,
                      social.shadow,
                      "hover:scale-110 hover:-translate-y-2 hover:border-transparent hover:text-white"
                    )}
                  >
                     <social.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                     <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-40 transition-all">
                       {social.name}
                     </span>
                  </button>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="col-span-2">
            <h3 className="text-3xl font-serif mb-6 italic text-primary">Parasmani</h3>
            <p className="opacity-60 max-w-sm mb-12 leading-relaxed">
              Established by Brahma Kumaris Mulund Sub Zone. 
              A non-profit, spiritual initiative dedicated to world transformation 
              through self transformation.
            </p>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-background transition-all">
                <InstagramIcon className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-background transition-all">
                <YoutubeIcon className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-background transition-all">
                <FacebookIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-6 uppercase text-[10px] tracking-widest opacity-40">Location</h4>
            <p className="text-sm italic mb-4 leading-relaxed opacity-80">Mundhavare Village, Taluka Maval<br />Near Wet and Joy Resort<br />Lonavala, Maharashtra</p>
            <p className="text-sm font-bold opacity-80 underline underline-offset-4 decoration-primary cursor-pointer">info@parasmaniretreat.com</p>
          </div>
          <div>
            <h4 className="font-semibold mb-6 uppercase text-[10px] tracking-widest opacity-40">Fast Links</h4>
            <ul className="space-y-4 text-sm font-medium">
              <li className="hover:text-primary cursor-pointer transition-colors">Program Registration</li>
              <li className="hover:text-primary cursor-pointer transition-colors">FAQ</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Bank Details</li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}
