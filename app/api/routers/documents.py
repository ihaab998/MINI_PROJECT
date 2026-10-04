import json
from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import date, datetime

from app.models.schemas import (
    MedicalDocumentCreate,
    MedicalDocumentResponse,
    ExtractedDocumentData
)
from app.core.config import settings, get_supabase_client
from app.services.document_ai import DocumentProcessor, verify_patient_identity
from app.services.chronic_detector import ChronicDetector

router = APIRouter(prefix="/api/v1/documents", tags=["Medical Documents & Document AI Pipeline"])

# Singleton instances & persistent storage fallback
document_processor = DocumentProcessor()
chronic_detector = ChronicDetector()
IN_MEMORY_DOCUMENTS: Dict[str, List[dict]] = {}


@router.post("/", response_model=MedicalDocumentResponse, status_code=status.HTTP_201_CREATED, summary="Create Medical Document Metadata")
def create_document(doc: MedicalDocumentCreate):
    """
    Registers a newly uploaded medical document metadata record manually.
    """
    supabase = get_supabase_client()
    doc_dict = doc.model_dump(mode="json")

    if supabase:
        try:
            res = supabase.table("medical_documents").insert(doc_dict).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"[WARNING] Database error registering medical document: {e}")

    doc_dict["id"] = uuid4()
    doc_dict["created_at"] = datetime.utcnow()
    p_id = str(doc_dict["patient_id"])
    if p_id not in IN_MEMORY_DOCUMENTS:
        IN_MEMORY_DOCUMENTS[p_id] = []
    IN_MEMORY_DOCUMENTS[p_id].insert(0, doc_dict)
    return doc_dict


@router.get("/patient/{patient_id}", response_model=List[MedicalDocumentResponse], summary="Get Patient Documents")
def get_patient_documents(patient_id: UUID):
    """
    Lists all medical documents associated with a specific patient.
    """
    pid_str = str(patient_id)
    db_docs = []
    supabase = get_supabase_client()
    if supabase:
        try:
            res = supabase.table("medical_documents").select("*").eq("patient_id", pid_str).order("encounter_date", desc=True).execute()
            db_docs = res.data or []
        except Exception as e:
            print(f"[WARNING] Database error fetching documents: {e}")

    in_mem = IN_MEMORY_DOCUMENTS.get(pid_str, [])
    # Combine and deduplicate by id
    seen_ids = set()
    combined = []
    for d in (db_docs + in_mem):
        doc_id = str(d.get("id"))
        if doc_id not in seen_ids:
            seen_ids.add(doc_id)
            combined.append(d)

    return combined


