"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { createProject } from "@/lib/firestore";

export function NewProjectForm() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email) return;
    setSubmitting(true);
    try {
      await createProject({
        name,
        description,
        ownerId: user.uid,
        ownerEmail: user.email,
      });
      setName("");
      setDescription("");
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
      >
        + New project
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4"
    >
      <input
        required
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        rows={2}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          Create
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
