"use client";

import { updateTaskStatus } from "@/lib/firestore";
import type { Task, TaskStatus } from "@/lib/types";
import { TASK_STATUSES } from "@/lib/types";

export function TaskCard({ task }: { task: Task }) {
  return (
    <div className="space-y-2 rounded-md border border-neutral-200 bg-white p-3 text-sm shadow-sm">
      <p className="font-medium">{task.title}</p>
      {task.description && <p className="text-neutral-500">{task.description}</p>}
      <p className="text-xs text-neutral-400">
        {task.assigneeEmail ? `Assigned to ${task.assigneeEmail}` : "Unassigned"}
      </p>
      <select
        value={task.status}
        onChange={(e) =>
          updateTaskStatus(task.projectId, task.id, e.target.value as TaskStatus)
        }
        className="w-full rounded-md border border-neutral-300 px-2 py-1 text-xs"
      >
        {TASK_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
