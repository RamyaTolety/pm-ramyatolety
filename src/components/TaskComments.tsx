"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { addComment, subscribeToComments } from "@/lib/firestore";
import type { Comment } from "@/lib/types";
import { Avatar } from "./Avatar";

export function TaskComments({ projectId, taskId }: { projectId: string; taskId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => subscribeToComments(projectId, taskId, setComments), [projectId, taskId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email || !text.trim()) return;
    setSubmitting(true);
    try {
      await addComment(projectId, taskId, { authorEmail: user.email, text: text.trim() });
      setText("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2 border-t border-neutral-100 pt-2">
      {comments.map((c) => (
        <div key={c.id} className="flex items-start gap-1.5 text-xs">
          <Avatar email={c.authorEmail} />
          <div>
            <span className="font-medium text-neutral-700">{c.authorEmail}</span>{" "}
            <span className="text-neutral-500">{c.text}</span>
          </div>
        </div>
      ))}
      <form onSubmit={handleSubmit} className="flex gap-1.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
