"use client";

import { useState } from "react";
import { createTask } from "@/lib/firestore";
import type { TaskLabel, TaskPriority, TaskRecurrence } from "@/lib/types";
import {
  DEFAULT_TASK_PRIORITY,
  DEFAULT_TASK_RECURRENCE,
  TASK_LABELS,
  TASK_PRIORITIES,
  TASK_RECURRENCES,
} from "@/lib/types";

export function NewTaskForm({
  projectId,
  memberEmails,
  open,
  onOpenChange,
}: {
  projectId: string;
  memberEmails: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [labels, setLabels] = useState<TaskLabel[]>([]);
  const [priority, setPriority] = useState<TaskPriority>(DEFAULT_TASK_PRIORITY);
  const [recurrence, setRecurrence] = useState<TaskRecurrence>(DEFAULT_TASK_RECURRENCE);
  const [submitting, setSubmitting] = useState(false);

  function toggleLabel(label: TaskLabel) {
    setLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTask(projectId, {
        title,
        description,
        assigneeEmail: assigneeEmail || null,
        dueDate: dueDate ? new Date(dueDate).getTime() : null,
        labels,
        priority,
        recurrence,
      });
      setTitle("");
      setDescription("");
      setAssigneeEmail("");
      setDueDate("");
      setLabels([]);
      setPriority(DEFAULT_TASK_PRIORITY);
      setRecurrence(DEFAULT_TASK_RECURRENCE);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => onOpenChange(true)}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        + New task <span className="opacity-60">(n)</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
    >
      <input
        autoFocus
        required
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900/40"
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900/40"
        rows={2}
      />
      <div className="flex flex-wrap gap-1.5">
        {TASK_LABELS.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => toggleLabel(l.value)}
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
              labels.includes(l.value)
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
              onClick={() => setPriority(p.value)}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                priority === p.value
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
              onClick={() => setRecurrence(r.value)}
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                recurrence === r.value
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
          value={assigneeEmail}
          onChange={(e) => setAssigneeEmail(e.target.value)}
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
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900/40 dark:[color-scheme:dark]"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          Create
        </button>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:text-slate-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
