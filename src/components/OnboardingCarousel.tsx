"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { CompassIcon, CrewIcon, FlagIcon } from "./icons";

const SLIDES = [
  {
    Icon: CompassIcon,
    title: "Every project is a route",
    detail:
      "Plot the course for what you're building. Give it a name, a description, and it's ready to sail.",
  },
  {
    Icon: CrewIcon,
    title: "Your team is the crew",
    detail:
      "Add crew members by email. Everyone aboard can see the board and pick up a leg of the journey.",
  },
  {
    Icon: FlagIcon,
    title: "Every task is a waypoint",
    detail:
      "Break the route into legs, drag them across the board, and log each waypoint reached.",
  },
];

function pendingKey(uid: string) {
  return `waypoint-onboarding-pending-${uid}`;
}

export function OnboardingCarousel() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem(pendingKey(user.uid))) {
      setOpen(true);
    }
  }, [user]);

  function dismiss() {
    if (user) localStorage.removeItem(pendingKey(user.uid));
    setOpen(false);
  }

  if (!open || !user) return null;

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/40 px-4 backdrop-blur-sm">
      <div className="animate-fade-in-up w-full max-w-md rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-2xl shadow-blue-900/20">
        <div
          key={step}
          className="animate-slide-in-right flex flex-col items-center"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
            <slide.Icon className="h-8 w-8" />
          </span>
          <h2 className="mt-5 text-xl font-bold text-blue-950">{slide.title}</h2>
          <p className="mt-2 text-sm text-neutral-600">{slide.detail}</p>
        </div>

        <div className="mt-7 flex items-center justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-5 bg-blue-600" : "w-1.5 bg-blue-100"
              }`}
            />
          ))}
        </div>

        <div className="mt-7 flex items-center justify-between gap-3">
          <button
            onClick={dismiss}
            className="text-sm text-neutral-400 hover:text-neutral-600"
          >
            Skip
          </button>
          <button
            onClick={() => (isLast ? dismiss() : setStep((s) => s + 1))}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            {isLast ? "Set sail" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
