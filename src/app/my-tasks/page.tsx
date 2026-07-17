"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth-context";
import { subscribeToProjectTasks, subscribeToUserProjects } from "@/lib/firestore";
import type { Project, Task, TaskStatus } from "@/lib/types";
import { TASK_STATUSES } from "@/lib/types";

function MyTasksContent() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasksByProject, setTasksByProject] = useState<Record<string, Task[]>>({});
  const [projectFilter, setProjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [assigneeFilter, setAssigneeFilter] = useState(user?.email ?? "");

  useEffect(() => {
    if (!user?.email) return;
    return subscribeToUserProjects(user.email, setProjects);
  }, [user?.email]);

  useEffect(() => {
    const unsubscribers = projects.map((project) =>
      subscribeToProjectTasks(project.id, (tasks) => {
        setTasksByProject((prev) => ({ ...prev, [project.id]: tasks }));
      })
    );
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [projects]);

  const allMemberEmails = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.memberEmails))),
    [projects]
  );

  const rows = useMemo(() => {
    return projects
      .filter((p) => !projectFilter || p.id === projectFilter)
      .flatMap((project) =>
        (tasksByProject[project.id] ?? []).map((task) => ({ project, task }))
      )
      .filter(({ task }) => !statusFilter || task.status === statusFilter)
      .filter(({ task }) => !assigneeFilter || task.assigneeEmail === assigneeFilter);
  }, [projects, tasksByProject, projectFilter, statusFilter, assigneeFilter]);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">My Tasks</h1>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          Project
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="rounded-md border border-neutral-300 px-2 py-1"
          >
            <option value="">All</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "")}
            className="rounded-md border border-neutral-300 px-2 py-1"
          >
            <option value="">All</option>
            {TASK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          Assignee
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="rounded-md border border-neutral-300 px-2 py-1"
          >
            <option value="">Everyone</option>
            {allMemberEmails.map((email) => (
              <option key={email} value={email}>
                {email}
              </option>
            ))}
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500">No tasks match these filters.</p>
      ) : (
        <div className="space-y-2">
          {rows.map(({ project, task }) => (
            <Link
              key={task.id}
              href={`/projects/${project.id}`}
              className="flex items-center justify-between rounded-md border border-neutral-200 bg-white p-3 text-sm hover:bg-neutral-50"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-neutral-500">
                  {project.name} · {task.assigneeEmail ?? "Unassigned"}
                </p>
              </div>
              <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
                {TASK_STATUSES.find((s) => s.value === task.status)?.label}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MyTasksPage() {
  return (
    <RequireAuth>
      <Navbar />
      <MyTasksContent />
    </RequireAuth>
  );
}
