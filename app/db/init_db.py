import sys
import os
import psycopg2
from typing import Optional
from app.core.config import settings, get_supabase_client

SCHEMA_SQL = """
-- 1. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Patient Conditions Tracker (Acute & Chronic)
CREATE TABLE IF NOT EXISTS patient_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    condition_name VARCHAR(150) NOT NULL,
    condition_type VARCHAR(50) NOT NULL, -- 'CHRONIC' or 'ACUTE'
    status VARCHAR(50) NOT NULL,         -- 'ACTIVE', 'RESOLVED', 'MONITORING'
    diagnosed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Universal Medical Documents & Encounters
CREATE TABLE IF NOT EXISTS medical_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,  -- 'LAB_REPORT', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'ROUTINE'
    file_path TEXT NOT NULL,             -- Path in Supabase Storage bucket
    encounter_date DATE NOT NULL,
    facility_name VARCHAR(255),
    raw_ocr_text TEXT,
    clinical_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Extracted Medications
CREATE TABLE IF NOT EXISTS patient_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    document_id UUID REFERENCES medical_documents(id) ON DELETE CASCADE,
    medication_name VARCHAR(200) NOT NULL,
    rxnorm_code VARCHAR(50),
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    prescribed_date DATE NOT NULL
);

-- 5. Canonical Biomarkers Lookup (LOINC Mapped)
CREATE TABLE IF NOT EXISTS biomarker_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'hba1c', 'serum_creatinine'
    loinc_code VARCHAR(50),
    display_name VARCHAR(100) NOT NULL,
    standard_unit VARCHAR(50) NOT NULL,
    default_normal_min NUMERIC,
    default_normal_max NUMERIC,
    critical_high NUMERIC,
    critical_low NUMERIC,
    disease_category VARCHAR(100)                -- 'Diabetes', 'Renal', 'Cardiovascular', etc.
);

-- 6. Extracted Longitudinal Biomarker Records (With Bounding Boxes and Normalization)
CREATE TABLE IF NOT EXISTS patient_biomarkers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    document_id UUID REFERENCES medical_documents(id) ON DELETE SET NULL,
    biomarker_id UUID REFERENCES biomarker_definitions(id),
    raw_value NUMERIC NOT NULL,
    raw_unit VARCHAR(50) NOT NULL,
    canonical_value NUMERIC NOT NULL,            -- Normalized to biomarker_definitions.standard_unit
    lab_ref_min NUMERIC,                         -- Specific lab reference minimum from report
    lab_ref_max NUMERIC,                         -- Specific lab reference maximum from report
    test_date DATE NOT NULL,
    is_abnormal BOOLEAN DEFAULT FALSE,
    confidence_score NUMERIC(3, 2),
    source_bounding_box JSONB,                   -- {"page": 1, "box_2d": [ymin, xmin, ymax, xmax]}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast time-series retrieval per patient & biomarker
CREATE INDEX IF NOT EXISTS idx_patient_biomarker_trend 
ON patient_biomarkers (patient_id, biomarker_id, test_date ASC);
"""


def initialize_database():
    """
    Executes PostgreSQL DDL schema against Supabase / PostgreSQL.
    Supports both direct Postgres URL (SUPABASE_DB_URL) and Supabase RPC fallback.
    """
    print("==================================================")
    print("Executing Database Initialization Script")
    print("==================================================")

    db_url = settings.SUPABASE_DB_URL
    supabase_client = get_supabase_client()

    # Strategy 1: Direct PostgreSQL Connection via psycopg2
    if db_url and db_url != "postgresql://postgres:password@db.your-supabase-project.supabase.co:5432/postgres":
        try:
            print(f"[INFO] Connecting directly to PostgreSQL via SUPABASE_DB_URL...")
            conn = psycopg2.connect(db_url)
            cursor = conn.cursor()
            cursor.execute(SCHEMA_SQL)
            conn.commit()
            cursor.close()
            conn.close()
            print("[SUCCESS] Schema executed successfully via PostgreSQL driver.")
            return True
        except Exception as e:
            print(f"[WARNING] PostgreSQL direct connection failed: {e}")

    # Strategy 2: Supabase RPC method (exec_sql)
    if supabase_client:
        try:
            print("[INFO] Attempting schema execution via Supabase client RPC ('exec_sql')...")
            response = supabase_client.rpc("exec_sql", {"sql": SCHEMA_SQL}).execute()
            print("[SUCCESS] Schema executed successfully via Supabase RPC.")
            return True
        except Exception as e:
            print(f"[NOTICE] Supabase RPC execution skipped or unconfigured: {e}")

    # Fallback / Dry Run Notice
    print("\n[INFO] Complete DDL Schema to apply in Supabase SQL Editor:")
    print("--------------------------------------------------")
    print(SCHEMA_SQL)
    print("--------------------------------------------------")
    print("[COMPLETED] Database initialization script finished.")
    return True


if __name__ == "__main__":
    initialize_database()
