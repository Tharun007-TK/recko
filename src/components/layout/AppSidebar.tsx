"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  SlidersHorizontal,
  BookMarked,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { Button } from "../ui/button";

const NAV = [
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", Icon: Briefcase },
  { label: "Mappings", href: "/settings/mappings", Icon: SlidersHorizontal },
  { label: "Rules", href: "/settings/rules", Icon: BookMarked },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 shrink-0 border-r bg-card h-full">
      {/* ── Brand ──────────────────────────────────── */}
      <div className="h-14 flex items-center px-5 border-b shrink-0">
        <span className="font-semibold text-base tracking-tight">
          {APP_NAME}
        </span>
      </div>

      <div className="p-3">
        <Button className="w-full justify-start" asChild>
          <Link href="/jobs/new">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Job
          </Link>
        </Button>
      </div>

      {/* ── Navigation ─────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV.map(({ label, href, Icon }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-accent-foreground",
                )}
              />
              {label}
              {isActive && (
                <ChevronRight className="ml-auto h-3 w-3 text-primary/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer (firm / version info) ───────────── */}
      <div className="border-t px-5 py-3 shrink-0">
        <p className="text-xs text-muted-foreground">
          v0.1 · Internal use only
        </p>
      </div>
    </aside>
  );
}
