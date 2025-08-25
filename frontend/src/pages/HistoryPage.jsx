import React, { useState } from 'react';
import { useAnalysis } from '../contexts/AnalysisContext';
import { BarChart3, Calendar, Target, Eye, Trash2 } from 'lucide-react';

const HistoryPage = () => {
  const { history, loading, deleteAnalysis } = useAnalysis();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState(null);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreBand = (score) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Moderate';
    return 'Low';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (analysisId) => {
    if (window.confirm('Are you sure you want to delete this analysis? This action cannot be undone.')) {
      setDeletingId(analysisId);
      try {
        await deleteAnalysis(analysisId);
        // Refresh the page to show updated history
        window.location.reload();
      } catch (error) {
        console.error('Failed to delete analysis:', error);
        alert('Failed to delete analysis. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Pagination
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHistory = history.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analysis history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Analysis History
        </h1>
        <p className="text-xl text-gray-600">
          Review your previous resume analyses and track your progress over time.
        </p>
      </div>

      {/* Stats Summary */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{history.length}</div>
            <div className="text-gray-600">Total Analyses</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {history.filter(item => item.score >= 80).length}
            </div>
            <div className="text-gray-600">Strong Matches</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {history.filter(item => item.score >= 60 && item.score < 80).length}
            </div>
            <div className="text-gray-600">Moderate Matches</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {history.filter(item => item.score < 60).length}
            </div>
            <div className="text-gray-600">Low Matches</div>
          </div>
        </div>
      )}

      {/* History List */}
      {history.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analyses yet</h3>
          <p className="text-gray-600 mb-6">
            Start by analyzing your first resume against a job description.
          </p>
          <a
            href="/analyze"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start Your First Analysis
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Analysis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentHistory.map((item) => (
                  <tr key={item.analysis_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Target className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Analysis {item.analysis_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            Resume: {item.resume_id} | JD: {item.jd_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(item.score)}`}>
                          {item.score}/100
                        </span>
                        <span className="text-sm text-gray-500">
                          ({getScoreBand(item.score)})
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(item.created_at)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(`/analysis/${item.analysis_id}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="View Analysis"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.analysis_id)}
                          disabled={deletingId === item.analysis_id}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                          title="Delete Analysis"
                        >
                          {deletingId === item.analysis_id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(endIndex, history.length)} of {history.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
