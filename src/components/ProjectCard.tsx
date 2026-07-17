"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addProjectMember, subscribeToProjectTasks, updateProject } from "@/lib/firestore";
import type { Project, Task } from "@/lib/types";
import { Avatar } from "./Avatar";

export function ProjectCard({ project }: { project: Project }) {
  const [memberEmail, setMemberEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => subscribeToProjectTasks(project.id, setTasks), [project.id]);

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

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
    <div className="animate-fade-in-up space-y-3 rounded-xl border border-violet-100 bg-white p-4 shadow-sm shadow-violet-100/40 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-100/60">
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
                className="rounded-md bg-violet-600 px-2 py-1 text-xs font-medium text-white hover:bg-violet-700"
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
            <Link
              href={`/projects/${project.id}`}
              className="font-semibold text-violet-950 hover:text-violet-700 hover:underline"
            >
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
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-violet-50 hover:text-violet-700"
            >
              Edit
            </button>
            <button
              onClick={() => updateProject(project.id, { archived: !project.archived })}
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-violet-50 hover:text-violet-700"
            >
              {project.archived ? "Unarchive" : "Archive"}
            </button>
          </div>
        )}
      </div>

      {tasks.length > 0 && (
        <div className="space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-violet-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500">
            {doneCount}/{tasks.length} tasks done · {progress}%
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        {project.memberEmails.map((email) => (
          <Avatar key={email} email={email} />
        ))}
      </div>

      <form onSubmit={handleAddMember} className="flex gap-2">
        <input
          type="email"
          placeholder="Add member by email"
          value={memberEmail}
          onChange={(e) => setMemberEmail(e.target.value)}
          className="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
        <button
          type="submit"
          className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-violet-50 hover:text-violet-700"
        >
          Add
        </button>
      </form>
    </div>
  );
}
