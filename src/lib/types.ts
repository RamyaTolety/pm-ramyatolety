export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskLabel = "bug" | "feature" | "docs" | "urgent" | "design";

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerEmail: string;
  memberEmails: string[];
  archived: boolean;
  createdAt: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeEmail: string | null;
  dueDate: number | null;
  labels: TaskLabel[];
  createdAt: number;
  updatedAt: number;
}

export interface Comment {
  id: string;
  authorEmail: string;
  text: string;
  createdAt: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

export const TASK_LABELS: { value: TaskLabel; label: string; classes: string }[] = [
  { value: "bug", label: "Bug", classes: "bg-rose-100 text-rose-700" },
  { value: "feature", label: "Feature", classes: "bg-emerald-100 text-emerald-700" },
  { value: "docs", label: "Docs", classes: "bg-sky-100 text-sky-700" },
  { value: "urgent", label: "Urgent", classes: "bg-orange-100 text-orange-700" },
  { value: "design", label: "Design", classes: "bg-fuchsia-100 text-fuchsia-700" },
];

export const PROJECT_TEMPLATES: {
  value: string;
  label: string;
  description: string;
  starterTasks: { title: string; description: string; labels: TaskLabel[] }[];
}[] = [
  { value: "blank", label: "Blank", description: "Start with an empty board", starterTasks: [] },
  {
    value: "sprint",
    label: "Sprint Board",
    description: "Common sprint kickoff tasks",
    starterTasks: [
      { title: "Define sprint goal", description: "", labels: ["docs"] },
      { title: "Break down backlog into tasks", description: "", labels: ["feature"] },
      { title: "Daily standup notes", description: "", labels: ["docs"] },
    ],
  },
  {
    value: "bugs",
    label: "Bug Tracker",
    description: "Triage-first workflow for incoming bugs",
    starterTasks: [
      { title: "Triage incoming bugs", description: "", labels: ["bug"] },
      { title: "Reproduce and label severity", description: "", labels: ["bug"] },
      { title: "Fix top priority bug", description: "", labels: ["bug", "urgent"] },
    ],
  },
];

export const TASK_STATUSES: {
  value: TaskStatus;
  label: string;
  accent: string;
}[] = [
  { value: "todo", label: "To Do", accent: "border-t-slate-400" },
  { value: "in_progress", label: "In Progress", accent: "border-t-amber-400" },
  { value: "done", label: "Done", accent: "border-t-emerald-400" },
];
