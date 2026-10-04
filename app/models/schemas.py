from datetime import date, datetime
from typing import List, Optional, Any
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


# ==========================================
# 1. Bounding Box & Extraction Schemas
# ==========================================

class BoundingBox(BaseModel):
    page: int = Field(..., description="1-indexed page number of the source document")
    box_2d: List[int] = Field(..., description="[ymin, xmin, ymax, xmax] normalized bounding box coordinates")

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 2. Patient Schemas
# ==========================================

class PatientBase(BaseModel):
    first_name: str = Field(..., max_length=100, example="John")
    last_name: str = Field(..., max_length=100, example="Doe")
    date_of_birth: date = Field(..., example="1975-08-15")
    gender: str = Field(..., max_length=20, example="Male")
    phone: Optional[str] = Field(None, max_length=20, example="+15550192834")


class PatientCreate(PatientBase):
    pass


class PatientResponse(PatientBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 3. Patient Condition Schemas
# ==========================================

class PatientConditionBase(BaseModel):
    condition_name: str = Field(..., max_length=150, example="Type 2 Diabetes Mellitus")
    condition_type: str = Field(..., max_length=50, example="CHRONIC", description="'CHRONIC' or 'ACUTE'")
    status: str = Field(..., max_length=50, example="ACTIVE", description="'ACTIVE', 'RESOLVED', 'MONITORING'")
    diagnosed_date: Optional[date] = Field(None, example="2022-03-10")


class PatientConditionCreate(PatientConditionBase):
    patient_id: UUID


class PatientConditionResponse(PatientConditionBase):
    id: UUID
    patient_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 4. Medical Document Schemas
# ==========================================

class MedicalDocumentBase(BaseModel):
    document_name: str = Field(..., max_length=255, example="Apollo_Lab_Report_2024.pdf")
    document_type: str = Field(..., max_length=50, example="LAB_REPORT", description="'LAB_REPORT', 'PRESCRIPTION', 'DISCHARGE_SUMMARY', 'ROUTINE'")
    file_path: str = Field(..., example="documents/patient_123/Apollo_Lab_Report_2024.pdf")
    encounter_date: date = Field(..., example="2024-04-12")
    facility_name: Optional[str] = Field(None, max_length=255, example="Apollo Diagnostics")
    raw_ocr_text: Optional[str] = Field(None, description="Raw extracted OCR text content")
    clinical_summary: Optional[str] = Field(None, description="Generated clinical brief or summary")


class MedicalDocumentCreate(MedicalDocumentBase):
    patient_id: UUID


class MedicalDocumentResponse(MedicalDocumentBase):
    id: UUID
    patient_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 5. Patient Medication Schemas
# ==========================================

class PatientMedicationBase(BaseModel):
    medication_name: str = Field(..., max_length=200, example="Metformin")
    rxnorm_code: Optional[str] = Field(None, max_length=50, example="6809")
    dosage: Optional[str] = Field(None, max_length=100, example="500mg")
    frequency: Optional[str] = Field(None, max_length=100, example="Twice daily")
    is_active: bool = Field(True, example=True)
    prescribed_date: date = Field(..., example="2024-04-12")


class PatientMedicationCreate(PatientMedicationBase):
    patient_id: UUID
    document_id: Optional[UUID] = None


class PatientMedicationResponse(PatientMedicationBase):
    id: UUID
    patient_id: UUID
    document_id: Optional[UUID] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 6. Biomarker Definition Schemas
# ==========================================

class BiomarkerDefinitionBase(BaseModel):
    canonical_name: str = Field(..., max_length=100, example="hba1c")
    loinc_code: Optional[str] = Field(None, max_length=50, example="4548-4")
    display_name: str = Field(..., max_length=100, example="Hemoglobin A1c")
    standard_unit: str = Field(..., max_length=50, example="%")
    default_normal_min: Optional[float] = Field(None, example=4.0)
    default_normal_max: Optional[float] = Field(None, example=5.6)
    critical_high: Optional[float] = Field(None, example=6.5)
    critical_low: Optional[float] = Field(None, example=None)
    disease_category: Optional[str] = Field(None, max_length=100, example="Type 2 Diabetes")


class BiomarkerDefinitionCreate(BiomarkerDefinitionBase):
    pass


class BiomarkerDefinitionResponse(BiomarkerDefinitionBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 7. Patient Biomarker Schemas
# ==========================================

class PatientBiomarkerBase(BaseModel):
    raw_value: float = Field(..., example=1.4)
    raw_unit: str = Field(..., max_length=50, example="mg/dL")
    canonical_value: float = Field(..., example=1.4)
    lab_ref_min: Optional[float] = Field(None, example=0.7)
    lab_ref_max: Optional[float] = Field(None, example=1.2)
    test_date: date = Field(..., example="2024-04-12")
    is_abnormal: bool = Field(False, example=False)
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0, example=0.97)
    source_bounding_box: Optional[BoundingBox] = Field(None)


class PatientBiomarkerCreate(PatientBiomarkerBase):
    patient_id: UUID
    biomarker_id: UUID
    document_id: Optional[UUID] = None


class PatientBiomarkerResponse(PatientBiomarkerBase):
    id: UUID
    patient_id: UUID
    document_id: Optional[UUID] = None
    biomarker_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 8. Multimodal Extraction Schema (Module 1 Pipeline)
# ==========================================

class ExtractedBiomarker(BaseModel):
    raw_name: str = Field(..., example="Serum Creatinine")
    loinc_code: Optional[str] = Field(None, example="2160-0")
    canonical_name: str = Field(..., example="serum_creatinine")
    raw_value: float = Field(..., example=1.4)
    raw_unit: str = Field(..., example="mg/dL")
    canonical_value: float = Field(..., example=1.4)
    canonical_unit: str = Field(..., example="mg/dL")
    lab_ref_min: Optional[float] = Field(None, example=0.7)
    lab_ref_max: Optional[float] = Field(None, example=1.2)
    confidence_score: float = Field(..., ge=0.0, le=1.0, example=0.97)
    source_bounding_box: Optional[BoundingBox] = Field(None)


class ExtractedMedication(BaseModel):
    name: str = Field(..., example="Amlodipine")
    rxnorm_code: Optional[str] = Field(None, example="17767")
    dosage: Optional[str] = Field(None, example="5mg")
    frequency: Optional[str] = Field(None, example="Once daily")
    source_bounding_box: Optional[BoundingBox] = Field(None)


class ExtractedDocumentData(BaseModel):
    is_medical_document: bool = Field(True, description="False if document is non-medical (e.g. invoice, bill, selfie, random text)")
    rejection_reason: Optional[str] = Field(None, description="Reason if document was classified as non-medical")
    detected_patient_name: Optional[str] = Field(None, description="Exact patient name parsed from document header")
    document_type: str = Field(..., example="LAB_REPORT")
    report_date: date = Field(..., example="2024-04-12")
    encounter_date: Optional[date] = Field(None, example="2024-04-12")
    lab_name: Optional[str] = Field(None, example="Apollo Diagnostics")
    facility_name: Optional[str] = Field(None, example="Apollo Diagnostics")
    clinical_summary: Optional[str] = Field(None, description="Generated clinical brief or summary")
    diagnoses: List[str] = Field(default_factory=list, example=["Essential Hypertension"])
    medications: List[ExtractedMedication] = Field(default_factory=list)
    biomarkers: List[ExtractedBiomarker] = Field(default_factory=list)
