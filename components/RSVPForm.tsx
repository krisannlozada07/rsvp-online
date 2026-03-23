"use client";

import { useState, useEffect } from "react";
import PINModal from "./PINModal";
import { Event, RSVP, LocalRSVPData, RSVPResponse } from "@/types";
import { getEventStatus, responseColor, responseLabel } from "@/lib/utils";
import { getLocalRSVPKey } from "@/lib/utils";

interface Props {
  event: Event;
}

type Stage =
  | "name_entry"        // User enters their name
  | "new_rsvp"          // New user filling out form
  | "pin_verify"        // Existing user verifying PIN to view/edit
  | "view_response"     // Showing current response
  | "edit_response";    // Editing response (PIN already verified)

const inputClass =
  "w-full border border-stone-300 rounded-xl px-4 py-2.5 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-800 focus:border-transparent placeholder:text-stone-400 transition-shadow";

const responseOptions: { value: RSVPResponse; label: string; icon: string; color: string }[] = [
  { value: "yes", label: "Yes, I'll be there!", icon: "✓", color: "border-emerald-500 bg-emerald-50 text-emerald-800" },
  { value: "no", label: "Sorry, can't make it", icon: "✗", color: "border-rose-400 bg-rose-50 text-rose-800" },
  { value: "maybe", label: "Maybe", icon: "?", color: "border-amber-400 bg-amber-50 text-amber-800" },
];

