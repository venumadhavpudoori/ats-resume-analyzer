from typing import Dict, Any, List, Set
import re

class JobMatchScorer:
    """
    Deterministic rule-based scorer for Job Match.
    Score = Required Skills (35) + Experience (25) + Projects (20) + Education (10) + Preferred (10)
    """

    def __init__(self, parsed_content: Dict[str, Any], job_description: str):
        self.resume_content = parsed_content.get("structured_content", {})
        self.raw_text = parsed_content.get("raw_text", "").lower()
        self.jd_text = job_description.lower()

    def _extract_keywords(self, text: str, keywords_list: List[str]) -> Set[str]:
        """Simple keyword extraction from text based on a provided list."""
        found = set()
        for kw in keywords_list:
            if kw.lower() in text:
                found.add(kw.lower())
        return found

    def score_required_skills(self, required_skills: List[str]) -> tuple[int, List[str]]:
        """Scores based on required skills (out of 35)."""
        if not required_skills:
            return 35, []

        found_skills = self._extract_keywords(self.raw_text, required_skills)
        match_rate = len(found_skills) / len(required_skills)

        score = int(match_rate * 35)
        missing = [s for s in required_skills if s.lower() not in found_skills]

        return score, missing

    def score_experience(self) -> tuple[int, str]:
        """Scores experience level (out of 25)."""
        score = 0
        explanation = ""

        exp_text = self.resume_content.get("experience", "").lower()

        # Simple heuristic: Look for years of experience in JD and Resume
        # This is a simplified MVP version of experience matching
        jd_years_match = re.findall(r'(\d+)\+?\s*(?:years?|yrs?)\s*exp', self.jd_text)
        if jd_years_match:
            required_years = int(jd_years_match[0])
            # Check resume for similar mentions
            res_years_match = re.findall(r'(\d+)\+?\s*(?:years?|yrs?)\s*exp', exp_text)
            if res_years_match:
                candidate_years = int(res_years_match[0])
                if candidate_years >= required_years:
                    score = 25
                    explanation = "Experience level meets or exceeds requirements."
                elif candidate_years >= required_years / 2:
                    score = 12
                    explanation = "Experience level is partial match."
                else:
                    score = 5
                    explanation = "Experience level is significantly below requirements."
            else:
                score = 10 # Give partial credit if experience section exists but no years mentioned
                explanation = "Experience section found, but years of experience not explicitly stated."
        else:
            # No explicit year requirement in JD, score based on experience section quality
            if exp_text:
                score = 25
                explanation = "Experience section is present."
            else:
                score = 0
                explanation = "No experience section found."

        return score, explanation

    def score_projects_achievements(self) -> tuple[int, str]:
        """Scores projects and achievements (out of 20)."""
        score = 0
        explanation = ""

        proj_text = self.resume_content.get("projects", "").lower()

        # Look for action verbs or metric-based achievements
        metrics = ["%", "$", "increased", "decreased", "reduced", "improved", "saved"]
        found_metrics = [m for m in metrics if m in proj_text or m in self.raw_text]

        if proj_text:
            score = 10
            explanation = "Projects section found."
            if len(found_metrics) >= 2:
                score += 10
                explanation += " Quantifiable achievements detected."
        else:
            score = 0
            explanation = "No projects section found."

        return score, explanation

    def score_education(self) -> tuple[int, str]:
        """Scores education and certifications (out of 10)."""
        score = 0
        explanation = ""

        edu_text = self.resume_content.get("education", "").lower()
        if edu_text:
            score = 10
            explanation = "Education section present."
        else:
            score = 0
            explanation = "Education section missing."

        return score, explanation

    def score_preferred_skills(self, preferred_skills: List[str]) -> tuple[int, str]:
        """Scores preferred skills (out of 10)."""
        if not preferred_skills:
            return 10, "No preferred skills specified."

        found_skills = self._extract_keywords(self.raw_text, preferred_skills)
        match_rate = len(found_skills) / len(preferred_skills)

        score = int(match_rate * 10)
        explanation = f"Matched {len(found_skills)} of {len(preferred_skills)} preferred skills."

        return score, explanation

    def calculate_match_score(self, required_skills: List[str] = None, preferred_skills: List[str] = None) -> Dict[str, Any]:
        """Computes the final Job Match score and breakdown."""
        s_req, m_req = self.score_required_skills(required_skills or [])
        s_exp, e_exp = self.score_experience()
        s_proj, e_proj = self.score_projects_achievements()
        s_edu, e_edu = self.score_education()
        s_pref, e_pref = self.score_preferred_skills(preferred_skills or [])

        total_score = s_req + s_exp + s_proj + s_edu + s_pref

        return {
            "total_score": total_score,
            "breakdown": {
                "required_skills": {"score": s_req, "explanation": f"Missing: {', '.join(m_req)}" if m_req else "All required skills found."},
                "experience": {"score": s_exp, "explanation": e_exp},
                "projects": {"score": s_proj, "explanation": e_proj},
                "education": {"score": s_edu, "explanation": e_edu},
                "preferred_skills": {"score": s_pref, "explanation": e_pref}
            },
            "matched_skills": self._extract_keywords(self.raw_text, required_skills or []) if required_skills else []
        }
