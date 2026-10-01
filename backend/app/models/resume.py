from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Boolean, Text
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    resumes = relationship("Resume", back_populates="owner", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # Path in S3 storage
    parsed_content = Column(JSON, nullable=True)  # JSONB for parsed structure
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="resumes")
    analyses = relationship("Analysis", back_populates="resume", cascade="all, delete-orphan")

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    resume_id = Column(String, ForeignKey("resumes.id"), nullable=False)
    job_description = Column(Text, nullable=False)

    # ATS Compatibility Score (out of 100)
    # Breakdown: structure (25), sections (20), readability (20), keywords (20), file (15)
    ats_score = Column(Integer, nullable=False)
    ats_breakdown = Column(JSON, nullable=False)

    # Job Match Score (out of 100)
    # Breakdown: skills (35), experience (25), projects (20), education (10), preferred (10)
    match_score = Column(Integer, nullable=False)
    match_breakdown = Column(JSON, nullable=False)

    keyword_gaps = Column(JSON, nullable=True) # List of missing/found keywords

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    resume = relationship("Resume", back_populates="analyses")
