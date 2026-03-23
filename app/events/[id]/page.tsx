import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import EventHeader from "@/components/EventHeader";
import RSVPForm from "@/components/RSVPForm";
import Countdown from "@/components/Countdown";
import { Event } from "@/types";

interface Props {
  params: { id: string };
}

async function getEvent(id: string): Promise<Event | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
  if (error || !data) return null;
  return data as Event;
}

export async function generateMetadata({ params }: Props) {
  const event = await getEvent(params.id);
  return {
    title: event ? `RSVP — ${event.title}` : "Event Not Found",
  };
}

export default async function EventPage({ params }: Props) {
  const event = await getEvent(params.id);
  if (!event) notFound();

  return (
    <div className="space-y-6">
      <EventHeader event={event} />
      <Countdown event={event} />

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-stone-900 mb-5">Your RSVP</h2>
        <RSVPForm event={event} />
      </div>
    </div>
  );
}
