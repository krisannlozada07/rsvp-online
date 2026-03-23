"use client";

import { useState, useEffect } from "react";
import { Event } from "@/types";
import { formatDate, getEventStatus, statusLabel, statusColor } from "@/lib/utils";

interface StoredEntry {
  token: string;
  event: Event;
}

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("creator_events");
    if (!raw) { setMounted(true); return; }

    const stored: Record<string, StoredEntry | string> = JSON.parse(raw);
    const list: Event[] = [];

    for (const entry of Object.values(stored)) {
      // New format: { token, event }  |  Old format: just a token string (skip)
      if (typeof entry === "object" && entry.event) {
        list.push(entry.event);
      }
    }

    // Newest first by created_at
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setEvents(list);
    setMounted(true);
  }, []);

  if (!mounted || events.length === 0) return null;

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
