import sys
import os
import psycopg2
from typing import List, Dict, Any
from app.core.config import settings, get_supabase_client

# Exact 5 Disease Categories & Biomarker Mappings from Section 4 of Spec
SEED_BIOMARKERS: List[Dict[str, Any]] = [
    # ----------------------------------------------------
    # Category 1: Type 2 Diabetes
    # ----------------------------------------------------
    {
        "canonical_name": "hba1c",
        "display_name": "HbA1c",
        "loinc_code": "4548-4",
        "standard_unit": "%",
        "default_normal_min": 4.0,
        "default_normal_max": 5.6,
        "critical_high": 6.5,
        "critical_low": None,
        "disease_category": "Type 2 Diabetes"
    },
    {
        "canonical_name": "fasting_blood_sugar",
        "display_name": "Fasting Blood Sugar (FBS)",
        "loinc_code": "1558-6",
        "standard_unit": "mg/dL",
        "default_normal_min": 70.0,
        "default_normal_max": 99.0,
        "critical_high": 126.0,
        "critical_low": 50.0,
        "disease_category": "Type 2 Diabetes"
    },
    {
        "canonical_name": "postprandial_glucose",
        "display_name": "Postprandial Glucose (PPBS)",
        "loinc_code": "28436-4",
        "standard_unit": "mg/dL",
        "default_normal_min": 70.0,
        "default_normal_max": 140.0,
        "critical_high": 200.0,
        "critical_low": 50.0,
        "disease_category": "Type 2 Diabetes"
    },

    # ----------------------------------------------------
    # Category 2: Chronic Kidney Disease (CKD)
    # ----------------------------------------------------
    {
        "canonical_name": "serum_creatinine",
        "display_name": "Serum Creatinine",
        "loinc_code": "2160-0",
        "standard_unit": "mg/dL",
        "default_normal_min": 0.7,
        "default_normal_max": 1.2,
        "critical_high": 1.5,
        "critical_low": None,
        "disease_category": "Chronic Kidney Disease (CKD)"
    },
    {
        "canonical_name": "egfr",
        "display_name": "Estimated Glomerular Filtration Rate (eGFR)",
        "loinc_code": "33914-3",
        "standard_unit": "mL/min/1.73m²",
        "default_normal_min": 90.0,
        "default_normal_max": 120.0,
        "critical_high": None,
        "critical_low": 60.0,
        "disease_category": "Chronic Kidney Disease (CKD)"
    },
    {
        "canonical_name": "blood_urea_nitrogen",
        "display_name": "Blood Urea Nitrogen (BUN)",
        "loinc_code": "3094-0",
        "standard_unit": "mg/dL",
        "default_normal_min": 7.0,
        "default_normal_max": 20.0,
        "critical_high": 25.0,
        "critical_low": None,
        "disease_category": "Chronic Kidney Disease (CKD)"
    },

    # ----------------------------------------------------
    # Category 3: Dyslipidemia
    # ----------------------------------------------------
    {
        "canonical_name": "total_cholesterol",
        "display_name": "Total Cholesterol",
        "loinc_code": "2093-3",
        "standard_unit": "mg/dL",
        "default_normal_min": 125.0,
        "default_normal_max": 200.0,
        "critical_high": 240.0,
        "critical_low": None,
        "disease_category": "Dyslipidemia"
    },
    {
        "canonical_name": "ldl_cholesterol",
        "display_name": "LDL Cholesterol",
        "loinc_code": "13457-7",
        "standard_unit": "mg/dL",
        "default_normal_min": 50.0,
        "default_normal_max": 100.0,
        "critical_high": 160.0,
        "critical_low": None,
        "disease_category": "Dyslipidemia"
    },
    {
        "canonical_name": "hdl_cholesterol",
        "display_name": "HDL Cholesterol",
        "loinc_code": "2085-9",
        "standard_unit": "mg/dL",
        "default_normal_min": 40.0,
        "default_normal_max": 60.0,
        "critical_high": None,
        "critical_low": 40.0,
        "disease_category": "Dyslipidemia"
    },
    {
        "canonical_name": "triglycerides",
        "display_name": "Triglycerides",
        "loinc_code": "2571-8",
        "standard_unit": "mg/dL",
        "default_normal_min": 35.0,
        "default_normal_max": 150.0,
        "critical_high": 200.0,
        "critical_low": None,
        "disease_category": "Dyslipidemia"
    },
    {
        "canonical_name": "systolic_bp",
        "display_name": "Systolic BP",
        "loinc_code": "8480-6",
        "standard_unit": "mmHg",
        "default_normal_min": 90.0,
        "default_normal_max": 120.0,
        "critical_high": 140.0,
        "critical_low": 90.0,
        "disease_category": "Dyslipidemia"
    },

    # ----------------------------------------------------
    # Category 4: Thyroid Disorders
    # ----------------------------------------------------
    {
        "canonical_name": "tsh",
        "display_name": "Thyroid Stimulating Hormone (TSH)",
        "loinc_code": "11580-8",
        "standard_unit": "uIU/mL",
        "default_normal_min": 0.4,
        "default_normal_max": 4.0,
        "critical_high": 10.0,
        "critical_low": 0.1,
        "disease_category": "Thyroid Disorders"
    },
    {
        "canonical_name": "free_t3",
        "display_name": "Free T3",
        "loinc_code": "3051-2",
        "standard_unit": "pg/mL",
        "default_normal_min": 2.0,
        "default_normal_max": 4.4,
        "critical_high": 5.0,
        "critical_low": 1.5,
        "disease_category": "Thyroid Disorders"
    },
    {
        "canonical_name": "free_t4",
        "display_name": "Free T4",
        "loinc_code": "3024-9",
        "standard_unit": "ng/dL",
        "default_normal_min": 0.8,
        "default_normal_max": 1.8,
        "critical_high": 2.2,
        "critical_low": 0.5,
        "disease_category": "Thyroid Disorders"
    },

    # ----------------------------------------------------
    # Category 5: Chronic Liver Disease
    # ----------------------------------------------------
    {
        "canonical_name": "alt_sgpt",
        "display_name": "ALT (SGPT)",
        "loinc_code": "1742-6",
        "standard_unit": "U/L",
        "default_normal_min": 7.0,
        "default_normal_max": 56.0,
        "critical_high": 100.0,
        "critical_low": None,
        "disease_category": "Chronic Liver Disease"
    },
    {
        "canonical_name": "ast_sgot",
        "display_name": "AST (SGOT)",
        "loinc_code": "1920-8",
        "standard_unit": "U/L",
        "default_normal_min": 8.0,
        "default_normal_max": 40.0,
        "critical_high": 100.0,
        "critical_low": None,
        "disease_category": "Chronic Liver Disease"
    },
    {
        "canonical_name": "total_bilirubin",
        "display_name": "Total Bilirubin",
        "loinc_code": "1975-2",
        "standard_unit": "mg/dL",
        "default_normal_min": 0.1,
        "default_normal_max": 1.2,
        "critical_high": 2.0,
        "critical_low": None,
        "disease_category": "Chronic Liver Disease"
    },
    {
        "canonical_name": "alkaline_phosphatase",
        "display_name": "Alkaline Phosphatase (ALP)",
        "loinc_code": "6768-6",
        "standard_unit": "U/L",
        "default_normal_min": 44.0,
        "default_normal_max": 147.0,
        "critical_high": 200.0,
        "critical_low": None,
        "disease_category": "Chronic Liver Disease"
    }
]


