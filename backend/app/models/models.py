from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class DocumentType(str, Enum):
    RESUME = "resume"
    JOB_DESCRIPTION = "job_description"


class SkillCategory(str, Enum):
    PROGRAMMING_LANGUAGE = "programming_language"
    WEB_TECHNOLOGY = "web_technology"
    BACKEND_FRAMEWORK = "backend_framework"
    DATABASE = "database"
    CLOUD_PLATFORM = "cloud_platform"
    DEVOPS = "devops"
    ML_AI = "ml_ai"
    DATA_ANALYTICS = "data_analytics"
    SECURITY = "security"
    MOBILE_DEVELOPMENT = "mobile_development"
    OTHER = "other"


class Skill(BaseModel):
    name: str
    synonyms: List[str] = []
    category: SkillCategory
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ExtractedSkill(BaseModel):
    name: str
    category: SkillCategory
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: List[str] = []
    start_offset: Optional[int] = None
    end_offset: Optional[int] = None


class DocumentSection(BaseModel):
    name: str
    text: str
    start_line: int
    end_line: int


class Document(BaseModel):
    document_id: str
    document_type: DocumentType
    source: str  # "file" or "text"
    original_text_hash: str
    clean_text: str
    sections: List[DocumentSection] = []
    extracted_skills: List[ExtractedSkill] = []
    embeddings: Dict[str, List[float]] = {}
    created_at: datetime


class AnalysisComponents(BaseModel):
    semantic_similarity: float = Field(ge=0.0, le=1.0)
    skill_coverage: float = Field(ge=0.0, le=1.0)
    experience_alignment: float = Field(ge=0.0, le=1.0)


class MatchedSkill(BaseModel):
    name: str
    evidence: List[str]
    confidence: float = Field(ge=0.0, le=1.0)
    importance: float = Field(ge=0.0, le=1.0)


class MissingSkill(BaseModel):
    name: str
    importance: float = Field(ge=0.0, le=1.0)


class NiceToHaveSkill(BaseModel):
    name: str
    importance: float = Field(ge=0.0, le=1.0)


class Snippet(BaseModel):
    text: str
    start: int
    end: int


class Snippets(BaseModel):
    resume: List[Snippet] = []
    jd: List[Snippet] = []


class Analysis(BaseModel):
    analysis_id: str
    user_id: Optional[str] = None
    resume_id: str
    jd_id: str
    score: int = Field(ge=0, le=100)
    components: AnalysisComponents
    matched_skills: List[MatchedSkill] = []
    missing_skills: List[MissingSkill] = []
    nice_to_have_skills: List[NiceToHaveSkill] = []
    strengths: List[str] = []
    risks: List[str] = []
    recommendations: List[str] = []
    snippets: Snippets
    created_at: datetime


class User(BaseModel):
    user_id: str
    created_at: datetime


# API Request/Response Models
class UploadResumeRequest(BaseModel):
    text: Optional[str] = None


class UploadResumeResponse(BaseModel):
    document_id: str
    detected_sections: List[str]
    skills: List[ExtractedSkill]


class UploadJobRequest(BaseModel):
    text: Optional[str] = None


class UploadJobResponse(BaseModel):
    document_id: str
    skills: List[ExtractedSkill]


class AnalyzeRequest(BaseModel):
    resume_id: str
    jd_id: str
    target_role: Optional[str] = None


class AnalyzeResponse(BaseModel):
    analysis: Analysis


class HistoryResponse(BaseModel):
    items: List[Dict[str, Any]]


class HealthResponse(BaseModel):
    status: str
    uptime_sec: int
