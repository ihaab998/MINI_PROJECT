# Universal Longitudinal Health Record & Dynamic Chronic Disease Analytics Platform

## 1. Project Overview & Abstract

In modern healthcare, a patient's complete medical history is fragmented across disparate physical files, hospital prescriptions, diagnostic laboratory reports, and discharge summaries. During standard 5- to 10-minute consultations, physicians lack the time to manually piece together a patient's multi-year medical journey.

This platform provides an end-to-end, two-tier healthcare architecture:

1. **Tier 1 (Universal Health Record):** Serves as a centralized repository that ingests **any** medical document—including acute illness visits, surgical histories, prescriptions, routine checkups, vaccination records, and lab panels. It extracts structured clinical data, standardizes medical entities into clinical ontologies (LOINC, RxNorm), preserves spatial coordinate mapping for verification, and constructs a unified chronological timeline.

2. **Tier 2 (Dynamic Chronic Disease Focus Subsystem):** Continuously monitors the unified record. If an explicit chronic diagnosis is detected in clinical notes, or if persistent abnormal biomarker thresholds appear over time, the system automatically activates a specialized **Chronic Trend & Trajectory Engine** for in-depth time-series analytics (annualized velocity of change, Bayesian trajectory forecasting, and sample-size-guarded anomaly detection).

## 2. Problem Statement

> Medical records are decentralized, heterogeneous, and fragmented across physical paper reports, clinic prescriptions, and disparate diagnostic formats. Clinicians lack a unified system that aggregates a patient's complete medical history while simultaneously identifying emerging or deteriorating chronic disease trajectories. This absence of unified longitudinal visibility increases consultation overhead, delays interventions, and leads to clinical oversight.

## 3. Two-Tier System Architecture

```
                   [ ANY Uploaded Medical Record ]
 (Prescriptions, Discharge Summaries, Lab Reports, Scans, Camera Uploads)
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────────────┐
│              TIER 1: Master Universal Health Record (The Core)             │
│  - Multimodal Ingestion (PaddleOCR + Vision LLM fallback for handwriting) │
│  - Structured Extraction with Bounding Boxes & Confidence Scoring         │
│  - Clinical Ontology Normalization (LOINC for Biomarkers, RxNorm for Meds)│
│  - Dual-Value Standardization (Raw Value/Unit -> Canonical Base Unit)     │
│  - Unified Chronological Timeline (Acute illness, surgeries, medications) │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
                        [ Chronic Detection Engine ]
                     Does this patient have persistent
               biomarker flags or an active chronic diagnosis?
                                      │
                   ┌──────────────────┴──────────────────┐
                  NO                                    YES
                   │                                     │
                   ▼                                     ▼
┌──────────────────────────────┐       ┌───────────────────────────────────┐
│ General Health Timeline View │       │ TIER 2: Focused Chronic Analytics │
│ - Chronological history      │       │ - Multi-year trajectory modeling  │
│ - Past acute episodes        │       │ - Annualized velocity (ΔV / Δt)   │
│ - Active prescriptions       │       │ - Adaptive changepoint detection  │
│ - Allergy / Surgical tags    │       │   (PELT for N≥8; Z-score for N<8) │
│ - Side-by-side audit viewer  │       │ - KDIGO / ADA stage monitoring    │
└──────────────────────────────┘       └───────────────────────────────────┘

```

## 4. Chronic Focus Scope (Initial 5 Diseases)

When triggered, the Tier 2 subsystem isolates and analyzes specific biomarker panels:

| **Disease** | **Monitored Biomarkers** | **Standard LOINC Code** | **Standard Unit** | **Clinical Progression Focus** | 
| **Type 2 Diabetes** | HbA1c, Fasting Blood Sugar (FBS), Postprandial Glucose (PPBS) | `4548-4`, `1558-6`, `28436-4` | %, mg/dL | Glycemic variability, progressive beta-cell decline | 
| **Chronic Kidney Disease (CKD)** | Serum Creatinine, eGFR, Blood Urea Nitrogen (BUN) | `2160-0`, `33914-3`, `3094-0` | mg/dL, mL/min/1.73m² | Annual eGFR slope (mL/min/year), KDIGO staging (G1–G5) | 
| **Dyslipidemia / Cardiovascular** | Total Cholesterol, LDL, HDL, Triglycerides, Systolic BP | `2093-3`, `13457-7`, `2085-9`, `2571-8`, `8480-6` | mg/dL, mmHg | Atherogenic lipid ratio trends, response to statin therapy | 
| **Thyroid Disorders** | TSH, Free T3, Free T4 | `11580-8`, `3051-2`, `3024-9` | $\mu$IU/mL, pg/mL, ng/dL | Hyper/Hypothyroid transition cycles, dosage titration | 
| **Chronic Liver Disease (NAFLD)** | ALT (SGPT), AST (SGOT), Total Bilirubin, Alkaline Phosphatase | `1742-6`, `1920-8`, `1975-2`, `6768-6` | U/L, mg/dL | Transaminase spikes, progressive hepatic parenchymal injury | 

