import os
import shutil
from pathlib import Path
from fastapi import UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.resume import Resume
from app.schemas.resume import ResumeUploadResponse
from app.resumes.parser import parse_resume_file

# For MVP, we use a local directory. In production, this would be S3.
UPLOAD_DIR = Path("backend/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

async def save_upload_file(upload_file: UploadFile) -> str:
    """Saves the uploaded file to the local filesystem."""
    try:
        # Secure the filename to prevent path traversal
        filename = os.path.basename(upload_file.filename)
        file_path = UPLOAD_DIR / filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)

        return str(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")

async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db), user_id: int = 1):
    """
    Handles the resume upload.
    1. Validates file type.
    2. Saves file to storage.
    3. Parses the resume content.
    4. Creates record in database.
    """

    # 1. Basic Validation
    allowed_extensions = {".pdf", ".docx"}
    filename = file.filename
    if not any(filename.lower().endswith(ext) for ext in allowed_extensions):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and DOCX are allowed.")

    # 2. Save File
    file_path = await save_upload_file(file)

    # 3. Parse Resume
    parsed_data = parse_resume_file(file_path)

    # 4. DB Record
    new_resume = Resume(
        user_id=user_id,
        filename=filename,
        file_path=file_path,
        parsed_content=parsed_data
    )

    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return ResumeUploadResponse(
        resume_id=new_resume.id,
        filename=new_resume.filename,
        status="uploaded",
        message="Resume uploaded and parsed successfully"
    )
