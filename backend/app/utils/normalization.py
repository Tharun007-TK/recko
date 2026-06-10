"""
Normalization utilities for value standardization
Provides explicit normalization functions for different data types
"""

from datetime import datetime
import re
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


class Normalizer:
    """Utility class for normalizing values"""

    # Common date format patterns
    DATE_FORMATS = [
        "%d/%m/%Y",      # 10/06/2026
        "%m/%d/%Y",      # 06/10/2026
        "%d-%m-%Y",      # 10-06-2026
        "%Y-%m-%d",      # 2026-06-10
        "%d.%m.%Y",      # 10.06.2026
        "%B %d, %Y",     # June 10, 2026
        "%b %d, %Y",     # Jun 10, 2026
        "%d %B %Y",      # 10 June 2026
        "%d %b %Y",      # 10 Jun 2026
    ]

    @staticmethod
    def normalize_string(
        value: Any,
        trim_spaces: bool = True,
        ignore_case: bool = False,
    ) -> str:
        """
        Normalize string value
        
        Args:
            value: Value to normalize
            trim_spaces: Remove leading/trailing whitespace
            ignore_case: Convert to lowercase
            
        Returns:
            Normalized string
        """
        # Convert to string
        if value is None or (isinstance(value, float) and value != value):  # NaN check
            return ""

        str_value = str(value).strip()

        if trim_spaces:
            str_value = str_value.strip()

        if ignore_case:
            str_value = str_value.lower()

        return str_value

    @staticmethod
    def normalize_date(value: str, target_format: str = "%Y-%m-%d") -> str:
        """
        Normalize date to standard format
        
        Supports common Indian and international date formats.
        Returns in YYYY-MM-DD format by default.
        
        Args:
            value: Date string to normalize
            target_format: Output format
            
        Returns:
            Normalized date string or original value if parsing fails
        """
        if not value or not isinstance(value, str):
            return ""

        for fmt in Normalizer.DATE_FORMATS:
            try:
                parsed = datetime.strptime(value.strip(), fmt)
                return parsed.strftime(target_format)
            except ValueError:
                continue

        logger.warning(f"Could not normalize date: {value}")
        return value

    @staticmethod
    def normalize_numeric(
        value: Any,
        decimal_places: Optional[int] = None,
    ) -> str:
        """
        Normalize numeric value
        
        Args:
            value: Numeric value to normalize
            decimal_places: Round to N decimal places (None = no rounding)
            
        Returns:
            Normalized numeric string
        """
        if value is None or (isinstance(value, float) and value != value):
            return ""

        str_value = str(value).strip()

        # Extract numeric parts (handle currency, percentages, etc.)
        numeric_str = ""
        decimal_found = False
        for char in str_value:
            if char.isdigit():
                numeric_str += char
            elif char == "." and not decimal_found:
                numeric_str += "."
                decimal_found = True
            elif char == "-" and not numeric_str:  # Negative at start
                numeric_str += "-"

        if not numeric_str:
            return ""

        try:
            numeric_val = float(numeric_str)
            if decimal_places is not None:
                numeric_val = round(numeric_val, decimal_places)
            return str(numeric_val)
        except ValueError:
            logger.warning(f"Could not normalize numeric: {value}")
            return str_value

    @staticmethod
    def remove_separators(value: str) -> str:
        """
        Remove common separators
        
        Removes: commas, hyphens, slashes, periods, spaces
        Useful for normalizing GSTIN, phone numbers, account codes, etc.
        
        Args:
            value: String with separators
            
        Returns:
            String without separators
        """
        if not value:
            return ""

        # List of separators to remove
        separators = [",", "-", "/", ".", " ", "_"]
        result = str(value)
        for sep in separators:
            result = result.replace(sep, "")
        return result

    @staticmethod
    def remove_special_characters(value: str, keep_numeric: bool = False) -> str:
        """
        Remove special characters
        
        Args:
            value: String to clean
            keep_numeric: If True, keep alphanumeric only
            
        Returns:
            Cleaned string
        """
        if not value:
            return ""

        if keep_numeric:
            # Keep only alphanumeric
            return re.sub(r"[^a-zA-Z0-9]", "", str(value))
        else:
            # Remove only special characters, keep spaces
            return re.sub(r"[^\w\s]", "", str(value))

    @staticmethod
    def standardize_gstin(value: str) -> str:
        """
        Standardize GSTIN format
        
        GSTIN is 15-digit alphanumeric code
        Format: AABBU9999F1Z5
        
        Args:
            value: GSTIN string
            
        Returns:
            Standardized GSTIN (uppercase, no separators)
        """
        if not value:
            return ""

        # Remove separators and convert to uppercase
        gstin = Normalizer.remove_separators(value).upper()
        gstin = re.sub(r"[^A-Z0-9]", "", gstin)

        # Validate length (should be 15 characters)
        if len(gstin) == 15:
            return gstin
        else:
            logger.warning(f"Invalid GSTIN format: {value} (length: {len(gstin)})")
            return gstin

    @staticmethod
    def standardize_pan(value: str) -> str:
        """
        Standardize PAN format
        
        PAN is 10-character alphanumeric code
        Format: AAAAA1234B
        
        Args:
            value: PAN string
            
        Returns:
            Standardized PAN (uppercase, no separators)
        """
        if not value:
            return ""

        # Remove separators and convert to uppercase
        pan = Normalizer.remove_separators(value).upper()
        pan = re.sub(r"[^A-Z0-9]", "", pan)

        # Validate length
        if len(pan) == 10:
            return pan
        else:
            logger.warning(f"Invalid PAN format: {value} (length: {len(pan)})")
            return pan


# Convenience functions
def normalize_value(
    value: Any,
    trim_spaces: bool = True,
    ignore_case: bool = False,
    normalize_dates: bool = False,
    remove_separators: bool = False,
    numeric_rounding: Optional[int] = None,
) -> str:
    """
    Apply multiple normalization rules to a value
    
    Args:
        value: Value to normalize
        trim_spaces: Remove leading/trailing whitespace
        ignore_case: Convert to lowercase
        normalize_dates: Try to normalize date values
        remove_separators: Remove common separators
        numeric_rounding: Round numeric values to N decimal places
        
    Returns:
        Normalized value
    """
    # Start with string normalization
    normalized = Normalizer.normalize_string(value, trim_spaces, ignore_case)

    if not normalized:
        return ""

    # Try to detect and normalize date
    if normalize_dates and _looks_like_date(normalized):
        normalized = Normalizer.normalize_date(normalized)

    # Try to detect and normalize numeric
    if numeric_rounding is not None and _looks_like_numeric(normalized):
        normalized = Normalizer.normalize_numeric(normalized, numeric_rounding)

    # Remove separators
    if remove_separators and not _looks_like_numeric(normalized):
        normalized = Normalizer.remove_separators(normalized)

    return normalized


def _looks_like_date(value: str) -> bool:
    """Check if value looks like a date"""
    # Simple heuristic: contains / or - or . with digits
    return bool(re.search(r"\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}", value))


def _looks_like_numeric(value: str) -> bool:
    """Check if value looks like a number"""
    # Remove common separators and check if mostly numeric
    cleaned = value.replace(",", "").replace(" ", "").replace("-", "", 1)
    numeric_count = sum(1 for c in cleaned if c.isdigit() or c == ".")
    return numeric_count / len(cleaned) > 0.5 if cleaned else False
