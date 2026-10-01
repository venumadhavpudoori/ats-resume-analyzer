from fastapi import FastAPI, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import get_db, engine
from app.models import Base
from app.resumes.upload import upload_resume
from app.schemas.resume import ResumeUploadResponse, ResumeAnalyzeRequest
from app.analysis.ats_analysis import analyze_ats_compatibility
from app.analysis.full_analysis import analyze_resume_full
from app.ai.rewriter import rewrite_bullet
from app.schemas.ai import BulletRewriteRequest, BulletRewriteResponse
from app.auth.routes import router as auth_router
from app.auth.dependencies import get_current_user
from app.models.resume import User
from app.resumes.routes import router as resume_router

# Ensure tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ResumeAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(resume_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the ResumeAI API", "status": "online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/resumes/upload", response_model=ResumeUploadResponse)
async def handle_upload(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await upload_resume(file, db, current_user.id)

@app.get("/resumes/{resume_id}/ats-score")
async def get_ats_score(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await analyze_ats_compatibility(resume_id, db)

@app.post("/resumes/{resume_id}/analyze")
async def analyze_resume(
    resume_id: str,
    request: ResumeAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await analyze_resume_full(
        resume_id,
        request.job_description,
        request.required_skills,
        request.preferred_skills,
        db
    )

@app.post("/ai/rewrite-bullet", response_model=BulletRewriteResponse)
async def handle_rewrite(
    request: BulletRewriteRequest,
    current_user: User = Depends(get_current_user)
):
    return await rewrite_bullet(request)