@router.post("/upload/", status_code=status.HTTP_201_CREATED, summary="Upload & Process Medical Document (Document AI)")
async def upload_and_process_document(
    patient_id: UUID = Form(..., description="UUID of the patient"),
    document_type: str = Form("LAB_REPORT", description="Function type: LAB_REPORT, PRESCRIPTION, DISCHARGE_SUMMARY, ROUTINE"),
    facility_name: Optional[str] = Form(None, description="Name of hospital or diagnostic center"),
    confirm_assignment: bool = Form(False, description="Confirm assigning document if patient name is missing or mismatched"),
    file: UploadFile = File(..., description="Medical record image (.jpg, .png) or multi-page PDF")
):
    """
    Ingests any medical document, runs spatial Hybrid Document AI (PaddleOCR + Vision LLM fallback),
    uploads raw binary to Supabase Storage, and stores structured biomarkers & medications in database.
    """
    filename = file.filename or "uploaded_document.pdf"
    print(f"[INFO] Upload & Document AI pipeline triggered for patient: {patient_id}, file: {filename}, confirm_assignment={confirm_assignment}")

    # Step 1: Fetch active patient profile name from Supabase
    active_patient_name = "Active Patient Profile"
    supabase = get_supabase_client()
    if supabase:
        try:
            patient_res = supabase.table("patients").select("first_name, last_name").eq("id", str(patient_id)).execute()
            if patient_res.data and len(patient_res.data) > 0:
                p = patient_res.data[0]
                active_patient_name = f"{p.get('first_name', '')} {p.get('last_name', '')}".strip() or "Active Patient Profile"
        except Exception as e:
            print(f"[NOTICE] Active patient lookup failed: {e}")

    # Step 2: Read raw binary contents
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file binary: {e}")

    # Step 3: Pass file bytes to Document AI Processor
    try:
        extracted_data: ExtractedDocumentData = document_processor.process_document(file_bytes, filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document AI processing failed: {e}")

    # Step 4: Validation Gatekeeper for Non-Medical Documents
    if not extracted_data.is_medical_document:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "status": "REJECTED",
                "message": extracted_data.rejection_reason or "Uploaded file is not recognized as a valid medical document."
            }
        )

    # Step 5: Patient Identity Matching Logic
    identity_check = verify_patient_identity(extracted_data.detected_patient_name, active_patient_name)
    print(f"[IDENTITY CHECK] Status: {identity_check['status']} | Detected: '{identity_check.get('detected')}' | Active: '{active_patient_name}'")

    if identity_check["status"] in ["NAME_MISMATCH", "NAME_UNSPECIFIED"] and not confirm_assignment:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "status": identity_check["status"],
                "detected_name": extracted_data.detected_patient_name,
                "active_name": active_patient_name,
                "message": identity_check["message"],
                "extracted_data": extracted_data.model_dump(mode="json")
            }
        )

    # Step 6: Upload binary file to Supabase Storage Bucket
    doc_uuid = uuid4()
    storage_path = f"documents/{patient_id}/{doc_uuid}_{filename}"

    if supabase:
        try:
            bucket_name = settings.SUPABASE_STORAGE_BUCKET
            try:
                supabase.storage.create_bucket(bucket_name, options={"public": True})
            except Exception:
                pass  # Bucket may already exist

            supabase.storage.from_(bucket_name).upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": file.content_type or "application/octet-stream"}
            )
            print(f"[SUCCESS] File uploaded to Supabase Storage bucket '{bucket_name}' at path '{storage_path}'")
        except Exception as e:
            print(f"[WARNING] Supabase Storage upload skipped or failed: {e}")

    # Step 7: Insert master document record into medical_documents table
    fac_name_clean = facility_name.strip() if (facility_name and facility_name.strip()) else (extracted_data.lab_name or extracted_data.facility_name or "Medical Facility")
    clinical_brief = f"Patient document parsed from {fac_name_clean}. Found {len(extracted_data.biomarkers)} biomarkers and {len(extracted_data.medications)} medications."

    master_doc_record = {
        "id": str(doc_uuid),
        "patient_id": str(patient_id),
        "document_name": filename,
        "document_type": extracted_data.document_type or document_type,
        "file_path": storage_path,
        "encounter_date": str(extracted_data.report_date),
        "facility_name": fac_name_clean,
        "raw_ocr_text": json.dumps(extracted_data.model_dump(mode="json")),
        "clinical_summary": clinical_brief
    }

    if supabase:
        try:
            supabase.table("medical_documents").insert(master_doc_record).execute()
            print(f"[SUCCESS] Inserted master document record {doc_uuid} into database.")
        except Exception as e:
            print(f"[WARNING] Master document DB insert error: {e}")

    pid_key = str(patient_id)
    if pid_key not in IN_MEMORY_DOCUMENTS:
        IN_MEMORY_DOCUMENTS[pid_key] = []
    IN_MEMORY_DOCUMENTS[pid_key].insert(0, master_doc_record)

    # Step 8: Resolve biomarker IDs and insert atomic patient_biomarkers
    inserted_biomarkers = []
    for b in extracted_data.biomarkers:
        biomarker_def_id = None

        if supabase:
            try:
                res = supabase.table("biomarker_definitions").select("id").eq("canonical_name", b.canonical_name).execute()
                if res.data and len(res.data) > 0:
                    biomarker_def_id = res.data[0]["id"]
            except Exception as e:
                print(f"[NOTICE] Biomarker lookup failed for {b.canonical_name}: {e}")

        is_abnormal = False
        if b.lab_ref_max and b.raw_value > b.lab_ref_max:
            is_abnormal = True
        elif b.lab_ref_min and b.raw_value < b.lab_ref_min:
            is_abnormal = True

        biomarker_record = {
            "id": str(uuid4()),
            "patient_id": str(patient_id),
            "document_id": str(doc_uuid),
            "biomarker_id": biomarker_def_id,
            "raw_value": b.raw_value,
            "raw_unit": b.raw_unit,
            "canonical_value": b.canonical_value,
            "lab_ref_min": b.lab_ref_min,
            "lab_ref_max": b.lab_ref_max,
            "test_date": str(extracted_data.report_date),
            "is_abnormal": is_abnormal,
            "confidence_score": b.confidence_score,
            "source_bounding_box": b.source_bounding_box.model_dump(mode="json") if b.source_bounding_box else None
        }

        if supabase and biomarker_def_id:
            try:
                supabase.table("patient_biomarkers").insert(biomarker_record).execute()
                print(f"[SUCCESS] Inserted biomarker reading '{b.canonical_name}' = {b.canonical_value} {b.canonical_unit}")
            except Exception as e:
                print(f"[WARNING] Patient biomarker insert error: {e}")

        inserted_biomarkers.append(biomarker_record)

    # Step 9: Insert active medications into patient_medications table
    for m in extracted_data.medications:
        med_record = {
            "id": str(uuid4()),
            "patient_id": str(patient_id),
            "document_id": str(doc_uuid),
            "medication_name": m.name,
            "rxnorm_code": m.rxnorm_code,
            "dosage": m.dosage,
            "frequency": m.frequency,
            "is_active": True,
            "prescribed_date": str(extracted_data.report_date)
        }

        if supabase:
            try:
                supabase.table("patient_medications").insert(med_record).execute()
                print(f"[SUCCESS] Inserted patient medication '{m.name}' (RxNorm: {m.rxnorm_code})")
            except Exception as e:
                print(f"[WARNING] Patient medication insert error: {e}")

    # Step 10: Run Dynamic Chronic Detection Subsystem (Tier 2 Triggering)
    chronic_report = chronic_detector.evaluate_patient_chronic_risk(patient_id, extracted_data)

    # Step 11: Return validated payload response
    return {
        "status": "SUCCESS",
        "document_id": str(doc_uuid),
        "patient_id": str(patient_id),
        "file_path": storage_path,
        "encounter_date": str(extracted_data.report_date),
        "summary": clinical_brief,
        "biomarkers_count": len(extracted_data.biomarkers),
        "medications_count": len(extracted_data.medications),
        "chronic_detection": chronic_report.model_dump(mode="json"),
        "extracted_data": extracted_data.model_dump(mode="json")
    }
