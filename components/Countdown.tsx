"use client";

import { useState, useEffect } from "react";
import { Event } from "@/types";
import { getEventStatus } from "@/lib/utils";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(targetDate: string): TimeLeft | null {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

interface Props {
  event: Event;
}

export default function Countdown({ event }: Props) {
  const status = getEventStatus(event);
  const targetDate = status === "upcoming" ? event.rsvp_start : event.rsvp_end;

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === "closed" || status === "force_closed") return;

    setTimeLeft(calcTimeLeft(targetDate));

    const timer = setInterval(() => {
      const t = calcTimeLeft(targetDate);
      setTimeLeft(t);
      if (!t) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, status]);

  if (!mounted || status === "closed" || status === "force_closed") return null;
  if (!timeLeft) return null;

  const isUpcoming = status === "upcoming";
  const label = isUpcoming ? "RSVP opens in" : "RSVP closes in";
  const accent = isUpcoming
    ? "border-amber-200 bg-amber-50"
    : "border-emerald-200 bg-emerald-50";
  const textColor = isUpcoming ? "text-amber-900" : "text-emerald-900";
  const sublabelColor = isUpcoming ? "text-amber-600" : "text-emerald-600";
  const blockBg = isUpcoming ? "bg-amber-100" : "bg-emerald-100";

  const units = [
    { value: timeLeft.days, label: "days" },
    { value: timeLeft.hours, label: "hrs" },
    { value: timeLeft.minutes, label: "min" },
    { value: timeLeft.seconds, label: "sec" },
  ].filter((u, i) => i > 0 || u.value > 0); // hide days if 0

  return (
    <div className={`rounded-xl border ${accent} px-4 py-3`}>
      <p className={`text-xs font-medium mb-2 ${sublabelColor}`}>{label}</p>
      <div className="flex items-end gap-2">
        {units.map((u) => (
          <div key={u.label} className="text-center">
            <div
              className={`${blockBg} ${textColor} rounded-lg px-2.5 py-1 text-xl font-bold tabular-nums min-w-[2.5rem]`}
            >
              {pad(u.value)}
            </div>
            <div className={`text-[10px] mt-1 ${sublabelColor} font-medium`}>
              {u.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
