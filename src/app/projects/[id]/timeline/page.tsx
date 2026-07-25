"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { FlagIcon } from "@/components/icons";
import { subscribeToProject, subscribeToProjectTasks, updateTask } from "@/lib/firestore";
import type { Project, Task } from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const CLUSTER_THRESHOLD_PCT = 6;
const TIER_STEP_PX = 24;
const TICK_STEP_PX = 16;

const STATUS_DOT: Record<Task["status"], string> = {
  todo: "bg-slate-400",
  in_progress: "bg-amber-400",
  done: "bg-emerald-400",
};

type DatedTask = Task & { dueDate: number };

interface StopMeta {
  task: DatedTask;
  pct: number;
  above: boolean;
  tier: number;
  overdue: boolean;
  dateLabel: string;
}

function formatDayLabel(timestamp: number) {
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Group stops whose pct values fall within CLUSTER_THRESHOLD_PCT of their neighbor, then
// fan each cluster's labels out into alternating above/below tiers so nearby due dates
// don't render their labels on top of one another.
function buildStops(dated: DatedTask[], earliest: number, span: number): StopMeta[] {
  const withPct = dated.map((task) => ({
    task,
    pct: 4 + ((task.dueDate - earliest) / span) * 92,
    overdue: task.status !== "done" && task.dueDate < Date.now(),
  }));

  const clusters: (typeof withPct)[] = [];
  withPct.forEach((item, idx) => {
    const prev = withPct[idx - 1];
    if (idx > 0 && prev && item.pct - prev.pct < CLUSTER_THRESHOLD_PCT) {
      clusters[clusters.length - 1].push(item);
    } else {
      clusters.push([item]);
    }
  });

  const stops: StopMeta[] = [];
  let globalIndex = 0;
  for (const cluster of clusters) {
    const startAbove = globalIndex % 2 === 0;
    cluster.forEach((item, localIdx) => {
      stops.push({
        ...item,
        above: localIdx % 2 === 0 ? startAbove : !startAbove,
        tier: Math.floor(localIdx / 2),
        dateLabel: formatDayLabel(item.task.dueDate),
      });
      globalIndex += 1;
    });
  }
  return stops;
}

function TimelineContent({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dragState, setDragState] = useState<{ taskId: string; pct: number } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => subscribeToProject(projectId, setProject), [projectId]);
  useEffect(() => subscribeToProjectTasks(projectId, setTasks), [projectId]);

  // Clean up any in-flight drag listeners if the component unmounts mid-drag.
  useEffect(() => () => dragCleanupRef.current?.(), []);

  const dated = useMemo(() => {
    return tasks
      .filter((t): t is DatedTask => typeof t.dueDate === "number")
      .sort((a, b) => a.dueDate - b.dueDate);
  }, [tasks]);

  const bounds = useMemo(() => {
    if (dated.length === 0) return null;
    const earliest = dated[0].dueDate;
    const latest = dated[dated.length - 1].dueDate;
    const span = Math.max(latest - earliest, DAY_MS);
    return { earliest, span };
  }, [dated]);

  const stops = useMemo(() => {
    if (!bounds) return [];
    return buildStops(dated, bounds.earliest, bounds.span);
  }, [dated, bounds]);

  function handlePointerDown(
    e: React.PointerEvent<HTMLSpanElement>,
    task: DatedTask,
    startPct: number
  ) {
    if (!bounds) return;
    e.preventDefault();
    const { earliest, span } = bounds;
    let latestPct = startPct;
    setDragState({ taskId: task.id, pct: startPct });

    function onMove(ev: PointerEvent) {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const rawPct = ((ev.clientX - rect.left) / rect.width) * 100;
      latestPct = Math.min(100, Math.max(0, rawPct));
      setDragState({ taskId: task.id, pct: latestPct });
    }

    function cleanup() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      dragCleanupRef.current = null;
    }

    function onUp() {
      cleanup();
      setDragState(null);
      const rawDueDate = earliest + ((latestPct - 4) / 92) * span;
      const snapped = new Date(rawDueDate);
      snapped.setHours(0, 0, 0, 0);
      updateTask(projectId, task.id, { dueDate: snapped.getTime() });
    }

    dragCleanupRef.current = cleanup;
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  if (project === undefined) {
    return <p className="p-8 text-center text-neutral-500 dark:text-slate-400">Loading…</p>;
  }
  if (project === null) {
    return <p className="p-8 text-center text-neutral-500 dark:text-slate-400">Project not found.</p>;
  }

  return (
    <div className="animate-fade-in-up mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to board
        </Link>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-blue-950 dark:text-blue-100">
          <FlagIcon className="h-6 w-6 text-blue-500" />
          {project.name} · Route Timeline
        </h1>
        <p className="text-sm text-neutral-500 dark:text-slate-400">
          Due-dated legs of the journey, plotted like ports of call along the route. Drag a port to
          reschedule it.
        </p>
      </div>

      <div className="rounded-xl border border-blue-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        {stops.length === 0 ? (
          <p className="py-12 text-center text-sm text-neutral-400 dark:text-slate-500">
            No tasks with a due date yet — the route is still unplotted.
          </p>
        ) : (
          <div ref={trackRef} className="relative mt-20 mb-24 select-none">
            <div className="absolute top-1/2 right-1 left-1 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-200 via-blue-400 to-cyan-400" />
            {stops.map((stop) => {
              const isDragging = dragState?.taskId === stop.task.id;
              const pct = isDragging && dragState ? dragState.pct : stop.pct;
              const dateLabel =
                isDragging && dragState && bounds
                  ? formatDayLabel(bounds.earliest + ((dragState.pct - 4) / 92) * bounds.span)
                  : stop.dateLabel;
              const offsetPx = (stop.tier + 1) * TIER_STEP_PX;
              const tickPx = (stop.tier + 1) * TICK_STEP_PX;

              return (
                <div
                  key={stop.task.id}
                  className="absolute top-1/2 -translate-x-1/2"
                  style={{ left: `${pct}%` }}
                >
                  <span
                    onPointerDown={(e) => handlePointerDown(e, stop.task, stop.pct)}
                    title={`${stop.task.title} · ${dateLabel}`}
                    className={`block h-3.5 w-3.5 cursor-grab touch-none rounded-full ring-4 ring-white transition-transform active:cursor-grabbing dark:ring-slate-900 ${
                      isDragging ? "scale-125" : ""
                    } ${stop.overdue ? "bg-rose-500" : STATUS_DOT[stop.task.status]}`}
                  />
                  <div
                    className={`absolute left-1/2 flex w-32 -translate-x-1/2 flex-col items-center text-center ${
                      stop.above ? "flex-col-reverse" : ""
                    }`}
                    style={stop.above ? { bottom: `${offsetPx}px` } : { top: `${offsetPx}px` }}
                  >
                    <div
                      className="w-px bg-neutral-200 dark:bg-slate-700"
                      style={{ height: `${tickPx}px` }}
                    />
                    <p className="truncate text-[11px] font-medium text-neutral-700 dark:text-slate-300">
                      {stop.task.title}
                    </p>
                    <p
                      className={`text-[11px] ${
                        stop.overdue ? "text-rose-500 dark:text-rose-400" : "text-neutral-400 dark:text-slate-500"
                      }`}
                    >
                      {dateLabel}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {stops.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> To Do
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> In Progress
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Overdue
          </span>
        </div>
      )}
    </div>
  );
}

export default function TimelinePage() {
  const params = useParams<{ id: string }>();

  return (
    <RequireAuth>
      <Navbar />
      <TimelineContent projectId={params.id} />
    </RequireAuth>
  );
}
