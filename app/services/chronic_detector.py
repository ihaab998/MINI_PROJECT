import re
from typing import List, Dict, Any, Optional
from uuid import UUID, uuid4
from datetime import date
from pydantic import BaseModel, Field

from app.core.config import get_supabase_client
from app.models.schemas import ExtractedDocumentData, ExtractedBiomarker


class FlaggedCondition(BaseModel):
    condition_name: str = Field(..., description="Canonical disease category name")
    trigger_type: str = Field(..., description="'EXPLICIT_DIAGNOSIS' or 'PERSISTENT_BIOMARKER_BREACH'")
    reason: str = Field(..., description="Explicit evidence or biomarker value that triggered activation")
    status: str = Field("ACTIVE", description="'ACTIVE' condition status")


class ChronicDetectionReport(BaseModel):
    patient_id: str
    tier_2_active: bool = Field(False, description="True if patient has at least one active chronic condition")
    flagged_conditions: List[FlaggedCondition] = Field(default_factory=list)
    trigger_reasons: List[str] = Field(default_factory=list)


# Clinical Safety Cutoffs for Tier 2 Triggering
DISEASE_CUTOFFS: Dict[str, Dict[str, Any]] = {
    "Type 2 Diabetes": {
        "keywords": ["type 2 diabetes", "t2dm", "diabetes mellitus", "diabetic", "hyperglycemia"],
        "biomarker_rules": [
            {"canonical": "hba1c", "op": ">=", "value": 6.5, "unit": "%", "msg": "HbA1c >= 6.5%"},
            {"canonical": "fasting_blood_sugar", "op": ">=", "value": 126.0, "unit": "mg/dL", "msg": "FBS >= 126 mg/dL"},
            {"canonical": "postprandial_glucose", "op": ">=", "value": 200.0, "unit": "mg/dL", "msg": "PPBS >= 200 mg/dL"}
        ]
    },
    "Chronic Kidney Disease (CKD)": {
        "keywords": ["chronic kidney disease", "ckd", "renal impairment", "renal failure", "diabetic nephropathy", "kidney disease"],
        "biomarker_rules": [
            {"canonical": "egfr", "op": "<", "value": 60.0, "unit": "mL/min/1.73m²", "msg": "eGFR < 60 mL/min/1.73m²"},
            {"canonical": "serum_creatinine", "op": ">=", "value": 1.5, "unit": "mg/dL", "msg": "Serum Creatinine >= 1.5 mg/dL"},
            {"canonical": "blood_urea_nitrogen", "op": ">=", "value": 25.0, "unit": "mg/dL", "msg": "BUN >= 25 mg/dL"}
        ]
    },
    "Dyslipidemia": {
        "keywords": ["dyslipidemia", "hyperlipidemia", "hypercholesterolemia", "atherosclerosis", "essential hypertension", "hypertension"],
        "biomarker_rules": [
            {"canonical": "total_cholesterol", "op": ">", "value": 240.0, "unit": "mg/dL", "msg": "Total Cholesterol > 240 mg/dL"},
            {"canonical": "ldl_cholesterol", "op": ">", "value": 160.0, "unit": "mg/dL", "msg": "LDL > 160 mg/dL"},
            {"canonical": "triglycerides", "op": ">", "value": 200.0, "unit": "mg/dL", "msg": "Triglycerides > 200 mg/dL"},
            {"canonical": "systolic_bp", "op": ">=", "value": 140.0, "unit": "mmHg", "msg": "Systolic BP >= 140 mmHg"}
        ]
    },
    "Thyroid Disorders": {
        "keywords": ["hypothyroidism", "hyperthyroidism", "hashimoto", "graves disease", "thyroiditis", "goiter"],
        "biomarker_rules": [
            {"canonical": "tsh", "op": ">", "value": 4.5, "unit": "uIU/mL", "msg": "TSH > 4.5 uIU/mL"},
            {"canonical": "tsh", "op": "<", "value": 0.4, "unit": "uIU/mL", "msg": "TSH < 0.4 uIU/mL"},
            {"canonical": "free_t4", "op": ">", "value": 1.8, "unit": "ng/dL", "msg": "Free T4 > 1.8 ng/dL"},
            {"canonical": "free_t4", "op": "<", "value": 0.8, "unit": "ng/dL", "msg": "Free T4 < 0.8 ng/dL"}
        ]
    },
    "Chronic Liver Disease": {
        "keywords": ["chronic liver disease", "nafld", "nash", "fatty liver", "hepatic steatosis", "cirrhosis", "hepatitis"],
        "biomarker_rules": [
            {"canonical": "alt_sgpt", "op": ">", "value": 56.0, "unit": "U/L", "msg": "ALT (SGPT) > 56 U/L"},
            {"canonical": "ast_sgot", "op": ">", "value": 50.0, "unit": "U/L", "msg": "AST (SGOT) > 50 U/L"},
            {"canonical": "total_bilirubin", "op": ">", "value": 2.0, "unit": "mg/dL", "msg": "Total Bilirubin > 2.0 mg/dL"}
        ]
    }
}


