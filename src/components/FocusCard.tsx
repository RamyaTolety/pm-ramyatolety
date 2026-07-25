"use client";

import Link from "next/link";
import { updateTaskStatus } from "@/lib/firestore";
import type { Project, Task } from "@/lib/types";
import { CompassIcon } from "./icons";

export function FocusCard({
  focusTask,
  shippedThisWeek,
}: {
  focusTask: { project: Project; task: Task } | null;
  shippedThisWeek: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
      {focusTask ? (
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
            <CompassIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Focus next
            </p>
            <Link
              href={`/projects/${focusTask.project.id}`}
              className="font-medium text-blue-950 hover:underline dark:text-blue-100"
            >
              {focusTask.task.title}
            </Link>
            <p className="text-xs text-neutral-500 dark:text-slate-400">{focusTask.project.name}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
            <CompassIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
              Focus next
            </p>
            <p className="text-sm text-neutral-500 dark:text-slate-400">Nothing assigned to you right now</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        {focusTask && (
          <button
            onClick={() => updateTaskStatus(focusTask.project.id, focusTask.task.id, "done")}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Mark done
          </button>
        )}
        <div className="text-right">
          <p className="text-lg font-bold text-blue-950 dark:text-blue-100">{shippedThisWeek}</p>
          <p className="text-[11px] text-neutral-500 dark:text-slate-400">shipped this week</p>
        </div>
      </div>
    </div>
  );
}
