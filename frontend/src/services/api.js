import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response.data;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.detail || error.response.data?.message || 'Server error';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// Resume upload
export const uploadResume = async (formData) => {
  try {
    const response = await api.post('/api/v1/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Job description upload
export const uploadJobDescription = async (formData) => {
  try {
    const response = await api.post('/api/v1/upload-job', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Analyze resume against job description
export const analyzeResume = async (resumeId, jdId, targetRole = null) => {
  try {
    const payload = {
      resume_id: resumeId,
      jd_id: jdId,
    };
    
    if (targetRole) {
      payload.target_role = targetRole;
    }
    
    const response = await api.post('/api/v1/analyze', payload);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get analysis history
export const getHistory = async (limit = 20, offset = 0) => {
  try {
    const response = await api.get('/api/v1/history', {
      params: { limit, offset },
    });
    return response.items || [];
  } catch (error) {
    throw error;
  }
};

// Get specific analysis
export const getAnalysis = async (analysisId) => {
  try {
    const response = await api.get(`/api/v1/analysis/${analysisId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete analysis
export const deleteAnalysis = async (analysisId) => {
  try {
    const response = await api.delete(`/api/v1/analysis/${analysisId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete document
export const deleteDocument = async (documentId) => {
  try {
    const response = await api.delete(`/api/v1/document/${documentId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/api/v1/health');
    return response;
  } catch (error) {
    throw error;
  }
};

// Get system stats
export const getSystemStats = async () => {
  try {
    const response = await api.get('/api/v1/stats');
    return response;
  } catch (error) {
    throw error;
  }
};

// Get API info
export const getApiInfo = async () => {
  try {
    const response = await api.get('/api');
    return response;
  } catch (error) {
    throw error;
  }
};

export default api;
