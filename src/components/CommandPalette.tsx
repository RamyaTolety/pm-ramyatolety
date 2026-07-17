"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToUserProjects } from "@/lib/firestore";
import type { Project } from "@/lib/types";

interface Command {
  id: string;
  label: string;
  hint: string;
  onSelect: () => void;
}

export function CommandPalette() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!user?.email) return;
    return subscribeToUserProjects(user.email, setProjects);
  }, [user?.email]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setActiveIndex(0);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commands = useMemo<Command[]>(() => {
    const base: Command[] = [
      { id: "dashboard", label: "Go to Dashboard", hint: "Projects", onSelect: () => router.push("/dashboard") },
      { id: "my-tasks", label: "Go to My Tasks", hint: "Cross-project", onSelect: () => router.push("/my-tasks") },
    ];
    const projectCommands: Command[] = projects
      .filter((p) => !p.archived)
      .map((p) => ({
        id: p.id,
        label: `Go to ${p.name}`,
        hint: "Project",
        onSelect: () => router.push(`/projects/${p.id}`),
      }));
    return [...base, ...projectCommands];
  }, [projects, router]);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  function handleSelect(command: Command) {
    command.onSelect();
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-xl border border-blue-100 bg-white shadow-2xl"
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && filtered[activeIndex]) {
              handleSelect(filtered[activeIndex]);
            }
          }}
          placeholder="Jump to a project or page…"
          className="w-full border-b border-neutral-100 px-4 py-3 text-sm focus:outline-none"
        />
        <div className="max-h-72 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <p className="px-4 py-3 text-sm text-neutral-400">No matches.</p>
          )}
          {filtered.map((command, index) => (
            <button
              key={command.id}
              onClick={() => handleSelect(command)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
                index === activeIndex ? "bg-blue-50 text-blue-700" : "text-neutral-700"
              }`}
            >
              <span>{command.label}</span>
              <span className="text-xs text-neutral-400">{command.hint}</span>
            </button>
          ))}
        </div>
        <div className="border-t border-neutral-100 px-4 py-1.5 text-[11px] text-neutral-400">
          <kbd className="rounded border px-1">↑↓</kbd> navigate ·{" "}
          <kbd className="rounded border px-1">↵</kbd> select ·{" "}
          <kbd className="rounded border px-1">esc</kbd> close
        </div>
      </div>
    </div>
  );
}
