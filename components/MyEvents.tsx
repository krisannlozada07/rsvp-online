"use client";

import { useState, useEffect } from "react";
import { Event } from "@/types";
import { formatDate, getEventStatus, statusLabel, statusColor } from "@/lib/utils";

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const raw = localStorage.getItem("creator_events");
        if (!raw) { setLoading(false); return; }

        const stored: Record<string, unknown> = JSON.parse(raw);
        const ids = Object.keys(stored);
        if (ids.length === 0) { setLoading(false); return; }

        const res = await fetch(`/api/events?ids=${ids.join(",")}`);
        if (!res.ok) throw new Error("Failed to load events");

        const data: Event[] = await res.json();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="space-y-2">
      {[1, 2].map(i => (
        <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );

  if (error) return (
    <p className="text-sm text-rose-500">{error}</p>
  );

  if (events.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">
        My Events
      </h2>
      <div className="space-y-2">
        {events.map((event) => {
          const status = getEventStatus(event);
          return (
            <a
              key={event.id}
              href={`/events/${event.id}/manage`}
              className="flex items-center justify-between bg-white border border-stone-200 rounded-xl px-4 py-3 hover:border-stone-400 hover:shadow-sm transition-all group"
            >
              <div className="min-w-0">
                <p className="font-medium text-stone-900 text-sm truncate group-hover:text-stone-700">
                  {event.title}
                </p>
                {event.event_date && (
                  <p className="text-xs text-stone-400 mt-0.5">
                    {formatDate(event.event_date)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(status)}`}>
                  {statusLabel(status)}
                </span>
                <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
