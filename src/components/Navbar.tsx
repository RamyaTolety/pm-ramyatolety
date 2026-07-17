"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user, logOut } = useAuth();
  const router = useRouter();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="font-semibold">
          Cohort PM
        </Link>
        {user && (
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <Link href="/my-tasks" className="hover:underline">
              My Tasks
            </Link>
            <span>{user.email}</span>
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
