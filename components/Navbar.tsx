"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "About", href: "/about" },
  { name: "What We Offer", href: "/what-we-offer" },
  { name: "Learn & Resources", href: "/resources" },
  { name: "Events", href: "/events" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top,0px)]">
      <nav
        className={cn(
          "flex h-[var(--nav-height)] items-center border-b transition-all duration-300",
          isScrolled
            ? "border-border-subtle bg-background/90 shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset] backdrop-blur-xl"
            : "border-transparent bg-transparent"
        )}
      >
        <div className="container mx-auto flex w-full max-w-full items-center justify-between gap-2 px-[var(--gutter)]">
          <Link
            href="/"
            className="flex min-h-[44px] shrink-0 items-center gap-2 sm:gap-3"
            aria-label="Parasmani home"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border-subtle bg-surface text-sm font-semibold text-primary">
              P
            </div>
            <div className="min-w-0 leading-tight">
              <span className="block truncate text-base font-semibold text-foreground sm:text-[1.05rem]">
                Parasmani
              </span>
              <span className="hidden text-[11px] font-normal text-muted sm:block">
                Brahma Kumaris, Lonavala
              </span>
            </div>
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-6 md:flex lg:gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden shrink-0 md:block">
            <Link
              href="/donate"
              className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Donate
            </Link>
          </div>

          <button
            type="button"
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg text-foreground -mr-1 hover:bg-foreground/5 md:hidden"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="max-h-[min(70vh,calc(100dvh-var(--nav-height)-env(safe-area-inset-top,0px)))] overflow-y-auto border-b border-border-subtle bg-background/98 shadow-lg backdrop-blur-xl md:hidden"
          >
            <div className="container mx-auto flex max-w-full flex-col px-[var(--gutter)] pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="min-h-[48px] border-b border-border-subtle/50 py-3 text-base font-medium text-foreground/90 last:border-b-0 active:bg-foreground/[0.03]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/donate"
                className="mt-3 flex min-h-[48px] items-center justify-center rounded-md border border-primary bg-primary py-3 text-sm font-semibold text-white active:bg-primary-hover"
                onClick={() => setMobileMenuOpen(false)}
              >
                Donate
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
