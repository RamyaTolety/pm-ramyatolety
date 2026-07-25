"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { CrewIcon } from "@/components/icons";
import { subscribeToProject, subscribeToProjectTasks } from "@/lib/firestore";
import type { Project, Task } from "@/lib/types";

function CrewContent({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => subscribeToProject(projectId, setProject), [projectId]);
  useEffect(() => subscribeToProjectTasks(projectId, setTasks), [projectId]);

  const roster = useMemo(() => {
    if (!project) return [];
    // Tasks keep their assigneeEmail even after that person is removed from the
    // project's memberEmails, so build the roster from the union of current
    // members and any assignee still showing up on a task — otherwise their
    // historical stats silently vanish from the breakdown.
    const memberSet = new Set(project.memberEmails);
    const formerAssigneeEmails = Array.from(
      new Set(
        tasks
          .map((t) => t.assigneeEmail)
          .filter((email): email is string => !!email && !memberSet.has(email))
      )
    );
    const allEmails = [...project.memberEmails, ...formerAssigneeEmails];

    return allEmails
      .map((email) => {
        const assigned = tasks.filter((t) => t.assigneeEmail === email);
        const completed = assigned.filter((t) => t.status === "done");
        const rate = assigned.length ? Math.round((completed.length / assigned.length) * 100) : 0;
        return {
          email,
          assignedCount: assigned.length,
          completedCount: completed.length,
          rate,
          isFormerMember: !memberSet.has(email),
        };
      })
      .sort((a, b) => b.assignedCount - a.assignedCount);
  }, [project, tasks]);

  const unassignedCount = tasks.filter((t) => !t.assigneeEmail).length;

  if (project === undefined) {
    return <p className="p-8 text-center text-neutral-500 dark:text-slate-400">Loading…</p>;
  }
  if (project === null) {
    return <p className="p-8 text-center text-neutral-500 dark:text-slate-400">Project not found.</p>;
  }

  return (
    <div className="animate-fade-in-up mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-8">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to board
        </Link>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-blue-950 dark:text-blue-100">
          <CrewIcon className="h-6 w-6 text-blue-500" />
          {project.name} · Crew
        </h1>
      </div>

      <div className="rounded-xl border border-blue-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-slate-300">
          Roster ({roster.length})
        </h2>
        <div className="space-y-4">
          {roster.map((member) => (
            <Link
              key={member.email}
              href={`/projects/${projectId}?assignee=${encodeURIComponent(member.email)}`}
              className="-mx-2 flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-blue-50 dark:hover:bg-slate-800"
            >
              <Avatar email={member.email} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-800 dark:text-slate-200">
                  {member.email}
                  {member.isFormerMember && (
                    <span className="ml-1.5 text-xs font-normal text-neutral-400 dark:text-slate-500">
                      (former member)
                    </span>
                  )}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      style={{ width: `${member.rate}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs text-neutral-500 dark:text-slate-400">
                    {member.rate}%
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-4 text-right text-xs text-neutral-500 dark:text-slate-400">
                <div>
                  <p className="text-sm font-semibold text-blue-950 dark:text-blue-100">
                    {member.assignedCount}
                  </p>
                  <p>assigned</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-950 dark:text-blue-100">
                    {member.completedCount}
                  </p>
                  <p>done</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {unassignedCount > 0 && (
          <p className="mt-4 border-t border-neutral-100 pt-3 text-xs text-neutral-400 dark:border-slate-800 dark:text-slate-500">
            {unassignedCount} task{unassignedCount === 1 ? "" : "s"} still unassigned.
          </p>
        )}
      </div>
    </div>
  );
}

export default function CrewPage() {
  const params = useParams<{ id: string }>();

  return (
    <RequireAuth>
      <Navbar />
      <CrewContent projectId={params.id} />
    </RequireAuth>
  );
}
