"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { InstagramIcon, YoutubeIcon, FacebookIcon, XIcon } from "@/components/SocialIcons";

const socialItems = [
  { name: "YouTube", href: "#", icon: YoutubeIcon },
  { name: "Instagram", href: "#", icon: InstagramIcon },
  { name: "Facebook", href: "#", icon: FacebookIcon },
  { name: "X", href: "#", icon: XIcon },
];

const heroImages = [
  "/Assets/WhatsApp%20Image%202026-05-06%20at%2010.34.48%20PM.jpeg",
  "/WhatsApp%20Image%202026-05-06%20at%2010.34.49%20PM%20(2).jpeg",
  "/WhatsApp%20Image%202026-05-06%20at%2010.34.49%20PM%20(1).jpeg",
];

export function Hero() {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveImageIndex((previous) => (previous + 1) % heroImages.length);
    }, 4500);
    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <section
      className="relative flex min-h-[100dvh] flex-col justify-center border-b border-border-subtle bg-background pt-[var(--nav-height)]"
      aria-label="Welcome"
    >
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-700 ${index === activeImageIndex ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={image}
              alt="Parasmani campus"
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/35 to-black/20" />
      </div>
      <div className="container relative z-10 mx-auto max-w-4xl px-[var(--gutter)] py-16 md:py-20">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="mb-4 text-sm font-medium text-white/80"
          >
            Brahma Kumaris · Raja Yoga · Lonavala
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
            className="text-3xl font-semibold leading-snug tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-tight"
          >
            Meditation and spiritual study at Parasmani
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: "easeOut" }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg"
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
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/40 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              About us
            </Link>
          </motion.div>

          <div className="mt-6 flex justify-center gap-2" aria-label="Hero image carousel indicators">
            {heroImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveImageIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  index === activeImageIndex ? "bg-white" : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Show slide ${index + 1}`}
              />
            ))}
          </div>

          <div
            className="mt-12 flex flex-wrap items-center justify-center gap-2 border-t border-white/25 pt-10"
            aria-label="Social media"
          >
            <span className="mb-2 w-full text-center text-xs font-medium uppercase tracking-wide text-white/70 sm:mb-0 sm:mr-4 sm:inline sm:w-auto">
              Follow
            </span>
            {socialItems.map(({ name, href, icon: Icon }) => (
              <Link
                key={name}
                href={href}
                aria-label={name}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-white/30 bg-white/10 text-white/85 transition-colors hover:border-white/60 hover:bg-white/20"
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
