import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; rsvpId: string } }
) {
  try {
    const { pin, response, message } = await req.json();
    if (!pin || !response) {
      return NextResponse.json({ error: "PIN and response are required" }, { status: 400 });
    }
    if (!["yes", "no", "maybe"].includes(response)) {
      return NextResponse.json({ error: "Invalid response" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Check if event is still open
    const { data: event } = await supabase
      .from("events")
      .select("rsvp_start, rsvp_end, is_closed")
      .eq("id", params.id)
      .single();

    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    const now = new Date();
    if (
      event.is_closed ||
      now < new Date(event.rsvp_start) ||
      now > new Date(event.rsvp_end)
    ) {
      return NextResponse.json({ error: "RSVP is not open" }, { status: 403 });
    }

    // Verify PIN
    const { data: rsvp } = await supabase
      .from("rsvps")
      .select("pin_hash")
      .eq("id", params.rsvpId)
      .eq("event_id", params.id)
      .single();

    if (!rsvp) return NextResponse.json({ error: "RSVP not found" }, { status: 404 });

    const valid = await bcrypt.compare(pin, rsvp.pin_hash);
    if (!valid) return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });

    const { data, error } = await supabase
      .from("rsvps")
      .update({ response, message })
      .eq("id", params.rsvpId)
      .select("id, event_id, name, response, message, created_at, updated_at")
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update RSVP" }, { status: 500 });
  }
}
