import { format, isAfter, isBefore } from "date-fns";
import { RSVPStatus, Event } from "@/types";

export function getEventStatus(event: Event): RSVPStatus {
  if (event.is_closed) return "force_closed";
  const now = new Date();
  const start = new Date(event.rsvp_start);
  const end = new Date(event.rsvp_end);
  if (isBefore(now, start)) return "upcoming";
  if (isAfter(now, end)) return "closed";
  return "open";
}

export function formatDate(dateStr: string | null, fmt = "MMM d, yyyy"): string {
  if (!dateStr) return "";
  return format(new Date(dateStr), fmt);
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), "MMM d, yyyy h:mm a");
}

export function getLocalRSVPKey(eventId: string) {
  return `rsvp_${eventId}`;
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
