"use client";

import { useEffect, useState } from "react";
import { subscribeToProjectTasks, subscribeToUserProjects } from "./firestore";
import type { Project } from "./types";

export function useIncompleteTaskCount(userEmail: string | null | undefined) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [countByProject, setCountByProject] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!userEmail) return;
    return subscribeToUserProjects(userEmail, setProjects);
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) return;
    const unsubscribers = projects.map((project) =>
      subscribeToProjectTasks(project.id, (tasks) => {
        const count = tasks.filter(
          (t) => t.assigneeEmail === userEmail && t.status !== "done"
        ).length;
        setCountByProject((prev) => ({ ...prev, [project.id]: count }));
      })
    );
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [projects, userEmail]);

  return Object.values(countByProject).reduce((a, b) => a + b, 0);
}
