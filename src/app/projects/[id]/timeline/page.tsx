"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { FlagIcon } from "@/components/icons";
import { subscribeToProject, subscribeToProjectTasks } from "@/lib/firestore";
import type { Project, Task } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

const STATUS_DOT: Record<Task["status"], string> = {
  todo: "bg-slate-400",
  in_progress: "bg-amber-400",
  done: "bg-emerald-400",
};

function TimelineContent({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => subscribeToProject(projectId, setProject), [projectId]);
  useEffect(() => subscribeToProjectTasks(projectId, setTasks), [projectId]);

  const stops = useMemo(() => {
    const dated = tasks
      .filter((t): t is Task & { dueDate: number } => typeof t.dueDate === "number")
      .sort((a, b) => a.dueDate - b.dueDate);
    if (dated.length === 0) return [];

    const earliest = dated[0].dueDate;
    const latest = dated[dated.length - 1].dueDate;
    const span = Math.max(latest - earliest, DAY_MS);

    return dated.map((task, i) => {
      const pct = 4 + ((task.dueDate - earliest) / span) * 92;
      const overdue = task.status !== "done" && task.dueDate < Date.now();
      return {
        task,
        pct,
        above: i % 2 === 0,
        overdue,
        dateLabel: new Date(task.dueDate).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      };
    });
  }, [tasks]);

  if (project === undefined) {
    return <p className="p-8 text-center text-neutral-500 dark:text-slate-400">Loading…</p>;
  }
  if (project === null) {
    return <p className="p-8 text-center text-neutral-500 dark:text-slate-400">Project not found.</p>;
  }

  return (
    <div className="animate-fade-in-up mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to board
        </Link>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-blue-950 dark:text-blue-100">
          <FlagIcon className="h-6 w-6 text-blue-500" />
          {project.name} · Route Timeline
        </h1>
        <p className="text-sm text-neutral-500 dark:text-slate-400">
          Due-dated legs of the journey, plotted like ports of call along the route.
        </p>
      </div>

      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        {stops.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-400 dark:text-slate-500">
            No tasks with a due date yet — the route is still unplotted.
          </p>
        ) : (
          <div className="relative mt-20 mb-24">
            <div className="absolute top-1/2 right-1 left-1 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-cyan-400" />
            {stops.map(({ task, pct, above, overdue, dateLabel }) => (
              <div
                key={task.id}
                className="absolute top-1/2 -translate-x-1/2"
                style={{ left: `${pct}%` }}
              >
                <span
                  title={`${task.title} · ${dateLabel}`}
                  className={`block h-3.5 w-3.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${
                    overdue ? "bg-rose-500" : STATUS_DOT[task.status]
                  }`}
                />
                <div
                  className={`absolute left-1/2 flex w-32 -translate-x-1/2 flex-col items-center text-center ${
                    above ? "bottom-6 flex-col-reverse" : "top-6"
                  }`}
                >
                  <div className="h-4 w-px bg-neutral-200 dark:bg-slate-700" />
                  <p className="truncate text-[11px] font-medium text-neutral-700 dark:text-slate-300">
                    {task.title}
                  </p>
                  <p
                    className={`text-[11px] ${
                      overdue ? "text-rose-500 dark:text-rose-400" : "text-neutral-400 dark:text-slate-500"
                    }`}
                  >
                    {dateLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {stops.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> To Do
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Overdue
          </span>
        </div>
      )}
    </div>
  );
}

export default function TimelinePage() {
  const params = useParams<{ id: string }>();

  return (
    <RequireAuth>
      <Navbar />
      <TimelineContent projectId={params.id} />
    </RequireAuth>
  );
}
