import React, { useState, useMemo } from 'react';
import { Mark, Feedback, WellBeingStatus, User, Appointment, AvailabilitySlot, DiscussionPost, DiscussionReply, Badge, BehaviorLog, PAJSKRecord, Announcement } from '../types';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { SUBJECTS_LIST, COLORS } from '../constants';
import AnalysisCard from './AnalysisCard';
import { getAcademicInsights, getGradePrediction } from '../services/geminiService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Sparkles, Download, MessageSquare, Heart, TrendingUp, BrainCircuit, Loader2, Calendar, Clock, User as UserIcon, Send, MessageCircle, Plus, FileText, CheckCircle, XCircle, Award, AlertCircle, Megaphone } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Prediction {
  subject: string;
  currentScore: number;
  predictedScore: number;
  reasoning: string;
}

interface StudentDashboardProps {
  student: User;
  marks: Mark[];
  allFeedback: Feedback[];
  teachers: User[];
  appointments: Appointment[];
  availabilitySlots: AvailabilitySlot[];
  onRequestAppointment: (appt: Omit<Appointment, 'id' | 'status'>) => void;
  discussions: DiscussionPost[];
  onCreateDiscussion: (post: Omit<DiscussionPost, 'id' | 'timestamp' | 'likes' | 'replies'>) => void;
  onReplyDiscussion: (postId: string, reply: Omit<DiscussionReply, 'id' | 'timestamp'>) => void;
  attendance: any[]; // Using any temporarily or importation AttendanceRecord
  resources: any[]; // Using any temporarily or importation Resource
  onGetDownloadUrl: (fileId: string) => Promise<string | null>;
  onOpenMessage?: (userId: string) => void;
  badges?: Badge[];
  behaviorLogs?: BehaviorLog[];
  pajskRecords?: PAJSKRecord[];
  announcements?: Announcement[];
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student, marks, allFeedback, teachers, appointments, availabilitySlots,
  onRequestAppointment, discussions, onCreateDiscussion, onReplyDiscussion,
  attendance, resources, onGetDownloadUrl, onOpenMessage, badges = [], behaviorLogs = [], pajskRecords = [], announcements = []
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'community'>('overview');
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const performanceRef = React.useRef<HTMLDivElement>(null);

  // Mentorship State
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [apptReason, setApptReason] = useState('');

