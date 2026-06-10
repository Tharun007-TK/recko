"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  return redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = (formData.get("full_name") as string) || "";
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(".supabase.co", "")}/auth/callback`,
    },
  });

  if (error) {
    return redirect(`/login?tab=signup&message=${encodeURIComponent(error.message)}`);
  }

  // Upsert profile row and setup firm
  if (data.user) {
    const adminClient = require("@supabase/supabase-js").createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await adminClient.from("profiles").upsert({
      id: data.user.id,
      full_name: fullName,
      email,
    });

    const firmName = fullName ? `${fullName}'s Firm` : "My Audit Firm";
    const slug = firmName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + data.user.id.substring(0, 8);

    const { data: firm } = await adminClient.from("firms").insert({
      name: firmName,
      slug,
      created_by: data.user.id,
    }).select().single();

    if (firm) {
      await adminClient.from("firm_members").insert({
        firm_id: firm.id,
        user_id: data.user.id,
        role: "owner"
      });

      await adminClient.from("mapping_profiles").insert({
        firm_id: firm.id,
        name: "Standard GST Mapping",
        created_by: data.user.id,
        mapping_json: [
            {"tally_column": "Invoice No", "gst_column": "Invoice Number", "is_match_key": true},
            {"tally_column": "Date", "gst_column": "Invoice Date", "is_match_key": false},
            {"tally_column": "GSTIN/UIN", "gst_column": "GSTIN of Supplier", "is_match_key": true},
            {"tally_column": "Taxable Value", "gst_column": "Taxable Value", "is_match_key": false},
            {"tally_column": "Integrated Tax Amount", "gst_column": "Integrated Tax (₹)", "is_match_key": false},
            {"tally_column": "Central Tax Amount", "gst_column": "Central Tax (₹)", "is_match_key": false},
            {"tally_column": "State Tax Amount", "gst_column": "State/UT Tax (₹)", "is_match_key": false}
        ]
      });

      await adminClient.from("rule_profiles").insert({
        firm_id: firm.id,
        name: "Standard Rules",
        created_by: data.user.id,
        rules_json: {
            "trim_spaces": true,
            "ignore_case": true,
            "remove_special_chars_from_invoices": true,
            "date_tolerance_days": 1,
            "amount_tolerance_rupees": 1.0
        }
      });
    }
  }

  return redirect("/login?tab=signup&message=Account+created!+Please+sign+in.");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/login");
}
