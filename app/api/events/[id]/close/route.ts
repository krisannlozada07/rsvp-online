import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { creator_token, is_closed } = await req.json();
    if (!creator_token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createServiceClient();

    // Verify creator_token
    const { data: event } = await supabase
      .from("events")
      .select("creator_token")
      .eq("id", params.id)
      .single();

    if (!event || event.creator_token !== creator_token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("events")
      .update({ is_closed })
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