  // Forum State
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [viewPostId, setViewPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const chartData = useMemo(() => {
    return SUBJECTS_LIST.map(sub => {
      // Exclude PBD Formative from the percentage chart
      const numericalMarks = marks.filter(m => m.subjectId === sub.id && m.assessmentType !== 'PBD Formative');

      // Get the latest numerical mark for the chart, or average them. Using latest for now.
      const mark = numericalMarks[numericalMarks.length - 1];

      return {
        subject: sub.name,
        score: mark ? (mark.score / mark.maxScore) * 100 : 0,
      };
    });
  }, [marks]);

  const tooltipCursor = useMemo(() => ({ fill: '#f8fafc' }), []);
  const tooltipStyle = useMemo(() => ({ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }), []);

  const generateAIReport = async () => {
    setIsGeneratingInsight(true);
    const result = await getAcademicInsights(marks, allFeedback); // Using allFeedback as approx
    setAiInsight(result);
    setIsGeneratingInsight(false);
  };

  const generatePredictions = async () => {
    setIsPredicting(true);
    try {
      const result = await getGradePrediction(marks, allFeedback);
      setPredictions(result);
    } catch (error) {
      alert("Failed to generate predictions. Please try again.");
    } finally {
      setIsPredicting(false);
    }
  };

  const exportPDF = async () => {
    if (!performanceRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(performanceRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${student.name.replace(/\s+/g, '_')}_Performance_Report.pdf`);
    } catch (e) {
      alert("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleBookAppointment = () => {
    if (!selectedTeacherId || !selectedSlot || !apptReason) return;
    onRequestAppointment({
      studentId: student.id,
      teacherId: selectedTeacherId,
      date: selectedSlot.date,
      time: selectedSlot.time,
      reason: apptReason
    });
    alert("Appointment requested!");
    setSelectedSlot(null);
    setApptReason('');
  };

  const handleCreatePost = () => {
    if (!newPostTitle || !newPostContent) return;
    onCreateDiscussion({
      authorId: student.id,
      authorName: student.name,
      authorRole: student.role,
      title: newPostTitle,
      content: newPostContent
    });
    setShowNewPostModal(false);
    setNewPostTitle('');
    setNewPostContent('');
  };

  const handleReply = () => {
    if (!viewPostId || !replyContent) return;
    onReplyDiscussion(viewPostId, {
      authorName: student.name,
      authorRole: student.role,
      content: replyContent
    });
    setReplyContent('');
  };

  const handleDownload = async (fileId: string) => {
    try {
      const url = await onGetDownloadUrl(fileId);
      if (url) window.open(url, '_blank');
      else alert("Could not generate download link.");
    } catch (e) {
      alert("Error downloading file.");
    }
  };

  const latestWellBeing = allFeedback[0]?.wellBeing || WellBeingStatus.GOOD;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Student Portal</h1>
          <p className="text-slate-500 font-medium">Welcome back, <span className="text-indigo-600">{student.name}</span></p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto max-w-full">
          {(['overview', 'performance', 'community'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 flex-1 md:flex-none text-center rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Announcements Banner */}
          {announcements.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-[2rem] border border-amber-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-600"><Megaphone size={20} /></div>
                <h3 className="text-lg font-black text-slate-800">School Announcements</h3>
              </div>
              <div className="space-y-3">
                {announcements.slice(0, 3).map(a => (
                  <div key={a.id} className="bg-white/80 p-4 rounded-xl border border-amber-100/50">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-800 text-sm">{a.title}</h4>
                      <span className="text-[10px] font-mono text-slate-400">{new Date(a.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{a.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Attendance Bento Box */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center">
              <h3 className="text-lg font-black text-slate-800 mb-6 self-start flex items-center gap-2"><Calendar className="text-indigo-600" size={20} /> Attendance</h3>
              {(() => {
                const myAttendance = attendance.filter(a => a.studentId === student.id);
                const total = myAttendance.length;
                const present = myAttendance.filter(a => a.status === 'PRESENT').length;
                const late = myAttendance.filter(a => a.status === 'LATE').length;
                const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

                return (
                  <div className="relative inline-flex items-center justify-center mb-4">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={2 * Math.PI * 56} strokeDashoffset={2 * Math.PI * 56 * (1 - percentage / 100)} className={`text-indigo-600 transition-all duration-1000 ease-out`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-black text-slate-800">{percentage}%</span>
                    </div>
                  </div>
                );
              })()}
              <button onClick={() => setActiveTab('performance')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">View History &rarr;</button>
            </div>

            {/* Upcoming Mentorship Bento */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><Clock className="text-orange-500" size={20} /> Upcoming Setup</h3>
              <div className="flex-1 space-y-3">
                {appointments.filter(a => a.studentId === student.id && a.status === 'APPROVED').slice(0, 3).map(a => (
                  <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-slate-800 text-sm">{teachers.find(t => t.id === a.teacherId)?.name}</p>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">{a.date} • {a.time}</p>
                  </div>
                ))}
                {appointments.filter(a => a.studentId === student.id && a.status === 'APPROVED').length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                    <CheckCircle size={32} className="mb-2" />
                    <p className="text-sm font-bold">You're all caught up.</p>
                  </div>
                )}
              </div>
              <button onClick={() => setActiveTab('community')} className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-800 self-start">Book Session &rarr;</button>
            </div>

            {/* Recent Resources Bento */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><FileText className="text-emerald-500" size={20} /> New Files</h3>
              <div className="flex-1 flex flex-col gap-3">
                {resources.filter(r => r.classId === student.assignedClassId).slice(0, 3).map(res => (
                  <div key={res.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><FileText size={16} /></div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{res.title}</h4>
                      </div>
                    </div>
                    <button onClick={() => handleDownload(res.fileId)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"><Download size={16} /></button>
                  </div>
                ))}
                {resources.filter(r => r.classId === student.assignedClassId).length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 text-center">
                    <FileText size={32} className="mb-2" />
                    <p className="text-sm font-bold">No resources yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Gamification Badges Bento */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Award className="text-amber-500" size={20} /> My Badges
              </h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="grid grid-cols-2 gap-3">
                  {badges.length > 0 ? (
                    badges.map(badge => (
                      <div key={badge.id} className="flex flex-col items-center justify-center p-4 bg-amber-50 border border-amber-100 rounded-xl text-center group hover:bg-amber-100 transition-colors">
                        <span className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">{badge.icon}</span>
                        <p className="text-xs font-black text-amber-700 leading-tight">{badge.title}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 h-full flex flex-col items-center justify-center text-slate-400 opacity-60 text-center py-6">
                      <Award size={32} className="mb-2" />
                      <p className="text-sm font-bold">Earn badges from teachers!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Insight Snippet (Full Width) */}
            <div className="lg:col-span-4 bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-8 justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400"><Sparkles size={20} /></div>
                  <h2 className="text-xl font-black">AI Academic Coach</h2>
                </div>
                <p className="text-indigo-100/80 font-medium">Get a deep-dive analysis of your performance and a custom study blueprint.</p>
              </div>
              <button
                onClick={() => { setActiveTab('performance'); setTimeout(generateAIReport, 100); }}
                className="whitespace-nowrap bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                Analyze Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="animate-in fade-in duration-500" ref={performanceRef}>
          <div className="flex justify-end gap-3 mb-6" data-html2canvas-ignore>
            <button
              onClick={generatePredictions}
              disabled={isPredicting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg shadow-sm hover:bg-indigo-100 transition-colors disabled:opacity-50 font-bold text-sm"
            >
              {isPredicting ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
              AI Forecast
            </button>
            <button
              onClick={exportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-900 rounded-lg shadow-lg hover:bg-slate-800 transition-colors font-bold text-sm text-white disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </button>
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
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.predictedScore > p.currentScore ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
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
              <div className="h-[350px] w-full" style={{ minHeight: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={chartData}>
                    <XAxis dataKey="subject" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip
                      cursor={tooltipCursor}
                      contentStyle={tooltipStyle}
                    />
                    <Bar dataKey="score" fill={COLORS.PRIMARY} radius={[6, 6, 0, 0]} barSize={45} />
                  </RechartsBarChart>
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
                <div className={`mb-6 p-5 rounded-2xl flex items-center gap-4 border ${latestWellBeing === WellBeingStatus.GOOD ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
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

                {/* Recent Assessments List */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-8">
                  <h3 className="text-xl font-black mb-6 text-slate-800 flex items-center gap-2">
                    <FileText className="text-indigo-600" size={24} /> Recent Assessments
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-50 text-left">
                          <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">Subject</th>
                          <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment</th>
                          <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                          <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Score</th>
                          <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right pr-4">Paper</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {marks.filter(m => m.studentIcNumber === student.icNumber).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(mark => (
                          <tr key={mark.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 pl-4 font-bold text-slate-700">{SUBJECTS_LIST.find(s => s.id === mark.subjectId)?.name}</td>
                            <td className="py-4 text-sm text-slate-500 font-medium">{mark.assessmentType}</td>
                            <td className="py-4 text-sm text-slate-400 font-mono">{mark.date}</td>
                            <td className="py-4 text-right font-black text-indigo-600">
                              {mark.assessmentType === 'PBD Formative' && mark.grade ? (
                                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs">{mark.grade}</span>
                              ) : (
                                `${mark.score}/${mark.maxScore}`
                              )}
                            </td>
                            <td className="py-4 text-right pr-4">
                              {mark.attachmentId ? (
                                <button
                                  onClick={() => handleDownload(mark.attachmentId!)}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                                >
                                  <FileText size={14} /> View
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">No File</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {marks.filter(m => m.studentIcNumber === student.icNumber).length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400 italic">No assessments recorded yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2 tracking-widest">
                    <MessageSquare size={14} />
                    Latest Instructor Notes
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
                    <p className="text-slate-700 text-sm leading-relaxed italic relative z-10">
                      "{allFeedback[0]?.comment || "Your instructor hasn't posted any notes yet."}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Section (kept from original) */}
          <div className="bg-slate-900 rounded-[2rem] p-6 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
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
                    <button onClick={generateAIReport} disabled={isGeneratingInsight} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 disabled:opacity-50 text-lg">
                      {isGeneratingInsight ? <><Loader2 size={24} className="animate-spin" /> Consulting Tutor...</> : <><Sparkles size={24} /> Generate Study Plan</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Attendance History */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-[500px]">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Clock className="text-indigo-600" size={24} /> Attendance Log</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {attendance.filter(a => a.studentId === student.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                  <div key={record.id} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-10 rounded-full ${record.status === 'PRESENT' ? 'bg-emerald-500' : record.status === 'ABSENT' ? 'bg-rose-500' : record.status === 'LATE' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-600' : record.status === 'ABSENT' ? 'bg-rose-100 text-rose-600' : record.status === 'LATE' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>{record.status}</span>
                  </div>
                ))}
                {attendance.filter(a => a.studentId === student.id).length === 0 && (
                  <p className="text-center py-12 text-slate-400 italic">No attendance records found.</p>
                )}
              </div>
            </div>

            {/* Learning Resources */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-[500px]">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2"><FileText className="text-indigo-600" size={24} /> Learning Resources</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {resources.filter(r => r.classId === student.assignedClassId).map(res => (
                  <div key={res.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-sm transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-black text-slate-800 text-sm">{res.title}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">{res.subject}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{res.description || "No description provided."}</p>
                    <button onClick={() => handleDownload(res.fileId)} className="w-full py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center justify-center gap-2">
                      <Download size={14} /> Download
                    </button>
                  </div>
                ))}
                {resources.filter(r => r.classId === student.assignedClassId).length === 0 && (
                  <p className="text-center py-12 text-slate-400 italic">No resources available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Kokurikulum (PAJSK) Record */}
          <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 mb-8" data-html2canvas-ignore>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-100">
                <Award size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-800">Kokurikulum (PAJSK)</h2>
                <p className="text-slate-500 text-sm font-medium">Extracurricular achievements and involvement.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pajskRecords.length > 0 ? (
                pajskRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                  <div key={record.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {record.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">{new Date(record.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-end justify-between mt-2">
                      <p className="font-bold text-slate-800 leading-tight">
                        {record.activityName}
                      </p>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Tahap</span>
                        <span className="text-2xl font-black text-emerald-600">{record.grade}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <Award size={32} className="mb-3 opacity-50" />
                  <p className="font-bold">No PAJSK records logged.</p>
                  <p className="text-sm">Get involved in clubs or sports!</p>
                </div>
              )}
            </div>
          </div>

          {/* Behavioral Record */}
          <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 mb-8" data-html2canvas-ignore>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-slate-100 rounded-2xl text-slate-600 border border-slate-200">
                <AlertCircle size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-800">Behavioral Record</h2>
                <p className="text-slate-500 text-sm font-medium">Transparent tracking of classroom conduct and highlights.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {behaviorLogs.length > 0 ? (
                behaviorLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                  <div key={log.id} className={`p-6 rounded-2xl border-2 flex flex-col gap-3 ${log.type === 'POSITIVE' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                    <div className="flex justify-between items-start">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${log.type === 'POSITIVE' ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'}`}>
                        {log.type === 'POSITIVE' ? 'Praise' : 'Warning'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">{new Date(log.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed">
                      "{log.description}"
                    </p>
                    <div className="mt-auto pt-3 border-t border-white/40">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <UserIcon size={12} /> Logged by: {teachers.find(t => t.id === log.teacherId)?.name}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <AlertCircle size={32} className="mb-3 opacity-50" />
                  <p className="font-bold">No behavioral records logged.</p>
                  <p className="text-sm">Keep up the good work!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'community' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div>
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2"><UserIcon className="text-indigo-600" /> Mentorship</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                  <h3 className="text-lg font-black mb-4 text-slate-800">Find a Mentor</h3>
                  <div className="space-y-3">
                    {teachers.map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setSelectedTeacherId(t.id); setSelectedSlot(null); }}
                        className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all border-2 text-left ${selectedTeacherId === t.id ? 'border-indigo-600 bg-indigo-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
                      >
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-slate-700 shadow-sm border border-slate-100">{t.name.charAt(0)}</div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{t.name}</p>
                          <p className="text-xs text-slate-500">Teacher</p>
                        </div>
                        {selectedTeacherId === t.id && onOpenMessage && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onOpenMessage(t.id); }}
                            className="p-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                            title={`Message ${t.name}`}
                          >
                            <MessageSquare size={16} />
                          </button>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                  <h3 className="text-lg font-black mb-4 text-slate-800">My Requests</h3>
                  <div className="space-y-3">
                    {appointments.filter(a => a.studentId === student.id).map(a => (
                      <div key={a.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-slate-800">{teachers.find(t => t.id === a.teacherId)?.name}</p>
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${a.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                            a.status === 'REJECTED' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                            }`}>{a.status}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-mono mb-2">{a.date} • {a.time}</p>
                      </div>
                    ))}
                    {appointments.filter(a => a.studentId === student.id).length === 0 && (
                      <p className="text-center text-slate-400 text-sm italic py-4">No appointment requests yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                {selectedTeacherId ? (
                  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 h-full">
                    <h3 className="text-lg font-black mb-4">Available Slots</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {availabilitySlots.filter(s => s.teacherId === selectedTeacherId && !s.isBooked).length > 0 ? (
                        availabilitySlots.filter(s => s.teacherId === selectedTeacherId && !s.isBooked).map(slot => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-4 rounded-xl border-2 transition-all ${selectedSlot?.id === slot.id ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'}`}
                          >
                            <p className="font-bold text-sm">{slot.date}</p>
                            <p className="font-mono text-xs opacity-80">{slot.time}</p>
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <p className="text-slate-400 font-bold">No available slots.</p>
                        </div>
                      )}
                    </div>

                    {selectedSlot && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <textarea
                          value={apptReason}
                          onChange={(e) => setApptReason(e.target.value)}
                          placeholder="Briefly explain why you want to meet..."
                          className="w-full p-4 rounded-xl border border-slate-200 mb-4 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                        />
                        <button
                          onClick={handleBookAppointment}
                          disabled={!apptReason}
                          className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-50"
                        >
                          Confirm Request
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                    <UserIcon size={32} className="mb-4 opacity-50" />
                    <p className="font-bold">Select a teacher to book a meeting.</p>
                  </div>
                )}
              </div>
            </div >
          </div >

          <div className="pt-8 border-t border-slate-200">
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2"><MessageCircle className="text-indigo-600" /> Discussion Forum</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <button
                  onClick={() => setShowNewPostModal(true)}
                  className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mb-6"
                >
                  <Plus size={20} /> New Discussion
                </button>

                <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 h-[600px] overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                    {discussions.map(post => (
                      <button
                        key={post.id}
                        onClick={() => setViewPostId(post.id)}
                        className={`w-full p-5 rounded-2xl text-left transition-all border hover:shadow-md ${viewPostId === post.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}
                      >
                        <h4 className="font-black text-slate-800 mb-1 line-clamp-1">{post.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{post.content}</p>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <span>{post.authorName}</span>
                          <span className="flex items-center gap-1"><MessageCircle size={10} /> {post.replies.length}</span>
                        </div>
                      </button>
                    ))}
                    {discussions.length === 0 && (
                      <p className="text-center py-10 text-slate-400 italic text-sm">No discussions yet. Start one!</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                {viewPostId ? (
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-[700px] flex flex-col">
                    {discussions.find(p => p.id === viewPostId) && (
                      <>
                        <div className="mb-6 pb-6 border-b border-slate-100 flex-shrink-0">
                          <h2 className="text-2xl font-black text-slate-800 mb-4">{discussions.find(p => p.id === viewPostId)?.title}</h2>
                          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{discussions.find(p => p.id === viewPostId)?.content}</p>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar mb-6 space-y-4 pr-2">
                          {discussions.find(p => p.id === viewPostId)?.replies.map(reply => (
                            <div key={reply.id} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-sm text-slate-800">{reply.authorName}</span>
                                <span className="text-[10px] text-slate-400">{new Date(reply.timestamp).toLocaleDateString()}</span>
                              </div>
                              <p className="text-slate-600 text-sm">{reply.content}</p>
                            </div>
                          ))}
                          {discussions.find(p => p.id === viewPostId)?.replies.length === 0 && (
                            <p className="text-slate-400 italic text-sm text-center py-8">No replies yet. Be the first!</p>
                          )}
                        </div>

                        <div className="mt-auto flex gap-2 flex-shrink-0 pt-2">
                          <input
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                          />
                          <button onClick={handleReply} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                            <Send size={20} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="h-full bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                    <MessageSquare size={48} className="mb-4 opacity-50" />
                    <p className="font-bold text-lg">Select a discussion to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div >
      )
      }

      {/* New Post Modal */}
      {
        showNewPostModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl p-8 animate-in zoom-in-50 duration-200">
              <h3 className="text-2xl font-black mb-6 text-slate-800">Start Discussion</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Topic Title</label>
                  <input
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800"
                    placeholder="e.g. Help with Physics Motion..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Details</label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 h-32"
                    placeholder="Describe your question or topic..."
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowNewPostModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                  <button onClick={handleCreatePost} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all">Post Discussion</button>
                </div>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
};

const BarChart3 = ({ className, size }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
  </svg>
);

export default StudentDashboard;
