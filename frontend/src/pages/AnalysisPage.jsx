import React, { useState } from 'react';
import { useAnalysis } from '../contexts/AnalysisContext';
import { Upload, FileText, Target, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import DocumentUpload from '../components/DocumentUpload';
import AnalysisResults from '../components/AnalysisResults';
import SkillGapChart from '../components/SkillGapChart';

const AnalysisPage = () => {
  const {
    resume,
    jobDescription,
    analysis,
    loading,
    error,
    currentStep,
    uploadResumeFile,
    uploadResumeText,
    uploadJobDescriptionFile,
    uploadJobDescriptionText,
    performAnalysis,
    reset,
    clearError,
  } = useAnalysis();

  const [targetRole, setTargetRole] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);

  const handleAnalyze = async () => {
    try {
      await performAnalysis(targetRole || null);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleReset = () => {
    reset();
    setTargetRole('');
    setShowTextInput(false);
  };

  const canAnalyze = resume && jobDescription && !loading;

  if (currentStep === 'results' && analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={handleReset}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Start New Analysis
          </button>
        </div>
        <AnalysisResults analysis={analysis} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Resume Analysis
        </h1>
        <p className="text-xl text-gray-600">
          Upload your resume and job description to get AI-powered insights and recommendations.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-800">{error}</span>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800 text-sm mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Target Role Input */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Target Role (Optional)
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Specify the role you're applying for to get more accurate analysis and recommendations.
        </p>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g., Senior Software Engineer, Data Scientist, Product Manager"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Resume Upload */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-600" />
          Resume
        </h3>
        
        {!resume ? (
          <DocumentUpload
            onFileUpload={uploadResumeFile}
            onTextUpload={uploadResumeText}
            acceptedTypes={['.pdf', '.docx']}
            placeholder="Upload your resume (PDF/DOCX) or paste the text"
            showTextInput={showTextInput}
            setShowTextInput={setShowTextInput}
          />
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Resume uploaded successfully
                </span>
              </div>
              <button
                onClick={() => reset()}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                Change
              </button>
            </div>
            <div className="mt-2 text-sm text-green-700">
              <p>Document ID: {resume.document_id}</p>
              <p>Detected sections: {resume.detected_sections.join(', ')}</p>
              <p>Skills found: {resume.skills.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Job Description Upload */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Job Description
        </h3>
        
        {!jobDescription ? (
          <DocumentUpload
            onFileUpload={uploadJobDescriptionFile}
            onTextUpload={uploadJobDescriptionText}
            acceptedTypes={['.pdf', '.txt']}
            placeholder="Upload job description (PDF/TXT) or paste the text"
            showTextInput={showTextInput}
            setShowTextInput={setShowTextInput}
          />
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  Job description uploaded successfully
                </span>
              </div>
              <button
                onClick={() => reset()}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                Change
              </button>
            </div>
            <div className="mt-2 text-sm text-green-700">
              <p>Document ID: {jobDescription.document_id}</p>
              <p>Skills identified: {jobDescription.skills.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Button */}
      <div className="text-center">
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze || loading}
          className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
            canAnalyze && !loading
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Analyze Resume</span>
            </div>
          )}
        </button>
        
        {!canAnalyze && (
          <p className="text-gray-500 mt-2 text-sm">
            Please upload both resume and job description to continue
          </p>
        )}
      </div>

      {/* Progress Indicator */}
      {loading && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing your documents...</span>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            This usually takes 3-7 seconds
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPage;