## 5. Detailed Module Breakdown

### Module 1: Universal Ingestion & Document AI Pipeline

* **Input Support:** Multi-page PDFs, JPEG/PNG camera uploads, and digital lab exports.

* **Document Classification:** Labels incoming files into functional types (`LAB_REPORT`, `PRESCRIPTION`, `DISCHARGE_SUMMARY`, `PROCEDURE_NOTE`).

* **Hybrid OCR & Vision Pipeline:**

  * PaddleOCR for structured, native digital PDFs and high-contrast lab reports.

  * Vision LLM fallback for low-confidence, camera-captured, rotated, or handwritten prescription notes.

* **Schema-Enforced Extraction:** Employs structured prompting with strict Pydantic schemas, extracting spatial bounding box metadata for click-through verification:

  ```
  {
    "document_type": "LAB_REPORT",
    "report_date": "2024-04-12",
    "lab_name": "Apollo Diagnostics",
    "diagnoses": ["Essential Hypertension"],
    "medications": [
      {
        "name": "Amlodipine",
        "rxnorm_code": "17767",
        "dosage": "5mg",
        "frequency": "Once daily"
      }
    ],
    "biomarkers": [
      {
        "raw_name": "Serum Creatinine",
        "loinc_code": "2160-0",
        "canonical_name": "serum_creatinine",
        "raw_value": 1.4,
        "raw_unit": "mg/dL",
        "canonical_value": 1.4,
        "canonical_unit": "mg/dL",
        "lab_ref_min": 0.7,
        "lab_ref_max": 1.2,
        "confidence_score": 0.97,
        "source_bounding_box": {
          "page": 1,
          "box_2d": [340, 120, 362, 205]
        }
      }
    ]
  }
  
  ```

* **Ontology & Unit Normalization:** Standardizes test names to canonical LOINC identifiers and converts disparate laboratory units (e.g., converting glucose reported in $\text{mmol/L}$ to the canonical $\text{mg/dL}$) before database insertion.

### Module 2: Relational Data Modeling (PostgreSQL / Supabase)

* Manages relational integrity across patients, heterogeneous clinical encounters, diagnosed conditions, active medications, and atomic biomarker readings.

* Retains original lab-specific reference ranges and source bounding boxes directly alongside converted values.

* Optimized with composite indexes on `(patient_id, biomarker_id, test_date ASC)` for millisecond time-series slicing.

### Module 3: Dynamic Chronic Detection & Time-Series Engine (The ML Core)

* **Chronic Condition Trigger:** Activates when an explicit chronic diagnosis is parsed or when two consecutive tests breach clinical cutoffs (e.g., $\text{HbA1c} \ge 6.5\%$ or $\text{eGFR} < 60 \text{ mL/min}$).

* **Annualized Velocity Metrics:** Computes time-normalized rates of change between clinical encounters handling non-equidistant timestamps:
  

  $$
  \text{Velocity} = \frac{V_{\text{new}} - V_{\text{prev}}}{(t_{\text{new}} - t_{\text{prev}}) / 365.25} \quad (\text{units/year})
  $$

* **Trajectory Forecasting:** Uses Bayesian Ridge Regression fitted against elapsed days from baseline to project biomarker trajectories over the next 3–6 months with 95% confidence intervals (e.g., projecting when eGFR will cross below 60 mL/min at current rate of decline).

* **Sample-Size-Guarded Changepoint Detection:**

  * If longitudinal history has $N \ge 8$ records: Executes the PELT (Pruned Exact Linear Time) algorithm via Python’s `ruptures` library to detect shifts in mean and variance.

  * If data points are sparse ($3 \le N < 8$): Automatically falls back to rolling Z-score delta alerts to prevent false positives.

### Module 4: Clinician Dashboard & Summary Generator

* **Master Timeline View:** A chronological health feed displaying past acute episodes (e.g., dengue in 2022), surgical histories, and active prescriptions.

