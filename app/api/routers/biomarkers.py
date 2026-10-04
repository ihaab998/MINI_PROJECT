from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.schemas import BiomarkerDefinitionResponse
from app.db.seed import SEED_BIOMARKERS
from app.core.config import get_supabase_client

router = APIRouter(prefix="/api/v1/biomarkers", tags=["Biomarker Dictionary"])


@router.get("/definitions", response_model=List[BiomarkerDefinitionResponse], summary="Get Standard Biomarker Definitions")
def get_biomarker_definitions(category: Optional[str] = Query(None, description="Filter by disease category")):
    """
    Returns list of standard canonical biomarker definitions mapped to LOINC codes and standard units.
    """
    supabase = get_supabase_client()
    
    if supabase:
        try:
            query = supabase.table("biomarker_definitions").select("*")
            if category:
                query = query.eq("disease_category", category)
            res = query.execute()
            if res.data:
                return res.data
        except Exception as e:
            print(f"[WARNING] Database fetch failed, using fallback in-memory data: {e}")

    # Fallback to in-memory standard definitions list
    results = SEED_BIOMARKERS
    if category:
        results = [b for b in results if b.get("disease_category", "").lower() == category.lower()]
    
    # Assign dummy UUIDs for fallback view
    import uuid
    output = []
    for item in results:
        entry = dict(item)
        entry["id"] = uuid.uuid5(uuid.NAMESPACE_DNS, item["canonical_name"])
        output.append(entry)
    
    return output


@router.get("/definitions/{canonical_name}", response_model=BiomarkerDefinitionResponse, summary="Get Single Biomarker Definition")
def get_biomarker_definition(canonical_name: str):
    """
    Returns specific canonical biomarker definition by its canonical identifier (e.g., 'hba1c', 'serum_creatinine').
    """
    supabase = get_supabase_client()
    
    if supabase:
        try:
            res = supabase.table("biomarker_definitions").select("*").eq("canonical_name", canonical_name).single().execute()
            if res.data:
                return res.data
        except Exception as e:
            print(f"[WARNING] Database fetch error for {canonical_name}: {e}")

    # Search in-memory seed list
    match = next((b for b in SEED_BIOMARKERS if b["canonical_name"] == canonical_name), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"Biomarker '{canonical_name}' not found.")
    
    import uuid
    entry = dict(match)
    entry["id"] = uuid.uuid5(uuid.NAMESPACE_DNS, match["canonical_name"])
    return entry
