import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// GET /api/events?ids=id1,id2,id3
export async function GET(req: NextRequest) {
  try {
    const ids = req.nextUrl.searchParams.get("ids");
    if (!ids) return NextResponse.json([]);

    const idList = ids.split(",").filter(Boolean);
    if (idList.length === 0) return NextResponse.json([]);

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .in("id", idList)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

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
