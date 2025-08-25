import numpy as np
import logging
from typing import Dict, List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        """Initialize the embedding service with TF-IDF vectorizer."""
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.9
        )
        self.dimension = 1000  # TF-IDF feature dimension
        self.fitted = False

    def embed_text(self, text: str) -> List[float]:
        """Generate TF-IDF vector for text."""
        try:
            if not text or not text.strip():
                return [0.0] * self.dimension
            
            # Fit vectorizer if not already fitted
            if not self.fitted:
                self.vectorizer.fit([text])
                self.fitted = True
            
            # Transform text to vector
            vector = self.vectorizer.transform([text]).toarray()[0]
            
            # Normalize vector
            norm = np.linalg.norm(vector)
            if norm > 0:
                vector = vector / norm
            
            return vector.tolist()
            
        except Exception as e:
            logger.error(f"Failed to embed text: {e}")
            return [0.0] * self.dimension

    def embed_document(self, text: str, sections: Optional[List[Dict]] = None) -> Dict[str, List[float]]:
        """Generate embeddings for document and its sections."""
        try:
            result = {
                "document": self.embed_text(text)
            }
            
            if sections:
                for section in sections:
                    section_name = section.get("name", "unknown")
                    section_text = section.get("text", "")
                    result[section_name] = self.embed_text(section_text)
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to embed document: {e}")
            return {"document": [0.0] * self.dimension}

    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings."""
        try:
            if not embedding1 or not embedding2:
                return 0.0
            
            # Convert to numpy arrays
            vec1 = np.array(embedding1)
            vec2 = np.array(embedding2)
            
            # Ensure same dimensions
            if vec1.shape != vec2.shape:
                min_dim = min(len(vec1), len(vec2))
                vec1 = vec1[:min_dim]
                vec2 = vec2[:min_dim]
            
            # Calculate cosine similarity
            similarity = cosine_similarity([vec1], [vec2])[0][0]
            
            # Ensure result is in [0, 1] range
            return max(0.0, min(1.0, similarity))
            
        except Exception as e:
            logger.error(f"Failed to calculate similarity: {e}")
            return 0.0

    def calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two text strings directly."""
        try:
            if not text1 or not text2:
                return 0.0
            
            # Generate embeddings
            emb1 = self.embed_text(text1)
            emb2 = self.embed_text(text2)
            
            # Calculate similarity
            return self.calculate_similarity(emb1, emb2)
            
        except Exception as e:
            logger.error(f"Failed to calculate text similarity: {e}")
            return 0.0

    def normalize_embedding(self, embedding: List[float]) -> List[float]:
        """Normalize embedding vector to unit length."""
        try:
            if not embedding:
                return [0.0] * self.dimension
            
            vec = np.array(embedding)
            norm = np.linalg.norm(vec)
            
            if norm > 0:
                normalized = vec / norm
                return normalized.tolist()
            else:
                return [0.0] * self.dimension
                
        except Exception as e:
            logger.error(f"Failed to normalize embedding: {e}")
            return [0.0] * self.dimension
