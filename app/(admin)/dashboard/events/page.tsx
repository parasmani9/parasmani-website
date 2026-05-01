'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

type EventType = 'virtual' | 'in-person' | 'hybrid';

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
  event_start_at: string | null;
  event_end_at: string | null;
  event_sessions: AdminEventSession[];
}

interface AdminEventSession {
  id: string;
  session_name: string;
  start_at: string;
  end_at: string;
  is_active: boolean;
}

interface EventFormState {
  title: string;
  slug: string;
  description: string;
  eventType: EventType;
  imageUrlsText: string;
  location: string;
  eventStartAt: string;
  eventEndAt: string;
}

const initialFormState: EventFormState = {
  title: '',
  slug: '',
  description: '',
  eventType: 'in-person',
  imageUrlsText: '',
  location: '',
  eventStartAt: '',
  eventEndAt: '',
};

interface SessionFormState {
  sessionId: string | null;
  sessionName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const initialSessionFormState: SessionFormState = {
  sessionId: null,
  sessionName: '',
  sessionDate: '',
  startTime: '',
  endTime: '',
  isActive: true,
};

interface CreateSessionDraft {
  key: string;
  sessionName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const createDefaultSessionDraft = (): CreateSessionDraft => ({
  key: crypto.randomUUID(),
  sessionName: 'Day 1 Session',
  sessionDate: '',
  startTime: '',
  endTime: '',
  isActive: true,
});

const toTitleCase = (value: string) =>
  value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

const toDateTimeLocalValue = (value: string) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toDateValue = (value: string) => toDateTimeLocalValue(value).split('T')[0];
const toTimeValue = (value: string) => toDateTimeLocalValue(value).split('T')[1];

const combineDateAndTimeToIso = (dateValue: string, timeValue: string) =>
  new Date(`${dateValue}T${timeValue}:00`).toISOString();

const toDateStartIso = (dateValue: string) => new Date(`${dateValue}T00:00:00`).toISOString();
const toDateEndIso = (dateValue: string) => new Date(`${dateValue}T23:59:59`).toISOString();

export default function AdminEventsPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [deletingImageUrl, setDeletingImageUrl] = useState<string | null>(null);
  const [isSessionSubmitting, setIsSessionSubmitting] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [exportingEventId, setExportingEventId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formState, setFormState] = useState<EventFormState>(initialFormState);
  const [sessionFormState, setSessionFormState] = useState<SessionFormState>(initialSessionFormState);
  const [createSessions, setCreateSessions] = useState<CreateSessionDraft[]>([createDefaultSessionDraft()]);

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
      isPublished: true,
      eventStartAt: formState.eventStartAt ? toDateStartIso(formState.eventStartAt) : null,
      eventEndAt: formState.eventEndAt ? toDateEndIso(formState.eventEndAt) : null,
      sessions:
        editingEventId === null
          ? createSessions
              .filter(
                (session) =>
                  session.sessionName &&
                  session.sessionDate &&
                  session.startTime &&
                  session.endTime
              )
              .map((session) => ({
                sessionName: session.sessionName,
                startAt: combineDateAndTimeToIso(session.sessionDate, session.startTime),
                endAt: combineDateAndTimeToIso(session.sessionDate, session.endTime),
                isActive: session.isActive,
              }))
          : undefined,
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
      setCreateSessions([createDefaultSessionDraft()]);
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
      eventStartAt: event.event_start_at ? toDateValue(event.event_start_at) : '',
      eventEndAt: event.event_end_at ? toDateValue(event.event_end_at) : '',
    });
    setSessionFormState(initialSessionFormState);
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
    setFormState(initialFormState);
    setSessionFormState(initialSessionFormState);
    setCreateSessions([createDefaultSessionDraft()]);
  };

  const handleSetCreateSessionField = <Key extends keyof CreateSessionDraft>(
    sessionKey: string,
    key: Key,
    value: CreateSessionDraft[Key]
  ) => {
    setCreateSessions((previous) =>
      previous.map((session) =>
        session.key === sessionKey ? { ...session, [key]: value } : session
      )
    );
  };

  const handleAddCreateSession = () => {
    setCreateSessions((previous) => [
      ...previous,
      {
        key: crypto.randomUUID(),
        sessionName: `Day ${previous.length + 1} Session`,
        sessionDate: '',
        startTime: '',
        endTime: '',
        isActive: true,
      },
    ]);
  };

  const handleRemoveCreateSession = (sessionKey: string) => {
    setCreateSessions((previous) => {
      if (previous.length <= 1) {
        return previous;
      }
      return previous.filter((session) => session.key !== sessionKey);
    });
  };

  const handleSetSessionField = <Key extends keyof SessionFormState>(
    key: Key,
    value: SessionFormState[Key]
  ) => {
    setSessionFormState((previous) => ({ ...previous, [key]: value }));
  };

  const handleSaveSession = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!editingEventId) {
      setErrorMessage('Select an event to manage sessions.');
      return;
    }

    if (
      !sessionFormState.sessionName ||
      !sessionFormState.sessionDate ||
      !sessionFormState.startTime ||
      !sessionFormState.endTime
    ) {
      setErrorMessage('Session name, date, start time, and end time are required.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSessionSubmitting(true);

    const endpoint = sessionFormState.sessionId
      ? `/api/admin/events/sessions/${sessionFormState.sessionId}`
      : `/api/admin/events/${editingEventId}/sessions`;
    const method = sessionFormState.sessionId ? 'PATCH' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionName: sessionFormState.sessionName.trim(),
          startAt: combineDateAndTimeToIso(sessionFormState.sessionDate, sessionFormState.startTime),
          endAt: combineDateAndTimeToIso(sessionFormState.sessionDate, sessionFormState.endTime),
          isActive: sessionFormState.isActive,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to save session');
      }

      setSuccessMessage(sessionFormState.sessionId ? 'Session updated successfully.' : 'Session added successfully.');
      setSessionFormState(initialSessionFormState);
      await loadEvents();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setIsSessionSubmitting(false);
    }
  };

  const handleEditSession = (session: AdminEventSession) => {
    setSessionFormState({
      sessionId: session.id,
      sessionName: session.session_name,
      sessionDate: toDateValue(session.start_at),
      startTime: toTimeValue(session.start_at),
      endTime: toTimeValue(session.end_at),
      isActive: session.is_active,
    });
  };

  const handleDeleteSession = async (sessionId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setDeletingSessionId(sessionId);

    try {
      const response = await fetch(`/api/admin/events/sessions/${sessionId}`, { method: 'DELETE' });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to delete session');
      }

      if (sessionFormState.sessionId === sessionId) {
        setSessionFormState(initialSessionFormState);
      }
      setSuccessMessage('Session deleted successfully.');
      await loadEvents();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setDeletingSessionId(null);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const shouldDelete = window.confirm('Delete this event and all related sessions/registrations?');
    if (!shouldDelete) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setDeletingEventId(eventId);

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE' });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to delete event');
      }

      if (editingEventId === eventId) {
        setEditingEventId(null);
        setFormState(initialFormState);
        setSessionFormState(initialSessionFormState);
        setCreateSessions([createDefaultSessionDraft()]);
      }
      setSuccessMessage('Event deleted successfully.');
      await loadEvents();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleExportRegistrationsCsv = async (eventItem: AdminEvent) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setExportingEventId(eventItem.id);

    try {
      const response = await fetch(`/api/admin/events/${eventItem.id}/registrations/export`);
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'Unable to export registrations');
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = `${eventItem.slug || 'event'}-registrations.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(blobUrl);
      setSuccessMessage('Registrations exported successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setExportingEventId(null);
    }
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
        {editingEvent ? (
          <p className="mt-2 text-xs font-medium text-primary">
            Session management is enabled below for this event.
          </p>
        ) : (
          <p className="mt-2 text-xs text-zinc-500">
            Select an existing event and click Edit Event to manage details and sessions.
          </p>
        )}

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
                {(['virtual', 'in-person', 'hybrid'] as const).map((option) => (
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

            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-700">Event Start</span>
              <input
                type="date"
                value={formState.eventStartAt}
                onChange={(eventInput) => handleSetField('eventStartAt', eventInput.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus-visible:outline-zinc-400"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm font-medium text-zinc-700">Event End</span>
              <input
                type="date"
                value={formState.eventEndAt}
                onChange={(eventInput) => handleSetField('eventEndAt', eventInput.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus-visible:outline-zinc-400"
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

            {!editingEventId ? (
              <div className="space-y-3 md:col-span-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-900">Sessions (during event creation)</p>
                  <button
                    type="button"
                    onClick={handleAddCreateSession}
                    className="inline-flex min-h-8 items-center justify-center rounded-md border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                  >
                    + Add Session
                  </button>
                </div>
                {createSessions.map((session, index) => (
                  <div
                    key={session.key}
                    className="grid grid-cols-1 gap-2 rounded-md border border-zinc-200 bg-white p-3 md:grid-cols-4"
                  >
                    <label className="space-y-1 md:col-span-4">
                      <span className="text-xs font-medium text-zinc-700">Session Name</span>
                      <input
                        value={session.sessionName}
                        onChange={(eventInput) =>
                          handleSetCreateSessionField(session.key, 'sessionName', eventInput.target.value)
                        }
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                        placeholder={`Day ${index + 1} Session`}
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-xs font-medium text-zinc-700">Date</span>
                      <input
                        type="date"
                        value={session.sessionDate}
                        onChange={(eventInput) =>
                          handleSetCreateSessionField(session.key, 'sessionDate', eventInput.target.value)
                        }
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-xs font-medium text-zinc-700">Start Time</span>
                      <input
                        type="time"
                        value={session.startTime}
                        onChange={(eventInput) =>
                          handleSetCreateSessionField(session.key, 'startTime', eventInput.target.value)
                        }
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-xs font-medium text-zinc-700">End Time</span>
                      <input
                        type="time"
                        value={session.endTime}
                        onChange={(eventInput) =>
                          handleSetCreateSessionField(session.key, 'endTime', eventInput.target.value)
                        }
                        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                      />
                    </label>
                    <div className="md:col-span-4 flex items-center justify-between">
                      <label className="inline-flex items-center gap-2 text-xs text-zinc-700">
                        <input
                          type="checkbox"
                          checked={session.isActive}
                          onChange={(eventInput) =>
                            handleSetCreateSessionField(session.key, 'isActive', eventInput.target.checked)
                          }
                        />
                        Active
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveCreateSession(session.key)}
                        className="inline-flex min-h-8 items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 disabled:opacity-50"
                        disabled={createSessions.length <= 1}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {editingEvent ? (
              <div className="mt-2 border-t border-zinc-200 pt-6 md:col-span-2">
                <h2 className="text-lg font-semibold text-zinc-900">Session Management</h2>
                <p className="mt-1 text-sm text-zinc-600">Add or update event timing sessions.</p>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-sm font-medium text-zinc-700">Session Name</span>
                    <input
                      value={sessionFormState.sessionName}
                      onChange={(eventInput) => handleSetSessionField('sessionName', eventInput.target.value)}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                      placeholder="Day 1 Morning"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-zinc-700">Date</span>
                    <input
                      type="date"
                      value={sessionFormState.sessionDate}
                      onChange={(eventInput) => handleSetSessionField('sessionDate', eventInput.target.value)}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-zinc-700">Start Time</span>
                    <input
                      type="time"
                      value={sessionFormState.startTime}
                      onChange={(eventInput) => handleSetSessionField('startTime', eventInput.target.value)}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm font-medium text-zinc-700">End Time</span>
                    <input
                      type="time"
                      value={sessionFormState.endTime}
                      onChange={(eventInput) => handleSetSessionField('endTime', eventInput.target.value)}
                      className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
                    />
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-zinc-700 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={sessionFormState.isActive}
                      onChange={(eventInput) => handleSetSessionField('isActive', eventInput.target.checked)}
                    />
                    Session active
                  </label>
                  <div className="flex gap-2 md:col-span-2">
                    <button
                      type="button"
                      onClick={() => handleSaveSession()}
                      disabled={isSessionSubmitting}
                      className="inline-flex min-h-10 items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
                    >
                      {isSessionSubmitting
                        ? 'Saving Session...'
                        : sessionFormState.sessionId
                          ? 'Update Session'
                          : 'Add Session'}
                    </button>
                    {sessionFormState.sessionId ? (
                      <button
                        type="button"
                        onClick={() => setSessionFormState(initialSessionFormState)}
                        className="inline-flex min-h-10 items-center justify-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700"
                      >
                        Cancel Session Edit
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {(editingEvent.event_sessions ?? []).length === 0 ? (
                    <p className="text-sm text-zinc-600">No sessions added yet.</p>
                  ) : null}
                  {(editingEvent.event_sessions ?? [])
                    .slice()
                    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
                    .map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{session.session_name}</p>
                          <p className="text-xs text-zinc-600">
                            {new Date(session.start_at).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(session.end_at).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditSession(session)}
                            className="inline-flex min-h-8 items-center justify-center rounded-md border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-white"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSession(session.id)}
                            disabled={deletingSessionId === session.id}
                            className="inline-flex min-h-8 items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-70"
                          >
                            {deletingSessionId === session.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
          </div>

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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportRegistrationsCsv(event)}
                  disabled={exportingEventId === event.id}
                  className="inline-flex min-h-9 items-center justify-center rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-60"
                >
                  {exportingEventId === event.id ? 'Exporting...' : 'Export CSV'}
                </button>
                <button
                  type="button"
                  onClick={() => handleEditEvent(event)}
                  className="inline-flex min-h-9 items-center justify-center rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-white"
                >
                  Edit Event
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(event.id)}
                  disabled={deletingEventId === event.id}
                  className="inline-flex min-h-9 items-center justify-center rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                >
                  {deletingEventId === event.id ? 'Deleting...' : 'Delete Event'}
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
