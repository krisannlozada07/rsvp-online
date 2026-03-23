"use client";

import { useState } from "react";
import { Event } from "@/types";
import { localInputToUTC8ISO, utcToUTC8Input } from "@/lib/utils";

const inputClass =
  "w-full border border-stone-300 rounded-xl px-4 py-2.5 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent placeholder:text-stone-400 transition-shadow";

interface Props {
  event: Event;
  creatorToken: string;
  onSaved: (updated: Event) => void;
  onCancel: () => void;
}

export default function EditEventForm({ event, creatorToken, onSaved, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const title = data.get("title") as string;
    const description = data.get("description") as string;
    const event_date = data.get("event_date") as string;
    const location = data.get("location") as string;
    const rsvp_start = data.get("rsvp_start") as string;
    const rsvp_end = data.get("rsvp_end") as string;

    // Convert datetime inputs (entered as UTC+8) to UTC ISO
    const rsvp_start_utc = localInputToUTC8ISO(rsvp_start);
    const rsvp_end_utc = localInputToUTC8ISO(rsvp_end);
    const event_date_utc = event_date ? localInputToUTC8ISO(event_date) : null;

    if (new Date(rsvp_end_utc) <= new Date(rsvp_start_utc)) {
      setError("RSVP end must be after start.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creator_token: creatorToken,
          title,
          description,
          event_date: event_date_utc,
          location,
          rsvp_start: rsvp_start_utc,
          rsvp_end: rsvp_end_utc,
        }),
      });

      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || "Failed to update");
      onSaved(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1.5">Event Name *</label>
        <input
          name="title"
          type="text"
          required
          defaultValue={event.title}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-stone-600 mb-1.5">Description</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={event.description ?? ""}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1.5">Event Date</label>
          <input
            name="event_date"
            type="datetime-local"
            defaultValue={event.event_date ? utcToUTC8Input(event.event_date) : ""}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1.5">Location</label>
          <input
            name="location"
            type="text"
            defaultValue={event.location ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div className="bg-stone-50 rounded-xl p-3 space-y-3">
        <p className="text-xs font-medium text-stone-600">RSVP Window *</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-stone-500 mb-1">Opens</label>
            <input
              name="rsvp_start"
              type="datetime-local"
              required
              defaultValue={utcToUTC8Input(event.rsvp_start)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1">Closes</label>
            <input
              name="rsvp_end"
              type="datetime-local"
              required
              defaultValue={utcToUTC8Input(event.rsvp_end)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {error && <p className="text-rose-600 text-sm">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-stone-300 text-stone-700 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-stone-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
