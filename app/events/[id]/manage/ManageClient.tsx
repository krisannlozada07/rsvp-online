"use client";

import { useState, useEffect } from "react";
import { Event, RSVP } from "@/types";
import EventHeader from "@/components/EventHeader";
import ResponseList from "@/components/ResponseList";
import ShareButton from "@/components/ShareButton";
import ThemeUpload from "@/components/ThemeUpload";
import Countdown from "@/components/Countdown";
import { getEventStatus, statusLabel, statusColor } from "@/lib/utils";

interface Props {
  event: Event;
  initialRSVPs: RSVP[];
}

export default function ManageClient({ event: initialEvent, initialRSVPs }: Props) {
  const [event, setEvent] = useState<Event>(initialEvent);
  const [rsvps, setRsvps] = useState<RSVP[]>(initialRSVPs);
  const [isCreator, setIsCreator] = useState(false);
  const [creatorToken, setCreatorToken] = useState("");
  const [closing, setClosing] = useState(false);
  const [tab, setTab] = useState<"responses" | "settings">("responses");
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("creator_events") || "{}");
    const token = stored[event.id];
    if (token) {
      setIsCreator(true);
      setCreatorToken(token);
    }
    setShareUrl(`${window.location.origin}/events/${event.id}`);
  }, [event.id]);

  async function refreshRSVPs() {
    const res = await fetch(`/api/events/${event.id}/rsvps`);
    if (res.ok) {
      const data = await res.json();
      setRsvps(data);
    }
  }

  async function handleToggleClose() {
    if (!isCreator) return;
    setClosing(true);
    try {
      const res = await fetch(`/api/events/${event.id}/close`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creator_token: creatorToken, is_closed: !event.is_closed }),
      });
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      }
    } finally {
      setClosing(false);
    }
  }

  const status = getEventStatus(event);

  return (
    <div className="space-y-6">
      <EventHeader event={event} />
      <Countdown event={event} />

      {/* Non-creator notice */}
      {!isCreator && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm">
          You are viewing this event&apos;s responses. Only the event creator can manage settings.
        </div>
      )}

      {/* Creator controls */}
      {isCreator && (
        <div className="flex gap-3">
          <ShareButton url={shareUrl} />
        </div>
      )}
      {!isCreator && shareUrl && <ShareButton url={shareUrl} />}

      {/* Tabs */}
      {isCreator && (
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
          {(["responses", "settings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
                tab === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Responses Tab */}
      {(tab === "responses" || !isCreator) && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-stone-900">Responses</h2>
            <button
              onClick={refreshRSVPs}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          <ResponseList rsvps={rsvps} />
        </div>
      )}

      {/* Settings Tab */}
      {tab === "settings" && isCreator && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
          <h2 className="text-base font-semibold text-stone-900">Event Settings</h2>

          {/* Theme Upload */}
          <ThemeUpload
            eventId={event.id}
            creatorToken={creatorToken}
            currentThemeUrl={event.theme_url}
            onUploaded={(url) => setEvent((e) => ({ ...e, theme_url: url }))}
          />

          <hr className="border-stone-200" />

          {/* RSVP Status Control */}
          <div>
            <p className="text-sm font-medium text-stone-700 mb-1">RSVP Status</p>
            <p className="text-xs text-stone-500 mb-3">
              Current status:{" "}
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(status)}`}>
                {statusLabel(status)}
              </span>
            </p>
            <button
              onClick={handleToggleClose}
              disabled={closing}
              className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
                event.is_closed
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-rose-600 text-white hover:bg-rose-700"
              } disabled:opacity-50`}
            >
              {closing
                ? "Updating..."
                : event.is_closed
                ? "Reopen RSVP"
                : "Close RSVP Early"}
            </button>
          </div>

          <hr className="border-stone-200" />

          {/* RSVP Link */}
          <div>
            <p className="text-sm font-medium text-stone-700 mb-2">RSVP Link for Guests</p>
            <a
              href={`/events/${event.id}`}
              target="_blank"
              className="text-sm text-stone-600 underline hover:text-stone-900 break-all"
            >
              {shareUrl}
            </a>
          </div>
        </div>
      )}

      {/* Go to RSVP page */}
      <div className="text-center">
        <a
          href={`/events/${event.id}`}
          className="text-sm text-stone-500 hover:text-stone-800 underline transition-colors"
        >
          View guest RSVP page →
        </a>
      </div>
    </div>
  );
}
