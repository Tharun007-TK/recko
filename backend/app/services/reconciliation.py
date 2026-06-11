"""
Reconciliation service layer
Handles reading, mapping, normalizing, comparing, and reporting on records
"""

from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import pandas as pd
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class ReconciliationResult:
    """Result of reconciliation operation"""

    job_id: str
    total_records: int
    matched: int
    mismatched: int
    missing_in_gst: int
    missing_in_tally: int
    format_differences: int
    mismatches: List[Dict[str, Any]]


class ReconciliationService:
    """Service for reconciling Excel files"""

    def __init__(self, mapping_profile: Dict[str, Any], rule_profile: Dict[str, Any]):
        """Initialize with mapping and rule profiles"""
        self.mapping_profile = mapping_profile or {}
        self.rule_profile = rule_profile or {}
        self.mappings = self.mapping_profile.get("mapping_json", [])
        self.rules = self.rule_profile.get("rules_json", {})

    # ─── File Loading ─────────────────────────────────────────────────────

    def _detect_header_row(self, df_raw: "pd.DataFrame", max_scan: int = 15) -> int:
        """Auto-detect the header row by finding the first row with most non-null string cells."""
        best_row = 0
        best_score = 0
        for i in range(min(max_scan, len(df_raw))):
            row = df_raw.iloc[i]
            score = sum(1 for v in row if isinstance(v, str) and v.strip() and not v.lower().startswith('unnamed'))
            if score > best_score:
                best_score = score
                best_row = i
        return best_row

    def load_excel_file(self, file_data: bytes, sheet_name: int = 0) -> Optional[pd.DataFrame]:
        """Load Tally Excel file into DataFrame with auto-detected header row."""
        try:
            raw = pd.read_excel(file_data, sheet_name=sheet_name, header=None)
            header_row = self._detect_header_row(raw)
            df = pd.read_excel(file_data, sheet_name=sheet_name, header=header_row)
            # Drop completely empty rows and columns
            df = df.dropna(how='all').dropna(axis=1, how='all')
            logger.info(f"Loaded Excel (sheet={sheet_name}, header_row={header_row}): {len(df)} rows, {len(df.columns)} cols")
            return df
        except Exception as e:
            logger.error(f"Error loading Excel file: {e}")
            return None

    def load_gst_file(self, file_data: bytes) -> Optional[pd.DataFrame]:
        """Load GSTR-2B Excel file, selecting the B2B sheet and auto-detecting the header row."""
        try:
            all_sheets = pd.read_excel(file_data, sheet_name=None, header=None)
            # Priority: B2B sheet, otherwise the largest sheet
            target = None
            for preferred in ['B2B', 'b2b', 'Sheet1', 'Sheet']:
                if preferred in all_sheets:
                    target = preferred
                    break
            if target is None:
                # Fall back to the sheet with the most rows
                target = max(all_sheets.keys(), key=lambda s: len(all_sheets[s]))
            raw = all_sheets[target]
            header_row = self._detect_header_row(raw)
            df = pd.read_excel(file_data, sheet_name=target, header=header_row)
            df = df.dropna(how='all').dropna(axis=1, how='all')
            logger.info(f"Loaded GST file (sheet='{target}', header_row={header_row}): {len(df)} rows, {len(df.columns)} cols")
            return df
        except Exception as e:
            logger.error(f"Error loading GST file: {e}")
            return None


    # ─── Data Normalization ───────────────────────────────────────────────

    def normalize_value(self, value: Any) -> str:
        """Normalize a value according to rule profile"""
        if pd.isna(value):
            return ""

        # Convert to string
        if isinstance(value, float) and value.is_integer():
            normalized = str(int(value)).strip()
        else:
            normalized = str(value).strip()

        # Trim spaces
        if self.rules.get("trim_spaces", True):
            normalized = normalized.strip()

        # Ignore case
        if self.rules.get("ignore_case", False):
            normalized = normalized.lower()

        # Normalize dates
        if self.rules.get("normalize_dates", False):
            normalized = self._normalize_date(normalized)

        # Remove separators
        if self.rules.get("remove_separators", False):
            normalized = self._remove_separators(normalized)

        # Numeric rounding
        if self.rules.get("numeric_rounding") is not None:
            normalized = self._apply_numeric_rounding(
                normalized, self.rules["numeric_rounding"]
            )

        return normalized

    def _normalize_date(self, value: str) -> str:
        """Normalize date to YYYY-MM-DD format"""
        try:
            # Try parsing common date formats
            date_formats = [
                "%d/%m/%Y",
                "%m/%d/%Y",
                "%Y-%m-%d",
                "%d-%m-%Y",
                "%d.%m.%Y",
            ]
            for fmt in date_formats:
                try:
                    parsed = datetime.strptime(value, fmt)
                    return parsed.strftime("%Y-%m-%d")
                except ValueError:
                    continue
            return value
        except Exception as e:
            logger.warning(f"Error normalizing date: {e}")
            return value

    def _remove_separators(self, value: str) -> str:
        """Remove common separators"""
        separators = [",", "-", "/", ".", " "]
        for sep in separators:
            value = value.replace(sep, "")
        return value

    def _apply_numeric_rounding(self, value: str, decimal_places: int) -> str:
        """Apply numeric rounding"""
        try:
            if not value:
                return value
            # Remove non-numeric characters except decimal point
            numeric_str = "".join(c for c in value if c.isdigit() or c == ".")
            if not numeric_str:
                return value
            numeric_val = float(numeric_str)
            rounded = round(numeric_val, decimal_places)
            return str(rounded)
        except Exception as e:
            logger.warning(f"Error applying numeric rounding: {e}")
            return value

    # ─── Mapping and Key Generation ────────────────────────────────────────

    def apply_mapping(
        self, df: pd.DataFrame, file_type: str
    ) -> Optional[pd.DataFrame]:
        """Apply mapping profile to standardize column names"""
        # Filter out blank/empty mappings
        valid_mappings = [
            m for m in self.mappings
            if m.get("tally_column") and m.get("gst_column")
        ]

        if not valid_mappings:
            # If no valid mappings, return as-is
            return df

        # Build mapping dict based on file type
        column_map = {}
        for mapping in valid_mappings:
            if file_type == "tally":
                source = mapping.get("tally_column")
                target = mapping.get("tally_column")  # Use as standard name
            else:  # gst
                source = mapping.get("gst_column")
                target = mapping.get("tally_column")  # Standardize to tally_column name

            if source and source in df.columns:
                column_map[source] = target

        # Rename columns
        df = df.rename(columns=column_map)
        return df

    def get_match_key(self, row: Dict[str, Any]) -> str:
        """Generate match key from row using match key mappings"""
        valid_mappings = [
            m for m in self.mappings
            if m.get("tally_column") and m.get("gst_column")
        ]
        match_key_columns = [
            m.get("tally_column")
            for m in valid_mappings
            if m.get("is_match_key")
        ]

        if not match_key_columns:
            # Fallback: look for invoice/gstin columns by common keywords
            invoice_keywords = ['invoice', 'voucher', 'bill', 'no', 'number', 'inv']
            gstin_keywords = ['gstin', 'gst']
            row_cols = list(row.index) if hasattr(row, 'index') else list(row.keys())
            invoice_col = next(
                (c for c in row_cols if any(kw in c.lower() for kw in invoice_keywords)), None
            )
            gstin_col = next(
                (c for c in row_cols if any(kw in c.lower() for kw in gstin_keywords)), None
            )
            parts = []
            for col in [invoice_col, gstin_col]:
                if col and col in row:
                    parts.append(self.normalize_value(row[col]))
            if parts:
                return "|".join(parts)
            # Last resort: first column value
            if len(row) > 0:
                return str(row.values[0]) if hasattr(row, 'values') else str(list(row.values())[0])
            return ""

        parts = []
        for col in match_key_columns:
            if col in row:
                val = self.normalize_value(row[col])
                parts.append(val)

        return "|".join(parts) if parts else ""

    # ─── Reconciliation Logic ──────────────────────────────────────────────

    def reconcile(
        self, tally_df: pd.DataFrame, gst_df: pd.DataFrame, job_id: str, firm_id: str
    ) -> ReconciliationResult:
        """Reconcile two DataFrames"""
        mismatches: List[Dict[str, Any]] = []

        # Normalize all values
        tally_normalized = self._normalize_dataframe(tally_df)
        gst_normalized = self._normalize_dataframe(gst_df)

        # Create record maps by match key
        tally_records = {}
        gst_records = {}

        for idx, row in tally_normalized.iterrows():
            match_key = self.get_match_key(row)
            if match_key:
                tally_records[match_key] = row

        for idx, row in gst_normalized.iterrows():
            match_key = self.get_match_key(row)
            if match_key:
                gst_records[match_key] = row

        # Compare records
        matched = 0
        mismatched = 0
        missing_in_gst = 0
        missing_in_tally = 0
        format_differences = 0

        # Check all tally records
        for match_key, tally_row in tally_records.items():
            if match_key in gst_records:
                gst_row = gst_records[match_key]
                # Compare fields
                field_mismatches = self._compare_records(
                    tally_row, gst_row, match_key, job_id, firm_id
                )
                if field_mismatches:
                    mismatches.extend(field_mismatches)
                    mismatched += 1
                    format_differences += len(field_mismatches)
                else:
                    matched += 1
            else:
                # Missing in GST
                mismatches.append(
                    {
                        "job_id": job_id,
                        "firm_id": firm_id,
                        "category": "missing_in_gst",
                        "match_key": match_key,
                        "field_name": "",
                        "tally_value": str(tally_row.get("amount", "")),
                        "gst_value": "",
                        "normalized_tally": str(tally_row.get("amount", "")),
                        "normalized_gst": "",
                        "reason": "Record exists in Tally but not in GST",
                    }
                )
                missing_in_gst += 1

        # Check GST records not in Tally
        for match_key, gst_row in gst_records.items():
            if match_key not in tally_records:
                mismatches.append(
                    {
                        "job_id": job_id,
                        "firm_id": firm_id,
                        "category": "missing_in_tally",
                        "match_key": match_key,
                        "field_name": "",
                        "tally_value": "",
                        "gst_value": str(gst_row.get("amount", "")),
                        "normalized_tally": "",
                        "normalized_gst": str(gst_row.get("amount", "")),
                        "reason": "Record exists in GST but not in Tally",
                    }
                )
                missing_in_tally += 1

        return ReconciliationResult(
            job_id=job_id,
            total_records=len(tally_records),
            matched=matched,
            mismatched=mismatched,
            missing_in_gst=missing_in_gst,
            missing_in_tally=missing_in_tally,
            format_differences=format_differences,
            mismatches=mismatches,
        )

    def _normalize_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normalize all values in a DataFrame"""
        normalized_df = df.copy()
        for col in normalized_df.columns:
            normalized_df[col] = normalized_df[col].apply(self.normalize_value)
        return normalized_df

    def _compare_records(
        self,
        tally_row: Dict[str, Any],
        gst_row: Dict[str, Any],
        match_key: str,
        job_id: str,
        firm_id: str,
    ) -> List[Dict[str, Any]]:
        """Compare two records and return field mismatches"""
        mismatches = []

        # Compare all columns
        for col in tally_row.index:
            if col in gst_row.index:
                tally_val = str(tally_row[col])
                gst_val = str(gst_row[col])

                if tally_val != gst_val:
                    mismatches.append(
                        {
                            "job_id": job_id,
                            "firm_id": firm_id,
                            "category": "field_mismatch",
                            "match_key": match_key,
                            "field_name": col,
                            "tally_value": tally_val,
                            "gst_value": gst_val,
                            "normalized_tally": tally_val,
                            "normalized_gst": gst_val,
                            "reason": f"Field value mismatch: {tally_val} vs {gst_val}",
                        }
                    )

        return mismatches

    def generate_excel_report(self, result: ReconciliationResult) -> bytes:
        """Generate an Excel report for the reconciliation result"""
        import io
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill, Alignment

        wb = Workbook()
        
        # Helper to style headers
        def style_header(ws):
            header_fill = PatternFill(start_color="4F81BD", end_color="4F81BD", fill_type="solid")
            header_font = Font(color="FFFFFF", bold=True)
            for cell in ws[1]:
                cell.fill = header_fill
                cell.font = header_font
                cell.alignment = Alignment(horizontal="center")

        # 1. Summary Sheet
        ws_summary = wb.active
        ws_summary.title = "Summary"
        ws_summary.append(["Metric", "Count"])
        ws_summary.append(["Job ID", result.job_id])
        ws_summary.append(["Total Records Checked", result.total_records])
        ws_summary.append(["Matched", result.matched])
        ws_summary.append(["Mismatched", result.mismatched])
        ws_summary.append(["Missing in GST", result.missing_in_gst])
        ws_summary.append(["Missing in Tally", result.missing_in_tally])
        ws_summary.append(["Format Differences", result.format_differences])
        style_header(ws_summary)
        ws_summary.column_dimensions['A'].width = 25
        ws_summary.column_dimensions['B'].width = 40

        # Create separate data lists for each category
        field_mismatches = []
        missing_in_gst = []
        missing_in_tally = []

        for m in result.mismatches:
            row = [
                m.get("match_key", ""),
                m.get("field_name", ""),
                m.get("tally_value", ""),
                m.get("gst_value", ""),
                m.get("normalized_tally", ""),
                m.get("normalized_gst", ""),
                m.get("reason", "")
            ]
            if m.get("category") == "field_mismatch":
                field_mismatches.append(row)
            elif m.get("category") == "missing_in_gst":
                missing_in_gst.append(row)
            elif m.get("category") == "missing_in_tally":
                missing_in_tally.append(row)

        headers = [
            "Match Key", "Field Name", "Raw Tally Value", "Raw GST Value", 
            "Normalized Tally", "Normalized GST", "Reason"
        ]

        # 2. Field Mismatches Sheet
        ws_mismatches = wb.create_sheet(title="Field Mismatches")
        ws_mismatches.append(headers)
        for row in field_mismatches:
            ws_mismatches.append(row)
        style_header(ws_mismatches)
        for col in ['A', 'B', 'C', 'D', 'E', 'F', 'G']:
            ws_mismatches.column_dimensions[col].width = 20

        # 3. Missing in GST Sheet
        ws_missing_gst = wb.create_sheet(title="Missing in GST")
        ws_missing_gst.append(headers)
        for row in missing_in_gst:
            ws_missing_gst.append(row)
        style_header(ws_missing_gst)
        for col in ['A', 'B', 'C', 'D', 'E', 'F', 'G']:
            ws_missing_gst.column_dimensions[col].width = 20

        # 4. Missing in Tally Sheet
        ws_missing_tally = wb.create_sheet(title="Missing in Tally")
        ws_missing_tally.append(headers)
        for row in missing_in_tally:
            ws_missing_tally.append(row)
        style_header(ws_missing_tally)
        for col in ['A', 'B', 'C', 'D', 'E', 'F', 'G']:
            ws_missing_tally.column_dimensions[col].width = 20

        output = io.BytesIO()
        wb.save(output)
        return output.getvalue()
