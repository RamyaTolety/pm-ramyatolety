"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { CommandPalette } from "./CommandPalette";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="p-8 text-center text-neutral-500">Loading…</div>;
  }

  return (
    <>
      <CommandPalette />
      {children}
    </>
  );
}
