import pandas as pd
import os

def generate_samples():
    print("Generating sample data for reconciliation...")

    # Data for Tally
    tally_data = [
        # Matched
        {"Invoice No": "INV-001", "Date": "2026-06-01", "GSTIN": "27AADCB2230M1Z2", "Taxable Value": 1000.0, "Tax Amount": 180.0},
        # Mismatch in Tax Amount
        {"Invoice No": "INV-002", "Date": "2026-06-02", "GSTIN": "27AADCB2230M1Z2", "Taxable Value": 2000.0, "Tax Amount": 360.0},
        # Missing in GST
        {"Invoice No": "INV-003", "Date": "2026-06-03", "GSTIN": "27AADCB2230M1Z2", "Taxable Value": 1500.0, "Tax Amount": 270.0},
        # Format differences (Date format, trailing spaces)
        {"Invoice No": "INV-004 ", "Date": "04/06/2026", "GSTIN": "27AADCB2230M1Z2", "Taxable Value": " 3000.0 ", "Tax Amount": 540.0},
    ]

    # Data for GST
    gst_data = [
        # Matched
        {"Invoice Number": "INV-001", "Invoice Date": "2026-06-01", "Supplier GSTIN": "27AADCB2230M1Z2", "Taxable Value": 1000.0, "Tax": 180.0},
        # Mismatch in Tax Amount
        {"Invoice Number": "INV-002", "Invoice Date": "2026-06-02", "Supplier GSTIN": "27AADCB2230M1Z2", "Taxable Value": 2000.0, "Tax": 365.0},
        # Missing in Tally
        {"Invoice Number": "INV-005", "Invoice Date": "2026-06-05", "Supplier GSTIN": "27AADCB2230M1Z2", "Taxable Value": 2500.0, "Tax": 450.0},
        # Format differences
        {"Invoice Number": "INV-004", "Invoice Date": "2026-06-04", "Supplier GSTIN": "27AADCB2230M1Z2", "Taxable Value": 3000.0, "Tax": 540.0},
    ]

    df_tally = pd.DataFrame(tally_data)
    df_gst = pd.DataFrame(gst_data)

    os.makedirs("samples", exist_ok=True)
    
    df_tally.to_excel("samples/tally_sample.xlsx", index=False)
    df_gst.to_excel("samples/gst_sample.xlsx", index=False)
    
    print("Sample files created in the 'samples' directory:")
    print("- samples/tally_sample.xlsx")
    print("- samples/gst_sample.xlsx")

if __name__ == "__main__":
    generate_samples()
