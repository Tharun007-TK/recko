"use client";

import { usePathname } from "next/navigation";
import { Bell, LogOut, ChevronDown, User } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Top bar shown in all authenticated dashboard pages.
 * Displays a page title derived from the current route, plus a user menu stub.
 * User data + sign-out action will be wired in Prompt 2 (Supabase auth).
 */
export function TopBar() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="h-14 shrink-0 border-b bg-card flex items-center justify-between px-6">
      {/* ── Page title ───────────────────────────── */}
      <span className="text-sm font-medium text-foreground">{pageTitle}</span>

      {/* ── Right actions ────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Notification bell – placeholder */}
        <button
          type="button"
          aria-label="Notifications"
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* User menu stub */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="User menu"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
            <User className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline-block font-medium">Account</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </div>
    </header>
  );
}

/** Derive a human-readable page title from the current pathname. */
function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/jobs") return "Reconciliation Jobs";
  if (pathname === "/jobs/new") return "New Reconciliation Job";
  if (pathname.startsWith("/jobs/")) return "Job Details";
  if (pathname === "/settings/mappings") return "Mapping Profiles";
  if (pathname === "/settings/rules") return "Rule Profiles";
  if (pathname === "/settings") return "Settings";
  return "ReconFlow";
}
