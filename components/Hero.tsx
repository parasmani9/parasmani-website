"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { InstagramIcon, YoutubeIcon, FacebookIcon, XIcon } from "@/components/SocialIcons";

const socialItems = [
  { name: "YouTube", href: "#", icon: YoutubeIcon },
  { name: "Instagram", href: "#", icon: InstagramIcon },
  { name: "Facebook", href: "#", icon: FacebookIcon },
  { name: "X", href: "#", icon: XIcon },
];

export function Hero() {
  return (
    <section
      className="relative flex min-h-[100dvh] flex-col justify-center border-b border-border-subtle bg-background pt-[var(--nav-height)]"
      aria-label="Welcome"
    >
      <div className="container relative z-10 mx-auto max-w-4xl px-[var(--gutter)] py-16 md:py-20">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mb-4 text-sm font-medium text-muted"
          >
            Brahma Kumaris · Raja Yoga · Lonavala
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
            className="text-3xl font-semibold leading-snug tracking-tight text-foreground sm:text-4xl md:text-[2.75rem] md:leading-tight"
          >
            Meditation and spiritual study at Parasmani
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: "easeOut" }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-foreground/80 md:text-lg"
          >
            A centre for self-transformation through the Brahma Kumaris way of life. Open to all who
            wish to learn meditation and explore Raja Yoga in depth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24, ease: "easeOut" }}
            className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center sm:gap-4"
          >
            <Link
              href="/what-we-offer"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Programs
            </Link>
            <Link
              href="/about"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-subtle bg-background px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface"
            >
              About us
            </Link>
          </motion.div>

          <div
            className="mt-12 flex flex-wrap items-center justify-center gap-2 border-t border-border-subtle pt-10"
            aria-label="Social media"
          >
            <span className="mb-2 w-full text-center text-xs font-medium uppercase tracking-wide text-muted sm:mb-0 sm:mr-4 sm:inline sm:w-auto">
              Follow
            </span>
            {socialItems.map(({ name, href, icon: Icon }) => (
              <Link
                key={name}
                href={href}
                aria-label={name}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-border-subtle bg-surface text-foreground/70 transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Icon className="h-[18px] w-[18px]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
