"use client";

import { useState } from "react";
import { completeTask, deleteTask, updateTask, updateTaskStatus } from "@/lib/firestore";
import type { Task, TaskLabel, TaskPriority, TaskRecurrence, TaskStatus } from "@/lib/types";
import {
  DEFAULT_ANCHOR_WATCH_DAYS,
  DEFAULT_TASK_PRIORITY,
  DEFAULT_TASK_RECURRENCE,
  TASK_LABELS,
  TASK_PRIORITIES,
  TASK_RECURRENCES,
  TASK_STATUSES,
} from "@/lib/types";
import { Avatar } from "./Avatar";
import { AnchorIcon } from "./icons";
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

  if (diffDays < 0)
    return { label: `Overdue · ${label}`, classes: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" };
  if (diffDays === 0)
    return { label: `Due today`, classes: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" };
  if (diffDays <= 3)
    return { label: `Due ${label}`, classes: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400" };
  return { label: `Due ${label}`, classes: "bg-neutral-100 text-neutral-500 dark:bg-slate-800 dark:text-slate-400" };
}

function anchorWatchInfo(task: Task, anchorWatchDays: number) {
  if (task.status !== "todo") return null;
  const daysSinceCreated = Math.floor((Date.now() - task.createdAt) / 86_400_000);
  if (daysSinceCreated <= anchorWatchDays) return null;
  return { label: `Anchored ${daysSinceCreated}d` };
}

function priorityInfo(task: Task) {
  const value = task.priority ?? DEFAULT_TASK_PRIORITY;
  return TASK_PRIORITIES.find((p) => p.value === value) ?? TASK_PRIORITIES[1];
}

function toDateInputValue(dueDate: number | null) {
  if (!dueDate) return "";
  return new Date(dueDate).toISOString().slice(0, 10);
}

export function TaskCard({
  task,
  onCompleted,
  memberEmails = task.assigneeEmail ? [task.assigneeEmail] : [],
  anchorWatchDays = DEFAULT_ANCHOR_WATCH_DAYS,
}: {
  task: Task;
  onCompleted?: (title: string) => void;
  memberEmails?: string[];
  anchorWatchDays?: number;
}) {
  const [showComments, setShowComments] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editAssigneeEmail, setEditAssigneeEmail] = useState(task.assigneeEmail ?? "");
  const [editDueDate, setEditDueDate] = useState(toDateInputValue(task.dueDate));
  const [editLabels, setEditLabels] = useState<TaskLabel[]>(task.labels ?? []);
  const [editPriority, setEditPriority] = useState<TaskPriority>(task.priority ?? DEFAULT_TASK_PRIORITY);
  const [editRecurrence, setEditRecurrence] = useState<TaskRecurrence>(task.recurrence ?? DEFAULT_TASK_RECURRENCE);

  const status = TASK_STATUSES.find((s) => s.value === task.status);
  const due = dueDateInfo(task.dueDate);
  const anchorWatch = anchorWatchInfo(task, anchorWatchDays);
  const priority = priorityInfo(task);

  function handleStatusChange(next: TaskStatus) {
    if (next === "done" && task.recurrence && task.recurrence !== "none") {
      completeTask(task.projectId, task);
    } else {
      updateTaskStatus(task.projectId, task.id, next);
    }
    if (next === "done" && task.status !== "done") {
      onCompleted?.(task.title);
    }
  }

  function toggleEditLabel(label: TaskLabel) {
    setEditLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  }

  function resetEditState() {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditAssigneeEmail(task.assigneeEmail ?? "");
    setEditDueDate(toDateInputValue(task.dueDate));
    setEditLabels(task.labels ?? []);
    setEditPriority(task.priority ?? DEFAULT_TASK_PRIORITY);
    setEditRecurrence(task.recurrence ?? DEFAULT_TASK_RECURRENCE);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    await updateTask(task.projectId, task.id, {
      title: editTitle,
      description: editDescription,
      assigneeEmail: editAssigneeEmail || null,
      dueDate: editDueDate ? new Date(editDueDate).getTime() : null,
      labels: editLabels,
      priority: editPriority,
      recurrence: editRecurrence,
    });
    setEditing(false);
  }

  function handleCancelEdit() {
    resetEditState();
    setEditing(false);
  }

  function handleDelete() {
    if (window.confirm(`Delete "${task.title}"? This can't be undone.`)) {
      deleteTask(task.projectId, task.id);
    }
  }

  return (
    <div
      draggable={!editing}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/task-id", task.id);
        e.dataTransfer.setData("text/from-status", task.status);
      }}
      className={`animate-fade-in-up cursor-grab space-y-2 rounded-md border border-t-4 border-neutral-200 bg-white p-3 text-sm text-neutral-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none ${status?.accent ?? ""}`}
    >
      {editing ? (
        <form onSubmit={handleSaveEdit} className="space-y-2">
          <input
            autoFocus
            required
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900/40"
          />
          <textarea
            placeholder="Description (optional)"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900/40"
          />
          <div className="flex flex-wrap gap-1.5">
            {TASK_LABELS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => toggleEditLabel(l.value)}
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                  editLabels.includes(l.value)
                    ? l.classes + " ring-transparent"
                    : "bg-transparent text-neutral-400 ring-neutral-200 dark:text-slate-500 dark:ring-slate-700"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-neutral-600 dark:text-slate-400">Priority</p>
            <div className="flex flex-wrap gap-1.5">
              {TASK_PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setEditPriority(p.value)}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                    editPriority === p.value
                      ? p.classes + " ring-transparent"
                      : "bg-transparent text-neutral-400 ring-neutral-200 dark:text-slate-500 dark:ring-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-neutral-600 dark:text-slate-400">Standing watch</p>
            <div className="flex flex-wrap gap-1.5">
              {TASK_RECURRENCES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setEditRecurrence(r.value)}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                    editRecurrence === r.value
                      ? "bg-blue-600 text-white ring-transparent"
                      : "bg-transparent text-neutral-400 ring-neutral-200 dark:text-slate-500 dark:ring-slate-700"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={editAssigneeEmail}
              onChange={(e) => setEditAssigneeEmail(e.target.value)}
              className="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900/40"
            >
              <option value="">Unassigned</option>
              {memberEmails.map((email) => (
                <option key={email} value={email}>
                  {email}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900/40 dark:[color-scheme:dark]"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
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
          {task.description && <p className="text-neutral-500 dark:text-slate-400">{task.description}</p>}

          <div className="flex flex-wrap items-center gap-1.5">
            {task.assigneeEmail && <Avatar email={task.assigneeEmail} />}
            <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-medium ${priority.classes}`}>
              {priority.label}
            </span>
            {due && (
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-medium ${due.classes}`}>
                {due.label}
              </span>
            )}
            {anchorWatch && (
              <span
                title="Sitting in To Do for a while"
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              >
                <AnchorIcon className="h-2.5 w-2.5" />
                {anchorWatch.label}
              </span>
            )}
          </div>

          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            className="w-full rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900/40"
          >
            {TASK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setEditing(true)}
              className="text-[11px] text-neutral-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400"
            >
              Edit
            </button>
            <button
              onClick={() => setShowChecklist((v) => !v)}
              className="text-[11px] text-neutral-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400"
            >
              {showChecklist ? "Hide checklist" : "Checklist"}
            </button>
            <button
              onClick={() => setShowComments((v) => !v)}
              className="text-[11px] text-neutral-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400"
            >
              {showComments ? "Hide comments" : "Comments"}
            </button>
            <button
              onClick={handleDelete}
              className="ml-auto text-[11px] text-rose-500 hover:text-rose-600 dark:text-rose-500/90 dark:hover:text-rose-400"
            >
              Delete
            </button>
          </div>
          {showChecklist && <TaskChecklist projectId={task.projectId} taskId={task.id} />}
          {showComments && <TaskComments projectId={task.projectId} taskId={task.id} />}
        </>
      )}
    </div>
  );
}
