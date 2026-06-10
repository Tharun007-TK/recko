import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
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
import { MappingProfilesList } from "./_components/MappingProfilesList";
import { MappingProfileForm } from "./_components/MappingProfileForm";
import { useState } from "react";

export const metadata: Metadata = {
  title: "Mapping Profiles",
};

export default async function MappingsPage() {
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

  // Fetch all mapping profiles for the firm
  const { data: profiles = [] } = await supabase
    .from("mapping_profiles")
    .select("*")
    .eq("firm_id", firmId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mapping Profiles"
        description="Define how Tally columns map to GST columns for reconciliation."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Create Profile</CardTitle>
              <CardDescription>
                Define field mappings for a new profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MappingProfileForm firmId={firmId} />
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <MappingProfilesList initialProfiles={profiles} firmId={firmId} />
        </div>
      </div>
    </div>
  );
}
