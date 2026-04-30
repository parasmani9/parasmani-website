"use client";

import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import {
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Music,
  PlayCircle,
} from "lucide-react";

const courses = [
  {
    t: "24/7 Practical Meditation",
    d: "Integrating mindfulness into every moment of your day.",
    type: "Self-Paced",
  },
  {
    t: "Developing Spiritual Awareness",
    d: "Deepen your understanding of your true identity.",
    type: "Certificate",
  },
  {
    t: "This Thing Called Mind",
    d: "Understanding the thoughts and emotions that shape your life.",
    type: "Video Series",
  },
  {
    t: "Exploring Eternal Reality",
    d: "Wisdom on the nature of time and eternity.",
    type: "Knowledge",
  },
  {
    t: "Meditation in Action",
    d: "How to stay peaceful while being active in the world.",
    type: "Interactive",
  },
];

const resources = [
  {
    title: "Meditation Commentary (Audio)",
    desc: "Guided sessions for beginners and advanced practitioners.",
    icon: Music,
  },
  {
    title: "Introduction to Raja Yoga",
    desc: "A comprehensive PDF guide to our core philosophy.",
    icon: FileText,
  },
  {
    title: "Inner Power Workshop Material",
    desc: "Student workbook for self-transformation.",
    icon: Download,
  },
  {
    title: "Brahma Kumaris Global Wall",
    desc: "Access the latest spiritual news and wisdom globally.",
    icon: LinkIcon,
  },
];

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function LearnAndResourcesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="border-b border-border-subtle bg-surface pt-[var(--nav-stack)] pb-10 md:pb-14">
        <div className="container mx-auto max-w-3xl px-[var(--gutter)]">
          <p className="text-sm font-medium text-muted">Brahma Kumaris · Knowledge</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Learning and resources
          </h1>
          <p className="mt-4 text-base leading-relaxed text-foreground/80">
            Self-paced courses, downloads, and links for Raja Yoga study and daily practice.
          </p>
        </div>
      </section>

      {/* e-Learning */}
      <section id="e-learning" className="scroll-mt-[var(--nav-stack)] py-10 md:py-14">
        <div className="container mx-auto max-w-4xl px-[var(--gutter)]">
          <div className="mb-8 border-b border-border-subtle pb-6">
            <h2 className="text-xl font-semibold text-foreground md:text-2xl">E-learning</h2>
            <p className="mt-2 text-sm text-foreground/75 md:text-base">
              Study at your own pace with audio and video guidance.
            </p>
          </div>
          <ul className="divide-y divide-border-subtle border-y border-border-subtle">
            {courses.map((course, i) => (
              <li
                key={i}
                className="flex flex-col gap-4 py-6 md:flex-row md:items-start md:justify-between md:gap-8"
              >
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface text-primary">
                    <PlayCircle size={20} aria-hidden />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted">{course.type}</p>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">{course.t}</h3>
                  </div>
                </div>
                <div className="min-w-0 flex-1 md:max-w-md md:text-right">
                  <p className="text-sm leading-relaxed text-foreground/70">{course.d}</p>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Access <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Downloads & links */}
      <section id="downloads" className="scroll-mt-[var(--nav-stack)] border-t border-border-subtle bg-background py-10 md:py-14">
        <div className="container mx-auto max-w-4xl px-[var(--gutter)]">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground md:text-2xl">Downloads and media</h2>
            <p className="mt-2 text-sm text-foreground/75 md:text-base">
              Materials to support your daily practice.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {resources.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-lg border border-border-subtle bg-surface p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-background text-primary">
                  <item.icon size={22} strokeWidth={1.5} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/70">{item.desc}</p>
                  <button type="button" className="mt-3 text-sm font-medium text-primary hover:underline">
                    Open or download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global */}
      <section className="border-t border-border-subtle bg-surface py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-[var(--gutter)] text-center">
          <BookOpen className="mx-auto mb-4 h-10 w-10 text-muted" aria-hidden />
          <h2 className="text-xl font-semibold text-foreground md:text-2xl">
            Global Brahma Kumaris resources
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-foreground/75">
            Wider libraries of murli, apps, and messages are available on official Brahma Kumaris
            channels worldwide.
          </p>
          <div className="mx-auto mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              className="flex items-center justify-between rounded-md border border-border-subtle bg-background px-4 py-3 text-left text-sm font-medium text-foreground hover:border-primary/40"
            >
              Daily murli
              <ExternalLink size={16} className="shrink-0 text-muted" aria-hidden />
            </button>
            <button
              type="button"
              className="flex items-center justify-between rounded-md border border-border-subtle bg-background px-4 py-3 text-left text-sm font-medium text-foreground hover:border-primary/40"
            >
              Spiritual tools app
              <ExternalLink size={16} className="shrink-0 text-muted" aria-hidden />
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border-subtle bg-stone-900 py-10 text-stone-300">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-[var(--gutter)] sm:flex-row">
          <p className="text-center text-sm text-stone-400 sm:text-left">
            Parasmani · Brahma Kumaris Mulund Sub Zone
          </p>
          <Link href="/dashboard" className="text-sm font-medium text-white hover:underline">
            Facilitator dashboard
          </Link>
        </div>
      </footer>
    </main>
  );
}
