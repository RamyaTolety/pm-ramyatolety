export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskLabel = "bug" | "feature" | "docs" | "urgent" | "design";

export type PortIcon = "helm" | "anchor" | "sailboat" | "waves" | "flag" | "compass";

export type PortColor = "blue" | "cyan" | "teal" | "emerald" | "amber" | "rose" | "slate";

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerEmail: string;
  memberEmails: string[];
  archived: boolean;
  createdAt: number;
  portIcon?: PortIcon | null;
  portColor?: PortColor | null;
}

export const PORT_ICONS: { value: PortIcon; label: string }[] = [
  { value: "compass", label: "Compass" },
  { value: "helm", label: "Helm" },
  { value: "anchor", label: "Anchor" },
  { value: "sailboat", label: "Sailboat" },
  { value: "waves", label: "Waves" },
  { value: "flag", label: "Flag" },
];

export const PORT_COLORS: { value: PortColor; badge: string; dot: string }[] = [
  { value: "blue", badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  { value: "cyan", badge: "bg-cyan-100 text-cyan-700", dot: "bg-cyan-500" },
  { value: "teal", badge: "bg-teal-100 text-teal-700", dot: "bg-teal-500" },
  { value: "emerald", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  { value: "amber", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  { value: "rose", badge: "bg-rose-100 text-rose-700", dot: "bg-rose-500" },
  { value: "slate", badge: "bg-slate-100 text-slate-700", dot: "bg-slate-500" },
];

export const DEFAULT_PORT_ICON: PortIcon = "compass";
export const DEFAULT_PORT_COLOR: PortColor = "blue";

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
  completedAt: number | null;
}

export const TASK_LABELS: { value: TaskLabel; label: string; classes: string }[] = [
  { value: "bug", label: "Bug", classes: "bg-rose-100 text-rose-700" },
  { value: "feature", label: "Feature", classes: "bg-emerald-100 text-emerald-700" },
  { value: "docs", label: "Docs", classes: "bg-sky-100 text-sky-700" },
  { value: "urgent", label: "Urgent", classes: "bg-orange-100 text-orange-700" },
  { value: "design", label: "Design", classes: "bg-teal-100 text-teal-700" },
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
