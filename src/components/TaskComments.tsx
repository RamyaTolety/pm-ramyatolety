"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { addComment, subscribeToComments, subscribeToProject } from "@/lib/firestore";
import type { Comment, Project } from "@/lib/types";
import { Avatar } from "./Avatar";

const MENTION_SUGGESTION_LIMIT = 5;

// Finds the "@query" fragment (if any) that the cursor is currently sitting inside of.
function getMentionQuery(value: string, cursorPos: number): { atIndex: number; query: string } | null {
  const upToCursor = value.slice(0, cursorPos);
  const atIndex = upToCursor.lastIndexOf("@");
  if (atIndex === -1) return null;
  const fragment = upToCursor.slice(atIndex + 1);
  if (/\s/.test(fragment)) return null;
  return { atIndex, query: fragment };
}

// Renders comment text with "@email" mentions highlighted.
function renderCommentText(text: string) {
  const regex = /@[^\s]+@[^\s.]+\.[^\s]+/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      <span key={`${match.index}-${match[0]}`} className="font-medium text-blue-600 dark:text-blue-400">
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

export function TaskComments({ projectId, taskId }: { projectId: string; taskId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mention, setMention] = useState<{ atIndex: number; query: string } | null>(null);
  const [mentionActiveIndex, setMentionActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => subscribeToComments(projectId, taskId, setComments), [projectId, taskId]);
  useEffect(() => subscribeToProject(projectId, setProject), [projectId]);

  const suggestions = useMemo(() => {
    if (!mention || !project?.memberEmails) return [];
    const q = mention.query.toLowerCase();
    return project.memberEmails
      .filter((email) => email.toLowerCase().includes(q))
      .slice(0, MENTION_SUGGESTION_LIMIT);
  }, [mention, project]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart ?? value.length;
    setText(value);
    const next = getMentionQuery(value, cursorPos);
    setMention(next);
    setMentionActiveIndex(0);
  }

  function selectMention(email: string) {
    if (!mention) return;
    const before = text.slice(0, mention.atIndex);
    const after = text.slice(mention.atIndex + 1 + mention.query.length);
    const newText = `${before}@${email} ${after}`;
    setText(newText);
    setMention(null);
    const cursorPos = before.length + email.length + 2;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(cursorPos, cursorPos);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (mention && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionActiveIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        selectMention(suggestions[mentionActiveIndex]);
        return;
      }
      if (e.key === "Escape") {
        setMention(null);
        return;
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email || !text.trim()) return;
    setSubmitting(true);
    try {
      await addComment(projectId, taskId, { authorEmail: user.email, text: text.trim() });
      setText("");
      setMention(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2 border-t border-neutral-100 pt-2 dark:border-slate-800">
      {comments.map((c) => (
        <div key={c.id} className="flex items-start gap-1.5 text-xs">
          <Avatar email={c.authorEmail} />
          <div>
            <span className="font-medium text-neutral-700 dark:text-slate-300">{c.authorEmail}</span>{" "}
            <span className="text-neutral-500 dark:text-slate-400">{renderCommentText(c.text)}</span>
          </div>
        </div>
      ))}
      <form onSubmit={handleSubmit} className="flex gap-1.5">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Delay so a click on a suggestion still registers before we hide the list.
              setTimeout(() => setMention(null), 150);
            }}
            placeholder="Add a comment… use @ to mention"
            className="w-full rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-900/40"
          />
          {mention && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-y-auto rounded-md border border-neutral-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              {suggestions.map((email, index) => (
                <button
                  key={email}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectMention(email)}
                  onMouseEnter={() => setMentionActiveIndex(index)}
                  className={`block w-full px-2 py-1 text-left text-xs ${
                    index === mentionActiveIndex
                      ? "bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-300"
                      : "text-neutral-700 dark:text-slate-300"
                  }`}
                >
                  {email}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
        >
          Send
        </button>
      </form>
    </div>
  );
}
