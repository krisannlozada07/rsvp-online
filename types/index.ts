export type RSVPResponse = "yes" | "no" | "maybe";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  theme_url: string | null;
  rsvp_start: string;
  rsvp_end: string;
  creator_token: string;
  is_closed: boolean;
  created_at: string;
}

export interface RSVP {
  id: string;
  event_id: string;
  name: string;
  response: RSVPResponse;
  message: string | null;
  created_at: string;
  updated_at: string;
}

export type RSVPStatus = "upcoming" | "open" | "closed" | "force_closed";

export interface LocalRSVPData {
  name: string;
  pin: string;
  rsvpId: string;
  response: RSVPResponse;
}
