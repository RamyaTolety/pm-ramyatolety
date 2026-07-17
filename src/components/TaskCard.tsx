"use client";

import { updateTaskStatus } from "@/lib/firestore";
import type { Task, TaskStatus } from "@/lib/types";
import { TASK_STATUSES } from "@/lib/types";
import { Avatar } from "./Avatar";

export function TaskCard({ task, onCompleted }: { task: Task; onCompleted?: () => void }) {
  const status = TASK_STATUSES.find((s) => s.value === task.status);

  function handleStatusChange(next: TaskStatus) {
    updateTaskStatus(task.projectId, task.id, next);
    if (next === "done" && task.status !== "done") {
      onCompleted?.();
    }
  }

  return (
    <div
      className={`space-y-2 rounded-md border border-t-4 border-neutral-200 bg-white p-3 text-sm shadow-sm ${status?.accent ?? ""}`}
    >
      <p className="font-medium">{task.title}</p>
      {task.description && <p className="text-neutral-500">{task.description}</p>}
      <div className="flex items-center gap-1.5 text-xs text-neutral-400">
        {task.assigneeEmail ? (
          <>
            <Avatar email={task.assigneeEmail} />
            <span>{task.assigneeEmail}</span>
          </>
        ) : (
          "Unassigned"
        )}
      </div>
      <select
        value={task.status}
        onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
        className="w-full rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
      >
        {TASK_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.emoji} {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
