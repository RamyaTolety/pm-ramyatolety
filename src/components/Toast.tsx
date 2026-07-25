"use client";

import { useEffect, useState } from "react";

export function Toast({ message, trigger }: { message: string | null; trigger: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === 0 || !message) return;
    setVisible(true);
    const timeout = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  if (!message || !visible) return null;

  return (
    <div className="animate-slide-in-right fixed bottom-6 right-6 z-50 max-w-xs rounded-lg border border-blue-100 bg-white px-4 py-3 shadow-lg shadow-blue-200/50 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none">
      <p className="text-sm font-medium text-blue-950 dark:text-blue-100">{message}</p>
    </div>
  );
}
