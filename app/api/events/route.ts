import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, event_date, location, rsvp_start, rsvp_end, creator_token } = body;

    if (!title || !rsvp_start || !rsvp_end || !creator_token) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("events")
      .insert({ title, description, event_date, location, rsvp_start, rsvp_end, creator_token })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
