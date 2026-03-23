"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { localInputToUTC8ISO } from "@/lib/utils";

const inputClass =
  "w-full border border-stone-300 rounded-xl px-4 py-2.5 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent placeholder:text-stone-400 transition-shadow";

export default function CreateEventForm() {
  const router = useRouter();
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

    if (!rsvp_start || !rsvp_end) {
      setError("RSVP start and end time are required.");
      setLoading(false);
      return;
    }
    if (new Date(rsvp_end) <= new Date(rsvp_start)) {
      setError("RSVP end must be after start.");
      setLoading(false);
      return;
    }

    // Convert all datetime inputs (entered as UTC+8) to UTC ISO strings
    const rsvp_start_utc = localInputToUTC8ISO(rsvp_start);
    const rsvp_end_utc = localInputToUTC8ISO(rsvp_end);
    const event_date_utc = event_date ? localInputToUTC8ISO(event_date) : null;

    // Generate creator token and store in localStorage
    const creator_token = uuidv4();

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, event_date: event_date_utc, location, rsvp_start: rsvp_start_utc, rsvp_end: rsvp_end_utc, creator_token }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create event");
      }

      const event = await res.json();

      // Store event + creator token so My Events list works without a Supabase query
      const stored = JSON.parse(localStorage.getItem("creator_events") || "{}");
      stored[event.id] = { token: creator_token, event };
      localStorage.setItem("creator_events", JSON.stringify(stored));

      router.push(`/events/${event.id}/manage`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Event Name *</label>
        <input name="title" type="text" required placeholder="e.g. Annual Company Dinner" className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
        <textarea
          name="description"
          rows={3}
          placeholder="Tell guests what to expect..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Event Date</label>
          <input name="event_date" type="datetime-local" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Location</label>
          <input name="location" type="text" placeholder="Venue or address" className={inputClass} />
        </div>
      </div>

      <div className="bg-stone-50 rounded-xl p-4 space-y-4">
        <p className="text-sm font-medium text-stone-700">RSVP Window *</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-stone-500 mb-1.5">Opens</label>
            <input name="rsvp_start" type="datetime-local" required className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-stone-500 mb-1.5">Closes</label>
            <input name="rsvp_end" type="datetime-local" required className={inputClass} />
          </div>
        </div>
      </div>

      {error && <p className="text-rose-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors text-sm"
      >
        {loading ? "Creating..." : "Create Event"}
      </button>
    </form>
  );
}
