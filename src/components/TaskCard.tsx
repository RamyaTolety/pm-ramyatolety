"use client";

import { useState } from "react";
import { updateTaskStatus } from "@/lib/firestore";
import type { Task, TaskStatus } from "@/lib/types";
import { TASK_LABELS, TASK_STATUSES } from "@/lib/types";
import { Avatar } from "./Avatar";
import { TaskChecklist } from "./TaskChecklist";
import { TaskComments } from "./TaskComments";

function dueDateInfo(dueDate: number | null) {
  if (!dueDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  const label = due.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  if (diffDays < 0) return { label: `Overdue · ${label}`, classes: "bg-rose-100 text-rose-700" };
  if (diffDays === 0) return { label: `Due today`, classes: "bg-amber-100 text-amber-700" };
  if (diffDays <= 3) return { label: `Due ${label}`, classes: "bg-amber-50 text-amber-600" };
  return { label: `Due ${label}`, classes: "bg-neutral-100 text-neutral-500" };
}

export function TaskCard({
  task,
  onCompleted,
}: {
  task: Task;
  onCompleted?: (title: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const status = TASK_STATUSES.find((s) => s.value === task.status);
  const due = dueDateInfo(task.dueDate);

  function handleStatusChange(next: TaskStatus) {
    updateTaskStatus(task.projectId, task.id, next);
    if (next === "done" && task.status !== "done") {
      onCompleted?.(task.title);
    }
  }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/task-id", task.id);
        e.dataTransfer.setData("text/from-status", task.status);
      }}
      className={`animate-fade-in-up cursor-grab space-y-2 rounded-md border border-t-4 border-neutral-200 bg-white p-3 text-sm shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing ${status?.accent ?? ""}`}
    >
      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map((labelValue) => {
            const label = TASK_LABELS.find((l) => l.value === labelValue);
            if (!label) return null;
            return (
              <span
                key={labelValue}
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${label.classes}`}
              >
                {label.label}
              </span>
            );
          })}
        </div>
      )}

      <p className="font-medium">{task.title}</p>
      {task.description && <p className="text-neutral-500">{task.description}</p>}

      <div className="flex flex-wrap items-center gap-1.5">
        {task.assigneeEmail && <Avatar email={task.assigneeEmail} />}
        {due && (
          <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-medium ${due.classes}`}>
            {due.label}
          </span>
        )}
      </div>

      <select
        value={task.status}
        onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
        className="w-full rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
      >
        {TASK_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <div className="flex gap-3">
        <button
          onClick={() => setShowChecklist((v) => !v)}
          className="text-[11px] text-neutral-400 hover:text-violet-600"
        >
          {showChecklist ? "Hide checklist" : "Checklist"}
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="text-[11px] text-neutral-400 hover:text-violet-600"
        >
          {showComments ? "Hide comments" : "Comments"}
        </button>
      </div>
      {showChecklist && <TaskChecklist projectId={task.projectId} taskId={task.id} />}
      {showComments && <TaskComments projectId={task.projectId} taskId={task.id} />}
    </div>
  );
}
