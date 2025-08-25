import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SkillGapChart = ({ analysis }) => {
  // Prepare data for the chart
  const prepareChartData = () => {
    const data = [];
    
    // Add matched skills
    analysis.matched_skills.forEach(skill => {
      data.push({
        name: skill.name,
        importance: 100, // Full importance since it's matched
        confidence: Math.round(skill.confidence * 100),
        type: 'matched',
        color: '#10B981' // Green
      });
    });
    
    // Add missing skills
    analysis.missing_skills.forEach(skill => {
      data.push({
        name: skill.name,
        importance: Math.round(skill.importance * 100),
        confidence: 0, // No confidence since it's missing
        type: 'missing',
        color: '#EF4444' // Red
      });
    });
    
    // Add nice to have skills
    analysis.nice_to_have_skills.forEach(skill => {
      data.push({
        name: skill.name,
        importance: Math.round(skill.importance * 100),
        confidence: 0, // No confidence since it's missing
        type: 'nice_to_have',
        color: '#3B82F6' // Blue
      });
    });
    
    // Sort by importance (descending)
    return data.sort((a, b) => b.importance - a.importance).slice(0, 15); // Show top 15
  };

  const chartData = prepareChartData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Importance: {data.importance}%
          </p>
          {data.type === 'matched' && (
            <p className="text-sm text-green-600">
              Confidence: {data.confidence}%
            </p>
          )}
          <p className="text-xs text-gray-500 capitalize">
            {data.type.replace('_', ' ')}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No skills data available for visualization
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          This chart shows skill importance (job requirement) vs. presence in your resume.
        </p>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Matched Skills</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Missing Skills</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Nice to Have</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#6B7280"
            label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Importance bars (background) */}
          <Bar
            dataKey="importance"
            fill="#E5E7EB"
            radius={[2, 2, 0, 0]}
            opacity={0.3}
          />
          
          {/* Confidence bars (foreground) */}
          <Bar
            dataKey="confidence"
            fill="#10B981"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>
          <strong>Green bars:</strong> Skills you have (height shows confidence level)
        </p>
        <p>
          <strong>Gray bars:</strong> Total importance of each skill in the job description
        </p>
      </div>
    </div>
  );
};

export default SkillGapChart;
