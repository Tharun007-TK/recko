import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import io
from app.utils.supabase import supabase
from app.services.reconciliation import ReconciliationService

resp = supabase.client.table('reconciliation_jobs').select('*').eq('status', 'failed').order('created_at', desc=True).limit(1).execute()
job = resp.data[0]
job_id = job['id']
files_resp = supabase.client.table('job_files').select('*').eq('job_id', job_id).execute()
tally_file = next((f for f in files_resp.data if f.get('file_type') == 'tally_source'), None)
gst_file = next((f for f in files_resp.data if f.get('file_type') == 'gst_source'), None)
tally_data = supabase.download_file('job-files', tally_file['storage_path'])
gst_data = supabase.download_file('job-files', gst_file['storage_path'])

svc = ReconciliationService({}, None)

print("=== TALLY COLUMNS ===")
tally_df = svc.load_excel_file(io.BytesIO(tally_data))
print(tally_df.columns.tolist())
print("Shape:", tally_df.shape)

print("\n=== GST B2B COLUMNS ===")
gst_df = svc.load_gst_file(io.BytesIO(gst_data))
print("Shape:", gst_df.shape if gst_df is not None else None)
# Encode each column name as ascii-safe
for c in (gst_df.columns.tolist() if gst_df is not None else []):
    print(repr(c)[:60])
