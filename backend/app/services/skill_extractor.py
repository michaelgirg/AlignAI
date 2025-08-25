import re
import logging
from typing import List, Dict, Tuple, Optional
from rapidfuzz import fuzz
from ..models.models import ExtractedSkill, SkillCategory

logger = logging.getLogger(__name__)

class SkillExtractor:
    def __init__(self):
        self.skill_ontology = self._build_skill_ontology()
        self.skill_patterns = self._build_skill_patterns()

    def _build_skill_ontology(self) -> Dict[str, Dict]:
        """Build a comprehensive skill ontology with categories and synonyms."""
        return {
            # Programming Languages
            "python": {"category": SkillCategory.PROGRAMMING_LANGUAGE, "synonyms": ["py", "python3"]},
            "javascript": {"category": SkillCategory.PROGRAMMING_LANGUAGE, "synonyms": ["js", "ecmascript"]},
            "java": {"category": SkillCategory.PROGRAMMING_LANGUAGE, "synonyms": ["j2ee", "j2se"]},
            "c++": {"category": SkillCategory.PROGRAMMING_LANGUAGE, "synonyms": ["cpp", "c plus plus"]},
            "c#": {"category": SkillCategory.PROGRAMMING_LANGUAGE, "synonyms": ["csharp", "dotnet"]},
            "go": {"category": SkillCategory.PROGRAMMING_LANGUAGE, "synonyms": ["golang"]},
            "rust": {"category": SkillCategory.PROGRAMMING_LANGUAGE, "synonyms": []},
            "swift": {"category": SkillCategory.PROGRAMMING_LANGUAGE, "synonyms": []},
            "kotlin": {"category": SkillCategory.PROGRAMMING_LANGUAGE, "synonyms": []},
            "typescript": {"category": SkillCategory.PROGRAMMING_LANGUAGE, "synonyms": ["ts"]},
            
            # Web Technologies
            "html": {"category": SkillCategory.WEB_TECHNOLOGY, "synonyms": ["html5"]},
            "css": {"category": SkillCategory.WEB_TECHNOLOGY, "synonyms": ["css3", "sass", "scss"]},
            "react": {"category": SkillCategory.WEB_TECHNOLOGY, "synonyms": ["reactjs", "react.js"]},
            "angular": {"category": SkillCategory.WEB_TECHNOLOGY, "synonyms": ["angularjs", "angular.js"]},
            "vue": {"category": SkillCategory.WEB_TECHNOLOGY, "synonyms": ["vuejs", "vue.js"]},
            "node.js": {"category": SkillCategory.WEB_TECHNOLOGY, "synonyms": ["nodejs", "node"]},
            "express": {"category": SkillCategory.WEB_TECHNOLOGY, "synonyms": ["expressjs", "express.js"]},
            
            # Backend Frameworks
            "django": {"category": SkillCategory.BACKEND_FRAMEWORK, "synonyms": ["djangorest"]},
            "flask": {"category": SkillCategory.BACKEND_FRAMEWORK, "synonyms": []},
            "fastapi": {"category": SkillCategory.BACKEND_FRAMEWORK, "synonyms": []},
            "spring": {"category": SkillCategory.BACKEND_FRAMEWORK, "synonyms": ["springboot", "spring boot"]},
            "laravel": {"category": SkillCategory.BACKEND_FRAMEWORK, "synonyms": []},
            "rails": {"category": SkillCategory.BACKEND_FRAMEWORK, "synonyms": ["ruby on rails"]},
            
            # Databases
            "mysql": {"category": SkillCategory.DATABASE, "synonyms": []},
            "postgresql": {"category": SkillCategory.DATABASE, "synonyms": ["postgres", "psql"]},
            "mongodb": {"category": SkillCategory.DATABASE, "synonyms": ["mongo"]},
            "redis": {"category": SkillCategory.DATABASE, "synonyms": []},
            "sqlite": {"category": SkillCategory.DATABASE, "synonyms": []},
            "oracle": {"category": SkillCategory.DATABASE, "synonyms": []},
            
            # Cloud & DevOps
            "aws": {"category": SkillCategory.CLOUD_PLATFORM, "synonyms": ["amazon web services"]},
            "azure": {"category": SkillCategory.CLOUD_PLATFORM, "synonyms": ["microsoft azure"]},
            "gcp": {"category": SkillCategory.CLOUD_PLATFORM, "synonyms": ["google cloud", "google cloud platform"]},
            "docker": {"category": SkillCategory.DEVOPS, "synonyms": ["containerization"]},
            "kubernetes": {"category": SkillCategory.DEVOPS, "synonyms": ["k8s"]},
            "jenkins": {"category": SkillCategory.DEVOPS, "synonyms": []},
            "git": {"category": SkillCategory.DEVOPS, "synonyms": ["gitlab", "github"]},
            "terraform": {"category": SkillCategory.DEVOPS, "synonyms": []},
            
            # Machine Learning & AI
            "tensorflow": {"category": SkillCategory.ML_AI, "synonyms": ["tf"]},
            "pytorch": {"category": SkillCategory.ML_AI, "synonyms": ["torch"]},
            "scikit-learn": {"category": SkillCategory.ML_AI, "synonyms": ["sklearn"]},
            "pandas": {"category": SkillCategory.ML_AI, "synonyms": ["pd"]},
            "numpy": {"category": SkillCategory.ML_AI, "synonyms": ["np"]},
            "matplotlib": {"category": SkillCategory.ML_AI, "synonyms": ["plt"]},
            "seaborn": {"category": SkillCategory.ML_AI, "synonyms": ["sns"]},
            "opencv": {"category": SkillCategory.ML_AI, "synonyms": ["cv2"]},
            "nltk": {"category": SkillCategory.ML_AI, "synonyms": []},
            "spacy": {"category": SkillCategory.ML_AI, "synonyms": []},
            
            # Data & Analytics
            "hadoop": {"category": SkillCategory.DATA_ANALYTICS, "synonyms": []},
            "spark": {"category": SkillCategory.DATA_ANALYTICS, "synonyms": ["apache spark"]},
            "kafka": {"category": SkillCategory.DATA_ANALYTICS, "synonyms": ["apache kafka"]},
            "elasticsearch": {"category": SkillCategory.DATA_ANALYTICS, "synonyms": ["es"]},
            "tableau": {"category": SkillCategory.DATA_ANALYTICS, "synonyms": []},
            "powerbi": {"category": SkillCategory.DATA_ANALYTICS, "synonyms": ["power bi"]},
            
            # Security
            "owasp": {"category": SkillCategory.SECURITY, "synonyms": []},
            "penetration testing": {"category": SkillCategory.SECURITY, "synonyms": ["pentesting"]},
            "vulnerability assessment": {"category": SkillCategory.SECURITY, "synonyms": ["vuln assessment"]},
            
            # Mobile Development
            "android": {"category": SkillCategory.MOBILE_DEVELOPMENT, "synonyms": ["android studio"]},
            "ios": {"category": SkillCategory.MOBILE_DEVELOPMENT, "synonyms": ["swift ui", "xcode"]},
            "react native": {"category": SkillCategory.MOBILE_DEVELOPMENT, "synonyms": ["reactnative"]},
            "flutter": {"category": SkillCategory.MOBILE_DEVELOPMENT, "synonyms": ["dart"]},
            
            # Other Technologies
            "graphql": {"category": SkillCategory.OTHER, "synonyms": []},
            "rest": {"category": SkillCategory.OTHER, "synonyms": ["rest api", "restful"]},
            "soap": {"category": SkillCategory.OTHER, "synonyms": ["soap api"]},
            "microservices": {"category": SkillCategory.OTHER, "synonyms": ["micro service"]},
            "serverless": {"category": SkillCategory.OTHER, "synonyms": ["lambda", "functions"]},
        }

    def _build_skill_patterns(self) -> List[Tuple[str, str]]:
        """Build regex patterns for context-based skill detection."""
        return [
            # Experience patterns
            (r'\b(?:experience|experienced|proficient|skilled|expert|knowledge|familiar|worked with|used|built|developed|implemented|created|designed|architected)\s+(?:in|with|on|using)\s+([a-zA-Z0-9+#\s]+)', 'experience'),
            # Technology stacks
            (r'\b(?:tech stack|technology stack|stack|technologies?|tools?|frameworks?|libraries?|platforms?)\s*[:=]\s*([a-zA-Z0-9+#,\s]+)', 'stack'),
            # Project descriptions
            (r'\b(?:built|developed|created|implemented|designed|architected)\s+(?:using|with|in)\s+([a-zA-Z0-9+#\s]+)', 'project'),
            # Certifications
            (r'\b(?:certified|certification)\s+(?:in|for)\s+([a-zA-Z0-9+#\s]+)', 'certification'),
        ]

    def extract_skills(self, text: str) -> List[ExtractedSkill]:
        """Extract skills from text using multiple detection methods."""
        if not text:
            return []
        
        text_lower = text.lower()
        detected_skills = {}
        
        # Method 1: Exact matches from ontology
        for skill_name, skill_info in self.skill_ontology.items():
            if skill_name in text_lower:
                confidence = self._calculate_confidence(skill_name, text, "exact")
                self._add_skill(detected_skills, skill_name, skill_info, confidence, text)
            
            # Check synonyms
            for synonym in skill_info.get("synonyms", []):
                if synonym in text_lower:
                    confidence = self._calculate_confidence(skill_name, text, "synonym")
                    self._add_skill(detected_skills, skill_name, skill_info, confidence, text)
        
        # Method 2: Pattern-based detection
        for pattern, context_type in self.skill_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                potential_skill = match.group(1).strip()
                if len(potential_skill) > 2:  # Filter out very short matches
                    # Try to match with ontology
                    best_match = self._find_best_skill_match(potential_skill)
                    if best_match:
                        skill_name, skill_info = best_match
                        confidence = self._calculate_confidence(skill_name, text, context_type)
                        self._add_skill(detected_skills, skill_name, skill_info, confidence, text)
        
        # Method 3: Fuzzy matching for close matches
        words = re.findall(r'\b[a-zA-Z0-9+#]+\b', text_lower)
        for word in words:
            if len(word) > 3:  # Only check longer words
                best_match = self._find_fuzzy_match(word)
                if best_match:
                    skill_name, skill_info, similarity = best_match
                    if similarity >= 85:  # High similarity threshold
                        confidence = self._calculate_confidence(skill_name, text, "fuzzy")
                        self._add_skill(detected_skills, skill_name, skill_info, confidence, text)
        
        # Convert to list and sort by confidence
        skills_list = list(detected_skills.values())
        skills_list.sort(key=lambda x: x.confidence, reverse=True)
        
        return skills_list

    def _find_best_skill_match(self, text: str) -> Optional[Tuple[str, Dict]]:
        """Find the best matching skill from ontology."""
        text_lower = text.lower()
        
        # Direct match
        if text_lower in self.skill_ontology:
            return text_lower, self.skill_ontology[text_lower]
        
        # Check if it's a substring of any skill
        for skill_name in self.skill_ontology:
            if skill_name in text_lower or text_lower in skill_name:
                return skill_name, self.skill_ontology[skill_name]
        
        return None

    def _find_fuzzy_match(self, word: str) -> Optional[Tuple[str, Dict, float]]:
        """Find fuzzy matches using rapidfuzz."""
        best_match = None
        best_score = 0
        
        for skill_name in self.skill_ontology:
            score = fuzz.ratio(word, skill_name)
            if score > best_score:
                best_score = score
                best_match = (skill_name, self.skill_ontology[skill_name], score)
        
        return best_match if best_score >= 80 else None

    def _calculate_confidence(self, skill_name: str, text: str, detection_method: str) -> float:
        """Calculate confidence score for detected skill."""
        base_confidence = {
            "exact": 0.95,
            "synonym": 0.90,
            "experience": 0.85,
            "stack": 0.80,
            "project": 0.75,
            "certification": 0.90,
            "fuzzy": 0.70
        }
        
        confidence = base_confidence.get(detection_method, 0.70)
        
        # Context boost
        context_boost = 0.05
        if any(phrase in text.lower() for phrase in ["experience with", "proficient in", "expert in"]):
            confidence += context_boost
        
        # Skills section boost
        if "skills" in text.lower() and skill_name in text.lower():
            confidence += 0.05
        
        return min(confidence, 1.0)

    def _add_skill(self, detected_skills: Dict, skill_name: str, skill_info: Dict, confidence: float, text: str):
        """Add or update a detected skill."""
        if skill_name not in detected_skills or confidence > detected_skills[skill_name].confidence:
            # Find evidence snippet
            evidence = self._find_evidence_snippet(skill_name, text)
            
            detected_skills[skill_name] = ExtractedSkill(
                name=skill_name,
                category=skill_info["category"],
                confidence=confidence,
                evidence=[evidence] if evidence else []
            )

    def _find_evidence_snippet(self, skill_name: str, text: str) -> str:
        """Find a snippet of text that mentions the skill."""
        # Simple approach: find the sentence containing the skill
        sentences = re.split(r'[.!?]+', text)
        for sentence in sentences:
            if skill_name.lower() in sentence.lower():
                # Clean up the sentence
                cleaned = sentence.strip()
                if len(cleaned) > 200:
                    cleaned = cleaned[:200] + "..."
                return cleaned
        
        # Fallback: return a short context around the skill
        skill_pos = text.lower().find(skill_name.lower())
        if skill_pos != -1:
            start = max(0, skill_pos - 50)
            end = min(len(text), skill_pos + len(skill_name) + 50)
            snippet = text[start:end]
            if len(snippet) > 200:
                snippet = "..." + snippet[:200] + "..."
            return snippet
        
        return ""

    def get_skill_importance(self, skill_name: str, jd_text: str) -> float:
        """Calculate skill importance based on JD context."""
        if not jd_text:
            return 0.5
        
        jd_lower = jd_text.lower()
        importance = 0.5  # Base importance
        
        # Boost for skills in requirements sections
        if any(phrase in jd_lower for phrase in ["requirements", "must have", "required", "essential"]):
            importance += 0.3
        
        # Boost for skills in job title
        if skill_name.lower() in jd_lower:
            importance += 0.2
        
        # Boost for skills mentioned multiple times
        skill_count = jd_lower.count(skill_name.lower())
        if skill_count > 1:
            importance += min(0.1 * skill_count, 0.2)
        
        return min(importance, 1.0)
