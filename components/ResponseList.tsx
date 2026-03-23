"use client";

import { RSVP } from "@/types";
import { responseColor, responseLabel, formatDateTime } from "@/lib/utils";

interface Props {
  rsvps: RSVP[];
}

export default function ResponseList({ rsvps }: Props) {
  const yes = rsvps.filter((r) => r.response === "yes");
  const no = rsvps.filter((r) => r.response === "no");
  const maybe = rsvps.filter((r) => r.response === "maybe");

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Attending", count: yes.length, color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
          { label: "Not Attending", count: no.length, color: "bg-rose-50 text-rose-800 border-rose-200" },
          { label: "Maybe", count: maybe.length, color: "bg-amber-50 text-amber-800 border-amber-200" },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl border p-3 text-center ${item.color}`}>
            <div className="text-2xl font-bold">{item.count}</div>
            <div className="text-xs font-medium mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Total */}
      <p className="text-sm text-stone-500 text-center">
        {rsvps.length} total {rsvps.length === 1 ? "response" : "responses"}
      </p>

      {/* Response list */}
      {rsvps.length === 0 ? (
        <div className="text-center py-10 text-stone-400">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-sm">No responses yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rsvps.map((rsvp) => (
            <div
              key={rsvp.id}
              className="bg-white border border-stone-200 rounded-xl px-4 py-3 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-stone-900 text-sm truncate">{rsvp.name}</p>
                {rsvp.message && (
                  <p className="text-stone-500 text-xs mt-0.5 line-clamp-2 italic">&ldquo;{rsvp.message}&rdquo;</p>
                )}
                <p className="text-stone-400 text-xs mt-1">{formatDateTime(rsvp.updated_at || rsvp.created_at)}</p>
              </div>
              <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${responseColor(rsvp.response)}`}>
                {responseLabel(rsvp.response)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
