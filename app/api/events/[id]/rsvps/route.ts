import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("rsvps")
      .select("id, event_id, name, response, message, created_at, updated_at")
      .eq("event_id", params.id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch RSVPs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, response, pin, message } = await req.json();

    if (!name || !response || !pin) {
      return NextResponse.json({ error: "Name, response, and PIN are required" }, { status: 400 });
    }
    if (!/^\d{6}$/.test(pin)) {
      return NextResponse.json({ error: "PIN must be 6 digits" }, { status: 400 });
    }
    if (!["yes", "no", "maybe"].includes(response)) {
      return NextResponse.json({ error: "Invalid response" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Check if event exists and is open
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

    // Check if name already exists
    const { data: existing } = await supabase
      .from("rsvps")
      .select("id")
      .eq("event_id", params.id)
      .ilike("name", name.trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Name already exists. Please verify your PIN to update your response.", code: "NAME_EXISTS" },
        { status: 409 }
      );
    }

    const pin_hash = await bcrypt.hash(pin, 10);
    const { data, error } = await supabase
      .from("rsvps")
      .insert({ event_id: params.id, name: name.trim(), response, pin_hash, message })
      .select("id, event_id, name, response, message, created_at, updated_at")
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to submit RSVP" }, { status: 500 });
  }
}
