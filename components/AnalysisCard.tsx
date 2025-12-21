
import React from 'react';
import { Mark, PerformanceSummary } from '../types';
import { THRESHOLDS, SUBJECTS_LIST } from '../constants';
import { TrendingUp, AlertTriangle, Lightbulb, BarChart3 } from 'lucide-react';

interface AnalysisCardProps {
  marks: Mark[];
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ marks }) => {
  const calculateAnalysis = (): PerformanceSummary => {
    if (marks.length === 0) return { average: 0, strengths: [], weaknesses: [], recommendations: [] };

    const total = marks.reduce((acc, m) => acc + (m.score / m.maxScore) * 100, 0);
    const average = total / marks.length;

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    marks.forEach(m => {
      const percentage = (m.score / m.maxScore) * 100;
      const subjectName = SUBJECTS_LIST.find(s => s.id === m.subjectId)?.name || 'Unknown';

      if (percentage >= THRESHOLDS.GOOD) {
        strengths.push(subjectName);
      } else if (percentage < THRESHOLDS.NEEDS_IMPROVEMENT) {
        weaknesses.push(subjectName);
        recommendations.push(`Extra focus needed on ${subjectName} foundational concepts.`);
      }
    });

    return { average, strengths, weaknesses, recommendations };
  };

  const analysis = calculateAnalysis();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <BarChart3 size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Avg. Performance</h3>
        </div>
        <p className="text-3xl font-bold text-slate-800">{analysis.average.toFixed(1)}%</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
            <TrendingUp size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Strengths</h3>
        </div>
        <p className="text-lg font-medium text-slate-700">
          {analysis.strengths.length > 0 ? analysis.strengths.slice(0, 2).join(', ') + (analysis.strengths.length > 2 ? '...' : '') : 'N/A'}
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Critical Areas</h3>
        </div>
        <p className="text-lg font-medium text-slate-700">
          {analysis.weaknesses.length > 0 ? analysis.weaknesses.slice(0, 2).join(', ') + (analysis.weaknesses.length > 2 ? '...' : '') : 'None'}
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
            <Lightbulb size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Next Step</h3>
        </div>
        <p className="text-sm font-medium text-slate-600 italic">
          {analysis.recommendations[0] || "Maintain current progress!"}
        </p>
      </div>
    </div>
  );
};

export default AnalysisCard;
