"use client";

import Image from "next/image";
import { Event } from "@/types";
import { formatDate, formatDateTime, getEventStatus, statusLabel, statusColor } from "@/lib/utils";

interface Props {
  event: Event;
}

export default function EventHeader({ event }: Props) {
  const status = getEventStatus(event);

  return (
    <div className="w-full">
      {/* Theme Image */}
      {event.theme_url ? (
        <div className="relative w-full h-48 sm:h-64 rounded-2xl overflow-hidden mb-6">
          <Image
            src={event.theme_url}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-2 ${statusColor(status)}`}>
              {statusLabel(status)}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{event.title}</h1>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${statusColor(status)}`}>
            {statusLabel(status)}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">{event.title}</h1>
        </div>
      )}

      {/* Event Details */}
      <div className="space-y-2 mb-4">
        {event.event_date && (
          <div className="flex items-center gap-2 text-stone-600 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(event.event_date, "EEEE, MMMM d, yyyy")}</span>
          </div>
        )}
        {event.location && (
          <div className="flex items-center gap-2 text-stone-600 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.location}</span>
          </div>
        )}
        {event.description && (
          <p className="text-stone-600 text-sm mt-3 leading-relaxed">{event.description}</p>
        )}
      </div>

      {/* RSVP Window */}
      <div className="bg-stone-50 rounded-xl px-4 py-3 text-xs text-stone-500 space-y-0.5">
        <div className="font-medium text-stone-700 mb-1">RSVP Window</div>
        <div>Opens: {formatDateTime(event.rsvp_start)}</div>
        <div>Closes: {formatDateTime(event.rsvp_end)}</div>
      </div>
    </div>
  );
}
