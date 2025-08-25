# AlignAI - AI-Powered Resume-Job Description Matching

AlignAI is an intelligent system that analyzes how well a candidate's resume matches a job description, providing detailed insights, skill gap analysis, and actionable recommendations.

## 🚀 Features

- **Smart Document Processing**: Upload resumes (PDF/DOCX) and job descriptions (PDF/TXT) or paste text
- **AI-Powered Analysis**: Uses Sentence-BERT embeddings and advanced NLP for semantic matching
- **Comprehensive Scoring**: 0-100 score with breakdown into semantic similarity, skill coverage, and experience alignment
- **Skill Gap Analysis**: Identifies matched, missing, and nice-to-have skills with confidence scores
- **Actionable Insights**: Provides strengths, risks, and specific recommendations for improvement
- **Evidence Snippets**: Shows supporting text from both resume and job description
- **Beautiful UI**: Modern, responsive interface built with React and Tailwind CSS

## 🏗️ Architecture

### Backend (Python/FastAPI)
- **Text Processing**: PDF/DOCX extraction, normalization, and section detection
- **Skill Extraction**: Hybrid approach using spaCy NER, pattern matching, and fuzzy matching
- **Embedding Service**: Sentence-BERT for semantic similarity calculations
- **Scoring Engine**: Multi-component scoring with configurable weights
- **Analysis Pipeline**: End-to-end processing from document upload to results

### Frontend (React)
- **Modern UI**: Built with React 18, Tailwind CSS, and Lucide icons
- **State Management**: Context API for global state management
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Interactive Charts**: Recharts for skill gap visualization
- **File Handling**: Drag-and-drop uploads with validation

## 📋 Requirements

### Backend
- Python 3.8+
- FastAPI
- spaCy with English model
- Sentence Transformers
- PDF and DOCX processing libraries

### Frontend
- Node.js 16+
- React 18
- Vite build tool
- Tailwind CSS

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AlignAI
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy English model
python -m spacy download en_core_web_sm

# Start the server
python main.py
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8000
```

### Backend Configuration
The backend uses default configurations that can be modified in the respective service files:
- Model weights in `scoring_engine.py`
- Skill ontology in `skill_extractor.py`
- File size limits in the API routes

## 📖 API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

### Key Endpoints
- `POST /api/v1/upload-resume` - Upload resume document or text
- `POST /api/v1/upload-job` - Upload job description document or text
- `POST /api/v1/analyze` - Perform analysis
- `GET /api/v1/history` - Get analysis history
- `GET /api/v1/analysis/{id}` - Get specific analysis

## 🎯 Usage

### 1. Upload Resume
- Drag and drop a PDF/DOCX file or paste text
- The system will extract skills and detect document sections

### 2. Add Job Description
- Paste job description text or upload a file
- Specify target role for better analysis (optional)

### 3. Analyze
- Click "Analyze Resume" to start the AI analysis
- Wait for processing (typically 3-7 seconds)

### 4. Review Results
- View your overall score (0-100)
- Examine skill gaps and matches
- Read actionable recommendations
- Download results as JSON

## 🔍 How It Works

### Text Processing Pipeline
1. **Document Extraction**: Convert PDF/DOCX to plain text
2. **Normalization**: Clean and standardize text format
3. **Section Detection**: Identify resume sections (experience, skills, education)
4. **Skill Extraction**: Use NLP to identify technical skills and tools

### Analysis Engine
1. **Semantic Similarity**: Compare document embeddings using Sentence-BERT
2. **Skill Coverage**: Calculate weighted coverage of required skills
3. **Experience Alignment**: Match seniority levels and domain expertise
4. **Scoring**: Combine components with configurable weights

### Results Generation
1. **Skill Classification**: Categorize skills as matched, missing, or nice-to-have
2. **Evidence Collection**: Gather supporting text snippets
3. **Recommendation Engine**: Generate actionable advice based on gaps
4. **Visualization**: Create charts and summaries for easy understanding

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment
```bash
# Build production image
docker build -t alignai-backend .

# Run container
docker run -p 8000:8000 alignai-backend
```

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting service
```

## 📊 Performance

- **Document Processing**: < 2.5 seconds for typical 2-page resume
- **Analysis Time**: < 7 seconds end-to-end (P95)
- **File Size Limits**: 6MB for resumes, 3MB for job descriptions
- **Concurrent Users**: Designed for moderate load (can be scaled)

## 🔒 Security & Privacy

- **Data Processing**: Files processed in memory when possible
- **PII Protection**: Optional redaction of personal information
- **Auto-cleanup**: Automatic deletion of artifacts after 7 days
- **No Storage**: V1 uses in-memory storage (configure database for production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the code comments for implementation details

## 🔮 Roadmap

### v1.1
- Database persistence
- User authentication
- Batch processing

### v1.2
- Multi-language support
- Custom skill taxonomies
- Export to PDF reports

### v2.0
- Advanced ML models
- Company-specific ontologies
- Integration APIs

---

**AlignAI** - Making job applications smarter, one resume at a time. 🎯