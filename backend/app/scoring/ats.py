from typing import Dict, Any, List
import re

class ATSScorer:
    """
    Deterministic rule-based scorer for ATS compatibility.
    Score = Structure (25) + Sections (20) + Readability (20) + Keywords (20) + File (15)
    """

    def __init__(self, parsed_content: Dict[str, Any], filename: str):
        self.content = parsed_content.get("structured_content", {})
        self.raw_text = parsed_content.get("raw_text", "")
        self.filename = filename.lower()

    def score_structure(self) -> tuple[int, str]:
        """Scores overall structure and formatting (out of 25)."""
        score = 25
        deductions = []

        # Rule 1: Check for excessive special characters in raw text (potential parsing issues)
        special_chars_count = len(re.findall(r'[^\w\s\.,!?()\-]', self.raw_text))
        if special_chars_count > len(self.raw_text) * 0.05:
            score -= 10
            deductions.append("Excessive special characters detected, which may confuse some ATS systems.")

        # Rule 2: Check for very short resumes (too little content)
        if len(self.raw_text) < 500:
            score -= 15
            deductions.append("Resume content is too short; lacks sufficient detail for most ATS.")

        return max(0, score), " ".join(deductions)

    def score_sections(self) -> tuple[int, str]:
        """Scores section completeness (out of 20)."""
        score = 20
        deductions = []

        required_sections = {
            "experience": "Work Experience",
            "education": "Education",
            "skills": "Skills"
        }

        for section, label in required_sections.items():
            content = self.content.get(section, "").strip()
            if not content:
                score -= 6 # Rough deduction per missing core section
                deductions.append(f"Missing core section: {label}.")

        return max(0, score), " ".join(deductions)

    def score_readability(self) -> tuple[int, str]:
        """Scores content readability (out of 20)."""
        score = 20
        deductions = []

        # Rule 1: Check for bullet points in experience
        exp_content = self.content.get("experience", "")
        if not any(char in exp_content for char in ["•", "-", "*"]):
            score -= 10
            deductions.append("Experience section lacks bullet points, making it harder to scan.")

        # Rule 2: Check for wall-of-text (extremely long paragraphs)
        paragraphs = exp_content.split("\n\n")
        for p in paragraphs:
            if len(p) > 500 and " " in p: # Very long paragraph
                score -= 10
                deductions.append("Contains very long paragraphs; consider breaking text into bullet points.")
                break

        return max(0, score), " ".join(deductions)

    def score_keywords(self, target_keywords: List[str] = None) -> tuple[int, str]:
        """
        Scores keyword alignment (out of 20).
        If no target_keywords provided, it checks for general professional keywords.
        """
        score = 20
        deductions = []

        if target_keywords is None:
            # Generic baseline keywords if no specific JD is provided yet
            target_keywords = ["managed", "developed", "implemented", "coordinated", "led"]

        found_count = 0
        text_lower = self.raw_text.lower()

        for kw in target_keywords:
            if kw.lower() in text_lower:
                found_count += 1

        # Simple ratio: score based on how many target keywords are present
        if not target_keywords:
            return 20, "No target keywords provided for alignment check."

        match_rate = found_count / len(target_keywords)
        if match_rate < 0.5:
            score -= 10
            deductions.append("Low alignment with target industry keywords.")
            if match_rate < 0.2:
                score -= 10
                deductions.append("Very few target keywords found.")

        return max(0, score), " ".join(deductions)

    def score_file_compatibility(self) -> tuple[int, str]:
        """Scores file compatibility (out of 15)."""
        score = 15
        deductions = []

        if not (self.filename.endswith(".pdf") or self.filename.endswith(".docx")):
            score = 0
            deductions.append("Unsupported file format. Use PDF or DOCX for best ATS compatibility.")

        return score, " ".join(deductions)

    def calculate_total_score(self, target_keywords: List[str] = None) -> Dict[str, Any]:
        """Computes the final ATS score and the full breakdown."""
        s_struct, d_struct = self.score_structure()
        s_sect, d_sect = self.score_sections()
        s_read, d_read = self.score_readability()
        s_key, d_key = self.score_keywords(target_keywords)
        s_file, d_file = self.score_file_compatibility()

        total_score = s_struct + s_sect + s_read + s_key + s_file

        return {
            "total_score": total_score,
            "breakdown": {
                "structure": {"score": s_struct, "explanation": d_struct},
                "sections": {"score": s_sect, "explanation": d_sect},
                "readability": {"score": s_read, "explanation": d_read},
                "keywords": {"score": s_key, "explanation": d_key},
                "file_compatibility": {"score": s_file, "explanation": d_file}
            }
        }
