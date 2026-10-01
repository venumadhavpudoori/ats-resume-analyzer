from typing import Dict, Any, List
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.resume import Resume, Analysis
from app.scoring.ats import ATSScorer
from app.scoring.match import JobMatchScorer

async def analyze_resume_full(resume_id: str, job_description: str, required_skills: List[str] = None, preferred_skills: List[str] = None, db: Session = Depends(get_db)):
    """
    Performs full analysis: both ATS Compatibility and Job Match.
    """
    # 1. Retrieve Resume
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    if not resume.parsed_content:
        raise HTTPException(status_code=400, detail="Resume has not been parsed yet.")

    # 2. ATS Scoring
    ats_scorer = ATSScorer(resume.parsed_content, resume.filename)
    ats_result = ats_scorer.calculate_total_score()

    # 3. Job Match Scoring
    match_scorer = JobMatchScorer(resume.parsed_content, job_description)
    match_result = match_scorer.calculate_match_score(
        required_skills=required_skills or [],
        preferred_skills=preferred_skills or []
    )

    # 4. Store Full Analysis in DB
    analysis = Analysis(
        resume_id=resume.id,
        job_description=job_description,
        ats_score=ats_result["total_score"],
        ats_breakdown=ats_result["breakdown"],
        match_score=match_result["total_score"],
        match_breakdown=match_result["breakdown"],
        keyword_gaps={
            "matched": list(match_result["matched_skills"]),
            "missing": [s for s in (required_skills or []) if s not in match_result["matched_skills"]]
        }
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return {
        "analysis_id": analysis.id,
        "ats_score": analysis.ats_score,
        "ats_breakdown": analysis.ats_breakdown,
        "match_score": analysis.match_score,
        "match_breakdown": analysis.match_breakdown,
        "keyword_gaps": analysis.keyword_gaps
    }
