"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { createProject, createTask } from "@/lib/firestore";
import { PROJECT_TEMPLATES } from "@/lib/types";

export function NewProjectForm() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState(PROJECT_TEMPLATES[0].value);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email) return;
    setSubmitting(true);
    try {
      const project = await createProject({
        name,
        description,
        ownerId: user.uid,
        ownerEmail: user.email,
      });
      const chosenTemplate = PROJECT_TEMPLATES.find((t) => t.value === template);
      if (chosenTemplate) {
        for (const starterTask of chosenTemplate.starterTasks) {
          await createTask(project.id, {
            title: starterTask.title,
            description: starterTask.description,
            assigneeEmail: null,
            dueDate: null,
            labels: starterTask.labels,
          });
        }
      }
      setName("");
      setDescription("");
      setTemplate(PROJECT_TEMPLATES[0].value);
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
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
      <div className="space-y-1">
        <p className="text-xs font-medium text-neutral-600">Template</p>
        <div className="flex flex-wrap gap-2">
          {PROJECT_TEMPLATES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTemplate(t.value)}
              title={t.description}
              className={`rounded-md border px-2.5 py-1 text-xs ${
                template === t.value
                  ? "border-blue-400 bg-blue-50 text-blue-700"
                  : "border-neutral-300 text-neutral-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
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
