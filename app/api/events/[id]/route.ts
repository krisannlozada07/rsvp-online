import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !data) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { creator_token, title, description, event_date, location, rsvp_start, rsvp_end } =
      await req.json();

    if (!creator_token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!title || !rsvp_start || !rsvp_end)
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    if (new Date(rsvp_end) <= new Date(rsvp_start))
      return NextResponse.json({ error: "RSVP end must be after start" }, { status: 400 });

    const supabase = createServiceClient();

    const { data: event } = await supabase
      .from("events")
      .select("creator_token")
      .eq("id", params.id)
      .single();

    if (!event || event.creator_token !== creator_token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("events")
      .update({ title, description, event_date: event_date || null, location, rsvp_start, rsvp_end })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { creator_token } = await req.json();
    if (!creator_token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createServiceClient();

    const { data: event } = await supabase
      .from("events")
      .select("creator_token")
      .eq("id", params.id)
      .single();

    if (!event || event.creator_token !== creator_token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error } = await supabase.from("events").delete().eq("id", params.id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
