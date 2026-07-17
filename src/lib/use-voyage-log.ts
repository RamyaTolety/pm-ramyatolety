"use client";

import { useEffect, useMemo, useState } from "react";
import { subscribeToChecklist, subscribeToComments, subscribeToProjectTasks } from "./firestore";
import type { ChecklistItem, Comment, Task } from "./types";

export type VoyageEvent =
  | { id: string; type: "task_created"; at: number; taskTitle: string }
  | { id: string; type: "task_completed"; at: number; taskTitle: string }
  | { id: string; type: "comment_added"; at: number; taskTitle: string; authorEmail: string; text: string }
  | { id: string; type: "checklist_completed"; at: number; taskTitle: string; itemText: string };

export function useVoyageLog(projectId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [commentsByTask, setCommentsByTask] = useState<Record<string, Comment[]>>({});
  const [checklistByTask, setChecklistByTask] = useState<Record<string, ChecklistItem[]>>({});

  useEffect(() => subscribeToProjectTasks(projectId, setTasks), [projectId]);

  useEffect(() => {
    const unsubscribers = tasks.map((task) =>
      subscribeToComments(projectId, task.id, (comments) => {
        setCommentsByTask((prev) => ({ ...prev, [task.id]: comments }));
      })
    );
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [projectId, tasks]);

  useEffect(() => {
    const unsubscribers = tasks.map((task) =>
      subscribeToChecklist(projectId, task.id, (items) => {
        setChecklistByTask((prev) => ({ ...prev, [task.id]: items }));
      })
    );
    return () => unsubscribers.forEach((unsub) => unsub());
  }, [projectId, tasks]);

  return useMemo<VoyageEvent[]>(() => {
    const events: VoyageEvent[] = [];

    for (const task of tasks) {
      events.push({
        id: `created-${task.id}`,
        type: "task_created",
        at: task.createdAt,
        taskTitle: task.title,
      });
      if (task.status === "done") {
        events.push({
          id: `completed-${task.id}`,
          type: "task_completed",
          at: task.updatedAt,
          taskTitle: task.title,
        });
      }
      for (const comment of commentsByTask[task.id] ?? []) {
        events.push({
          id: `comment-${comment.id}`,
          type: "comment_added",
          at: comment.createdAt,
          taskTitle: task.title,
          authorEmail: comment.authorEmail,
          text: comment.text,
        });
      }
      for (const item of checklistByTask[task.id] ?? []) {
        if (item.done && item.completedAt) {
          events.push({
            id: `checklist-${item.id}`,
            type: "checklist_completed",
            at: item.completedAt,
            taskTitle: task.title,
            itemText: item.text,
          });
        }
      }
    }

    events.sort((a, b) => b.at - a.at);
    return events.slice(0, 50);
  }, [tasks, commentsByTask, checklistByTask]);
}
