"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Check, ChevronLeft, ChevronRight, Loader2, MapPin, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Navbar } from "@/components/Navbar";
import { cn } from "@/lib/utils";

type EventType = "virtual" | "in-person" | "hybrid";

interface EventSession {
  id: string;
  session_name: string;
  start_at: string;
  end_at: string;
}

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  image_url: string | null;
  image_urls?: string[];
  location: string | null;
  event_sessions: EventSession[];
}

interface RegistrationFormState {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  notes: string;
  consent: boolean;
}

const initialFormState: RegistrationFormState = {
  fullName: "",
  email: "",
  phone: "",
  city: "",
  notes: "",
  consent: true,
};

const toTitleCase = (value: string) =>
  value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const defaultEventImageUrl =
  "https://images.unsplash.com/photo-1470274038469-958113db2384?auto=format&fit=crop&q=80&w=1200";

const isRenderableImageUrl = (value: string) => {
  try {
    const parsedUrl = new URL(value);
    const pathname = parsedUrl.pathname.toLowerCase();
    const hasImageExtension = /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(pathname);
    const isUnsplashImageCdn = parsedUrl.hostname.includes("images.unsplash.com");
    const isSupabaseStorage = pathname.includes("/storage/v1/object/public/");
    const hasImageTransformQuery = parsedUrl.search.includes("auto=format");
    return hasImageExtension || isUnsplashImageCdn || isSupabaseStorage || hasImageTransformQuery;
  } catch {
    return false;
  }
};

