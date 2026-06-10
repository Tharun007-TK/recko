import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rule Profiles",
};

/**
 * Rule profiles settings page.
 * Full CRUD implementation in Prompt 7 (settings pages).
 */
export default function RulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Rule Profiles
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure normalization rules applied during reconciliation
            (case sensitivity, date formats, numeric rounding, etc.).
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed bg-muted/20 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Rule profile CRUD will be implemented in Prompt 7.
        </p>
      </div>
    </div>
  );
}
