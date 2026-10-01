from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.resume import Resume
from app.auth.dependencies import get_current_user
from app.schemas.resume import ResumeOut

router = APIRouter(prefix="/resumes", tags=["resumes"])

@router.get("/", response_model=List[ResumeOut])
async def list_resumes(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Returns a list of all resumes uploaded by the authenticated user.
    """
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).all()
    return resumes
