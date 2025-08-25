import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnalysisProvider } from './contexts/AnalysisContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';
import HistoryPage from './pages/HistoryPage';
import './index.css';

function App() {
  return (
    <Router>
      <AnalysisProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/analyze" element={<AnalysisPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AnalysisProvider>
    </Router>
  );
}

export default App;
