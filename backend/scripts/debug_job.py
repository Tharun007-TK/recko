import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import io
import traceback
from app.utils.supabase import supabase
from app.services.reconciliation import ReconciliationService

resp = supabase.client.table('reconciliation_jobs').select('*').eq('status', 'failed').order('created_at', desc=True).limit(1).execute()
job = resp.data[0]
job_id = job['id']
firm_id = job['firm_id']
print("Job ID:", job_id)

# Fetch updated mapping profile
mapping_profile = supabase.get_mapping_profile(job['mapping_profile_id'])
print("Mapping JSON count:", len(mapping_profile.get('mapping_json', [])))

# Fetch files
files_resp = supabase.client.table('job_files').select('*').eq('job_id', job_id).execute()
tally_file = next((f for f in files_resp.data if f.get('file_type') == 'tally_source'), None)
gst_file = next((f for f in files_resp.data if f.get('file_type') == 'gst_source'), None)

tally_data = supabase.download_file('job-files', tally_file['storage_path'])
gst_data = supabase.download_file('job-files', gst_file['storage_path'])

try:
    service = ReconciliationService(mapping_profile, None)
    print("Valid mappings count:", len([m for m in service.mappings if m.get('tally_column')]))
    
    tally_df = service.load_excel_file(io.BytesIO(tally_data))
    gst_df = service.load_gst_file(io.BytesIO(gst_data))
    print("Tally shape:", tally_df.shape)
    print("GST shape:", gst_df.shape)

    tally_df = service.apply_mapping(tally_df, 'tally')
    gst_df = service.apply_mapping(gst_df, 'gst')
    print("After mapping - Tally cols (first 8):", tally_df.columns[:8].tolist())
    print("After mapping - GST cols (first 8):", [repr(c)[:25] for c in gst_df.columns[:8].tolist()])

    result = service.reconcile(tally_df, gst_df, job_id, firm_id)
    print("\n=== RECONCILIATION RESULT ===")
    print(f"Total Tally Records: {result.total_records}")
    print(f"Matched: {result.matched}")
    print(f"Mismatched: {result.mismatched}")
    print(f"Missing in GST: {result.missing_in_gst}")
    print(f"Missing in Tally: {result.missing_in_tally}")
    print(f"Total mismatches logged: {len(result.mismatches)}")
    print("\nSUCCESS - reconciliation ran without errors!")
except Exception as e:
    print("\n!!! EXCEPTION !!!")
    traceback.print_exc()