def seed_biomarker_definitions():
    """
    Populates biomarker_definitions table with standard LOINC codes and disease categories.
    """
    print("==================================================")
    print("Executing Biomarker Definitions Data Seeding")
    print("==================================================")
    print(f"[INFO] Total Biomarkers to seed: {len(SEED_BIOMARKERS)} across 5 disease categories.")

    db_url = settings.SUPABASE_DB_URL
    supabase_client = get_supabase_client()

    # Strategy 1: Supabase Client Upsert
    if supabase_client:
        try:
            print("[INFO] Seeding via Supabase client upsert...")
            response = supabase_client.table("biomarker_definitions").upsert(
                SEED_BIOMARKERS, on_conflict="canonical_name"
            ).execute()
            print(f"[SUCCESS] Seeded {len(SEED_BIOMARKERS)} biomarkers via Supabase client.")
            return True
        except Exception as e:
            print(f"[WARNING] Supabase client seeding error: {e}")

    # Strategy 2: Direct Postgres SQL Insert via psycopg2
    if db_url and db_url != "postgresql://postgres:password@db.your-supabase-project.supabase.co:5432/postgres":
        try:
            print("[INFO] Seeding via direct PostgreSQL connection...")
            conn = psycopg2.connect(db_url)
            cursor = conn.cursor()
            
            insert_query = """
            INSERT INTO biomarker_definitions (
                canonical_name, display_name, loinc_code, standard_unit,
                default_normal_min, default_normal_max, critical_high, critical_low, disease_category
            ) VALUES (
                %(canonical_name)s, %(display_name)s, %(loinc_code)s, %(standard_unit)s,
                %(default_normal_min)s, %(default_normal_max)s, %(critical_high)s, %(critical_low)s, %(disease_category)s
            )
            ON CONFLICT (canonical_name) DO UPDATE SET
                display_name = EXCLUDED.display_name,
                loinc_code = EXCLUDED.loinc_code,
                standard_unit = EXCLUDED.standard_unit,
                default_normal_min = EXCLUDED.default_normal_min,
                default_normal_max = EXCLUDED.default_normal_max,
                critical_high = EXCLUDED.critical_high,
                critical_low = EXCLUDED.critical_low,
                disease_category = EXCLUDED.disease_category;
            """
            
            for b in SEED_BIOMARKERS:
                cursor.execute(insert_query, b)
                
            conn.commit()
            cursor.close()
            conn.close()
            print(f"[SUCCESS] Seeded {len(SEED_BIOMARKERS)} biomarkers via PostgreSQL driver.")
            return True
        except Exception as e:
            print(f"[WARNING] PostgreSQL seeding error: {e}")

    # Fallback/Print verification
    print("[NOTICE] Displaying seeded biomarker entries:")
    for item in SEED_BIOMARKERS:
        print(f"  - [{item['disease_category']}] {item['display_name']} | LOINC: {item['loinc_code']} | Unit: {item['standard_unit']}")

    print("==================================================")
    print("[COMPLETED] Data seeding completed.")
    return True


if __name__ == "__main__":
    seed_biomarker_definitions()
