'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

type EventType = 'residential' | 'virtual' | 'in-person';

interface AdminEvent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  event_type: EventType;
  image_url: string | null;
  image_urls: string[];
  location: string | null;
  is_published: boolean;
}

interface EventFormState {
  title: string;
  slug: string;
  description: string;
  eventType: EventType;
  imageUrlsText: string;
  location: string;
  isPublished: boolean;
}

const initialFormState: EventFormState = {
  title: '',
  slug: '',
  description: '',
  eventType: 'residential',
  imageUrlsText: '',
  location: '',
  isPublished: false,
};

const toTitleCase = (value: string) =>
  value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImageUrl, setDeletingImageUrl] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formState, setFormState] = useState<EventFormState>(initialFormState);

  const editingEvent = useMemo(
    () => events.find((event) => event.id === editingEventId) ?? null,
    [editingEventId, events]
  );

  const loadEvents = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/admin/events');
      const payload = (await response.json()) as { data?: AdminEvent[]; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to load events');
      }

      setEvents(payload.data ?? []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadEvents();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  const handleSetField = <Key extends keyof EventFormState>(key: Key, value: EventFormState[Key]) => {
    setFormState((previous) => ({ ...previous, [key]: value }));
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    setErrorMessage(null);
    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];

      for (const selectedFile of Array.from(selectedFiles)) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        });
        const payload = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !payload.url) {
          throw new Error(payload.error ?? 'Unable to upload image');
        }
        uploadedUrls.push(payload.url);
      }

      setFormState((previous) => {
        const existingUrls = previous.imageUrlsText
          .split('\n')
          .map((value) => value.trim())
          .filter((value) => value.length > 0);
        return {
          ...previous,
          imageUrlsText: [...existingUrls, ...uploadedUrls].join('\n'),
        };
      });
      setSuccessMessage('Image uploaded successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setUploadingImages(false);
      event.target.value = '';
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setDeletingImageUrl(imageUrl);

    try {
      const response = await fetch('/api/admin/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: imageUrl }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to delete image');
      }

      setFormState((previous) => {
        const remainingUrls = previous.imageUrlsText
          .split('\n')
          .map((value) => value.trim())
          .filter((value) => value.length > 0 && value !== imageUrl);
        return { ...previous, imageUrlsText: remainingUrls.join('\n') };
      });
      setSuccessMessage('Image deleted successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setDeletingImageUrl(null);
    }
  };

  const handleCreateOrUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const requestBody = {
      title: formState.title,
      slug: formState.slug,
      description: formState.description || null,
      eventType: formState.eventType,
      imageUrls: formState.imageUrlsText
        .split('\n')
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
      location: formState.location || null,
      isPublished: formState.isPublished,
    };

    const endpoint = editingEventId ? `/api/admin/events/${editingEventId}` : '/api/admin/events';
    const method = editingEventId ? 'PATCH' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to save event');
      }

      setSuccessMessage(editingEventId ? 'Event updated successfully.' : 'Event created successfully.');
      setFormState(initialFormState);
      setEditingEventId(null);
      await loadEvents();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = (event: AdminEvent) => {
    setEditingEventId(event.id);
    setErrorMessage(null);
    setSuccessMessage(null);
    setFormState({
      title: event.title,
      slug: event.slug,
      description: event.description ?? '',
      eventType: event.event_type,
      imageUrlsText: (event.image_urls ?? []).join('\n'),
      location: event.location ?? '',
      isPublished: event.is_published,
    });
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
    setFormState(initialFormState);
  };

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold text-zinc-900">
          {editingEvent ? `Edit: ${editingEvent.title}` : 'Create Event'}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">Create and update event entries for the website.</p>

        <form className="mt-6 space-y-4" onSubmit={handleCreateOrUpdate}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-700">Title</span>
              <input
                required
                value={formState.title}
                onChange={(event) => handleSetField('title', event.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus-visible:outline-zinc-400"
                placeholder="Self-Transformation Bhatti"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-700">Slug</span>
              <input
                required
                value={formState.slug}
                onChange={(event) => handleSetField('slug', event.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus-visible:outline-zinc-400"
                placeholder="self-transformation-bhatti"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-700">Type</span>
              <select
                value={formState.eventType}
                onChange={(event) => handleSetField('eventType', event.target.value as EventType)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus-visible:outline-zinc-400"
              >
                {(['residential', 'virtual', 'in-person'] as const).map((option) => (
                  <option key={option} value={option}>
                    {toTitleCase(option)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-700">Location</span>
              <input
                value={formState.location}
                onChange={(event) => handleSetField('location', event.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus-visible:outline-zinc-400"
                placeholder="Pawasmai, Lonavala"
              />
            </label>

            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-zinc-700">Event Images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus-visible:outline-zinc-400"
              />
              <p className="text-xs text-zinc-500">
                {uploadingImages
                  ? 'Uploading images...'
                  : `Upload one or more images${formState.imageUrlsText ? ` (${formState.imageUrlsText.split('\n').filter((value) => value.trim().length > 0).length} uploaded)` : ''}`}
              </p>
            </label>

            {formState.imageUrlsText ? (
              <div className="space-y-2 md:col-span-2">
                <span className="text-sm font-medium text-zinc-700">Uploaded Images</span>
                <div className="space-y-2">
                  {formState.imageUrlsText
                    .split('\n')
                    .map((value) => value.trim())
                    .filter((value) => value.length > 0)
                    .map((imageUrl) => (
                      <div
                        key={imageUrl}
                        className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2"
                      >
                        <p className="truncate text-xs text-zinc-600">{imageUrl}</p>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(imageUrl)}
                          disabled={deletingImageUrl === imageUrl || isSubmitting}
                          className="inline-flex min-h-8 items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                        >
                          {deletingImageUrl === imageUrl ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            ) : null}

            <label className="space-y-1 md:col-span-2">
              <span className="text-sm font-medium text-zinc-700">Description</span>
              <textarea
                value={formState.description}
                onChange={(event) => handleSetField('description', event.target.value)}
                className="min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus-visible:outline-zinc-400"
                placeholder="Optional event details"
              />
            </label>
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={formState.isPublished}
              onChange={(event) => handleSetField('isPublished', event.target.checked)}
            />
            Publish this event
          </label>

          {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
          {successMessage ? <p className="text-sm text-green-700">{successMessage}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting || uploadingImages}
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            >
              {isSubmitting ? 'Saving...' : editingEventId ? 'Update Event' : 'Create Event'}
            </button>
            {editingEventId ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
        className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-zinc-900">Existing Events</h2>
        {isLoading ? <p className="mt-3 text-sm text-zinc-600">Loading events...</p> : null}
        {!isLoading && events.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-600">No events created yet.</p>
        ) : null}

        <div className="mt-4 space-y-3">
          {events.map((event, index) => (
            <motion.article
              key={event.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 flex items-start justify-between gap-4"
            >
              <div>
                <p className="text-base font-semibold text-zinc-900">{event.title}</p>
                <p className="text-xs text-zinc-500 mt-1">/{event.slug}</p>
                <p className="text-xs text-zinc-600 mt-2">
                  {toTitleCase(event.event_type)} • {event.is_published ? 'Published' : 'Draft'}
                </p>
                <p className="text-xs text-zinc-500 mt-1">{(event.image_urls ?? []).length} image(s)</p>
              </div>
              <button
                type="button"
                onClick={() => handleEditEvent(event)}
                className="inline-flex min-h-9 items-center justify-center rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-white"
              >
                Edit
              </button>
            </motion.article>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
