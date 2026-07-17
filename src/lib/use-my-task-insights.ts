"use client";

import { useEffect, useMemo, useState } from "react";
import { subscribeToProjectTasks, subscribeToUserProjects } from "./firestore";
import type { Project, Task } from "./types";

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function useMyTaskInsights(userEmail: string | null | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasksByProject, setTasksByProject] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    if (!userEmail) return;
    return subscribeToUserProjects(userEmail, setProjects);
  }, [userEmail]);

  useEffect(() => {
    const unsubscribers = projects.map((project) =>
      subscribeToProjectTasks(project.id, (tasks) => {
        setTasksByProject((prev) => ({ ...prev, [project.id]: tasks }));
      })
    );
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [projects]);

  return useMemo(() => {
    const rows = projects.flatMap((project) =>
      (tasksByProject[project.id] ?? []).map((task) => ({ project, task }))
    );
    const mine = rows.filter(({ task }) => task.assigneeEmail === userEmail);

    const incomplete = mine.filter(({ task }) => task.status !== "done");
    incomplete.sort((a, b) => {
      if (a.task.dueDate && b.task.dueDate) return a.task.dueDate - b.task.dueDate;
      if (a.task.dueDate) return -1;
      if (b.task.dueDate) return 1;
      return a.task.createdAt - b.task.createdAt;
    });
    const focusTask = incomplete[0] ?? null;

    const weekAgo = Date.now() - ONE_WEEK_MS;
    const shippedThisWeek = mine.filter(
      ({ task }) => task.status === "done" && task.updatedAt >= weekAgo
    ).length;

    return { focusTask, shippedThisWeek, incompleteCount: incomplete.length };
  }, [projects, tasksByProject, userEmail]);
}