export default function EventsPage() {
  const [filter, setFilter] = useState<"all" | EventType>("all");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openRegistrationEventId, setOpenRegistrationEventId] = useState<string | null>(null);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [formState, setFormState] = useState<RegistrationFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [activeImageIndexByEvent, setActiveImageIndexByEvent] = useState<Record<string, number>>({});
  const [expandedImageUrl, setExpandedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/events");
        const payload = (await response.json()) as { data?: EventItem[]; error?: string };
        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to fetch events");
        }
        setEvents(payload.data ?? []);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    };

    void loadEvents();
  }, []);

  const filteredEvents = useMemo(
    () => events.filter((event) => filter === "all" || event.event_type === filter),
    [events, filter]
  );

  const getEventImageUrls = (event: EventItem) => {
    const validImages = (event.image_urls ?? []).filter((url) => isRenderableImageUrl(url));
    if (validImages.length > 0) {
      return validImages;
    }
    if (event.image_url && isRenderableImageUrl(event.image_url)) {
      return [event.image_url];
    }
    return [defaultEventImageUrl];
  };

  const handleNextImage = (eventId: string, totalImages: number) => {
    setActiveImageIndexByEvent((previous) => {
      const current = previous[eventId] ?? 0;
      return { ...previous, [eventId]: (current + 1) % totalImages };
    });
  };

  const handlePreviousImage = (eventId: string, totalImages: number) => {
    setActiveImageIndexByEvent((previous) => {
      const current = previous[eventId] ?? 0;
      return { ...previous, [eventId]: (current - 1 + totalImages) % totalImages };
    });
  };

  const handleToggleRegistrationForm = (event: EventItem) => {
    setSubmitMessage(null);
    setSubmitStatus(null);
    setFormState(initialFormState);
    if (openRegistrationEventId === event.id) {
      setOpenRegistrationEventId(null);
      setSelectedSessionIds([]);
      return;
    }
    setOpenRegistrationEventId(event.id);
    setSelectedSessionIds(event.event_sessions.map((session) => session.id));
  };


  const toggleSession = (sessionId: string) => {
    setSelectedSessionIds((previous) => {
      if (previous.includes(sessionId)) {
        if (previous.length === 1) {
          return previous;
        }
        return previous.filter((id) => id !== sessionId);
      }
      return [...previous, sessionId];
    });
  };

  const handleRegister = async (eventId: string) => {
    if (!formState.fullName || !formState.email) {
      setSubmitMessage("Full name and email are required.");
      setSubmitStatus("error");
      return;
    }

    if (!formState.consent) {
      setSubmitMessage("Please confirm consent to continue.");
      setSubmitStatus("error");
      return;
    }

    if (selectedSessionIds.length === 0) {
      setSubmitMessage("Please keep at least one session selected.");
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);
    setSubmitStatus(null);
    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          fullName: formState.fullName,
          email: formState.email,
          phone: formState.phone || undefined,
          city: formState.city || undefined,
          notes: formState.notes || undefined,
          consent: formState.consent,
          sessionIds: selectedSessionIds,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to submit registration");
      }

      setSubmitMessage("Registration submitted successfully.");
      setSubmitStatus("success");
      setFormState(initialFormState);
      window.setTimeout(() => {
        setSubmitMessage(null);
        setSubmitStatus(null);
      }, 3200);
    } catch (submitError) {
      setSubmitMessage(submitError instanceof Error ? submitError.message : "Unexpected error");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-40 pb-14 bg-surface border-b border-border-subtle">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
              Events and programs
            </h1>
            <p className="text-base text-foreground/70">
              Registration now uses Supabase. All sessions are auto-selected by default. Uncheck any
              day you cannot attend.
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-[80px] z-30 bg-background border-b border-border-subtle py-3">
        <div className="container mx-auto px-6 flex items-center gap-4 overflow-x-auto">
          {(["all", "virtual", "in-person", "hybrid"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option as "all" | EventType)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all border",
                filter === option
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-background border-border-subtle text-foreground/70 hover:border-primary/60 hover:text-primary"
              )}
            >
              {toTitleCase(option)}
            </button>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-6">
          {loading && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading events...
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[0, 1].map((index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border-subtle bg-surface overflow-hidden animate-pulse"
                  >
                    <div className="aspect-[16/10] bg-zinc-200/70" />
                    <div className="p-6 space-y-3">
                      <div className="h-3 w-20 bg-zinc-200 rounded" />
                      <div className="h-5 w-2/3 bg-zinc-200 rounded" />
                      <div className="h-3 w-full bg-zinc-200 rounded" />
                      <div className="h-3 w-4/5 bg-zinc-200 rounded" />
                      <div className="h-9 w-28 bg-zinc-200 rounded-md mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredEvents.map((event) => (
                <article key={event.id} className="rounded-lg border border-border-subtle bg-surface overflow-hidden">
                  <div className="relative aspect-[16/10] bg-zinc-200 group">
                    {(() => {
                      const eventImageUrls = getEventImageUrls(event);
                      const activeImageIndex = activeImageIndexByEvent[event.id] ?? 0;
                      const activeImageUrl = eventImageUrls[Math.min(activeImageIndex, eventImageUrls.length - 1)];
                      return (
                        <>
                          <button
                            type="button"
                            onClick={() => setExpandedImageUrl(activeImageUrl)}
                            className="w-full h-full bg-cover bg-center cursor-zoom-in"
                            style={{ backgroundImage: `url(${activeImageUrl})` }}
                            aria-label={`Expand image for ${event.title}`}
                          />
                          {eventImageUrls.length > 1 ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handlePreviousImage(event.id, eventImageUrls.length)}
                                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-1.5 text-white opacity-90 hover:bg-black/65"
                                aria-label="Previous image"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleNextImage(event.id, eventImageUrls.length)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-1.5 text-white opacity-90 hover:bg-black/65"
                                aria-label="Next image"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-2 py-1">
                                {eventImageUrls.map((_, imageIndex) => (
                                  <button
                                    key={`${event.id}-${imageIndex}`}
                                    type="button"
                                    onClick={() =>
                                      setActiveImageIndexByEvent((previous) => ({
                                        ...previous,
                                        [event.id]: imageIndex,
                                      }))
                                    }
                                    className={cn(
                                      "h-1.5 w-1.5 rounded-full",
                                      imageIndex === activeImageIndex ? "bg-white" : "bg-white/50"
                                    )}
                                    aria-label={`Go to image ${imageIndex + 1}`}
                                  />
                                ))}
                              </div>
                            </>
                          ) : null}
                        </>
                      );
                    })()}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between gap-2 text-xs font-medium text-foreground/60">
                      <span>{toTitleCase(event.event_type)}</span>
                      {event.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.location}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-3 text-xl font-semibold">{event.title}</h2>
                    <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                      {event.description?.trim() || "Simple registration form only."}
                    </p>
                    <div className="mt-6 flex items-center gap-4">
                      <p className="text-xs text-foreground/60 inline-flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {event.event_sessions.length} session{event.event_sessions.length > 1 ? "s" : ""}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleToggleRegistrationForm(event)}
                        className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
                      >
                        {openRegistrationEventId === event.id ? "Close form" : "Register"}
                      </button>
                    </div>
                  </div>

                  {openRegistrationEventId === event.id ? (
                    <div className="border-t border-border-subtle bg-background p-6 space-y-4">
                      <h3 className="text-base font-semibold">Register for this event</h3>
                      <p className="text-xs text-foreground/65">
                        All sessions are selected by default. Uncheck only if you cannot attend a
                        specific day.
                      </p>
                      <div className="space-y-2">
                        {[...event.event_sessions]
                          .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
                          .map((session) => (
                          <label
                            key={session.id}
                            className="flex items-center justify-between rounded-md border border-border-subtle px-3 py-2 cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm text-foreground">{session.session_name}</span>
                              <span className="text-xs text-foreground/60">
                                {new Date(session.start_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} - {new Date(session.end_at).toLocaleString('en-US', { timeStyle: 'short' })}
                              </span>
                            </div>
                            <button
                              type="button"
                              aria-label={`Toggle ${session.session_name}`}
                              onClick={() => toggleSession(session.id)}
                              className={cn(
                                "w-6 h-6 rounded border flex items-center justify-center shrink-0 ml-4",
                                selectedSessionIds.includes(session.id)
                                  ? "bg-primary border-primary text-white"
                                  : "bg-white border-border-subtle text-transparent"
                              )}
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </label>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          value={formState.fullName}
                          onChange={(eventInput) =>
                            setFormState((previous) => ({
                              ...previous,
                              fullName: eventInput.target.value,
                            }))
                          }
                          className="rounded-md border border-border-subtle px-3 py-2 text-sm"
                          placeholder="Full name"
                        />
                        <input
                          value={formState.email}
                          onChange={(eventInput) =>
                            setFormState((previous) => ({
                              ...previous,
                              email: eventInput.target.value,
                            }))
                          }
                          className="rounded-md border border-border-subtle px-3 py-2 text-sm"
                          placeholder="Email"
                          type="email"
                        />
                        <input
                          value={formState.phone}
                          onChange={(eventInput) =>
                            setFormState((previous) => ({
                              ...previous,
                              phone: eventInput.target.value,
                            }))
                          }
                          className="rounded-md border border-border-subtle px-3 py-2 text-sm"
                          placeholder="Phone (optional)"
                        />
                        <input
                          value={formState.city}
                          onChange={(eventInput) =>
                            setFormState((previous) => ({
                              ...previous,
                              city: eventInput.target.value,
                            }))
                          }
                          className="rounded-md border border-border-subtle px-3 py-2 text-sm"
                          placeholder="City (optional)"
                        />
                      </div>
                      <textarea
                        value={formState.notes}
                        onChange={(eventInput) =>
                          setFormState((previous) => ({
                            ...previous,
                            notes: eventInput.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-border-subtle px-3 py-2 text-sm min-h-20"
                        placeholder="Notes (optional)"
                      />
                      <label className="flex items-center gap-2 text-xs text-foreground/75">
                        <input
                          type="checkbox"
                          checked={formState.consent}
                          onChange={(eventInput) =>
                            setFormState((previous) => ({
                              ...previous,
                              consent: eventInput.target.checked,
                            }))
                          }
                        />
                        I consent to submit my registration details.
                      </label>
                      {submitMessage && submitStatus !== "success" ? (
                        <p
                          className={cn(
                            "text-sm",
                            submitStatus === "error" ? "text-red-600" : "text-foreground/70"
                          )}
                        >
                          {submitMessage}
                        </p>
                      ) : null}
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleRegister(event.id)}
                        className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                      >
                        {isSubmitting ? "Submitting..." : "Submit registration"}
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {submitMessage && submitStatus === "success" ? (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="fixed bottom-6 right-6 z-[60] w-[min(92vw,360px)] rounded-lg border border-green-200 bg-green-50 p-4 shadow-lg"
          >
            <p className="text-sm font-semibold text-green-800">Success</p>
            <p className="mt-1 text-sm text-green-700">{submitMessage}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {expandedImageUrl ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/80 p-4 md:p-8"
            onClick={() => setExpandedImageUrl(null)}
          >
            <button
              type="button"
              onClick={() => setExpandedImageUrl(null)}
              className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/30"
              aria-label="Close expanded image"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              src={expandedImageUrl}
              alt="Event image preview"
              className="mx-auto h-full max-h-[92vh] w-full max-w-6xl object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
