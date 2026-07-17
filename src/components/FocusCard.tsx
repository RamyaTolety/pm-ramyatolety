"use client";

import Link from "next/link";
import { updateTaskStatus } from "@/lib/firestore";
import type { Project, Task } from "@/lib/types";

export function FocusCard({
  focusTask,
  shippedThisWeek,
}: {
  focusTask: { project: Project; task: Task } | null;
  shippedThisWeek: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4">
      {focusTask ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
            Focus next
          </p>
          <Link
            href={`/projects/${focusTask.project.id}`}
            className="font-medium text-violet-950 hover:underline"
          >
            {focusTask.task.title}
          </Link>
          <p className="text-xs text-neutral-500">{focusTask.project.name}</p>
        </div>
      ) : (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
            Focus next
          </p>
          <p className="text-sm text-neutral-500">Nothing assigned to you right now</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        {focusTask && (
          <button
            onClick={() => updateTaskStatus(focusTask.project.id, focusTask.task.id, "done")}
            className="rounded-md bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
          >
            Mark done
          </button>
        )}
        <div className="text-right">
          <p className="text-lg font-bold text-violet-950">{shippedThisWeek}</p>
          <p className="text-[11px] text-neutral-500">shipped this week</p>
        </div>
      </div>
    </div>
  );
}
