import re
import math
import logging
from typing import List, Dict, Tuple, Optional
from ..models.models import (
    ExtractedSkill, MatchedSkill, MissingSkill, NiceToHaveSkill, 
    AnalysisComponents, Snippet, Snippets
)
from .skill_extractor import SkillExtractor

logger = logging.getLogger(__name__)

class ScoringEngine:
    def __init__(self):
        self.skill_extractor = SkillExtractor()
        self.seniority_mapping = self._build_seniority_mapping()
        self.domain_terms = self._build_domain_terms()
        self.weights = {"semantic": 0.45, "skill_coverage": 0.45, "experience_alignment": 0.10}

    def calculate_score(self, resume_skills: List[ExtractedSkill], 
                       jd_skills: List[ExtractedSkill], 
                       semantic_similarity: float, 
                       resume_text: str, 
                       jd_text: str, 
                       target_role: Optional[str] = None) -> Tuple[int, AnalysisComponents, Dict]:
        """Calculate overall score and analysis components."""
        try:
            # Calculate skill coverage
            skill_coverage = self._calculate_skill_coverage(resume_skills, jd_skills, jd_text)
            
            # Calculate experience alignment
            experience_alignment = self._calculate_experience_alignment(resume_text, jd_text, target_role)
            
            # Combine scores with weights
            overall_raw = (
                self.weights["semantic"] * semantic_similarity +
                self.weights["skill_coverage"] * skill_coverage +
                self.weights["experience_alignment"] * experience_alignment
            )
            
            # Convert to 0-100 scale
            score = round(100 * overall_raw)
            score = max(0, min(100, score))  # Ensure bounds
            
            # Create analysis components
            components = AnalysisComponents(
                semantic_similarity=semantic_similarity,
                skill_coverage=skill_coverage,
                experience_alignment=experience_alignment
            )
            
            # Prepare metadata
            metadata = {
                "weights_used": self.weights,
                "skill_coverage_details": {
                    "resume_skills_count": len(resume_skills),
                    "jd_skills_count": len(jd_skills),
                    "matched_skills_count": len([s for s in resume_skills if s.name.lower() in [js.name.lower() for js in jd_skills]])
                }
            }
            
            logger.info(f"Score calculated: {score}/100 (coverage: {skill_coverage:.3f}, alignment: {experience_alignment:.3f})")
            return score, components, metadata
            
        except Exception as e:
            logger.error(f"Score calculation failed: {e}")
            # Return default scores on error
            default_components = AnalysisComponents(
                semantic_similarity=semantic_similarity,
                skill_coverage=0.5,
                experience_alignment=0.5
            )
            return 50, default_components, {"error": str(e)}

    def _calculate_skill_coverage(self, resume_skills: List[ExtractedSkill], 
                                 jd_skills: List[ExtractedSkill], 
                                 jd_text: str) -> float:
        """Calculate weighted coverage of JD skills present in resume."""
        try:
            if not jd_skills:
                return 0.0
            
            total_importance = 0.0
            covered_importance = 0.0
            
            # Create lookup for resume skills
            resume_skill_names = {skill.name.lower() for skill in resume_skills}
            
            for jd_skill in jd_skills:
                # Get skill importance from JD context
                importance = self.skill_extractor.get_skill_importance(jd_skill.name, jd_text)
                
                # Check if skill is present in resume
                is_present = jd_skill.name.lower() in resume_skill_names
                
                total_importance += importance
                if is_present:
                    covered_importance += importance
            
            if total_importance == 0:
                return 0.0
            
            coverage = covered_importance / total_importance
            logger.debug(f"Skill coverage: {coverage:.3f} ({covered_importance:.3f}/{total_importance:.3f})")
            return coverage
            
        except Exception as e:
            logger.error(f"Skill coverage calculation failed: {e}")
            return 0.5

    def _calculate_experience_alignment(self, resume_text: str, 
                                      jd_text: str, 
                                      target_role: Optional[str] = None) -> float:
        """Calculate experience alignment score."""
        try:
            alignment_score = 0.0
            
            # Years overlap (0.4 weight)
            years_overlap = self._calculate_years_overlap(resume_text, jd_text)
            alignment_score += 0.4 * years_overlap
            
            # Seniority match (0.3 weight)
            seniority_match = self._calculate_seniority_match(resume_text, jd_text)
            alignment_score += 0.3 * seniority_match
            
            # Domain terms match (0.3 weight)
            domain_match = self._calculate_domain_match(resume_text, jd_text)
            alignment_score += 0.3 * domain_match
            
            # Apply logistic function to smooth the score
            smoothed_score = 1 / (1 + math.exp(-5 * (alignment_score - 0.5)))
            
            logger.debug(f"Experience alignment: {smoothed_score:.3f} (raw: {alignment_score:.3f})")
            return smoothed_score
            
        except Exception as e:
            logger.error(f"Experience alignment calculation failed: {e}")
            return 0.5

    def _calculate_years_overlap(self, resume_text: str, jd_text: str) -> float:
        """Calculate overlap in years mentioned."""
        try:
            # Extract years from both texts
            resume_years = set(re.findall(r'\b(20\d{2}|19\d{2})\b', resume_text))
            jd_years = set(re.findall(r'\b(20\d{2}|19\d{2})\b', jd_text))
            
            if not resume_years or not jd_years:
                return 0.5
            
            # Calculate overlap
            overlap = len(resume_years.intersection(jd_years))
            total = len(resume_years.union(jd_years))
            
            if total == 0:
                return 0.5
            
            return overlap / total
            
        except Exception as e:
            logger.error(f"Years overlap calculation failed: {e}")
            return 0.5

    def _calculate_seniority_match(self, resume_text: str, jd_text: str) -> float:
        """Calculate seniority level match."""
        try:
            # Extract seniority indicators
            resume_seniority = self._extract_seniority_level(resume_text)
            jd_seniority = self._extract_seniority_level(jd_text)
            
            if resume_seniority == jd_seniority:
                return 1.0
            elif abs(resume_seniority - jd_seniority) == 1:
                return 0.7
            elif abs(resume_seniority - jd_seniority) == 2:
                return 0.4
            else:
                return 0.1
                
        except Exception as e:
            logger.error(f"Seniority match calculation failed: {e}")
            return 0.5

    def _extract_seniority_level(self, text: str) -> int:
        """Extract seniority level from text (0=junior, 1=mid, 2=senior, 3=lead)."""
        text_lower = text.lower()
        
        # Lead/Principal level
        if any(term in text_lower for term in ['lead', 'principal', 'architect', 'director', 'head']):
            return 3
        
        # Senior level
        elif any(term in text_lower for term in ['senior', 'sr.', 'experienced', 'expert']):
            return 2
        
        # Mid level
        elif any(term in text_lower for term in ['mid', 'intermediate', 'mid-level']):
            return 1
        
        # Junior level (default)
        else:
            return 0

    def _calculate_domain_match(self, resume_text: str, jd_text: str) -> float:
        """Calculate domain terms match."""
        try:
            resume_domains = self._extract_domain_terms(resume_text)
            jd_domains = self._extract_domain_terms(jd_text)
            
            if not resume_domains or not jd_domains:
                return 0.5
            
            # Calculate Jaccard similarity
            intersection = len(resume_domains.intersection(jd_domains))
            union = len(resume_domains.union(jd_domains))
            
            if union == 0:
                return 0.5
            
            return intersection / union
            
        except Exception as e:
            logger.error(f"Domain match calculation failed: {e}")
            return 0.5

    def _extract_domain_terms(self, text: str) -> set:
        """Extract domain-specific terms from text."""
        text_lower = text.lower()
        domains = set()
        
        # Check for domain terms
        for domain, terms in self.domain_terms.items():
            for term in terms:
                if term.lower() in text_lower:
                    domains.add(domain)
                    break
        
        return domains

    def _build_seniority_mapping(self) -> Dict[str, int]:
        """Build mapping of job titles to seniority levels."""
        return {
            # Junior level
            "junior": 0, "jr": 0, "entry": 0, "graduate": 0, "intern": 0,
            
            # Mid level
            "mid": 1, "intermediate": 1, "mid-level": 1, "developer": 1, "engineer": 1,
            
            # Senior level
            "senior": 2, "sr": 2, "experienced": 2, "expert": 2, "specialist": 2,
            
            # Lead level
            "lead": 3, "principal": 3, "architect": 3, "director": 3, "head": 3
        }

    def _build_domain_terms(self) -> Dict[str, List[str]]:
        """Build mapping of domains to their terms."""
        return {
            "fintech": ["fintech", "financial", "banking", "payments", "blockchain", "cryptocurrency"],
            "healthcare": ["healthcare", "medical", "pharmaceutical", "biotech", "clinical"],
            "ecommerce": ["ecommerce", "retail", "shopping", "marketplace", "online store"],
            "ai_ml": ["artificial intelligence", "machine learning", "deep learning", "neural networks"],
            "cloud": ["cloud", "aws", "azure", "gcp", "kubernetes", "docker"],
            "mobile": ["mobile", "ios", "android", "react native", "flutter"],
            "web": ["web", "frontend", "backend", "full-stack", "responsive"],
            "data": ["data", "analytics", "big data", "data science", "business intelligence"]
        }

    def generate_analysis(self, resume_skills: List[ExtractedSkill], 
                         jd_skills: List[ExtractedSkill], 
                         resume_text: str, 
                         jd_text: str, 
                         semantic_similarity: float, 
                         components: AnalysisComponents) -> Dict:
        """Generate detailed analysis with matched/missing skills, strengths, risks, and recommendations."""
        try:
            # Generate matched skills
            matched_skills = self._generate_matched_skills(resume_skills, jd_skills, jd_text)
            
            # Generate missing skills
            missing_skills = self._generate_missing_skills(resume_skills, jd_skills, jd_text)
            
            # Generate nice-to-have skills
            nice_to_have_skills = self._generate_nice_to_have_skills(resume_skills, jd_skills, jd_text)
            
            # Generate strengths and risks
            strengths, risks = self._generate_strengths_and_risks(resume_skills, jd_skills, components)
            
            # Generate recommendations
            recommendations = self._generate_recommendations(missing_skills, resume_text, jd_text)
            
            # Generate evidence snippets
            snippets = self._generate_snippets(resume_text, jd_text, matched_skills)
            
            return {
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "nice_to_have_skills": nice_to_have_skills,
                "strengths": strengths,
                "risks": risks,
                "recommendations": recommendations,
                "snippets": snippets
            }
            
        except Exception as e:
            logger.error(f"Analysis generation failed: {e}")
            return {
                "matched_skills": [],
                "missing_skills": [],
                "nice_to_have_skills": [],
                "strengths": ["Analysis generation encountered an error"],
                "risks": ["Unable to complete full analysis"],
                "recommendations": ["Please try again or contact support"],
                "snippets": {"resume": [], "jd": []}
            }

    def _generate_matched_skills(self, resume_skills: List[ExtractedSkill], 
                                jd_skills: List[ExtractedSkill], 
                                jd_text: str) -> List[MatchedSkill]:
        """Generate list of matched skills with evidence."""
        matched = []
        
        for jd_skill in jd_skills:
            # Find matching resume skill
            for resume_skill in resume_skills:
                if resume_skill.name.lower() == jd_skill.name.lower():
                    importance = self.skill_extractor.get_skill_importance(jd_skill.name, jd_text)
                    matched.append(MatchedSkill(
                        name=jd_skill.name,
                        evidence=resume_skill.evidence,
                        confidence=resume_skill.confidence,
                        importance=importance
                    ))
                    break
        
        # Sort by importance * confidence
        matched.sort(key=lambda x: x.importance * x.confidence, reverse=True)
        return matched

    def _generate_missing_skills(self, resume_skills: List[ExtractedSkill], 
                                jd_skills: List[ExtractedSkill], 
                                jd_text: str) -> List[MissingSkill]:
        """Generate list of missing skills."""
        missing = []
        resume_skill_names = {skill.name.lower() for skill in resume_skills}
        
        for jd_skill in jd_skills:
            if jd_skill.name.lower() not in resume_skill_names:
                importance = self.skill_extractor.get_skill_importance(jd_skill.name, jd_text)
                if importance >= 0.6:  # Only include important missing skills
                    missing.append(MissingSkill(
                        name=jd_skill.name,
                        importance=importance
                    ))
        
        # Sort by importance
        missing.sort(key=lambda x: x.importance, reverse=True)
        return missing

    def _generate_nice_to_have_skills(self, resume_skills: List[ExtractedSkill], 
                                     jd_skills: List[ExtractedSkill], 
                                     jd_text: str) -> List[NiceToHaveSkill]:
        """Generate list of nice-to-have skills."""
        nice_to_have = []
        resume_skill_names = {skill.name.lower() for skill in resume_skills}
        
        for jd_skill in jd_skills:
            if jd_skill.name.lower() not in resume_skill_names:
                importance = self.skill_extractor.get_skill_importance(jd_skill.name, jd_text)
                if importance < 0.6:  # Lower importance skills
                    nice_to_have.append(NiceToHaveSkill(
                        name=jd_skill.name,
                        importance=importance
                    ))
        
        # Sort by importance
        nice_to_have.sort(key=lambda x: x.importance, reverse=True)
        return nice_to_have

    def _generate_strengths_and_risks(self, resume_skills: List[ExtractedSkill], 
                                     jd_skills: List[ExtractedSkill], 
                                     components: AnalysisComponents) -> Tuple[List[str], List[str]]:
        """Generate strengths and risks based on analysis."""
        strengths = []
        risks = []
        
        # Strengths
        if components.skill_coverage >= 0.8:
            strengths.append("Strong skill alignment with job requirements")
        elif components.skill_coverage >= 0.6:
            strengths.append("Good skill coverage for the role")
        
        if components.semantic_similarity >= 0.8:
            strengths.append("High semantic similarity between resume and job description")
        
        if len(resume_skills) >= 10:
            strengths.append("Comprehensive skill set demonstrated")
        
        # Risks
        if components.skill_coverage < 0.5:
            risks.append("Significant skill gaps identified")
        
        if components.experience_alignment < 0.4:
            risks.append("Experience level may not align with role requirements")
        
        if len(resume_skills) < 5:
            risks.append("Limited skill diversity shown")
        
        # Ensure we have at least some strengths and risks
        if not strengths:
            strengths.append("Resume shows relevant technical background")
        if not risks:
            risks.append("Consider adding more specific project examples")
        
        return strengths, risks

    def _generate_recommendations(self, missing_skills: List[MissingSkill], 
                                 resume_text: str, 
                                 jd_text: str) -> List[str]:
        """Generate actionable recommendations."""
        recommendations = []
        
        # Top missing skills recommendations
        for skill in missing_skills[:3]:
            if skill.importance >= 0.8:
                recommendations.append(f"Add specific examples demonstrating {skill.name} experience")
            elif skill.importance >= 0.6:
                recommendations.append(f"Consider highlighting {skill.name} in your skills section")
        
        # General recommendations
        if len(missing_skills) > 5:
            recommendations.append("Focus on the most critical missing skills rather than trying to cover everything")
        
        if "experience" in resume_text.lower() and "experience" in jd_text.lower():
            recommendations.append("Quantify your experience with specific metrics and achievements")
        
        if len(recommendations) < 3:
            recommendations.append("Ensure your resume clearly demonstrates the impact of your work")
        
        return recommendations[:5]  # Limit to 5 recommendations

    def _generate_snippets(self, resume_text: str, 
                          jd_text: str, 
                          matched_skills: List[MatchedSkill]) -> Snippets:
        """Generate evidence snippets from resume and JD."""
        resume_snippets = []
        jd_snippets = []
        
        try:
            # Generate resume snippets for top matched skills
            for skill in matched_skills[:3]:
                snippet = self._find_skill_snippet(resume_text, skill.name)
                if snippet:
                    resume_snippets.append(Snippet(
                        text=snippet,
                        start=resume_text.find(snippet),
                        end=resume_text.find(snippet) + len(snippet)
                    ))
            
            # Generate JD snippets for requirements
            jd_lines = jd_text.split('\n')
            for i, line in enumerate(jd_lines):
                if any(term in line.lower() for term in ['required', 'must have', 'essential']):
                    if len(line) > 20 and len(line) < 200:
                        jd_snippets.append(Snippet(
                            text=line.strip(),
                            start=i,
                            end=i
                        ))
            
            # Ensure we have some snippets
            if not resume_snippets:
                resume_snippets.append(Snippet(
                    text=resume_text[:200] + "..." if len(resume_text) > 200 else resume_text,
                    start=0,
                    end=min(200, len(resume_text))
                ))
            
            if not jd_snippets:
                jd_snippets.append(Snippet(
                    text=jd_text[:200] + "..." if len(jd_text) > 200 else jd_text,
                    start=0,
                    end=min(200, len(jd_text))
                ))
            
        except Exception as e:
            logger.error(f"Snippet generation failed: {e}")
            # Fallback snippets
            resume_snippets = [Snippet(text="Resume content", start=0, end=0)]
            jd_snippets = [Snippet(text="Job description content", start=0, end=0)]
        
        return Snippets(resume=resume_snippets, jd=jd_snippets)

    def _find_skill_snippet(self, text: str, skill_name: str) -> Optional[str]:
        """Find a snippet of text mentioning a specific skill."""
        try:
            # Find sentences containing the skill
            sentences = re.split(r'[.!?]+', text)
            for sentence in sentences:
                if skill_name.lower() in sentence.lower():
                    cleaned = sentence.strip()
                    if 20 <= len(cleaned) <= 200:
                        return cleaned
            
            # Fallback: find context around skill mention
            pos = text.lower().find(skill_name.lower())
            if pos != -1:
                start = max(0, pos - 50)
                end = min(len(text), pos + len(skill_name) + 50)
                snippet = text[start:end]
                if len(snippet) > 200:
                    snippet = "..." + snippet[:200] + "..."
                return snippet
            
            return None
            
        except Exception as e:
            logger.error(f"Skill snippet finding failed: {e}")
            return None

    def adjust_weights(self, role_type: str):
        """Adjust scoring weights based on role type."""
        if role_type.lower() in ['ml', 'ai', 'data scientist', 'machine learning']:
            self.weights = {"semantic": 0.40, "skill_coverage": 0.55, "experience_alignment": 0.05}
        elif role_type.lower() in ['security', 'cybersecurity', 'infosec']:
            self.weights = {"semantic": 0.35, "skill_coverage": 0.50, "experience_alignment": 0.15}
        elif role_type.lower() in ['frontend', 'ui', 'ux']:
            self.weights = {"semantic": 0.50, "skill_coverage": 0.40, "experience_alignment": 0.10}
        else:
            # Default weights for general software engineering roles
            self.weights = {"semantic": 0.45, "skill_coverage": 0.45, "experience_alignment": 0.10}
        
        logger.info(f"Adjusted weights for {role_type}: {self.weights}")
