"use client";

import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const ROUTE_STEPS = [
  { label: "Plan the route", detail: "Spin up a project, invite your crew" },
  { label: "Ship the legs", detail: "Break work into tasks, track the course" },
  { label: "Log the voyage", detail: "Every finished task is a waypoint reached" },
];

export default function LoginPage() {
  const { logIn, signUp } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await logIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof FirebaseError ? err.message.replace("Firebase: ", "") : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-10 px-4 py-12 md:flex-row md:items-stretch md:gap-16">
      <div className="animate-fade-in-up flex max-w-md flex-col justify-center text-center md:text-left">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-500">Waypoint</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-violet-950 sm:text-4xl">
          Chart the course.
          <br />
          Ship the work.
        </h1>
        <p className="mt-4 text-sm text-neutral-600">
          Every project is a route. Every task, a leg of the journey. Your crew ships
          together — Waypoint keeps the course clear.
        </p>

        <ol className="mt-8 space-y-4 border-l border-violet-200 pl-5 text-left">
          {ROUTE_STEPS.map((step, i) => (
            <li
              key={step.label}
              className="animate-fade-in-up relative"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full bg-violet-400" />
              <p className="text-sm font-semibold text-violet-950">{step.label}</p>
              <p className="text-xs text-neutral-500">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>

      <form
        onSubmit={handleSubmit}
        className="animate-fade-in-up w-full max-w-sm space-y-4 self-center rounded-xl border border-violet-100 bg-white p-6 shadow-lg shadow-violet-200/40"
        style={{ animationDelay: "0.2s" }}
      >
        <h2 className="text-lg font-semibold">
          {mode === "login" ? "Log in" : "Create account"}
        </h2>

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-700 hover:shadow-md disabled:opacity-50"
        >
          {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full text-center text-sm text-neutral-600 hover:text-violet-700 hover:underline"
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
