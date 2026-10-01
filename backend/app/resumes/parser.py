import PyPDF2
import docx
from pathlib import Path
from typing import Dict, Any
from fastapi import HTTPException

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts all text from a PDF file."""
    text = ""
    try:
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing PDF: {str(e)}")
    return text

def extract_text_from_docx(file_path: str) -> str:
    """Extracts all text from a DOCX file."""
    try:
        doc = docx.Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing DOCX: {str(e)}")

def parse_resume_structure(text: str) -> Dict[str, Any]:
    """
    A basic rule-based parser to extract sections.
    In a production environment, this would use NLP or a specialized LLM.
    """
    sections = {
        "contact": "",
        "experience": "",
        "education": "",
        "skills": "",
        "projects": "",
        "summary": ""
    }

    # Simple keyword-based section splitting
    lines = text.split("\n")
    current_section = "summary" # Default starting section

    section_keywords = {
        "experience": ["experience", "work history", "employment"],
        "education": ["education", "academic", "degree"],
        "skills": ["skills", "technologies", "competencies"],
        "projects": ["projects", "personal projects", "portfolio"],
        "summary": ["summary", "objective", "about me", "profile"]
    }

    for line in lines:
        clean_line = line.strip().lower()
        if not clean_line:
            continue

        found_section = False
        for section, keywords in section_keywords.items():
            if any(kw == clean_line or clean_line.startswith(kw + ":") for kw in keywords):
                current_section = section
                found_section = True
                break

        if not found_section:
            sections[current_section] += line + "\n"

    return {
        "raw_text": text,
        "structured_content": sections
    }

def parse_resume_file(file_path: str) -> Dict[str, Any]:
    """Determines file type and parses content."""
    path = Path(file_path)
    ext = path.suffix.lower()

    if ext == ".pdf":
        text = extract_text_from_pdf(file_path)
    elif ext == ".docx":
        text = extract_text_from_docx(file_path)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format for parsing.")

    return parse_resume_structure(text)
