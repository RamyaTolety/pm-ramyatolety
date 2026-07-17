"use client";

import { useState } from "react";
import { createTask } from "@/lib/firestore";

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
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTask(projectId, {
        title,
        description,
        assigneeEmail: assigneeEmail || null,
        dueDate: dueDate ? new Date(dueDate).getTime() : null,
      });
      setTitle("");
      setDescription("");
      setAssigneeEmail("");
      setDueDate("");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => onOpenChange(true)}
        className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
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
          className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
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
