from pydantic import BaseModel
from typing import Optional, Dict, Any

class ResumeUploadResponse(BaseModel):
    resume_id: str
    filename: str
    status: str
    message: str

class ResumeParseResponse(BaseModel):
    resume_id: str
    parsed_content: Dict[str, Any]
    status: str

class ResumeOut(BaseModel):
    id: str
    user_id: int
    filename: str
    file_path: str
    parsed_content: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# Alias for backwards compatibility
Resume = ResumeOut

class ResumeAnalyzeRequest(BaseModel):
    job_description: str
    required_skills: Optional[list[str]] = None
    preferred_skills: Optional[list[str]] = None

