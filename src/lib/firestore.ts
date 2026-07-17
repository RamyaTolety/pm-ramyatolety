import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { ChecklistItem, Comment, Project, Task, TaskLabel, TaskStatus } from "./types";

const projectsRef = collection(db, "projects");

export function subscribeToUserProjects(
  userEmail: string,
  callback: (projects: Project[]) => void
) {
  const q = query(projectsRef, where("memberEmails", "array-contains", userEmail));
  return onSnapshot(q, (snap) => {
    const projects = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
    projects.sort((a, b) => b.createdAt - a.createdAt);
    callback(projects);
  });
}

export async function createProject(params: {
  name: string;
  description: string;
  ownerId: string;
  ownerEmail: string;
}) {
  return addDoc(projectsRef, {
    name: params.name,
    description: params.description,
    ownerId: params.ownerId,
    ownerEmail: params.ownerEmail,
    memberEmails: [params.ownerEmail],
    archived: false,
    createdAt: Date.now(),
  });
}

export async function updateProject(projectId: string, updates: Partial<Project>) {
  return updateDoc(doc(db, "projects", projectId), updates);
}

export function subscribeToProject(
  projectId: string,
  callback: (project: Project | null) => void
) {
  return onSnapshot(doc(db, "projects", projectId), (snap) => {
    callback(snap.exists() ? ({ id: snap.id, ...snap.data() } as Project) : null);
  });
}

export async function addProjectMember(projectId: string, memberEmails: string[]) {
  return updateDoc(doc(db, "projects", projectId), { memberEmails });
}

export function subscribeToProjectTasks(
  projectId: string,
  callback: (tasks: Task[]) => void
) {
  const tasksRef = collection(db, "projects", projectId, "tasks");
  const q = query(tasksRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const tasks = snap.docs.map((d) => ({ id: d.id, projectId, ...d.data() } as Task));
    callback(tasks);
  });
}

export async function createTask(
  projectId: string,
  params: {
    title: string;
    description: string;
    assigneeEmail: string | null;
    dueDate: number | null;
    labels: TaskLabel[];
  }
) {
  const tasksRef = collection(db, "projects", projectId, "tasks");
  return addDoc(tasksRef, {
    title: params.title,
    description: params.description,
    status: "todo" as TaskStatus,
    assigneeEmail: params.assigneeEmail,
    dueDate: params.dueDate,
    labels: params.labels,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function updateTaskStatus(projectId: string, taskId: string, status: TaskStatus) {
  const taskRef = doc(db, "projects", projectId, "tasks", taskId);
  return updateDoc(taskRef, { status, updatedAt: Date.now() });
}

export async function updateTask(
  projectId: string,
  taskId: string,
  updates: Partial<
    Pick<Task, "title" | "description" | "assigneeEmail" | "status" | "dueDate" | "labels">
  >
) {
  const taskRef = doc(db, "projects", projectId, "tasks", taskId);
  return updateDoc(taskRef, { ...updates, updatedAt: Date.now() });
}

export function subscribeToComments(
  projectId: string,
  taskId: string,
  callback: (comments: Comment[]) => void
) {
  const commentsRef = collection(db, "projects", projectId, "tasks", taskId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment)));
  });
}

export async function addComment(
  projectId: string,
  taskId: string,
  params: { authorEmail: string; text: string }
) {
  const commentsRef = collection(db, "projects", projectId, "tasks", taskId, "comments");
  return addDoc(commentsRef, {
    authorEmail: params.authorEmail,
    text: params.text,
    createdAt: Date.now(),
  });
}

export function subscribeToChecklist(
  projectId: string,
  taskId: string,
  callback: (items: ChecklistItem[]) => void
) {
  const itemsRef = collection(db, "projects", projectId, "tasks", taskId, "checklistItems");
  const q = query(itemsRef, orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChecklistItem)));
  });
}

export async function addChecklistItem(projectId: string, taskId: string, text: string) {
  const itemsRef = collection(db, "projects", projectId, "tasks", taskId, "checklistItems");
  return addDoc(itemsRef, { text, done: false, createdAt: Date.now() });
}

export async function toggleChecklistItem(
  projectId: string,
  taskId: string,
  itemId: string,
  done: boolean
) {
  const itemRef = doc(db, "projects", projectId, "tasks", taskId, "checklistItems", itemId);
  return updateDoc(itemRef, { done });
}
