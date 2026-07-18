"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { AnchorIcon, SailboatIcon, WavesIcon } from "@/components/icons";
import { subscribeToProject, subscribeToProjectTasks } from "@/lib/firestore";
import type { Project, Task } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

const STATUS_LABEL: Record<Task["status"], string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

// A single due task must never classify worse than "Choppy waters" on its own —
// avgThroughput floors to 1 when there's little/no completion history, which used
// to spike the ratio immediately. "Storm warning" now requires genuine pile-up:
// both a high load ratio AND at least two tasks actually due that day.
function forecastLevel(dueCount: number, ratio: number) {
  if (dueCount === 0 || ratio <= 1) {
    return {
      condition: "Smooth sailing",
      classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      Icon: SailboatIcon,
    };
  }
  if (ratio >= 2 && dueCount >= 2) {
    return {
      condition: "Storm warning",
      classes: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
      Icon: WavesIcon,
    };
  }
  return {
    condition: "Choppy waters",
    classes: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    Icon: WavesIcon,
  };
}

function InsightsContent({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

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
        classes: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
        Icon: AnchorIcon,
      };
    }
    if (incomplete.length === 0) {
      return {
        label: "Smooth sailing",
        note: "Everything shipped.",
        classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
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
        classes: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        Icon: SailboatIcon,
      };
    }
    if (ratio < 0.34) {
      return {
        label: "Choppy waters",
        note: `${overdue} of ${incomplete.length} open tasks overdue.`,
        classes: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
        Icon: WavesIcon,
      };
    }
    return {
      label: "Storm warning",
      note: `${overdue} of ${incomplete.length} open tasks overdue.`,
      classes: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
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
      return { label, dueCount, start, end, ...forecastLevel(dueCount, ratio) };
    });
  }, [tasks, dailyCompleted]);

  const tasksForSelectedDay = useMemo(() => {
    if (selectedDayIndex === null) return [];
    const day = forecast[selectedDayIndex];
    if (!day) return [];
    return tasks.filter(
      (t) => t.status !== "done" && t.dueDate && t.dueDate >= day.start && t.dueDate < day.end
    );
  }, [tasks, forecast, selectedDayIndex]);

  if (project === undefined) {
    return <p className="p-8 text-center text-neutral-500 dark:text-slate-400">Loading…</p>;
  }
  if (project === null) {
    return <p className="p-8 text-center text-neutral-500 dark:text-slate-400">Project not found.</p>;
  }

  return (
    <div className="animate-fade-in-up mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-8">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to board
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-blue-950 dark:text-blue-100">
          {project.name} · Insights
        </h1>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <conditions.Icon className="h-5 w-5 shrink-0 text-blue-400" />
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${conditions.classes}`}>
          {conditions.label}
        </span>
        <span className="text-sm text-neutral-500 dark:text-slate-400">{conditions.note}</span>
      </div>

      <div className="rounded-xl border border-blue-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-slate-300">7-day forecast</h2>
        <div className="grid grid-cols-7 gap-2">
          {forecast.map((day, i) => {
            const selected = selectedDayIndex === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDayIndex((cur) => (cur === i ? null : i))}
                title={`${day.condition} · ${day.dueCount} task${day.dueCount === 1 ? "" : "s"} due`}
                className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border py-3 transition-colors hover:bg-blue-50 dark:hover:bg-slate-800/60 ${
                  selected
                    ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-slate-800/60"
                    : "border-neutral-100 dark:border-slate-800"
                }`}
              >
                <p className="text-[11px] font-medium text-neutral-500 dark:text-slate-400">{day.label}</p>
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${day.classes}`}>
                  <day.Icon className="h-4 w-4" />
                </span>
                <p className="text-[11px] text-neutral-400 dark:text-slate-500">
                  {day.dueCount || "—"}
                </p>
              </button>
            );
          })}
        </div>

        {selectedDayIndex !== null && forecast[selectedDayIndex] && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-3 text-xs font-semibold text-neutral-600 dark:text-slate-400">
              Due {forecast[selectedDayIndex].label}
            </h3>
            {tasksForSelectedDay.length === 0 ? (
              <p className="text-sm text-neutral-400 dark:text-slate-500">No legs due this day.</p>
            ) : (
              <div className="space-y-2">
                {tasksForSelectedDay.map((task) => (
                  <div key={task.id} className="flex items-center gap-2.5 text-sm">
                    {task.assigneeEmail ? (
                      <Avatar email={task.assigneeEmail} size="sm" />
                    ) : (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-semibold text-neutral-500 dark:bg-slate-700 dark:text-slate-400">
                        —
                      </span>
                    )}
                    <span className="flex-1 truncate text-neutral-700 dark:text-slate-300">
                      {task.title}
                    </span>
                    <span className="shrink-0 text-xs text-neutral-400 dark:text-slate-500">
                      {STATUS_LABEL[task.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-blue-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-2xl font-bold text-blue-950 dark:text-blue-100">{tasks.length}</p>
          <p className="text-xs text-neutral-500 dark:text-slate-400">total tasks</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-2xl font-bold text-blue-950 dark:text-blue-100">
            {tasks.filter((t) => t.status === "done").length}
          </p>
          <p className="text-xs text-neutral-500 dark:text-slate-400">completed</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-2xl font-bold text-blue-950 dark:text-blue-100">
            {avgCycleTimeHours === null ? "—" : `${avgCycleTimeHours.toFixed(1)}h`}
          </p>
          <p className="text-xs text-neutral-500 dark:text-slate-400">avg. cycle time</p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-slate-300">Completed, last 7 days</h2>
        <div className="flex h-32 items-end gap-3">
          {dailyCompleted.map((day) => (
            <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-blue-500 to-cyan-400"
                  style={{ height: `${(day.count / maxDaily) * 100}%`, minHeight: day.count ? 4 : 0 }}
                />
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-slate-400">{day.label}</p>
              <p className="text-[11px] font-medium text-neutral-700 dark:text-slate-300">{day.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-slate-300">By assignee</h2>
        {byAssignee.length === 0 ? (
          <p className="text-sm text-neutral-400 dark:text-slate-500">No tasks yet.</p>
        ) : (
          <div className="space-y-2">
            {byAssignee.map(([email, stats]) => (
              <div key={email} className="flex items-center gap-3 text-sm">
                <span className="w-48 truncate text-neutral-700 dark:text-slate-300">{email}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(stats.done / stats.total) * 100}%` }}
                  />
                </div>
                <span className="w-16 text-right text-xs text-neutral-500 dark:text-slate-400">
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
