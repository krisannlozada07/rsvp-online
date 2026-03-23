import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { Event, RSVP } from "@/types";
import ManageClient from "./ManageClient";

interface Props {
  params: { id: string };
}

async function getEvent(id: string): Promise<Event | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data as Event;
}

async function getRSVPs(id: string): Promise<RSVP[]> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("rsvps")
    .select("id, event_id, name, response, message, created_at, updated_at")
    .eq("event_id", id)
    .order("created_at", { ascending: true });
  return (data as RSVP[]) || [];
}

export async function generateMetadata({ params }: Props) {
  const event = await getEvent(params.id);
  return {
    title: event ? `Manage — ${event.title}` : "Event Not Found",
  };
}

export default async function ManagePage({ params }: Props) {
  const [event, rsvps] = await Promise.all([getEvent(params.id), getRSVPs(params.id)]);
  if (!event) notFound();

  return <ManageClient event={event} initialRSVPs={rsvps} />;
}
