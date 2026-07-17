"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { NewTaskForm } from "@/components/NewTaskForm";
import { RequireAuth } from "@/components/RequireAuth";
import { TaskCard } from "@/components/TaskCard";
import { subscribeToProject, subscribeToProjectTasks } from "@/lib/firestore";
import type { Project, Task } from "@/lib/types";
import { TASK_STATUSES } from "@/lib/types";

function BoardContent({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState("");

  useEffect(() => subscribeToProject(projectId, setProject), [projectId]);
  useEffect(() => subscribeToProjectTasks(projectId, setTasks), [projectId]);

  if (project === undefined) {
    return <p className="p-8 text-center text-neutral-500">Loading…</p>;
  }
  if (project === null) {
    return <p className="p-8 text-center text-neutral-500">Project not found.</p>;
  }

  const filteredTasks = assigneeFilter
    ? tasks.filter((t) => t.assigneeEmail === assigneeFilter)
    : tasks;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-neutral-500">{project.description}</p>
          )}
        </div>
        <NewTaskForm projectId={projectId} memberEmails={project.memberEmails} />
      </div>

      <div className="flex items-center gap-2 text-sm">
        <label className="text-neutral-600">Filter by assignee:</label>
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="rounded-md border border-neutral-300 px-2 py-1"
        >
          <option value="">Everyone</option>
          {project.memberEmails.map((email) => (
            <option key={email} value={email}>
              {email}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {TASK_STATUSES.map((status) => (
          <div key={status.value} className="space-y-3">
            <h2 className="text-sm font-semibold text-neutral-600">
              {status.label} ({filteredTasks.filter((t) => t.status === status.value).length})
            </h2>
            <div className="space-y-2">
              {filteredTasks
                .filter((t) => t.status === status.value)
                .map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectPage() {
  const params = useParams<{ id: string }>();

  return (
    <RequireAuth>
      <Navbar />
      <BoardContent projectId={params.id} />
    </RequireAuth>
  );
}
