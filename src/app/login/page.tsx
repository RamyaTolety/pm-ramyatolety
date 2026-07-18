"use client";

import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { AnchorIcon, MoonIcon, SailboatIcon, WavesIcon } from "@/components/icons";

const ROUTE_STEPS = [
  { label: "Plan the route", detail: "Spin up a project, invite your crew", Icon: AnchorIcon },
  { label: "Ship the legs", detail: "Break work into tasks, track the course", Icon: SailboatIcon },
  { label: "Log the voyage", detail: "Every finished task is a waypoint reached", Icon: WavesIcon },
];

export default function LoginPage() {
  const { logIn, signUp } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
        <div className="flex items-center justify-center gap-3 md:justify-between">
          <SailboatIcon className="h-10 w-10 text-blue-400" />
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Night Watch: on" : "Night Watch: off"}
            aria-label="Toggle Night Watch"
            className="rounded-md border border-neutral-300 p-1.5 hover:bg-neutral-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <MoonIcon className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-blue-500">Waypoint</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-blue-950 sm:text-4xl dark:text-blue-100">
          Chart the course.
          <br />
          Ship the work.
        </h1>
        <p className="mt-4 text-sm text-neutral-600 dark:text-slate-400">
          Every project is a route. Every task, a leg of the journey. Your crew ships
          together — Waypoint keeps the course clear.
        </p>

        <ol className="mt-8 space-y-5 text-left">
          {ROUTE_STEPS.map((step, i) => (
            <li
              key={step.label}
              className="animate-fade-in-up flex items-start gap-3"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                <step.Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-blue-950 dark:text-blue-100">{step.label}</p>
                <p className="text-xs text-neutral-500 dark:text-slate-400">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <form
        onSubmit={handleSubmit}
        className="animate-fade-in-up w-full max-w-sm space-y-4 self-center rounded-xl border border-blue-100 bg-white p-6 shadow-lg shadow-blue-200/40 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none"
        style={{ animationDelay: "0.2s" }}
      >
        <h2 className="text-lg font-semibold dark:text-slate-100">
          {mode === "login" ? "Log in" : "Create account"}
        </h2>

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-slate-300">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900/40"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-slate-300">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900/40"
          />
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 hover:shadow-md disabled:opacity-50"
        >
          {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="w-full text-center text-sm text-neutral-600 hover:text-blue-700 hover:underline dark:text-slate-400 dark:hover:text-blue-300"
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
