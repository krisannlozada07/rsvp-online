import { isAfter, isBefore } from "date-fns";
import { RSVPStatus, Event } from "@/types";

const TZ = "Asia/Manila"; // UTC+8

export function getEventStatus(event: Event): RSVPStatus {
  if (event.is_closed) return "force_closed";
  const now = new Date();
  const start = new Date(event.rsvp_start);
  const end = new Date(event.rsvp_end);
  if (isBefore(now, start)) return "upcoming";
  if (isAfter(now, end)) return "closed";
  return "open";
}

export function formatDate(dateStr: string | null, fmt?: string): string {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: TZ,
    weekday: fmt === "EEEE, MMMM d, yyyy" ? "long" : undefined,
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: TZ,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(dateStr));
}

export function getLocalRSVPKey(eventId: string) {
  return `rsvp_${eventId}`;
}

// Interpret a datetime-local string (YYYY-MM-DDTHH:mm) as UTC+8 and return UTC ISO.
// Uses Date.UTC explicitly — no string timezone parsing which varies across browsers.
export function localInputToUTC8ISO(local: string): string {
  if (!local) return "";
  const [datePart, timePart] = local.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  // UTC+8 means UTC = local - 8h
  return new Date(Date.UTC(year, month - 1, day, hours - 8, minutes)).toISOString();
}

// Convert a UTC ISO string to a datetime-local input value displayed in UTC+8.
export function utcToUTC8Input(iso: string): string {
  if (!iso) return "";
  // Add 8h to get UTC+8 wall time, then format as YYYY-MM-DDTHH:mm
  const utc8ms = new Date(iso).getTime() + 8 * 60 * 60 * 1000;
  return new Date(utc8ms).toISOString().slice(0, 16);
}

export function statusLabel(status: RSVPStatus): string {
  switch (status) {
    case "open": return "RSVP Open";
    case "upcoming": return "Opening Soon";
    case "closed": return "RSVP Closed";
    case "force_closed": return "RSVP Closed";
  }
}

export function statusColor(status: RSVPStatus): string {
  switch (status) {
    case "open": return "bg-emerald-100 text-emerald-800";
    case "upcoming": return "bg-amber-100 text-amber-800";
    case "closed":
    case "force_closed": return "bg-stone-100 text-stone-600";
  }
}

export function responseLabel(r: string): string {
  if (r === "yes") return "Attending";
  if (r === "no") return "Not Attending";
  return "Maybe";
}

export function responseColor(r: string): string {
  if (r === "yes") return "bg-emerald-100 text-emerald-800";
  if (r === "no") return "bg-rose-100 text-rose-800";
  return "bg-amber-100 text-amber-800";
}
