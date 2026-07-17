"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { subscribeToProject } from "@/lib/firestore";
import type { Project } from "@/lib/types";
import { useVoyageLog } from "@/lib/use-voyage-log";
import type { VoyageEvent } from "@/lib/use-voyage-log";

function eventCopy(event: VoyageEvent): string {
  switch (event.type) {
    case "task_created":
      return `Set sail on "${event.taskTitle}"`;
    case "task_completed":
      return `Waypoint reached — "${event.taskTitle}" done`;
    case "comment_added":
      return `${event.authorEmail} logged a note on "${event.taskTitle}": ${event.text}`;
    case "checklist_completed":
      return `Checked off "${event.itemText}" on "${event.taskTitle}"`;
  }
}

function eventDot(event: VoyageEvent): string {
  switch (event.type) {
    case "task_created":
      return "bg-slate-400";
    case "task_completed":
      return "bg-emerald-500";
    case "comment_added":
      return "bg-sky-400";
    case "checklist_completed":
      return "bg-violet-500";
  }
}

function LogContent({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const events = useVoyageLog(projectId);

  useEffect(() => subscribeToProject(projectId, setProject), [projectId]);

  if (project === undefined) {
    return <p className="p-8 text-center text-neutral-500">Loading…</p>;
  }
  if (project === null) {
    return <p className="p-8 text-center text-neutral-500">Project not found.</p>;
  }

  return (
    <div className="animate-fade-in-up mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8">
      <div>
        <Link href={`/projects/${projectId}`} className="text-sm text-violet-600 hover:underline">
          ← Back to board
        </Link>
        <h1 className="mt-1 text-2xl font-bold text-violet-950">{project.name} · Voyage Log</h1>
        <p className="text-sm text-neutral-500">Every leg of the journey, in order.</p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/40 p-8 text-center">
          <p className="text-sm text-neutral-600">Nothing logged yet — create a task to start the voyage.</p>
        </div>
      ) : (
        <ol className="space-y-4 border-l border-violet-200 pl-5">
          {events.map((event) => (
            <li key={event.id} className="relative">
              <span
                className={`absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ${eventDot(event)}`}
              />
              <p className="text-sm text-neutral-800">{eventCopy(event)}</p>
              <p className="text-xs text-neutral-400">
                {new Date(event.at).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default function VoyageLogPage() {
  const params = useParams<{ id: string }>();

  return (
    <RequireAuth>
      <Navbar />
      <LogContent projectId={params.id} />
    </RequireAuth>
  );
}
