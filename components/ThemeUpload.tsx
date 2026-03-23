"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface Props {
  eventId: string;
  creatorToken: string;
  currentThemeUrl: string | null;
  onUploaded: (url: string) => void;
}

export default function ThemeUpload({ eventId, creatorToken, currentThemeUrl, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(currentThemeUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("creator_token", creatorToken);

    try {
      const res = await fetch(`/api/events/${eventId}/theme`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUploaded(data.theme_url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setPreview(currentThemeUrl);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-2">Event Theme Image</label>

      {preview ? (
        <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3">
          <Image src={preview} alt="Theme preview" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={() => fileRef.current?.click()}
              className="bg-white text-stone-900 text-xs font-medium px-3 py-1.5 rounded-lg"
            >
              Change Image
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center gap-2 text-stone-400 hover:border-stone-400 hover:text-stone-500 transition-colors mb-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs">{uploading ? "Uploading..." : "Click to upload theme image"}</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="text-xs text-stone-500 hover:text-stone-800 underline transition-colors"
        >
          {uploading ? "Uploading..." : "Change image"}
        </button>
      )}

      {error && <p className="text-rose-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
