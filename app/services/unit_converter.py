from typing import Tuple, Dict, Any


def convert_unit(canonical_name: str, raw_value: float, raw_unit: str) -> Tuple[float, str]:
    """
    Standardizes disparate laboratory units into canonical base units.
    Returns (canonical_value, canonical_unit).

    Supported Conversions:
    - Glucose (FBS, PPBS): mmol/L -> mg/dL (x 18.018)
    - Serum Creatinine: umol/L -> mg/dL (/ 88.4)
    - Total / LDL / HDL Cholesterol: mmol/L -> mg/dL (x 38.67)
    - Triglycerides: mmol/L -> mg/dL (x 88.57)
    - Total Bilirubin: umol/L -> mg/dL (/ 17.1)
    - BUN: mmol/L -> mg/dL (x 2.8)
    - Free T4: pmol/L -> ng/dL (/ 12.87)
    - Free T3: pmol/L -> pg/mL (/ 1.536)
    - Hemoglobin: g/L -> g/dL (/ 10.0)
    - TSH: mIU/L, uIU/mL -> uIU/mL (1:1)
    """
    if raw_value is None:
        return 0.0, ""

    unit = (raw_unit or "").strip().lower()
    name = (canonical_name or "").strip().lower()

    # Default canonical unit fallback map
    STANDARD_UNITS: Dict[str, str] = {
        "hba1c": "%",
        "fasting_blood_sugar": "mg/dL",
        "postprandial_glucose": "mg/dL",
        "serum_creatinine": "mg/dL",
        "egfr": "mL/min/1.73m²",
        "blood_urea_nitrogen": "mg/dL",
        "total_cholesterol": "mg/dL",
        "ldl_cholesterol": "mg/dL",
        "hdl_cholesterol": "mg/dL",
        "triglycerides": "mg/dL",
        "systolic_bp": "mmHg",
        "tsh": "uIU/mL",
        "free_t3": "pg/mL",
        "free_t4": "ng/dL",
        "alt_sgpt": "U/L",
        "ast_sgot": "U/L",
        "total_bilirubin": "mg/dL",
        "alkaline_phosphatase": "U/L"
    }

    target_unit = STANDARD_UNITS.get(name, raw_unit)

    # 1. Glucose Conversions (FBS, PPBS)
    if name in ["fasting_blood_sugar", "postprandial_glucose", "glucose", "random_blood_sugar"]:
        if "mmol" in unit:
            converted = round(float(raw_value) * 18.018, 2)
            return converted, "mg/dL"

    # 2. Serum Creatinine Conversions
    elif name == "serum_creatinine":
        if "umol" in unit or "µmol" in unit or "micromol" in unit:
            converted = round(float(raw_value) / 88.4, 2)
            return converted, "mg/dL"

    # 3. Cholesterol & Lipids (Total, LDL, HDL)
    elif name in ["total_cholesterol", "ldl_cholesterol", "hdl_cholesterol"]:
        if "mmol" in unit:
            converted = round(float(raw_value) * 38.67, 2)
            return converted, "mg/dL"

    # 4. Triglycerides
    elif name == "triglycerides":
        if "mmol" in unit:
            converted = round(float(raw_value) * 88.57, 2)
            return converted, "mg/dL"

    # 5. Total Bilirubin
    elif name == "total_bilirubin":
        if "umol" in unit or "µmol" in unit or "micromol" in unit:
            converted = round(float(raw_value) / 17.1, 2)
            return converted, "mg/dL"

    # 6. Blood Urea Nitrogen (BUN)
    elif name == "blood_urea_nitrogen":
        if "mmol" in unit:
            converted = round(float(raw_value) * 2.8, 2)
            return converted, "mg/dL"

    # 7. Thyroid Free T4
    elif name == "free_t4":
        if "pmol" in unit:
            converted = round(float(raw_value) / 12.87, 2)
            return converted, "ng/dL"

    # 8. Thyroid Free T3
    elif name == "free_t3":
        if "pmol" in unit:
            converted = round(float(raw_value) / 1.536, 2)
            return converted, "pg/mL"

    # 9. TSH Standardization
    elif name == "tsh":
        if "miu" in unit or "uiu" in unit or "µiu" in unit:
            return round(float(raw_value), 2), "uIU/mL"

    # 10. Hemoglobin
    elif name == "hemoglobin":
        if unit in ["g/l", "g/L"]:
            converted = round(float(raw_value) / 10.0, 2)
            return converted, "g/dL"

    # Default: Return raw_value unchanged with target standard unit
    return round(float(raw_value), 2), target_unit
