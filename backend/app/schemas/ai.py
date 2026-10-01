from pydantic import BaseModel, Field
from typing import List

class BulletRewriteRequest(BaseModel):
    original_text: str
    job_description: str
    context: str = Field(..., description="The rest of the resume content to ensure consistency")

class BulletRewriteResponse(BaseModel):
    original_text: str
    suggested_text: str
    reasoning: str
    missing_info: List[str] = Field(default_factory=list, description="Information the AI needs from the user to make the bullet better")
