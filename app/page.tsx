"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Clock, Users } from "lucide-react";
import { InstagramIcon, YoutubeIcon, FacebookIcon, XIcon } from "@/components/SocialIcons";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <Hero />

      {/* Program Highlights */}
      <section className="bg-background py-[var(--section-y)]">
        <div className="container mx-auto max-w-6xl px-[var(--gutter)]">
          <div className="mb-12 text-center md:mb-16">
            <p className="text-sm font-medium text-muted">Brahma Kumaris Mulund Sub Zone</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              What we offer
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-foreground/75">
              Programs for study, meditation, and community — in Lonavala and online.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            {[
              { 
                title: "In-Person Programs", 
                desc: "Retreats and workshops for deepening practice in a supportive environment.",
                tag: "Lonavala",
                img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=800"
              },
              { 
                title: "Virtual Sessions", 
                desc: "Live guidance and collective meditation from wherever you are.",
                tag: "Online",
                img: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=800"
              },
              { 
                title: "Raja Yoga Study", 
                desc: "Structured study of consciousness, values, and spiritual principles.",
                tag: "Knowledge",
                img: "https://images.unsplash.com/photo-1529694337969-dfde8cba85ad?auto=format&fit=crop&q=80&w=800"
              },
              { 
                title: "Wellbeing & Outreach", 
                desc: "Tools for clarity and resilience in daily life and workplaces.",
                tag: "Community",
                img: "https://images.unsplash.com/photo-1499209974431-9eaa37a11144?auto=format&fit=crop&q=80&w=800"
              },
            ].map((item, i) => (
              <article
                key={i}
                className="overflow-hidden rounded-lg border border-border-subtle bg-surface"
              >
                <div
                  className="aspect-[4/3] bg-cover bg-center sm:aspect-[3/4]"
                  style={{ backgroundImage: `url(${item.img})` }}
                />
                <div className="border-t border-border-subtle p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">{item.tag}</p>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/70">{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Weekday meditation */}
      <section className="border-y border-border-subtle bg-surface py-14 md:py-16">
        <div className="container mx-auto max-w-3xl px-[var(--gutter)] text-center">
          <h2 className="text-xl font-semibold text-foreground md:text-2xl">
            Weekday collective meditation
          </h2>
          <p className="mt-4 text-base leading-relaxed text-foreground/75">
            Monday to Thursday — dedicated times for silence and reflection. All are welcome.
          </p>
          <div className="mt-8 flex flex-col gap-4 text-sm font-medium text-foreground sm:flex-row sm:justify-center sm:gap-12">
            <div className="flex items-center justify-center gap-2">
              <Clock className="shrink-0 text-primary" size={18} aria-hidden />
              <span>04:30 – 05:30</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="shrink-0 text-primary" size={18} aria-hidden />
              <span>19:00 – 20:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact / register interest */}
      <section className="bg-background py-[var(--section-y)]">
        <div className="container mx-auto max-w-5xl px-[var(--gutter)]">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-2xl font-semibold text-foreground md:text-3xl">Stay informed</h2>
              <p className="mt-4 text-base leading-relaxed text-foreground/75">
                Hear about retreats, courses, and events in Lonavala and online.
              </p>
              <div className="mt-8 flex gap-4 rounded-lg border border-border-subtle bg-surface p-4">
                <Users className="shrink-0 text-primary" size={22} aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-foreground">Mulund Sub Zone</p>
                  <p className="mt-1 text-sm text-muted">Also connected with our Mumbai-area centres.</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border-subtle bg-surface p-6 md:p-8">
              <form className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="sr-only" htmlFor="home-name">
                    Full name
                  </label>
                  <input
                    id="home-name"
                    type="text"
                    placeholder="Full name"
                    className="w-full rounded-md border border-border-subtle bg-background px-4 py-3 text-sm outline-none ring-primary focus:ring-2"
                  />
                  <label className="sr-only" htmlFor="home-email">
                    Email
                  </label>
                  <input
                    id="home-email"
                    type="email"
                    placeholder="Email"
                    className="w-full rounded-md border border-border-subtle bg-background px-4 py-3 text-sm outline-none ring-primary focus:ring-2"
                  />
                </div>
                <input
                  type="text"
                  placeholder="City"
                  className="w-full rounded-md border border-border-subtle bg-background px-4 py-3 text-sm outline-none ring-primary focus:ring-2"
                />
                <input
                  type="tel"
                  placeholder="Mobile (optional)"
                  className="w-full rounded-md border border-border-subtle bg-background px-4 py-3 text-sm outline-none ring-primary focus:ring-2"
                />
                <button
                  type="submit"
                  className="w-full rounded-md bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border-subtle bg-surface py-12">
        <div className="container mx-auto max-w-2xl px-[var(--gutter)] text-center">
          <h3 className="text-sm font-semibold text-foreground">Online channels</h3>
          <p className="mt-2 text-sm text-foreground/70">
            We share updates and recordings on these platforms when available.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              { name: "YouTube", icon: YoutubeIcon },
              { name: "Instagram", icon: InstagramIcon },
              { name: "X", icon: XIcon },
              { name: "Facebook", icon: FacebookIcon },
            ].map((social) => (
              <span
                key={social.name}
                className="inline-flex items-center gap-2 rounded-md border border-border-subtle bg-background px-3 py-2 text-xs font-medium text-foreground/80"
              >
                <social.icon className="h-4 w-4 text-muted" aria-hidden />
                {social.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-stone-900 py-14 text-stone-100">
        <div className="container mx-auto grid max-w-6xl grid-cols-1 gap-12 px-[var(--gutter)] md:grid-cols-4 md:gap-10">
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold text-white">Parasmani</h3>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-400">
              Brahma Kumaris Mulund Sub Zone. A non-profit initiative for spiritual learning and
              self-transformation through Raja Yoga meditation.
            </p>
            <div className="mt-8 flex gap-2">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-md border border-stone-700 bg-stone-800 text-stone-300 hover:bg-stone-700"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-md border border-stone-700 bg-stone-800 text-stone-300 hover:bg-stone-700"
                aria-label="YouTube"
              >
                <YoutubeIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-md border border-stone-700 bg-stone-800 text-stone-300 hover:bg-stone-700"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Address</h4>
            <p className="mt-4 text-sm leading-relaxed text-stone-400">
              Mundhavare Village, Taluka Maval
              <br />
              Near Wet and Joy Resort
              <br />
              Lonavala, Maharashtra
            </p>
            <p className="mt-4 text-sm font-medium text-stone-300">info@parasmaniretreat.com</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Links</h4>
            <ul className="mt-4 space-y-3 text-sm text-stone-300">
              <li>
                <Link href="/events" className="hover:text-white">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white">
                  Learn &amp; resources
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white">
                  Facilitator dashboard
                </Link>
              </li>
              <li className="cursor-pointer text-stone-400 hover:text-stone-300">FAQ</li>
              <li className="cursor-pointer text-stone-400 hover:text-stone-300">Bank details</li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}
