from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routers import health, biomarkers, patients, documents, analytics, auth, agent, whatsapp

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Universal Longitudinal Health Record & Dynamic Chronic Disease Analytics Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(health.router)
app.include_router(biomarkers.router)
app.include_router(patients.router)
app.include_router(documents.router)
app.include_router(analytics.router)
app.include_router(agent.router)
app.include_router(whatsapp.router)


@app.get("/", tags=["Health & System"])
def root():
    return {
        "title": settings.PROJECT_NAME,
        "status": "online",
        "documentation": "/docs",
        "milestone": "Milestone 1 - Backend Scaffolding & Database Setup",
        "chronic_disease_categories": [
            "Type 2 Diabetes",
            "Chronic Kidney Disease (CKD)",
            "Dyslipidemia",
            "Thyroid Disorders",
            "Chronic Liver Disease"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
