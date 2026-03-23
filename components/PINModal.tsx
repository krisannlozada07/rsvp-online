"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  title?: string;
  description?: string;
  onConfirm: (pin: string) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export default function PINModal({ title = "Enter your PIN", description, onConfirm, onCancel, loading, error }: Props) {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  function handleChange(i: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...pin];
    next[i] = val;
    setPin(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !pin[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    if (e.key === "Enter") handleSubmit();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...pin];
    text.split("").forEach((ch, i) => { next[i] = ch; });
    setPin(next);
    const lastFilled = Math.min(text.length, 5);
    inputs.current[lastFilled]?.focus();
  }

  function handleSubmit() {
    const full = pin.join("");
    if (full.length === 6) onConfirm(full);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-1">{title}</h2>
        {description && <p className="text-sm text-stone-500 mb-5">{description}</p>}

        <div className="flex gap-2 justify-center mb-5">
          {pin.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="w-11 h-12 text-center text-xl font-bold border-2 border-stone-300 rounded-lg focus:border-stone-800 focus:outline-none transition-colors"
            />
          ))}
        </div>

        {error && (
          <p className="text-rose-600 text-sm text-center mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-stone-300 rounded-xl text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={pin.join("").length < 6 || loading}
            className="flex-1 py-2.5 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 disabled:opacity-40 transition-colors"
          >
            {loading ? "Verifying..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
