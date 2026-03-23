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
