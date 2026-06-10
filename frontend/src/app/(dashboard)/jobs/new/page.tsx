import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { NewJobForm } from "./_components/NewJobForm";

export const metadata: Metadata = {
  title: "New Reconciliation Job",
};

export default async function NewJobPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Authentication required</div>;
  }

  // Get user's firm ID
  const { data: firmMembers } = await supabase
    .from("firm_members")
    .select("firm_id")
    .eq("user_id", user.id)
    .limit(1);

  const firmId = firmMembers?.[0]?.firm_id;

  // Fetch available profiles for dropdowns
  const { data: mappingProfilesData } = await supabase
    .from("mapping_profiles")
    .select("id, name, mapping_json")
    .eq("firm_id", firmId)
    .order("created_at", { ascending: false });

  const { data: ruleProfilesData } = await supabase
    .from("rule_profiles")
    .select("id, name, rules_json")
    .eq("firm_id", firmId)
    .order("created_at", { ascending: false });

  const mappingProfiles = (mappingProfilesData || []).map(p => ({ ...p, mappings: p.mapping_json || [] }));
  const ruleProfiles = (ruleProfilesData || []).map(p => ({ ...p, rules: p.rules_json || {} }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Reconciliation Job"
        description="Upload Tally and GST files to start a new reconciliation."
      />

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>
            Provide a name for this job and upload the source files. You can
            optionally select mapping and rule profiles to apply during
            reconciliation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewJobForm
            mappingProfiles={mappingProfiles}
            ruleProfiles={ruleProfiles}
          />
        </CardContent>
      </Card>
    </div>
  );
}
