"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "About", href: "/about" },
  { name: "Learn & Resources", href: "/resources" },
  { name: "Events", href: "/events" },
  { name: "Donate", href: "/donate" },
];

const whatWeOfferLinks = [
  { name: "Meditation", href: "/what-we-offer" },
  { name: "Raja Yoga Course", href: "/what-we-offer" },
  { name: "Retreat Programs", href: "/what-we-offer" },
  { name: "Youth & Family Sessions", href: "/what-we-offer" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActiveLink = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

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
        <div className="container mx-auto flex w-full max-w-full items-center justify-between gap-3 px-[var(--gutter)]">
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
            <div className="group relative">
              <Link
                href="/what-we-offer"
                className={cn(
                  "inline-flex items-center gap-1.5 py-2 text-sm font-medium transition-colors",
                  isActiveLink("/what-we-offer")
                    ? "text-primary"
                    : "text-foreground/80 hover:text-primary"
                )}
              >
                What We Offer
                <ChevronDown className="h-4 w-4" aria-hidden />
              </Link>
              {isActiveLink("/what-we-offer") ? (
                <span className="absolute -bottom-[9px] left-0 right-0 h-0.5 rounded-full bg-primary" />
              ) : null}
              <div className="invisible absolute left-1/2 top-full mt-2 w-56 -translate-x-1/2 rounded-lg border border-border-subtle bg-background/95 p-2 opacity-0 shadow-xl backdrop-blur-md transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                {whatWeOfferLinks.map((offerLink) => (
                  <Link
                    key={offerLink.name}
                    href={offerLink.href}
                    className="block rounded-md px-3 py-2 text-sm text-foreground/85 transition-colors hover:bg-foreground/[0.03] hover:text-primary"
                  >
                    {offerLink.name}
                  </Link>
                ))}
              </div>
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "relative py-2 text-sm font-medium transition-colors",
                  isActiveLink(link.href)
                    ? "text-primary"
                    : "text-foreground/80 hover:text-primary"
                )}
              >
                {link.name}
                {isActiveLink(link.href) ? (
                  <span className="absolute -bottom-[9px] left-0 right-0 h-0.5 rounded-full bg-primary" />
                ) : null}
              </Link>
            ))}
          </div>

          <div className="hidden min-w-[96px] justify-end md:flex" />

          <button
            type="button"
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg text-foreground hover:bg-foreground/5 md:hidden"
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
              <div className="border-b border-border-subtle/50 py-1">
                <Link
                  href="/what-we-offer"
                  className={cn(
                    "flex min-h-[48px] items-center justify-between py-3 text-base font-medium",
                    isActiveLink("/what-we-offer") ? "text-primary" : "text-foreground/90"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  What We Offer
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </Link>
                <div className="mb-2 ml-3 space-y-1 border-l border-border-subtle pl-4">
                  {whatWeOfferLinks.map((offerLink) => (
                    <Link
                      key={offerLink.name}
                      href={offerLink.href}
                      className="block min-h-[40px] py-2 text-sm text-foreground/80"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {offerLink.name}
                    </Link>
                  ))}
                </div>
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "min-h-[48px] border-b border-border-subtle/50 py-3 text-base font-medium last:border-b-0 active:bg-foreground/[0.03]",
                    isActiveLink(link.href) ? "text-primary" : "text-foreground/90"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
