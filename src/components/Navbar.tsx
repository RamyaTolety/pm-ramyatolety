"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useIncompleteTaskCount } from "@/lib/use-incomplete-count";
import { Avatar } from "./Avatar";
import { HelmIcon, MoonIcon } from "./icons";

export function Navbar() {
  const { user, logOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const incompleteCount = useIncompleteTaskCount(user?.email);

  return (
    <header className="border-b border-blue-100 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 font-semibold text-blue-950 dark:text-blue-100"
        >
          <HelmIcon className="h-5 w-5" />
          Waypoint
        </Link>
        {user && (
          <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-slate-400">
            <span className="hidden items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-400 sm:flex dark:border-slate-700 dark:text-slate-500">
              <kbd>⌘</kbd>
              <kbd>K</kbd> to jump around
            </span>
            <Link
              href="/my-tasks"
              className="flex items-center gap-1.5 hover:text-blue-700 hover:underline dark:hover:text-blue-300"
            >
              My Tasks
              {incompleteCount > 0 && (
                <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {incompleteCount}
                </span>
              )}
            </Link>
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Night Watch: on" : "Night Watch: off"}
              aria-label="Toggle Night Watch"
              className="rounded-md border border-neutral-300 p-1.5 hover:bg-neutral-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <MoonIcon className="h-4 w-4" />
            </button>
            <Avatar email={user.email ?? ""} size="md" />
            <button
              onClick={async () => {
                await logOut();
                router.push("/login");
              }}
              className="rounded-md border border-neutral-300 px-3 py-1 hover:bg-neutral-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