class ChronicDetector:
    """
    Subsystem for evaluating clinical documents & biomarker trajectories
    to automatically detect and trigger Tier 2 Chronic Disease monitoring.
    """

    def evaluate_patient_chronic_risk(
        self,
        patient_id: UUID,
        extracted_data: ExtractedDocumentData
    ) -> ChronicDetectionReport:
        """
        Evaluates extracted document data and historical patient records to flag chronic conditions.
        """
        patient_id_str = str(patient_id)
        flagged_conditions: List[FlaggedCondition] = []
        trigger_reasons: List[str] = []

        # 1. Condition A: Explicit Diagnosis Keyword Parsing
        text_to_search = " ".join([
            extracted_data.lab_name or "",
            " ".join(extracted_data.diagnoses),
            extracted_data.document_type
        ]).lower()

        for category, config in DISEASE_CUTOFFS.items():
            for kw in config["keywords"]:
                if kw in text_to_search:
                    reason = f"Explicit chronic diagnosis parsed from clinical record: '{kw.title()}'"
                    flagged_conditions.append(
                        FlaggedCondition(
                            condition_name=category,
                            trigger_type="EXPLICIT_DIAGNOSIS",
                            reason=reason,
                            status="ACTIVE"
                        )
                    )
                    trigger_reasons.append(reason)
                    break

        # 2. Condition B: Persistent Abnormal Biomarker Threshold Breaches
        biomarker_map = {b.canonical_name: b for b in extracted_data.biomarkers}

        for category, config in DISEASE_CUTOFFS.items():
            # Skip if already flagged via explicit diagnosis
            if any(fc.condition_name == category for fc in flagged_conditions):
                continue

            for rule in config["biomarker_rules"]:
                target_bio = biomarker_map.get(rule["canonical"])
                if not target_bio:
                    continue

                val = target_bio.canonical_value
                op = rule["op"]
                threshold = rule["value"]

                breach = False
                if op == ">=" and val >= threshold:
                    breach = True
                elif op == ">" and val > threshold:
                    breach = True
                elif op == "<=" and val <= threshold:
                    breach = True
                elif op == "<" and val < threshold:
                    breach = True

                if breach:
                    reason = f"Biomarker breach detected: {target_bio.raw_name} ({val} {target_bio.canonical_unit}) breached safety cutoff ({rule['msg']})"
                    flagged_conditions.append(
                        FlaggedCondition(
                            condition_name=category,
                            trigger_type="PERSISTENT_BIOMARKER_BREACH",
                            reason=reason,
                            status="ACTIVE"
                        )
                    )
                    trigger_reasons.append(reason)
                    break

        # 3. Persist flagged chronic conditions to Supabase patient_conditions table
        supabase = get_supabase_client()
        if supabase and flagged_conditions:
            try:
                for fc in flagged_conditions:
                    condition_record = {
                        "id": str(uuid4()),
                        "patient_id": patient_id_str,
                        "condition_name": fc.condition_name,
                        "condition_type": "CHRONIC",
                        "status": fc.status,
                        "diagnosed_date": str(extracted_data.report_date or date.today())
                    }
                    supabase.table("patient_conditions").insert(condition_record).execute()
                    print(f"[SUCCESS] Persisted active chronic condition '{fc.condition_name}' for patient {patient_id_str}")
            except Exception as e:
                print(f"[WARNING] Error persisting patient condition to database: {e}")

        tier_2_active = len(flagged_conditions) > 0

        return ChronicDetectionReport(
            patient_id=patient_id_str,
            tier_2_active=tier_2_active,
            flagged_conditions=flagged_conditions,
            trigger_reasons=trigger_reasons
        )
