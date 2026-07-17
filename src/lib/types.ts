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

export const TASK_LABELS: { value: TaskLabel; label: string; classes: string }[] = [
  { value: "bug", label: "Bug", classes: "bg-rose-100 text-rose-700" },
  { value: "feature", label: "Feature", classes: "bg-emerald-100 text-emerald-700" },
  { value: "docs", label: "Docs", classes: "bg-sky-100 text-sky-700" },
  { value: "urgent", label: "Urgent", classes: "bg-orange-100 text-orange-700" },
  { value: "design", label: "Design", classes: "bg-fuchsia-100 text-fuchsia-700" },
];

export const TASK_STATUSES: {
  value: TaskStatus;
  label: string;
  emoji: string;
  accent: string;
}[] = [
  { value: "todo", label: "To Do", emoji: "📋", accent: "border-t-slate-400" },
  { value: "in_progress", label: "In Progress", emoji: "🔨", accent: "border-t-amber-400" },
  { value: "done", label: "Done", emoji: "✅", accent: "border-t-emerald-400" },
];
