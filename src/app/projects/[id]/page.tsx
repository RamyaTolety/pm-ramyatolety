"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Confetti } from "@/components/Confetti";
import { Navbar } from "@/components/Navbar";
import { NewTaskForm } from "@/components/NewTaskForm";
import { RequireAuth } from "@/components/RequireAuth";
import { TaskCard } from "@/components/TaskCard";
import { subscribeToProject, subscribeToProjectTasks, updateTaskStatus } from "@/lib/firestore";
import type { Project, Task, TaskStatus } from "@/lib/types";
import { TASK_STATUSES } from "@/lib/types";

function BoardContent({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [celebration, setCelebration] = useState(0);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);

  useEffect(() => subscribeToProject(projectId, setProject), [projectId]);
  useEffect(() => subscribeToProjectTasks(projectId, setTasks), [projectId]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (!typing && e.key === "n") {
        e.preventDefault();
        setNewTaskOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (project === undefined) {
    return <p className="p-8 text-center text-neutral-500">Loading…</p>;
  }
  if (project === null) {
    return <p className="p-8 text-center text-neutral-500">Project not found.</p>;
  }

  const filteredTasks = assigneeFilter
    ? tasks.filter((t) => t.assigneeEmail === assigneeFilter)
    : tasks;

  function handleDrop(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault();
    setDragOverStatus(null);
    const taskId = e.dataTransfer.getData("text/task-id");
    const fromStatus = e.dataTransfer.getData("text/from-status");
    if (!taskId || fromStatus === status) return;
    updateTaskStatus(projectId, taskId, status);
    if (status === "done" && fromStatus !== "done") {
      setCelebration((n) => n + 1);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8">
      <Confetti trigger={celebration} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-violet-950">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-neutral-500">{project.description}</p>
          )}
        </div>
        <NewTaskForm
          projectId={projectId}
          memberEmails={project.memberEmails}
          open={newTaskOpen}
          onOpenChange={setNewTaskOpen}
        />
      </div>

      <div className="flex items-center gap-2 text-sm">
        <label className="text-neutral-600">Filter by assignee:</label>
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="rounded-md border border-neutral-300 px-2 py-1 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
        >
          <option value="">Everyone</option>
          {project.memberEmails.map((email) => (
            <option key={email} value={email}>
              {email}
            </option>
          ))}
        </select>
        <span className="ml-auto text-xs text-neutral-400">
          Drag cards between columns, or press <kbd className="rounded border px-1">n</kbd> for a
          new task
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {TASK_STATUSES.map((status) => (
          <div
            key={status.value}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverStatus(status.value);
            }}
            onDragLeave={() => setDragOverStatus(null)}
            onDrop={(e) => handleDrop(e, status.value)}
            className={`space-y-3 rounded-lg p-2 transition-colors ${
              dragOverStatus === status.value ? "bg-violet-50" : ""
            }`}
          >
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-neutral-600">
              <span aria-hidden>{status.emoji}</span>
              {status.label} ({filteredTasks.filter((t) => t.status === status.value).length})
            </h2>
            <div className="space-y-2">
              {filteredTasks
                .filter((t) => t.status === status.value)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onCompleted={() => setCelebration((n) => n + 1)}
                  />
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
