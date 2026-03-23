import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import bcrypt from "bcryptjs";

// Verify PIN and return RSVP (for lookup / update flow)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, pin } = await req.json();
    if (!name || !pin) {
      return NextResponse.json({ error: "Name and PIN are required" }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { data: rsvp } = await supabase
      .from("rsvps")
      .select("*")
      .eq("event_id", params.id)
      .ilike("name", name.trim())
      .single();

    if (!rsvp) {
      return NextResponse.json({ error: "No RSVP found for this name" }, { status: 404 });
    }

    const valid = await bcrypt.compare(pin, rsvp.pin_hash);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect PIN" }, { status: 401 });
    }

    // Return RSVP without pin_hash
    const { pin_hash: _ph, ...safeRsvp } = rsvp;
    return NextResponse.json(safeRsvp);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to verify PIN" }, { status: 500 });
  }
}
