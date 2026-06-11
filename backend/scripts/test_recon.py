import os
import sys
import traceback

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.reconciliation import ReconciliationService

# Define a mock mapping profile based on the standard GST mapping
mapping_profile = {
    'mapping_json': [
        {
            'tally_column': 'Invoice No',
            'gst_column': 'Invoice Number',
            'is_match_key': True
        },
        {
            'tally_column': 'Taxable Value',
            'gst_column': 'Taxable Value',
            'is_match_key': False
        }
    ]
}

service = ReconciliationService(mapping_profile, None)

try:
    print('Loading Tally file...')
    tally_df = service.load_excel_file(open('scripts/samples/tally_sample.xlsx', 'rb'))
    print('Loading GST file...')
    gst_df = service.load_excel_file(open('scripts/samples/gst_sample.xlsx', 'rb'))

    print('Applying mappings (handled internally)...')

    print('Tally columns:', tally_df.columns.tolist())
    print('GST columns:', gst_df.columns.tolist())

    print('Reconciling...')
    result = service.reconcile(tally_df, gst_df, 'test_job', 'test_firm')

    print('Summary:')
    print(f'Total Records: {result.total_records}')
    print(f'Matched: {result.matched}')
    print(f'Mismatched: {result.mismatched}')
    print(f'Missing in GST: {result.missing_in_gst}')
    print(f'Missing in Tally: {result.missing_in_tally}')

    if result.mismatches:
        print('\nFirst 5 Mismatches:')
        for m in result.mismatches[:5]:
            print(f"- MatchKey: {m.get('match_key')} | Field: {m.get('field_name')} | Tally: {m.get('tally_value')} | GST: {m.get('gst_value')} | Reason: {m.get('reason')}")

except Exception as e:
    traceback.print_exc()
