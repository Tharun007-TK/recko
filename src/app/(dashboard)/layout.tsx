import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopBar } from "@/components/layout/TopBar";

/**
 * Dashboard route group layout.
 * Provides the authenticated shell: sidebar + topbar + scrollable content area.
 * Route protection (redirect to /login if unauthenticated) will be
 * added via middleware in Prompt 2 (Supabase auth).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar ─────────────────────────────────── */}
      <AppSidebar />

      {/* ── Main content area ───────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 max-w-screen-xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
