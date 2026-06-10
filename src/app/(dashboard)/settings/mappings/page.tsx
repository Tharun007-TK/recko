import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mapping Profiles",
};

/**
 * Mapping profiles settings page.
 * Full CRUD implementation in Prompt 7 (settings pages).
 */
export default function MappingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Mapping Profiles
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define how Tally columns map to GST columns for reconciliation.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed bg-muted/20 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Mapping profile CRUD will be implemented in Prompt 7.
        </p>
      </div>
    </div>
  );
}
