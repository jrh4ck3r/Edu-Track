
import React, { useState, useEffect } from 'react';
import { Mark, Feedback, WellBeingStatus } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { SUBJECTS_LIST, COLORS } from '../constants';
import AnalysisCard from './AnalysisCard';
import { getAcademicInsights, getGradePrediction } from '../services/geminiService';
import { Sparkles, Download, MessageSquare, Heart, TrendingUp, BrainCircuit, Loader2 } from 'lucide-react';

interface Prediction {
  subject: string;
  currentScore: number;
  predictedScore: number;
  reasoning: string;
}

interface StudentDashboardProps {
  studentName: string;
  marks: Mark[];
  feedbacks: Feedback[];
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ studentName, marks, feedbacks }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const chartData = SUBJECTS_LIST.map(sub => {
    const mark = marks.find(m => m.subjectId === sub.id);
    return {
      subject: sub.name,
      score: mark ? (mark.score / mark.maxScore) * 100 : 0,
    };
  });

  const generateAIReport = async () => {
    setIsGeneratingInsight(true);
    const result = await getAcademicInsights(marks, feedbacks);
    setAiInsight(result);
    setIsGeneratingInsight(false);
  };

  const generatePredictions = async () => {
    setIsPredicting(true);
    try {
      const result = await getGradePrediction(marks, feedbacks);
      setPredictions(result);
    } catch (error) {
      alert("Failed to generate predictions. Please try again.");
    } finally {
      setIsPredicting(false);
    }
  };

  const latestWellBeing = feedbacks[0]?.wellBeing || WellBeingStatus.GOOD;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Academic Portal</h1>
          <p className="text-slate-500">Monitoring performance for <span className="text-indigo-600 font-semibold">{studentName}</span></p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={generatePredictions}
            disabled={isPredicting}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg shadow-sm hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            {isPredicting ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
            Predict Final Grades
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      <AnalysisCard marks={marks} />

      {/* Prediction Results Banner */}
      {predictions && (
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-2xl border-2 border-indigo-100 shadow-xl shadow-indigo-50 overflow-hidden">
            <div className="bg-indigo-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} />
                <h3 className="font-bold">AI Grade Forecasting (Final Exams)</h3>
              </div>
              <button onClick={() => setPredictions(null)} className="text-white/60 hover:text-white">✕</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {predictions.map((p, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800">{p.subject}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      p.predictedScore > p.currentScore ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {p.predictedScore > p.currentScore ? 'Upward Trend' : 'Steady Trend'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-black text-indigo-600">{p.predictedScore}%</span>
                    <span className="text-xs text-slate-400">Predicted (current: {p.currentScore}%)</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed italic line-clamp-2" title={p.reasoning}>
                    "{p.reasoning}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="text-indigo-600" size={20} />
              Current Subject Performance
            </h3>
            <span className="text-xs font-medium text-slate-400">Values in %</span>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" fill={COLORS.PRIMARY} radius={[6, 6, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback & Well-being */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Heart className="text-rose-600" size={20} />
            Well-being Status
          </h3>
          
          <div className="flex-1">
            <div className={`mb-6 p-5 rounded-2xl flex items-center gap-4 border ${
              latestWellBeing === WellBeingStatus.GOOD ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
              latestWellBeing === WellBeingStatus.MODERATE ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}>
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-3xl shadow-sm">
                {latestWellBeing === WellBeingStatus.GOOD ? '😊' : latestWellBeing === WellBeingStatus.MODERATE ? '😐' : '⚠️'}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-60">Mental Health</p>
                <p className="text-2xl font-black">{latestWellBeing}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2 tracking-widest">
                <MessageSquare size={14} />
                Latest Instructor Notes
              </h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
                <p className="text-slate-700 text-sm leading-relaxed italic relative z-10">
                  "{feedbacks[0]?.comment || "Your instructor hasn't posted any notes yet."}"
                </p>
                <div className="absolute -top-2 -left-2 text-indigo-100">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21ZM3 21L3 18C3 16.8954 3.89543 16 5 16H8C9.10457 16 10 16.8954 10 18V21C10 22.1046 9.10457 23 8 23H5C3.89543 23 3 22.1046 3 21ZM5 3V11C5 12.6569 6.34315 14 8 14H16C17.6569 14 19 12.6569 19 11V3"/></svg>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 font-medium text-right uppercase tracking-wider">
                — {feedbacks[0] ? `Updated on ${feedbacks[0].date}` : 'Awaiting Update'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Performance Assistant Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400 border border-indigo-500/30">
              <Sparkles size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">AI Academic Coach</h2>
              <p className="text-indigo-400/80 text-sm font-medium">Powered by Gemini 3.0 Flash</p>
            </div>
          </div>
          
          {aiInsight ? (
            <div className="prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-indigo-100/90 leading-relaxed text-lg font-medium bg-white/5 p-6 rounded-2xl border border-white/10">
                {aiInsight}
              </div>
              <button 
                onClick={() => setAiInsight(null)}
                className="mt-6 text-sm text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-widest flex items-center gap-2"
              >
                Reset Analysis
              </button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <p className="text-indigo-50 text-xl font-medium mb-8 leading-relaxed">
                  Analyze your performance trends, identify hidden learning patterns, and receive a customized 4-week improvement plan.
                </p>
                <button
                  onClick={generateAIReport}
                  disabled={isGeneratingInsight}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 disabled:opacity-50 text-lg"
                >
                  {isGeneratingInsight ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      Consulting Tutor...
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} />
                      Generate Study Plan
                    </>
                  )}
                </button>
              </div>
              <div className="hidden md:block w-1/3 opacity-20 hover:opacity-40 transition-opacity">
                <BrainCircuit size={200} className="text-indigo-400" />
              </div>
            </div>
          )}
        </div>
        
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>
      </div>
    </div>
  );
};

const BarChart3 = ({ className, size }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
  </svg>
);

export default StudentDashboard;
