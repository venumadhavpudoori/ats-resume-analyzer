from typing import Dict, Any, List
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.resume import Resume, Analysis
from app.scoring.ats import ATSScorer

async def analyze_ats_compatibility(resume_id: str, db: Session = Depends(get_db)):
    """
    Performs deterministic ATS scoring for a specific resume.
    """
    # 1. Retrieve Resume
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    if not resume.parsed_content:
        raise HTTPException(status_code=400, detail="Resume has not been parsed yet.")

    # 2. Initialize Scorer
    scorer = ATSScorer(resume.parsed_content, resume.filename)

    # In a full analysis, we'd pass keywords from the JD.
    # For a standalone ATS check, we use the scorer's baseline.
    result = scorer.calculate_total_score()

    # 3. Store Analysis in DB
    # Note: Using dummy job_description for standalone ATS check
    analysis = Analysis(
        resume_id=resume.id,
        job_description="ATS Baseline Check",
        ats_score=result["total_score"],
        ats_breakdown=result["breakdown"],
        match_score=0, # Not computed in this specific function
        match_breakdown={"info": "Match score requires a job description."},
        keyword_gaps=[]
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return {
        "resume_id": resume.id,
        "ats_score": analysis.ats_score,
        "ats_breakdown": analysis.ats_breakdown
    }
