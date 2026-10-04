from fastapi import APIRouter, HTTPException, status
from typing import List
from uuid import UUID, uuid4
from datetime import datetime
from app.models.schemas import PatientCreate, PatientResponse
from app.core.config import get_supabase_client

router = APIRouter(prefix="/api/v1/patients", tags=["Patients"])


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED, summary="Create Patient")
def create_patient(patient: PatientCreate):
    """
    Creates a new patient profile in the Universal Health Record platform.
    """
    supabase = get_supabase_client()
    patient_dict = patient.model_dump(mode="json")
    
    if supabase:
        try:
            res = supabase.table("patients").insert(patient_dict).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error creating patient: {e}")

    # Fallback mock response for offline testing
    patient_dict["id"] = uuid4()
    patient_dict["created_at"] = datetime.utcnow()
    return patient_dict


@router.get("/", response_model=List[PatientResponse], summary="List Patients")
def list_patients():
    """
    Retrieves all registered patient records.
    """
    supabase = get_supabase_client()
    if supabase:
        try:
            res = supabase.table("patients").select("*").order("created_at", desc=True).execute()
            return res.data or []
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error fetching patients: {e}")
            
    return []


@router.get("/{patient_id}", response_model=PatientResponse, summary="Get Patient Details")
def get_patient(patient_id: UUID):
    """
    Retrieves a single patient profile by UUID.
    """
    supabase = get_supabase_client()
    if supabase:
        try:
            res = supabase.table("patients").select("*").eq("id", str(patient_id)).single().execute()
            if res.data:
                return res.data
        except Exception:
            pass

    raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found.")
