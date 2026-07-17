"use client";

import Link from "next/link";
import { useState } from "react";
import { addProjectMember, updateProject } from "@/lib/firestore";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  const [memberEmail, setMemberEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    const email = memberEmail.trim().toLowerCase();
    if (!email || project.memberEmails.includes(email)) return;
    await addProjectMember(project.id, [...project.memberEmails, email]);
    setMemberEmail("");
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    await updateProject(project.id, { name, description });
    setEditing(false);
  }

  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between">
        {editing ? (
          <form onSubmit={handleSaveEdit} className="flex-1 space-y-2 pr-2">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm font-semibold"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-neutral-900 px-2 py-1 text-xs font-medium text-white hover:bg-neutral-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setName(project.name);
                  setDescription(project.description);
                  setEditing(false);
                }}
                className="rounded-md border border-neutral-300 px-2 py-1 text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <Link href={`/projects/${project.id}`} className="font-semibold hover:underline">
              {project.name}
            </Link>
            {project.description && (
              <p className="text-sm text-neutral-500">{project.description}</p>
            )}
          </div>
        )}

        {!editing && (
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => setEditing(true)}
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
            >
              Edit
            </button>
            <button
              onClick={() => updateProject(project.id, { archived: !project.archived })}
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
            >
              {project.archived ? "Unarchive" : "Archive"}
            </button>
          </div>
        )}
      </div>

      <div className="text-xs text-neutral-500">
        Members: {project.memberEmails.join(", ")}
      </div>

      <form onSubmit={handleAddMember} className="flex gap-2">
        <input
          type="email"
          placeholder="Add member by email"
          value={memberEmail}
          onChange={(e) => setMemberEmail(e.target.value)}
          className="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-xs"
        />
        <button
          type="submit"
          className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
        >
          Add
        </button>
      </form>
    </div>
  );
}
