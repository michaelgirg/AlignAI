import React from 'react';
import { Target, Github, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">AlignAI</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">
              AI-powered resume-job description matching and analysis. Get detailed insights into 
              skill gaps, strengths, and actionable recommendations to improve your job applications.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/analyze" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Analyze Resume
                </a>
              </li>
              <li>
                <a href="/history" className="text-gray-300 hover:text-white text-sm transition-colors">
                  Analysis History
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">
              Contact
            </h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:support@alignai.com" 
                  className="flex items-center space-x-2 text-gray-300 hover:text-white text-sm transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Support</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/alignai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white text-sm transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 AlignAI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
