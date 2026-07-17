"use client";

import { useEffect, useState } from "react";
import { addChecklistItem, subscribeToChecklist, toggleChecklistItem } from "@/lib/firestore";
import type { ChecklistItem } from "@/lib/types";

export function TaskChecklist({ projectId, taskId }: { projectId: string; taskId: string }) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => subscribeToChecklist(projectId, taskId, setItems), [projectId, taskId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await addChecklistItem(projectId, taskId, text.trim());
      setText("");
    } finally {
      setSubmitting(false);
    }
  }

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="space-y-1.5 border-t border-neutral-100 pt-2">
      {items.length > 0 && (
        <div className="space-y-1">
          <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-violet-500 transition-all"
              style={{ width: `${(doneCount / items.length) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-neutral-400">
            {doneCount}/{items.length} checked off
          </p>
        </div>
      )}
      {items.map((item) => (
        <label key={item.id} className="flex items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            checked={item.done}
            onChange={(e) => toggleChecklistItem(projectId, taskId, item.id, e.target.checked)}
          />
          <span className={item.done ? "text-neutral-400 line-through" : "text-neutral-700"}>
            {item.text}
          </span>
        </label>
      ))}
      <form onSubmit={handleSubmit} className="flex gap-1.5">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a checklist item…"
          className="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="rounded-md border border-neutral-300 px-2 py-1 text-xs hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  );
}