export default function RSVPForm({ event }: Props) {
  const [stage, setStage] = useState<Stage>("name_entry");
  const [name, setName] = useState("");
  const [response, setResponse] = useState<RSVPResponse | "">("");
  const [message, setMessage] = useState("");
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [currentRSVP, setCurrentRSVP] = useState<RSVP | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPINModal, setShowPINModal] = useState(false);
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [verifiedPIN, setVerifiedPIN] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const status = getEventStatus(event);
  const storageKey = getLocalRSVPKey(event.id);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const data: LocalRSVPData = JSON.parse(stored);
      setName(data.name);
      setCurrentRSVP({
        id: data.rsvpId,
        event_id: event.id,
        name: data.name,
        response: data.response,
        message: null,
        created_at: "",
        updated_at: "",
      });
      setVerifiedPIN(data.pin);
      setStage("view_response");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleNameSubmit() {
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    try {
      // Check if name exists in supabase
      const res = await fetch(`/api/events/${event.id}/rsvps/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), pin: "000000" }), // dummy pin to check existence
      });

      if (res.status === 404) {
        // New user
        setStage("new_rsvp");
      } else {
        // Existing user - need to verify PIN
        setStage("pin_verify");
        setShowPINModal(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePINVerify(enteredPin: string) {
    setPinLoading(true);
    setPinError("");

    try {
      const res = await fetch(`/api/events/${event.id}/rsvps/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), pin: enteredPin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPinError(data.error || "Incorrect PIN");
        return;
      }

      setCurrentRSVP(data);
      setVerifiedPIN(enteredPin);
      setShowPINModal(false);

      // Save to localStorage
      const local: LocalRSVPData = { name: data.name, pin: enteredPin, rsvpId: data.id, response: data.response };
      localStorage.setItem(storageKey, JSON.stringify(local));

      setStage("view_response");
    } catch {
      setPinError("Something went wrong. Try again.");
    } finally {
      setPinLoading(false);
    }
  }

  async function handleSubmit() {
    if (!response) { setError("Please select a response."); return; }
    setLoading(true);
    setError("");

    const pinStr = pin.join("");
    if (stage === "new_rsvp" && pinStr.length < 6) {
      setError("Please enter a 6-digit PIN.");
      setLoading(false);
      return;
    }

    try {
      if (stage === "new_rsvp") {
        const res = await fetch(`/api/events/${event.id}/rsvps`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), response, pin: pinStr, message }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.code === "NAME_EXISTS") {
            setStage("pin_verify");
            setShowPINModal(true);
            setLoading(false);
            return;
          }
          throw new Error(data.error);
        }
        setCurrentRSVP(data);
        const local: LocalRSVPData = { name: data.name, pin: pinStr, rsvpId: data.id, response: data.response };
        localStorage.setItem(storageKey, JSON.stringify(local));
        setVerifiedPIN(pinStr);
      } else if (stage === "edit_response" && currentRSVP) {
        const res = await fetch(`/api/events/${event.id}/rsvps/${currentRSVP.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: verifiedPIN, response, message }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setCurrentRSVP(data);
        // Update localStorage
        const local: LocalRSVPData = { name: data.name, pin: verifiedPIN, rsvpId: data.id, response: data.response };
        localStorage.setItem(storageKey, JSON.stringify(local));
      }

      setSubmitted(true);
      setStage("view_response");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit() {
    if (!currentRSVP) return;
    setResponse(currentRSVP.response);
    setMessage(currentRSVP.message || "");
    setStage("edit_response");
    setSubmitted(false);
  }

  function handleEditWithPIN(enteredPIN: string) {
    setVerifiedPIN(enteredPIN);
    setShowPINModal(false);
    if (currentRSVP) {
      setResponse(currentRSVP.response);
      setMessage(currentRSVP.message || "");
    }
    setStage("edit_response");
  }

  if (status !== "open") {
    return (
      <div className="bg-stone-50 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-3">
          {status === "upcoming" ? "⏰" : "🔒"}
        </div>
        <p className="text-stone-700 font-medium">
          {status === "upcoming" ? "RSVP hasn't opened yet" : "RSVP is closed"}
        </p>
        <p className="text-stone-500 text-sm mt-1">
          {status === "upcoming"
            ? "Check back when the RSVP window opens."
            : "The RSVP window for this event has ended."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {showPINModal && (
        <PINModal
          title="Enter your PIN"
          description={`Enter the 6-digit PIN you set for "${name}"`}
          onConfirm={stage === "pin_verify" ? handlePINVerify : handleEditWithPIN}
          onCancel={() => { setShowPINModal(false); setStage("name_entry"); }}
          loading={pinLoading}
          error={pinError}
        />
      )}

      {/* Success flash */}
      {submitted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-800 text-sm">
          Your RSVP has been saved!
        </div>
      )}

      {/* Name Entry */}
      {stage === "name_entry" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              placeholder="Enter your full name"
              className={inputClass}
            />
          </div>
          {error && <p className="text-rose-600 text-sm">{error}</p>}
          <button
            onClick={handleNameSubmit}
            disabled={!name.trim() || loading}
            className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors text-sm"
          >
            {loading ? "Checking..." : "Continue"}
          </button>
        </div>
      )}

      {/* View Response */}
      {stage === "view_response" && currentRSVP && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <p className="text-xs text-stone-500 mb-1">Your RSVP as</p>
            <p className="font-semibold text-stone-900 mb-3">{currentRSVP.name}</p>
            <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${responseColor(currentRSVP.response)}`}>
              {responseLabel(currentRSVP.response)}
            </span>
            {currentRSVP.message && (
              <p className="text-stone-600 text-sm mt-3 italic">&ldquo;{currentRSVP.message}&rdquo;</p>
            )}
          </div>
          <button
            onClick={handleEdit}
            className="w-full border border-stone-300 text-stone-700 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            Update My Response
          </button>
        </div>
      )}

      {/* New RSVP or Edit */}
      {(stage === "new_rsvp" || stage === "edit_response") && (
        <div className="space-y-5">
          <div>
            <p className="text-sm text-stone-500">
              RSVP for <span className="font-medium text-stone-900">{name}</span>
            </p>
          </div>

          {/* Response selection */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Will you attend? *</label>
            <div className="space-y-2">
              {responseOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setResponse(opt.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    response === opt.value
                      ? opt.color + " border-2"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                  }`}
                >
                  <span className="text-base w-5 text-center">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Message <span className="text-stone-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="Leave a note for the host..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* PIN setup (new users only) */}
          {stage === "new_rsvp" && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Set a 6-digit PIN *
              </label>
              <p className="text-xs text-stone-500 mb-2">
                You&apos;ll need this to view or update your RSVP later.
              </p>
              <div className="flex gap-2">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      if (!/^\d?$/.test(e.target.value)) return;
                      const next = [...pin];
                      next[i] = e.target.value;
                      setPin(next);
                      if (e.target.value) {
                        const nextInput = document.getElementById(`pin-${i + 1}`);
                        nextInput?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !pin[i] && i > 0) {
                        document.getElementById(`pin-${i - 1}`)?.focus();
                      }
                    }}
                    id={`pin-${i}`}
                    className="w-11 h-12 text-center text-xl font-bold border-2 border-stone-300 rounded-lg focus:border-stone-800 focus:outline-none transition-colors"
                  />
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-rose-600 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => { setStage(currentRSVP ? "view_response" : "name_entry"); setError(""); }}
              className="flex-1 border border-stone-300 text-stone-700 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !response}
              className="flex-1 bg-stone-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-stone-800 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : stage === "edit_response" ? "Update RSVP" : "Submit RSVP"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
