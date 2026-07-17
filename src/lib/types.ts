export type TaskStatus = "todo" | "in_progress" | "done";

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
  createdAt: number;
  updatedAt: number;
}

export interface Comment {
  id: string;
  authorEmail: string;
  text: string;
  createdAt: number;
}

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
