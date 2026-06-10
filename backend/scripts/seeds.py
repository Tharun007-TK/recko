import os
from supabase import create_client

def run_seed():
    print("Running seeds...")
    
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        print("Missing Supabase credentials in environment.")
        return
        
    client = create_client(supabase_url, supabase_key)
    
    users = client.auth.admin.list_users()
    if not users:
        print("No users found. Creating test@example.com / password123")
        res = client.auth.admin.create_user({"email": "test@example.com", "password": "password123", "email_confirm": True})
        user_id = res.user.id
    else:
        user_id = users[0].id
    
    # Check if firm exists, otherwise create it
    firm_res = client.table("firms").select("id").eq("slug", "test-firm-llc").execute()
    if not firm_res.data:
        firm_res = client.table("firms").insert({"name": "Test Firm LLC", "slug": "test-firm-llc", "created_by": user_id}).execute()
    firm_id = firm_res.data[0]["id"]
    
    # Create Profile
    client.table("profiles").upsert({"id": user_id, "full_name": "Test User"}).execute()
    
    # Link User to Firm
    client.table("firm_members").upsert({"firm_id": firm_id, "user_id": user_id, "role": "owner"}).execute()
    
    # Create Mapping Profile
    mapping_res = client.table("mapping_profiles").insert({
        "firm_id": firm_id,
        "name": "Standard GST Mapping",
        "mappings": [
            {"tally_column": "Invoice No", "gst_column": "Invoice Number", "is_match_key": True},
            {"tally_column": "Date", "gst_column": "Invoice Date", "is_match_key": False},
            {"tally_column": "GSTIN", "gst_column": "Supplier GSTIN", "is_match_key": False},
            {"tally_column": "Tax Amount", "gst_column": "Tax", "is_match_key": False},
            {"tally_column": "Taxable Value", "gst_column": "Taxable Value", "is_match_key": False}
        ]
    }).execute()
    
    # Create Rule Profile
    rule_res = client.table("rule_profiles").insert({
        "firm_id": firm_id,
        "name": "Standard Rules",
        "rules": {
            "trim_spaces": True,
            "ignore_case": True,
            "normalize_dates": True,
            "remove_separators": False,
            "numeric_rounding": 2
        }
    }).execute()
    
    print("Seeding completed successfully.")

if __name__ == "__main__":
    from dotenv import load_dotenv
    # Resolve the project root dynamically
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root_env = os.path.join(script_dir, "..", "..", "frontend", ".env.local")
    backend_env = os.path.join(script_dir, "..", ".env")
    
    # Try loading from backend/.env first, then root/.env.local
    if os.path.exists(backend_env):
        load_dotenv(backend_env)
    if os.path.exists(project_root_env):
        load_dotenv(project_root_env)
        
    run_seed()
