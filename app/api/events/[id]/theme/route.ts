import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const creator_token = formData.get("creator_token") as string | null;

    if (!file || !creator_token) {
      return NextResponse.json({ error: "Missing file or creator_token" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Verify creator
    const { data: event } = await supabase
      .from("events")
      .select("creator_token")
      .eq("id", params.id)
      .single();

    if (!event || event.creator_token !== creator_token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${params.id}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("themes")
      .upload(fileName, buffer, { contentType: file.type, upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("themes").getPublicUrl(fileName);
    const theme_url = urlData.publicUrl;

    const { data, error } = await supabase
      .from("events")
      .update({ theme_url })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ theme_url: data.theme_url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to upload theme" }, { status: 500 });
  }
}
