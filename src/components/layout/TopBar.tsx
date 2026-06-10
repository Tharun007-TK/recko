"use client";

import { usePathname } from "next/navigation";
import { Bell, LogOut, ChevronDown, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/actions/auth";

export function TopBar({ user }: { user: any }) {
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

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="User menu"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline-block font-medium">
                {user?.user_metadata?.full_name ?? user?.email}
              </span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={signOut}>
              <DropdownMenuItem asChild>
                <button type="submit" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
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
