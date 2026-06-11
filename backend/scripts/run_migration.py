import sys, os
sys.path.insert(0, os.getcwd())
from app.utils.supabase import supabase

# Run the migration via Supabase RPC (execute raw SQL)
migration_sql = """
ALTER TABLE mismatch_items
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS match_key TEXT,
  ADD COLUMN IF NOT EXISTS field_name TEXT,
  ADD COLUMN IF NOT EXISTS tally_value TEXT,
  ADD COLUMN IF NOT EXISTS gst_value TEXT,
  ADD COLUMN IF NOT EXISTS normalized_tally TEXT,
  ADD COLUMN IF NOT EXISTS normalized_gst TEXT,
  ADD COLUMN IF NOT EXISTS reason TEXT;

ALTER TABLE mismatch_items DROP COLUMN IF EXISTS data;
ALTER TABLE mismatch_items DROP COLUMN IF EXISTS status;
"""

try:
    resp = supabase.client.rpc('exec_sql', {'sql': migration_sql}).execute()
    print('Migration via RPC:', resp)
except Exception as e:
    print('RPC exec_sql not available, trying direct approach...')
    print(f'Error: {e}')

# Verify by checking the structure
print('\nVerifying mismatch_items columns...')
try:
    # Try select with new columns
    resp2 = supabase.client.table('mismatch_items').select('id,category,match_key,field_name,tally_value,gst_value,reason').limit(1).execute()
    print('SUCCESS: new columns exist!')
except Exception as e:
    print(f'Columns still missing: {e}')
    print('\nPlease run the following SQL in Supabase SQL Editor:')
    print(migration_sql)
