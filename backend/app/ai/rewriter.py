import os
import json
from openai import OpenAI
from fastapi import HTTPException
from dotenv import load_dotenv
from app.schemas.ai import BulletRewriteRequest, BulletRewriteResponse

load_dotenv()

# Grok (xAI) API configuration
client = OpenAI(
    api_key=os.getenv("GROK_API_KEY", "your-api-key-here"),
    base_url=os.getenv("GROK_BASE_URL", "https://api.x.ai/v1"),
)

SYSTEM_PROMPT = """
You are an expert professional resume writer. Your goal is to rewrite resume bullet points to be high-impact,
achievement-oriented, and tailored to a specific job description.

RULES:
1. NEVER invent metrics, achievements, responsibilities, or technologies.
2. If the original text is too vague to be improved with specific numbers, do not make them up.
3. Instead, use the 'missing_info' field to ask the user for specific metrics (e.g., "How much did you increase efficiency by?").
4. Focus on action verbs (e.g., "Spearheaded", "Optimized", "Engineered").
5. Ensure the result is a single, concise bullet point.
6. Use a professional, corporate tone.

OUTPUT FORMAT:
You must return a JSON object matching this schema:
{
  "suggested_text": "The rewritten bullet point",
  "reasoning": "Why this version is better",
  "missing_info": ["Question 1", "Question 2"]
}
"""

async def rewrite_bullet(request: BulletRewriteRequest) -> BulletRewriteResponse:
    """
    Uses an LLM to rewrite a resume bullet point.
    """
    user_prompt = f"""
Job Description:
{request.job_description}

Resume Context:
{request.context}

Original Bullet Point to rewrite:
{request.original_text}
"""

    try:
        response = client.chat.completions.create(
            model=os.getenv("GROK_MODEL", "grok-2-latest"),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)

        return BulletRewriteResponse(
            original_text=request.original_text,
            suggested_text=result["suggested_text"],
            reasoning=result["reasoning"],
            missing_info=result.get("missing_info", [])
        )

    except Exception as e:
        # In a real app, we'd implement a retry mechanism here
        raise HTTPException(status_code=500, detail=f"AI rewrite failed: {str(e)}")
