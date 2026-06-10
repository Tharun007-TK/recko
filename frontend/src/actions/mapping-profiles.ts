"use server";

import { createClient } from "@/lib/supabase/server";
import type { FieldMapping, MappingProfile } from "@/types";

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
    .eq("user_id", userId)
    .limit(1);

  return firmMembers?.[0]?.firm_id || null;
}

/**
 * Create a new mapping profile
 */
export async function createMappingProfile(
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string; id?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  const firmId = await getUserFirmId(supabase, user.id);
  if (!firmId) {
    return { success: false, message: "User is not a member of any firm" };
  }

  const name = (formData.get("name") as string) || "";
  const description = (formData.get("description") as string) || "";
  const mappingsJson = (formData.get("mappings") as string) || "[]";

  if (!name.trim()) {
    return { success: false, message: "Profile name is required" };
  }

  let mappings: FieldMapping[] = [];
  try {
    mappings = JSON.parse(mappingsJson);
  } catch (e) {
    return { success: false, message: "Invalid mappings format" };
  }

  const { data, error } = await supabase
    .from("mapping_profiles")
    .insert({
      firm_id: firmId,
      name: name.trim(),
      mapping_json: mappings,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating mapping profile:", error);
    return { success: false, message: "Failed to create profile" };
  }

  return {
    success: true,
    message: "Profile created successfully",
    id: data.id,
  };
}

/**
 * Update a mapping profile
 */
export async function updateMappingProfile(
  prevState: any,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  const profileId = (formData.get("profile_id") as string) || "";
  const name = (formData.get("name") as string) || "";
  const description = (formData.get("description") as string) || "";
  const mappingsJson = (formData.get("mappings") as string) || "[]";

  if (!name.trim()) {
    return { success: false, message: "Profile name is required" };
  }

  let mappings: FieldMapping[] = [];
  try {
    mappings = JSON.parse(mappingsJson);
  } catch (e) {
    return { success: false, message: "Invalid mappings format" };
  }

  const { error } = await supabase
    .from("mapping_profiles")
    .update({
      name: name.trim(),
      mapping_json: mappings,
    })
    .eq("id", profileId);

  if (error) {
    console.error("Error updating mapping profile:", error);
    return { success: false, message: "Failed to update profile" };
  }

  return { success: true, message: "Profile updated successfully" };
}

/**
 * Delete a mapping profile
 */
export async function deleteMappingProfile(profileId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "Authentication required" };
  }

  const { error } = await supabase
    .from("mapping_profiles")
    .delete()
    .eq("id", profileId);

  if (error) {
    console.error("Error deleting mapping profile:", error);
    return { success: false, message: "Failed to delete profile" };
  }

  return { success: true, message: "Profile deleted successfully" };
}
