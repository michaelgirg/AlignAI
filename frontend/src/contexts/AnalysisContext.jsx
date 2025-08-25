import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { analyzeResume, uploadResume, uploadJobDescription, getHistory } from '../services/api';

const AnalysisContext = createContext();

const initialState = {
  resume: null,
  jobDescription: null,
  analysis: null,
  history: [],
  loading: false,
  error: null,
  currentStep: 'upload', // upload, analyzing, results
};

const analysisReducer = (state, action) => {
  switch (action.type) {
    case 'SET_RESUME':
      return { ...state, resume: action.payload, error: null };
    
    case 'SET_JOB_DESCRIPTION':
      return { ...state, jobDescription: action.payload, error: null };
    
    case 'SET_ANALYSIS':
      return { ...state, analysis: action.payload, currentStep: 'results', error: null };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'SET_HISTORY':
      return { ...state, history: action.payload };
    
    case 'RESET':
      return { ...initialState, history: state.history };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

export const AnalysisProvider = ({ children }) => {
  const [state, dispatch] = useReducer(analysisReducer, initialState);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await getHistory();
      dispatch({ type: 'SET_HISTORY', payload: history });
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const uploadResumeFile = async (file) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await uploadResume(formData);
      
      dispatch({ type: 'SET_RESUME', payload: result });
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const uploadResumeText = async (text) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const formData = new FormData();
      formData.append('text', text);
      
      const result = await uploadResume(formData);
      
      dispatch({ type: 'SET_RESUME', payload: result });
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const uploadJobDescriptionFile = async (file) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await uploadJobDescription(formData);
      
      dispatch({ type: 'SET_JOB_DESCRIPTION', payload: result });
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const uploadJobDescriptionText = async (text) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const formData = new FormData();
      formData.append('text', text);
      
      const result = await uploadJobDescription(formData);
      
      dispatch({ type: 'SET_JOB_DESCRIPTION', payload: result });
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const performAnalysis = async (targetRole = null) => {
    try {
      if (!state.resume || !state.jobDescription) {
        throw new Error('Both resume and job description are required');
      }
      
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'analyzing' });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const analysis = await analyzeResume(
        state.resume.document_id,
        state.jobDescription.document_id,
        targetRole
      );
      
      dispatch({ type: 'SET_ANALYSIS', payload: analysis });
      
      // Reload history to include new analysis
      await loadHistory();
      
      return analysis;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'SET_CURRENT_STEP', payload: 'upload' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const reset = () => {
    dispatch({ type: 'RESET' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    uploadResumeFile,
    uploadResumeText,
    uploadJobDescriptionFile,
    uploadJobDescriptionText,
    performAnalysis,
    reset,
    clearError,
    loadHistory,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};
