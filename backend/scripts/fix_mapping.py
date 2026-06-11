import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.utils.supabase import supabase

# The actual column mappings for PURCHASE.xlsx (Tally) <-> GSTR-2B B2B sheet
correct_mapping = [
    {"tally_column": "GSTIN", "gst_column": "GSTIN of supplier", "is_match_key": True},
    {"tally_column": "Voucher No", "gst_column": "Invoice number", "is_match_key": True},
    {"tally_column": "Date", "gst_column": "Invoice Date", "is_match_key": False},
    {"tally_column": "CGST", "gst_column": "Central Tax(₹)", "is_match_key": False},
    {"tally_column": "SGST", "gst_column": "State/UT Tax(₹)", "is_match_key": False},
    {"tally_column": "IGST", "gst_column": "Integrated Tax(₹)", "is_match_key": False},
    {"tally_column": "Net Amount", "gst_column": "Invoice Value(₹)", "is_match_key": False},
]

# Get the mapping profile ID for Standard GST Mapping
resp = supabase.client.table('mapping_profiles').select('id, name, mapping_json').execute()
print("All mapping profiles:")
for p in resp.data:
    print(f"  [{p['id']}] {p['name']}: {p['mapping_json']}")

# Update the Standard GST Mapping profile
for p in resp.data:
    if 'Standard GST' in p.get('name', ''):
        pid = p['id']
        print(f"\nUpdating mapping profile {pid} with correct column mappings...")
        supabase.client.table('mapping_profiles').update({
            'mapping_json': correct_mapping
        }).eq('id', pid).execute()
        print("Done! Updated successfully.")
