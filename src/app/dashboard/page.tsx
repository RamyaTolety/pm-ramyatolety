"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { NewProjectForm } from "@/components/NewProjectForm";
import { ProjectCard } from "@/components/ProjectCard";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth-context";
import { subscribeToUserProjects } from "@/lib/firestore";
import type { Project } from "@/lib/types";

function DashboardContent() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    return subscribeToUserProjects(user.email, setProjects);
  }, [user?.email]);

  const visible = projects.filter((p) => p.archived === showArchived);

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8">
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
        <p className="text-sm text-neutral-500">
          {showArchived ? "No archived projects." : "No projects yet — create one to get started."}
        </p>
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
