"use client";

import { useEffect, useState } from "react";
import { FocusCard } from "@/components/FocusCard";
import { Navbar } from "@/components/Navbar";
import { NewProjectForm } from "@/components/NewProjectForm";
import { ProjectCard } from "@/components/ProjectCard";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth-context";
import { subscribeToUserProjects } from "@/lib/firestore";
import type { Project } from "@/lib/types";
import { useMyTaskInsights } from "@/lib/use-my-task-insights";

function DashboardContent() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const { focusTask, shippedThisWeek } = useMyTaskInsights(user?.email);

  useEffect(() => {
    if (!user?.email) return;
    return subscribeToUserProjects(user.email, setProjects);
  }, [user?.email]);

  const visible = projects.filter((p) => p.archived === showArchived);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8">
      <FocusCard focusTask={focusTask} shippedThisWeek={shippedThisWeek} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-violet-950">Your projects</h1>
        <NewProjectForm />
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-600">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
        />
        Show archived
      </label>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/40 p-8 text-center">
          <p className="text-sm text-neutral-600">
            {showArchived
              ? "No archived projects — anything you archive shows up here."
              : "No projects yet. Create your first one and chart the course."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <Navbar />
      <DashboardContent />
    </RequireAuth>
  );
}
