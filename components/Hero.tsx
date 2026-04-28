"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image / Placeholder */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[10s] scale-110 active:scale-100"
        style={{ 
          backgroundImage: `linear-gradient(rgba(253, 251, 247, 0.4), rgba(253, 251, 247, 0.1)), url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=100&w=2000')`,
        }}
      />
      
      {/* Overlay for softness */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background z-[1]" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="uppercase tracking-[0.4em] text-xs font-sans text-primary font-semibold mb-6 block"
          >
            Brahma Kumaris Lonavala
          </motion.span>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-foreground leading-[1.1] mb-8">
            An Oasis of Peace <br />
            <span className="italic text-primary">in the Sahyadris</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground font-sans max-w-2xl mx-auto mb-12 opacity-80 leading-relaxed font-light">
            Welcome to Parasmani. A sanctuary in the beautiful hill station of Lonavala, 
            beckoning weary souls with nature&apos;s gentle whispers and spiritual solace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-background px-10 py-4 rounded-full text-base font-bold shadow-xl hover:shadow-primary/20 transition-all"
            >
              Discover Retreats
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-background/80 backdrop-blur-md border border-border-subtle text-foreground px-10 py-4 rounded-full text-base font-bold hover:bg-background transition-all"
            >
              Our Facilities
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.2em] font-sans opacity-40">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="text-primary w-5 h-5 opacity-50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
