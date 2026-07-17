"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "./Avatar";

export function Navbar() {
  const { user, logOut } = useAuth();
  const router = useRouter();

  return (
    <header className="border-b border-violet-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-1.5 font-semibold text-violet-950">
          <span aria-hidden>🧭</span>
          Waypoint
        </Link>
        {user && (
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <Link href="/my-tasks" className="hover:text-violet-700 hover:underline">
              My Tasks
            </Link>
            <Avatar email={user.email ?? ""} size="md" />
            <button
              onClick={async () => {
                await logOut();
                router.push("/login");
              }}
              className="rounded-md border border-neutral-300 px-3 py-1 hover:bg-neutral-100"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
