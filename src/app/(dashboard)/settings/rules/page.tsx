import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { RuleProfileForm } from "./_components/RuleProfileForm";
import { RuleProfilesList } from "./_components/RuleProfilesList";

export const metadata: Metadata = {
  title: "Rule Profiles",
};

export default async function RulesPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return <div>Authentication required</div>;
  }

  // Get user's firm ID
  const { data: firmMembers } = await supabase
    .from("firm_members")
    .select("firm_id")
    .eq("profile_id", session.user.id)
    .limit(1);

  const firmId = firmMembers?.[0]?.firm_id;

  // Fetch all rule profiles for the firm
  const { data: profiles = [] } = await supabase
    .from("rule_profiles")
    .select("*")
    .eq("firm_id", firmId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rule Profiles"
        description="Configure normalization rules applied during reconciliation (case sensitivity, date formats, numeric rounding, etc.)."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create Profile</CardTitle>
              <CardDescription>
                Define normalization rules for a new profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RuleProfileForm firmId={firmId} />
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <RuleProfilesList initialProfiles={profiles} firmId={firmId} />
        </div>
      </div>
    </div>
  );
}
