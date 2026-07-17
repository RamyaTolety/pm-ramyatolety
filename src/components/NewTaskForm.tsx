"use client";

import { useState } from "react";
import { createTask } from "@/lib/firestore";
import type { TaskLabel } from "@/lib/types";
import { TASK_LABELS } from "@/lib/types";

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
      });
      setTitle("");
      setDescription("");
      setAssigneeEmail("");
      setDueDate("");
      setLabels([]);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => onOpenChange(true)}
        className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-violet-700"
      >
        + New task <span className="opacity-60">(n)</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3"
    >
      <input
        autoFocus
        required
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
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
                : "bg-transparent text-neutral-400 ring-neutral-200"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <select
          value={assigneeEmail}
          onChange={(e) => setAssigneeEmail(e.target.value)}
          className="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
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
          className="rounded-md border border-neutral-300 px-2 py-1 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
        >
          Create
        </button>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
