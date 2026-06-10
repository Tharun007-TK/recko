import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Sign In`,
};

/**
 * Login page shell – Supabase auth will be wired in Prompt 2.
 * Rendering a minimal structure so the auth layout and route work end-to-end.
 */
export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Brand mark */}
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">
          Reconciliation platform for audit firms
        </p>
      </div>

      {/* Auth form placeholder – filled in Prompt 2 */}
      <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Authentication will be integrated in Phase 1 · Step 2
        </p>
      </div>
    </div>
  );
}