* **Focused Chronic Dashboard:** Activates automatically as a dedicated view when a chronic condition is flagged, displaying interactive multi-year Recharts graphs with shaded normal/abnormal reference bands.

* **Side-by-Side Audit Trail:** Clicking any parsed biomarker or prescription highlights the corresponding bounding box directly over the original uploaded document viewer.

* **Objective Clinical Briefing:** Generates a structured 3-bullet briefing detailing trends, annualized rate of decline, and flagged anomalies with explicit date references.

## 6. Complete Database Schema (Supabase / PostgreSQL)

```
-- 1. Patients Table
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Patient Conditions Tracker (Acute & Chronic)
CREATE TABLE patient_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    condition_name VARCHAR(150) NOT NULL,
    condition_type VARCHAR(50) NOT NULL, -- 'CHRONIC' or 'ACUTE'
    status VARCHAR(50) NOT NULL,         -- 'ACTIVE', 'RESOLVED', 'MONITORING'
    diagnosed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Universal Medical Documents & Encounters
CREATE TABLE medical_documents (
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
CREATE TABLE patient_medications (
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
CREATE TABLE biomarker_definitions (
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
CREATE TABLE patient_biomarkers (
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
CREATE INDEX idx_patient_biomarker_trend 
ON patient_biomarkers (patient_id, biomarker_id, test_date ASC);

```

## 7. Technology Stack

* **Backend:** FastAPI (Python 3.11+)

* **Database & File Storage:** Supabase (PostgreSQL + Supabase Storage Bucket)

* **Document Processing & Vision Pipeline:**

  * PaddleOCR / PyTesseract for digital lab sheets

  * Multimodal Vision API (e.g., Gemini Vision) for handwriting/prescriptions

  * `pdf2image` & `pypdf` for rasterization and coordinate tracking

* **Data Validation & Typing:** Pydantic v2

* **Data Science & ML:**

  * `pandas`, `numpy`: Tabular time-series processing and unit scaling

  * `scikit-learn`: Bayesian Ridge Regression for confidence-bounded trajectory forecasting

  * `ruptures`: PELT algorithm for offline changepoint detection (guarded for $N \ge 8$)

  * `scipy`: Non-equidistant regression slopes and statistical variances

* **Frontend:** Next.js (React), Tailwind CSS, Lucide Icons

* **Data Visualization & Document Viewer:** Recharts, React-PDF (bounding box overlays)

## 8. College Evaluation & Viva Defense Strategy

* **Q1: Why build a universal record instead of only focusing on chronic diseases?**

  * *Answer:* Real clinical practice cannot isolate chronic diseases from a patient's overall health history. An acute episode (e.g., severe infection or antibiotic course) often impacts chronic biomarkers (e.g., causing transient creatinine spikes). A universal health record provides full clinical context, while the dynamic focus engine ensures chronic conditions receive in-depth trajectory analysis when needed.

* **Q2: What constitutes the AI/ML component?**

  * *Answer:*

    1. *Document Intelligence (Computer Vision / NLP):* Spatial layout parsing, OCR/Vision hybrid extraction, clinical ontology mapping, and coordinate-backed schema validation.

    2. *Time-Series Trajectory Modeling (Machine Learning):* Bayesian trajectory forecasting with confidence bounds to predict future biomarker paths over irregular time steps.

    3. *Adaptive Anomaly Detection:* Guarded changepoint detection (PELT for deep series, rolling Z-score delta for sparse data) to detect physiological deviations from long-term baselines.

* **Q3: Why not train a black-box disease prediction classifier?**

  * *Answer:* In clinical settings, black-box classification labels lack trust and introduce false-positive liabilities. Real clinicians prioritize objective, verifiable longitudinal trajectories and rates of decline ($\Delta \text{Value} / \Delta t$) alongside verifiable source documents to make informed decisions themselves.

## 9. Phased Implementation Roadmap

* **Milestone 1:** Database setup on Supabase, LOINC biomarker dictionary seed, and storage bucket configuration.

* **Milestone 2:** Universal ingestion pipeline with PaddleOCR/Vision fallback and Pydantic schema extraction (including bounding boxes).

* **Milestone 3:** Unit conversion utility and dynamic chronic detection logic.

* **Milestone 4:** Time-series analytical engine (annualized slopes, Bayesian trajectory forecasts, and guarded changepoints).

* **Milestone 5:** Next.js clinician interface (master timeline, Recharts trends, and PDF audit click-through).

* **Milestone 6:** Evaluation using synthetic longitudinal patient profiles across all 5 disease categories.