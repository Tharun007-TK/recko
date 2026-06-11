import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import requests
from app.utils.supabase import supabase

# Get the failed job
resp = supabase.client.table('reconciliation_jobs').select('id, firm_id, status').eq('status', 'failed').order('created_at', desc=True).limit(1).execute()
job = resp.data[0]
job_id = job['id']
firm_id = job['firm_id']

print(f"Re-triggering reconciliation for job {job_id}")

# First reset status to uploaded so the backend can pick it up
supabase.update_job_status(job_id, 'uploaded')

# Call the backend API to start reconciliation
r = requests.post('http://localhost:8000/api/reconciliation/start', json={
    'job_id': job_id,
    'firm_id': firm_id
})
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
