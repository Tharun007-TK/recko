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
    
    # Check if a user exists
    users = client.auth.admin.list_users()
    if not users:
        print("No users found. Please create a user via the UI first.")
        return
        
    user_id = users[0].id
    
    # Create Firm
    firm_res = client.table("firms").insert({"name": "Test Firm LLC", "plan": "pro"}).execute()
    firm_id = firm_res.data[0]["id"]
    
    # Create Profile
    client.table("profiles").upsert({"id": user_id, "full_name": "Test User", "role": "admin"}).execute()
    
    # Link User to Firm
    client.table("firm_members").upsert({"firm_id": firm_id, "profile_id": user_id, "role": "admin"}).execute()
    
    # Create Mapping Profile
    mapping_res = client.table("mapping_profiles").insert({
        "firm_id": firm_id,
        "name": "Standard GST Mapping",
        "description": "Standard mapping for Tally to GST",
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
        "description": "Standard normalization rules",
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
