"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { InstagramIcon, YoutubeIcon, FacebookIcon } from "./SocialIcons";

const navLinks = [
  { name: "About", href: "/about" },
  { name: "What We Offer", href: "/what-we-offer" },
  { name: "e-Learnings", href: "/eleearnings" },
  { name: "Resources", href: "/resources" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled 
          ? "bg-background/90 backdrop-blur-xl border-b border-border-subtle py-2 shadow-xl" 
          : "bg-transparent py-4 text-foreground"
      )}
    >
      {/* Top Bar for Tagline */}
      {!isScrolled && (
        <div className="hidden md:flex border-b border-foreground/5 py-2 mb-2">
          <div className="container mx-auto px-6 flex justify-between items-center">
            <span className="italic font-serif text-[13px] opacity-70 tracking-wide">
              Peace is simply an experience but Peace of Mind is a way of life...
            </span>
            <div className="flex gap-6 text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">
              <div className="flex gap-4 items-center mr-6 border-r border-foreground/10 pr-6">
                <Link href="#" className="hover:text-primary transition-colors"><InstagramIcon className="w-3.5 h-3.5" /></Link>
                <Link href="#" className="hover:text-primary transition-colors"><YoutubeIcon className="w-3.5 h-3.5" /></Link>
                <Link href="#" className="hover:text-primary transition-colors"><FacebookIcon className="w-3.5 h-3.5" /></Link>
              </div>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
              <button className="hover:text-primary transition-colors flex items-center gap-1">
                <Search size={12} /> Search
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-background font-serif text-xl font-bold transition-all group-hover:scale-110 shadow-lg shadow-primary/20">
            P
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold leading-none tracking-tight">
              Parasmani
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] font-sans opacity-50 font-bold">
              Lonavala
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors relative group py-2"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          <Link
            href="/donate"
            className="bg-primary text-background px-8 py-3 rounded-full text-xs font-bold tracking-widest uppercase hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
          >
            Donate
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 bg-background border-b border-border-subtle shadow-2xl overflow-hidden md:hidden"
          >
            <div className="flex flex-col p-8 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xl font-serif py-4 border-b border-border-subtle/50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/donate"
                className="bg-primary text-background text-center py-5 rounded-2xl font-bold uppercase tracking-widest text-sm mt-4 shadow-xl shadow-primary/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Donate
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
