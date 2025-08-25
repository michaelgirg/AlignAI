import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Upload, BarChart3, Zap, Shield, Users } from 'lucide-react';

const HomePage = () => {
  const features = [
    {
      icon: Upload,
      title: 'Easy Upload',
      description: 'Upload your resume (PDF/DOCX) and paste job descriptions or upload files. Our AI handles the rest.',
    },
    {
      icon: Target,
      title: 'Smart Analysis',
      description: 'AI-powered skill extraction, semantic matching, and comprehensive gap analysis.',
    },
    {
      icon: BarChart3,
      title: 'Detailed Insights',
      description: 'Get matched skills, missing requirements, strengths, risks, and actionable recommendations.',
    },
    {
      icon: Zap,
      title: 'Fast Results',
      description: 'Complete analysis in under 7 seconds with detailed explanations and evidence snippets.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is processed securely with optional PII redaction and automatic cleanup.',
    },
    {
      icon: Users,
      title: 'For Everyone',
      description: 'Job seekers, recruiters, and career services can all benefit from our analysis.',
    },
  ];

  const stats = [
    { label: 'Skills Detected', value: '100+' },
    { label: 'File Formats', value: 'PDF, DOCX, TXT' },
    { label: 'Analysis Time', value: '< 7s' },
    { label: 'Accuracy', value: '90%+' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <Target className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Align Your Resume with
              <span className="block text-blue-200">Job Requirements</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              AI-powered analysis that shows exactly how well your resume matches a job description, 
              with detailed skill gaps, strengths, and actionable recommendations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/analyze"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                Start Analyzing
              </Link>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI analyzes your resume against job descriptions using advanced NLP and machine learning techniques.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Improve Your Job Applications?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Get instant insights into how well your resume matches job requirements and 
            receive actionable advice to improve your chances.
          </p>
          <Link
            to="/analyze"
            className="inline-block bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Start Your Analysis
          </Link>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
            Simple 3-Step Process
          </h2>
          
          <div className="space-y-12">
            {[
              {
                step: '1',
                title: 'Upload Your Resume',
                description: 'Upload your resume as PDF or DOCX, or simply paste the text. Our AI will extract and analyze your skills, experience, and qualifications.',
              },
              {
                step: '2',
                title: 'Add Job Description',
                description: 'Paste the job description text or upload a file. We\'ll identify required skills, experience levels, and key requirements.',
              },
              {
                step: '3',
                title: 'Get Detailed Analysis',
                description: 'Receive a comprehensive score, skill gap analysis, strengths identification, and actionable recommendations to improve your resume.',
              },
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
