import React, { useState } from 'react';
import { Download, Copy, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import SkillGapChart from './SkillGapChart';

const AnalysisResults = ({ analysis }) => {
  const [copied, setCopied] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBand = (score) => {
    if (score >= 80) return 'Strong Match';
    if (score >= 60) return 'Moderate Match';
    return 'Low Match';
  };

  const getScoreBandColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const copyToClipboard = async () => {
    const summary = `
AlignAI Analysis Summary
Score: ${analysis.score}/100 (${getScoreBand(analysis.score)})

Matched Skills: ${analysis.matched_skills.length}
Missing Skills: ${analysis.missing_skills.length}
Nice to Have: ${analysis.nice_to_have_skills.length}

Strengths:
${analysis.strengths.map(s => `• ${s}`).join('\n')}

Areas for Improvement:
${analysis.risks.map(r => `• ${r}`).join('\n')}

Recommendations:
${analysis.recommendations.map(r => `• ${r}`).join('\n')}
    `.trim();

    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadJSON = () => {
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alignai-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Score Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-4 mb-4">
          <div className={`text-6xl font-bold ${getScoreColor(analysis.score)}`}>
            {analysis.score}
          </div>
          <div className="text-left">
            <div className="text-2xl font-semibold text-gray-900">/100</div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBandColor(analysis.score)}`}>
              {getScoreBand(analysis.score)}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>
          <button
            onClick={downloadJSON}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON</span>
          </button>
        </div>
      </div>

      {/* Score Components */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Semantic Similarity</h3>
          <div className="text-3xl font-bold text-blue-600">
            {Math.round(analysis.components.semantic_similarity * 100)}%
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Overall content alignment between resume and job description
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Skill Coverage</h3>
          <div className="text-3xl font-bold text-green-600">
            {Math.round(analysis.components.skill_coverage * 100)}%
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Required skills present in your resume
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Experience Alignment</h3>
          <div className="text-3xl font-bold text-purple-600">
            {Math.round(analysis.components.experience_alignment * 100)}%
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Seniority and domain experience match
          </p>
        </div>
      </div>

      {/* Skill Gap Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Gap Analysis</h3>
        <SkillGapChart analysis={analysis} />
      </div>

      {/* Matched Skills */}
      {analysis.matched_skills.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Matched Skills ({analysis.matched_skills.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.matched_skills.map((skill, index) => (
              <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-green-800">{skill.name}</h4>
                  <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                    {Math.round(skill.confidence * 100)}%
                  </span>
                </div>
                {skill.evidence && skill.evidence.length > 0 && (
                  <div className="text-sm text-green-700">
                    <p className="font-medium mb-1">Evidence:</p>
                    {skill.evidence.map((evidence, idx) => (
                      <p key={idx} className="text-xs bg-white p-2 rounded mb-1">
                        "{evidence}"
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Skills */}
      {analysis.missing_skills.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            Missing Skills ({analysis.missing_skills.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.missing_skills.map((skill, index) => (
              <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-red-800">{skill.name}</h4>
                  <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded">
                    {Math.round(skill.importance * 100)}% important
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nice to Have Skills */}
      {analysis.nice_to_have_skills.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Info className="w-5 h-5 text-blue-600 mr-2" />
            Nice to Have Skills ({analysis.nice_to_have_skills.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.nice_to_have_skills.map((skill, index) => (
              <div key={index} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-blue-800">{skill.name}</h4>
                  <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {Math.round(skill.importance * 100)}% important
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths and Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risks */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {analysis.risks.map((risk, index) => (
              <li key={index} className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actionable Recommendations</h3>
        <div className="space-y-3">
          {analysis.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {index + 1}
              </div>
              <p className="text-gray-700">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Snippets */}
      {(analysis.snippets.resume.length > 0 || analysis.snippets.jd.length > 0) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidence Snippets</h3>
          
          {analysis.snippets.resume.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">From Resume:</h4>
              <div className="space-y-2">
                {analysis.snippets.resume.map((snippet, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                    <p className="text-sm text-gray-700">"{snippet.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {analysis.snippets.jd.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-3">From Job Description:</h4>
              <div className="space-y-2">
                {analysis.snippets.jd.map((snippet, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-green-500">
                    <p className="text-sm text-gray-700">"{snippet.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;
