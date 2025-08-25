import uuid
import time
import logging
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from ..models.models import (
    Document, DocumentType, ExtractedSkill, Analysis, AnalysisComponents, 
    MatchedSkill, MissingSkill, NiceToHaveSkill, Snippets
)
from .text_processor import TextProcessor
from .skill_extractor import SkillExtractor
from .embedding_service import EmbeddingService
from .scoring_engine import ScoringEngine

logger = logging.getLogger(__name__)

class AnalysisService:
    def __init__(self):
        """Initialize the analysis service with all required components."""
        self.text_processor = TextProcessor()
        self.skill_extractor = SkillExtractor()
        self.embedding_service = EmbeddingService()
        self.scoring_engine = ScoringEngine()
        
        # In-memory storage for v1
        self.documents: Dict[str, Document] = {}
        self.analyses: Dict[str, Analysis] = {}

    def upload_resume(self, text: str, file_path: Optional[str] = None) -> Dict:
        """Upload and process a resume document."""
        try:
            start_time = time.time()
            
            # Generate document ID
            document_id = f"resume_{uuid.uuid4().hex[:8]}"
            
            # Process text
            clean_text = self.text_processor.normalize_text(text)
            if not clean_text:
                raise ValueError("No text content found in resume")
            
            # Calculate text hash
            text_hash = self.text_processor.calculate_text_hash(clean_text)
            
            # Detect sections
            sections = self.text_processor.detect_sections(clean_text)
            
            # Extract skills
            extracted_skills = self.skill_extractor.extract_skills(clean_text)
            
            # Generate embeddings
            embeddings = self.embedding_service.embed_document(clean_text, sections)
            
            # Create document
            document = Document(
                document_id=document_id,
                document_type=DocumentType.RESUME,
                source="text" if not file_path else "file",
                original_text_hash=text_hash,
                clean_text=clean_text,
                sections=sections,
                extracted_skills=extracted_skills,
                embeddings=embeddings,
                created_at=datetime.utcnow()
            )
            
            # Store document
            self.documents[document_id] = document
            
            processing_time = time.time() - start_time
            logger.info(f"Resume processed in {processing_time:.2f}s: {len(extracted_skills)} skills extracted")
            
            return {
                "document_id": document_id,
                "detected_sections": [section.name for section in sections],
                "skills": [{"name": skill.name, "confidence": skill.confidence} for skill in extracted_skills[:10]]  # Top 10 skills
            }
            
        except Exception as e:
            logger.error(f"Resume upload failed: {e}")
            raise

    def upload_job_description(self, text: str, file_path: Optional[str] = None) -> Dict:
        """Upload and process a job description document."""
        try:
            start_time = time.time()
            
            # Generate document ID
            document_id = f"jd_{uuid.uuid4().hex[:8]}"
            
            # Process text
            clean_text = self.text_processor.normalize_text(text)
            if not clean_text:
                raise ValueError("No text content found in job description")
            
            # Calculate text hash
            text_hash = self.text_processor.calculate_text_hash(clean_text)
            
            # Extract skills
            extracted_skills = self.skill_extractor.extract_skills(clean_text)
            
            # Generate embeddings
            embeddings = self.embedding_service.embed_document(clean_text)
            
            # Create document
            document = Document(
                document_id=document_id,
                document_type=DocumentType.JOB_DESCRIPTION,
                source="text" if not file_path else "file",
                original_text_hash=text_hash,
                clean_text=clean_text,
                sections=[],  # JDs typically don't have clear sections
                extracted_skills=extracted_skills,
                embeddings=embeddings,
                created_at=datetime.utcnow()
            )
            
            # Store document
            self.documents[document_id] = document
            
            processing_time = time.time() - start_time
            logger.info(f"Job description processed in {processing_time:.2f}s: {len(extracted_skills)} skills extracted")
            
            return {
                "document_id": document_id,
                "skills": [{"name": skill.name, "importance": self.skill_extractor.get_skill_importance(skill.name, clean_text)} for skill in extracted_skills[:10]]  # Top 10 skills
            }
            
        except Exception as e:
            logger.error(f"Job description upload failed: {e}")
            raise

    def analyze(self, resume_id: str, jd_id: str, target_role: Optional[str] = None) -> Dict:
        """Perform analysis between resume and job description."""
        try:
            start_time = time.time()
            
            # Validate documents exist
            if resume_id not in self.documents:
                raise ValueError(f"Resume document {resume_id} not found")
            if jd_id not in self.documents:
                raise ValueError(f"Job description document {jd_id} not found")
            
            resume_doc = self.documents[resume_id]
            jd_doc = self.documents[jd_id]
            
            # Validate document types
            if resume_doc.document_type != DocumentType.RESUME:
                raise ValueError(f"Document {resume_id} is not a resume")
            if jd_doc.document_type != DocumentType.JOB_DESCRIPTION:
                raise ValueError(f"Document {jd_id} is not a job description")
            
            # Extract skills
            resume_skills = resume_doc.extracted_skills
            jd_skills = jd_doc.extracted_skills
            
            # Calculate semantic similarity
            semantic_similarity = self.embedding_service.calculate_similarity(
                resume_doc.embeddings.get("document", []),
                jd_doc.embeddings.get("document", [])
            )
            
            # Calculate score
            score, components, metadata = self.scoring_engine.calculate_score(
                resume_skills, jd_skills, semantic_similarity,
                resume_doc.clean_text, jd_doc.clean_text, target_role
            )
            
            # Generate analysis
            analysis_data = self.scoring_engine.generate_analysis(
                resume_skills, jd_skills, resume_doc.clean_text, jd_doc.clean_text,
                semantic_similarity, components
            )
            
            # Create analysis record
            analysis_id = f"analysis_{uuid.uuid4().hex[:8]}"
            analysis = Analysis(
                analysis_id=analysis_id,
                user_id=None,  # Anonymous for v1
                resume_id=resume_id,
                jd_id=jd_id,
                score=score,
                components=components,
                matched_skills=analysis_data["matched_skills"],
                missing_skills=analysis_data["missing_skills"],
                nice_to_have_skills=analysis_data["nice_to_have_skills"],
                strengths=analysis_data["strengths"],
                risks=analysis_data["risks"],
                recommendations=analysis_data["recommendations"],
                snippets=analysis_data["snippets"],
                created_at=datetime.utcnow()
            )
            
            # Store analysis
            self.analyses[analysis_id] = analysis
            
            processing_time = time.time() - start_time
            logger.info(f"Analysis completed in {processing_time:.2f}s: score {score}/100")
            
            return {
                "analysis": analysis,
                "processing_time": processing_time,
                "metadata": metadata
            }
            
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            raise

    def get_history(self, limit: int = 20, offset: int = 0) -> List[Dict]:
        """Get analysis history."""
        try:
            # Sort analyses by creation date (newest first)
            sorted_analyses = sorted(
                self.analyses.values(),
                key=lambda x: x.created_at,
                reverse=True
            )
            
            # Apply pagination
            paginated_analyses = sorted_analyses[offset:offset + limit]
            
            # Convert to response format
            history_items = []
            for analysis in paginated_analyses:
                # Get document info
                resume_doc = self.documents.get(analysis.resume_id)
                jd_doc = self.documents.get(analysis.jd_id)
                
                history_items.append({
                    "analysis_id": analysis.analysis_id,
                    "score": analysis.score,
                    "created_at": analysis.created_at.isoformat(),
                    "resume_summary": {
                        "document_id": analysis.resume_id,
                        "skills_count": len(resume_doc.extracted_skills) if resume_doc else 0
                    } if resume_doc else None,
                    "jd_summary": {
                        "document_id": analysis.jd_id,
                        "skills_count": len(jd_doc.extracted_skills) if jd_doc else 0
                    } if jd_doc else None
                })
            
            return history_items
            
        except Exception as e:
            logger.error(f"Failed to get history: {e}")
            return []

    def get_analysis(self, analysis_id: str) -> Optional[Analysis]:
        """Get a specific analysis by ID."""
        return self.analyses.get(analysis_id)

    def delete_analysis(self, analysis_id: str) -> bool:
        """Delete an analysis."""
        try:
            if analysis_id in self.analyses:
                del self.analyses[analysis_id]
                logger.info(f"Analysis {analysis_id} deleted")
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to delete analysis {analysis_id}: {e}")
            return False

    def get_system_stats(self) -> Dict:
        """Get system statistics."""
        try:
            total_analyses = len(self.analyses)
            total_resumes = len([d for d in self.documents.values() if d.document_type == DocumentType.RESUME])
            total_jds = len([d for d in self.documents.values() if d.document_type == DocumentType.JOB_DESCRIPTION])
            
            # Calculate average score
            if total_analyses > 0:
                avg_score = sum(a.score for a in self.analyses.values()) / total_analyses
            else:
                avg_score = 0
            
            return {
                "total_analyses": total_analyses,
                "total_resumes": total_resumes,
                "total_job_descriptions": total_jds,
                "average_score": round(avg_score, 2),
                "storage_type": "in_memory"
            }
            
        except Exception as e:
            logger.error(f"Failed to get system stats: {e}")
            return {"error": str(e)}

    def clear_data(self) -> bool:
        """Clear all stored data (for testing/reset)."""
        try:
            self.documents.clear()
            self.analyses.clear()
            logger.info("All data cleared")
            return True
        except Exception as e:
            logger.error(f"Failed to clear data: {e}")
            return False
