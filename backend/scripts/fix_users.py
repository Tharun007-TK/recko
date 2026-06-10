import os
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    from dotenv import load_dotenv
    load_dotenv()
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

client = create_client(url, key)

# Get all users
profiles = client.table("profiles").select("*").execute()

# Ensure we have at least one firm
firms = client.table("firms").select("*").execute()
if not firms.data:
    res = client.table("firms").insert({"name": "Global Audit Firm", "slug": "global-audit-firm"}).execute()
    firm_id = res.data[0]["id"]
else:
    firm_id = firms.data[0]["id"]

# Link all users to this firm
for profile in profiles.data:
    try:
        client.table("firm_members").upsert({
            "firm_id": firm_id,
            "user_id": profile["id"],
            "role": "owner"
        }).execute()
        print(f"Linked {profile['email']} to firm {firm_id}")
    except Exception as e:
        print(f"Failed to link {profile['email']}: {e}")
