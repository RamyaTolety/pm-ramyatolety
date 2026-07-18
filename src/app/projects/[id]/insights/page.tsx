"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { AnchorIcon, SailboatIcon, WavesIcon } from "@/components/icons";
import { subscribeToProject, subscribeToProjectTasks } from "@/lib/firestore";
import type { Project, Task } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

function forecastLevel(dueCount: number, ratio: number) {
  if (dueCount === 0 || ratio <= 1) {
    return { condition: "Smooth sailing", classes: "bg-emerald-100 text-emerald-700", Icon: SailboatIcon };
  }
  if (ratio < 2) {
    return { condition: "Choppy waters", classes: "bg-amber-100 text-amber-700", Icon: WavesIcon };
  }
  return { condition: "Storm warning", classes: "bg-rose-100 text-rose-700", Icon: WavesIcon };
}

function InsightsContent({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => subscribeToProject(projectId, setProject), [projectId]);
  useEffect(() => subscribeToProjectTasks(projectId, setTasks), [projectId]);

  const dailyCompleted = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (6 - i));
      return start.getTime();
    });
    return days.map((dayStart) => {
      const dayEnd = dayStart + DAY_MS;
      const count = tasks.filter(
        (t) => t.status === "done" && t.updatedAt >= dayStart && t.updatedAt < dayEnd
      ).length;
      const label = new Date(dayStart).toLocaleDateString(undefined, { weekday: "short" });
      return { label, count };
    });
  }, [tasks]);

  const maxDaily = Math.max(1, ...dailyCompleted.map((d) => d.count));

  const byAssignee = useMemo(() => {
    const map = new Map<string, { total: number; done: number }>();
    for (const task of tasks) {
      const key = task.assigneeEmail ?? "Unassigned";
      const entry = map.get(key) ?? { total: 0, done: 0 };
      entry.total += 1;
      if (task.status === "done") entry.done += 1;
      map.set(key, entry);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total);
  }, [tasks]);

  const avgCycleTimeHours = useMemo(() => {
    const done = tasks.filter((t) => t.status === "done");
    if (done.length === 0) return null;
    const totalMs = done.reduce((sum, t) => sum + (t.updatedAt - t.createdAt), 0);
    return totalMs / done.length / (60 * 60 * 1000);
  }, [tasks]);

  const conditions = useMemo(() => {
    const incomplete = tasks.filter((t) => t.status !== "done");
    if (tasks.length === 0) {
      return {
        label: "Calm harbor",
        note: "Nothing logged yet.",
        classes: "bg-slate-100 text-slate-600",
        Icon: AnchorIcon,
      };
    }
    if (incomplete.length === 0) {
      return {
        label: "Smooth sailing",
        note: "Everything shipped.",
        classes: "bg-emerald-100 text-emerald-700",
        Icon: SailboatIcon,
      };
    }
    const now = Date.now();
    const overdue = incomplete.filter((t) => t.dueDate && t.dueDate < now).length;
    const ratio = overdue / incomplete.length;
    if (ratio === 0) {
      return {
        label: "Smooth sailing",
        note: "No overdue tasks.",
        classes: "bg-emerald-100 text-emerald-700",
        Icon: SailboatIcon,
      };
    }
    if (ratio < 0.34) {
      return {
        label: "Choppy waters",
        note: `${overdue} of ${incomplete.length} open tasks overdue.`,
        classes: "bg-amber-100 text-amber-700",
        Icon: WavesIcon,
      };
    }
    return {
      label: "Storm warning",
      note: `${overdue} of ${incomplete.length} open tasks overdue.`,
      classes: "bg-rose-100 text-rose-700",
      Icon: WavesIcon,
    };
  }, [tasks]);

  const forecast = useMemo(() => {
    const avgThroughput = Math.max(
      1,
      dailyCompleted.reduce((sum, d) => sum + d.count, 0) / dailyCompleted.length
    );
    return Array.from({ length: 7 }, (_, i) => {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() + i);
      const start = dayStart.getTime();
      const end = start + DAY_MS;
      const dueCount = tasks.filter(
        (t) => t.status !== "done" && t.dueDate && t.dueDate >= start && t.dueDate < end
      ).length;
      const ratio = dueCount / avgThroughput;
      const label = i === 0 ? "Today" : dayStart.toLocaleDateString(undefined, { weekday: "short" });
      return { label, dueCount, ...forecastLevel(dueCount, ratio) };
    });
  }, [tasks, dailyCompleted]);

  if (project === undefined) {
    return <p className="p-8 text-center text-neutral-500">Loading…</p>;
  }
  if (project === null) {
    return <p className="p-8 text-center text-neutral-500">Project not found.</p>;
  }

  return (
    <div className="animate-fade-in-up mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-8">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to board
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-blue-950">
          {project.name} · Insights
        </h1>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-4">
        <conditions.Icon className="h-5 w-5 shrink-0 text-blue-400" />
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${conditions.classes}`}>
          {conditions.label}
        </span>
        <span className="text-sm text-neutral-500">{conditions.note}</span>
      </div>

      <div className="rounded-xl border border-blue-100 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">7-day forecast</h2>
        <div className="grid grid-cols-7 gap-2">
          {forecast.map((day, i) => (
            <div
              key={i}
              title={`${day.condition} · ${day.dueCount} task${day.dueCount === 1 ? "" : "s"} due`}
              className="flex flex-col items-center gap-1.5 rounded-lg border border-neutral-100 py-3"
            >
              <p className="text-[11px] font-medium text-neutral-500">{day.label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-full ${day.classes}`}>
                <day.Icon className="h-4 w-4" />
              </span>
              <p className="text-[11px] text-neutral-400">
                {day.dueCount || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-blue-100 bg-white p-4">
          <p className="text-2xl font-bold text-blue-950">{tasks.length}</p>
          <p className="text-xs text-neutral-500">total tasks</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-white p-4">
          <p className="text-2xl font-bold text-blue-950">
            {tasks.filter((t) => t.status === "done").length}
          </p>
          <p className="text-xs text-neutral-500">completed</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-white p-4">
          <p className="text-2xl font-bold text-blue-950">
            {avgCycleTimeHours === null ? "—" : `${avgCycleTimeHours.toFixed(1)}h`}
          </p>
          <p className="text-xs text-neutral-500">avg. cycle time</p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">Completed, last 7 days</h2>
        <div className="flex h-32 items-end gap-3">
          {dailyCompleted.map((day) => (
            <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-cyan-400"
                  style={{ height: `${(day.count / maxDaily) * 100}%`, minHeight: day.count ? 4 : 0 }}
                />
              </div>
              <p className="text-[11px] text-neutral-500">{day.label}</p>
              <p className="text-[11px] font-medium text-neutral-700">{day.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">By assignee</h2>
        {byAssignee.length === 0 ? (
          <p className="text-sm text-neutral-400">No tasks yet.</p>
        ) : (
          <div className="space-y-2">
            {byAssignee.map(([email, stats]) => (
              <div key={email} className="flex items-center gap-3 text-sm">
                <span className="w-48 truncate text-neutral-700">{email}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(stats.done / stats.total) * 100}%` }}
                  />
                </div>
                <span className="w-16 text-right text-xs text-neutral-500">
                  {stats.done}/{stats.total}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const params = useParams<{ id: string }>();

  return (
    <RequireAuth>
      <Navbar />
      <InsightsContent projectId={params.id} />
    </RequireAuth>
  );
}
