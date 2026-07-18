"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { WavesIcon } from "@/components/icons";
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
    <div className="animate-fade-in-up mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-blue-950 dark:text-blue-100">My Tasks</h1>

      <div className="flex flex-wrap gap-4 text-sm dark:text-slate-300">
        <label className="flex items-center gap-2">
          Project
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="rounded-md border border-neutral-300 px-2 py-1 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900/40"
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
            className="rounded-md border border-neutral-300 px-2 py-1 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900/40"
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
            className="rounded-md border border-neutral-300 px-2 py-1 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900/40"
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
        <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <WavesIcon className="mx-auto h-8 w-8 text-blue-300 dark:text-slate-600" />
          <p className="mt-2 text-sm text-neutral-600 dark:text-slate-400">No tasks match these filters — clear one to see more.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(({ project, task }) => (
            <Link
              key={task.id}
              href={`/projects/${project.id}`}
              className="flex items-center justify-between rounded-lg border border-blue-100 bg-white p-3 text-sm shadow-sm shadow-blue-100/40 hover:shadow-md hover:shadow-blue-100/60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:shadow-none"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-neutral-500 dark:text-slate-400">
                  {project.name} · {task.assigneeEmail ?? "Unassigned"}
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-slate-800 dark:text-blue-300">
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
