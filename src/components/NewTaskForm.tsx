"use client";

import { useState } from "react";
import { createTask } from "@/lib/firestore";

export function NewTaskForm({
  projectId,
  memberEmails,
}: {
  projectId: string;
  memberEmails: string[];
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTask(projectId, {
        title,
        description,
        assigneeEmail: assigneeEmail || null,
      });
      setTitle("");
      setDescription("");
      setAssigneeEmail("");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
      >
        + New task
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 rounded-lg border border-neutral-200 bg-white p-3"
    >
      <input
        required
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
        rows={2}
      />
      <select
        value={assigneeEmail}
        onChange={(e) => setAssigneeEmail(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
      >
        <option value="">Unassigned</option>
        {memberEmails.map((email) => (
          <option key={email} value={email}>
            {email}
          </option>
        ))}
      </select>
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
          onClick={() => setOpen(false)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
