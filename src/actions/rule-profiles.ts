"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import type { RuleSet } from "@/types";

/**
 * Get user's firm ID
 */
async function getUserFirmId(
  supabase: any,
  userId: string,
): Promise<string | null> {
  const { data: firmMembers } = await supabase
    .from("firm_members")
    .select("firm_id")
    .eq("profile_id", userId)
    .limit(1);

  return firmMembers?.[0]?.firm_id || null;
}

/**
 * Create a new rule profile
 */
export async function createRuleProfile(
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string; id?: string }> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, message: "Authentication required" };
  }

  const firmId = await getUserFirmId(supabase, session.user.id);
  if (!firmId) {
    return { success: false, message: "User is not a member of any firm" };
  }

  const name = (formData.get("name") as string) || "";
  const description = (formData.get("description") as string) || "";

  const trim_spaces = formData.get("trim_spaces") === "on";
  const ignore_case = formData.get("ignore_case") === "on";
  const normalize_dates = formData.get("normalize_dates") === "on";
  const remove_separators = formData.get("remove_separators") === "on";
  const numeric_rounding_str =
    (formData.get("numeric_rounding") as string) || "";
  const numeric_rounding = numeric_rounding_str
    ? parseInt(numeric_rounding_str, 10)
    : null;

  if (!name.trim()) {
    return { success: false, message: "Profile name is required" };
  }

  const rules: RuleSet = {
    trim_spaces,
    ignore_case,
    normalize_dates,
    remove_separators,
    numeric_rounding,
  };

  const { data, error } = await supabase
    .from("rule_profiles")
    .insert({
      firm_id: firmId,
      name: name.trim(),
      description: description.trim() || null,
      rules,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating rule profile:", error);
    return { success: false, message: "Failed to create profile" };
  }

  return {
    success: true,
    message: "Profile created successfully",
    id: data.id,
  };
}

/**
 * Update a rule profile
 */
export async function updateRuleProfile(
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, message: "Authentication required" };
  }

  const profileId = (formData.get("profile_id") as string) || "";
  const name = (formData.get("name") as string) || "";
  const description = (formData.get("description") as string) || "";

  const trim_spaces = formData.get("trim_spaces") === "on";
  const ignore_case = formData.get("ignore_case") === "on";
  const normalize_dates = formData.get("normalize_dates") === "on";
  const remove_separators = formData.get("remove_separators") === "on";
  const numeric_rounding_str =
    (formData.get("numeric_rounding") as string) || "";
  const numeric_rounding = numeric_rounding_str
    ? parseInt(numeric_rounding_str, 10)
    : null;

  if (!name.trim()) {
    return { success: false, message: "Profile name is required" };
  }

  const rules: RuleSet = {
    trim_spaces,
    ignore_case,
    normalize_dates,
    remove_separators,
    numeric_rounding,
  };

  const { error } = await supabase
    .from("rule_profiles")
    .update({
      name: name.trim(),
      description: description.trim() || null,
      rules,
    })
    .eq("id", profileId);

  if (error) {
    console.error("Error updating rule profile:", error);
    return { success: false, message: "Failed to update profile" };
  }

  return { success: true, message: "Profile updated successfully" };
}

/**
 * Delete a rule profile
 */
export async function deleteRuleProfile(profileId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { success: false, message: "Authentication required" };
  }

  const { error } = await supabase
    .from("rule_profiles")
    .delete()
    .eq("id", profileId);

  if (error) {
    console.error("Error deleting rule profile:", error);
    return { success: false, message: "Failed to delete profile" };
  }

  return { success: true, message: "Profile deleted successfully" };
}
