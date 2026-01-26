import React, { useState } from 'react';
import { Mark, Feedback, WellBeingStatus, User, Appointment, AvailabilitySlot, DiscussionPost, DiscussionReply } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { SUBJECTS_LIST, COLORS } from '../constants';
import AnalysisCard from './AnalysisCard';
import { getAcademicInsights, getGradePrediction } from '../services/geminiService';
import { Sparkles, Download, MessageSquare, Heart, TrendingUp, BrainCircuit, Loader2, Calendar, Clock, User as UserIcon, Send, MessageCircle, Plus } from 'lucide-react';

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
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student, marks, allFeedback, teachers, appointments, availabilitySlots,
  onRequestAppointment, discussions, onCreateDiscussion, onReplyDiscussion
}) => {
  const [activeTab, setActiveTab] = useState<'academics' | 'mentorship' | 'forum'>('academics');
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

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

  const chartData = SUBJECTS_LIST.map(sub => {
    const mark = marks.find(m => m.subjectId === sub.id);
    return {
      subject: sub.name,
      score: mark ? (mark.score / mark.maxScore) * 100 : 0,
    };
  });

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

  const latestWellBeing = allFeedback[0]?.wellBeing || WellBeingStatus.GOOD;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Student Portal</h1>
          <p className="text-slate-500 font-medium">Welcome back, <span className="text-indigo-600">{student.name}</span></p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
          {(['academics', 'mentorship', 'forum'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'academics' && (
        <div className="animate-in fade-in duration-500">
          <div className="flex justify-end gap-3 mb-6">
            <button
              onClick={generatePredictions}
              disabled={isPredicting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg shadow-sm hover:bg-indigo-100 transition-colors disabled:opacity-50 font-bold text-sm"
            >
              {isPredicting ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
              AI Forecast
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors font-bold text-sm text-slate-600">
              <Download size={18} /> Export
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
                  <BarChart className="text-indigo-600" size={20} />
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
        </div>
      )}

      {activeTab === 'mentorship' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-black mb-6 text-slate-800 flex items-center gap-2">
                <UserIcon className="text-indigo-600" size={24} /> Find a Mentor
              </h3>
              <div className="space-y-3">
                {teachers.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTeacherId(t.id); setSelectedSlot(null); }}
                    className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all border-2 text-left ${selectedTeacherId === t.id ? 'border-indigo-600 bg-indigo-50' : 'border-transparent bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-slate-700 shadow-sm border border-slate-100">{t.name.charAt(0)}</div>
                    <div>
                      <p className="font-bold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">Teacher</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* My Appointments Status */}
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-indigo-50 border border-slate-100">
              <h3 className="text-xl font-black mb-6 text-slate-800 flex items-center gap-2">
                <Clock className="text-orange-500" size={24} /> My Requests
              </h3>
              <div className="space-y-3">
                {appointments.filter(a => a.studentId === student.id).map(a => (
                  <div key={a.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-slate-800">{teachers.find(t => t.id === a.teacherId)?.name}</p>
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${a.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                        a.status === 'REJECTED' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                        }`}>{a.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mb-2">{a.date} • {a.time}</p>
                    <p className="text-xs text-slate-400 italic">"{a.reason}"</p>
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
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-full">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-800">Available Slots</h2>
                  <p className="text-slate-500">Select a time to meet with {teachers.find(t => t.id === selectedTeacherId)?.name}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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
                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold">No available slots for this teacher.</p>
                    </div>
                  )}
                </div>

                {selectedSlot && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h4 className="font-black text-slate-800 mb-4">Request Appointment</h4>
                    <textarea
                      value={apptReason}
                      onChange={(e) => setApptReason(e.target.value)}
                      placeholder="Briefly explain why you want to meet (e.g. Discuss Math Grades, Project Help)..."
                      className="w-full p-4 rounded-xl border border-slate-200 mb-4 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                    />
                    <button
                      onClick={handleBookAppointment}
                      disabled={!apptReason}
                      className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm Request
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full bg-slate-100 rounded-[2rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <UserIcon size={48} className="mb-4 opacity-50" />
                <p className="font-bold text-lg">Select a teacher to view availability</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'forum' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          <div className="lg:col-span-1">
            <button
              onClick={() => setShowNewPostModal(true)}
              className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mb-6"
            >
              <Plus size={20} /> New Discussion
            </button>

            <div className="bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto custom-scrollbar p-2 space-y-2">
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
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-full flex flex-col">
                {discussions.find(p => p.id === viewPostId) && (
                  <>
                    <div className="mb-8 pb-8 border-b border-slate-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                          {discussions.find(p => p.id === viewPostId)?.authorName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{discussions.find(p => p.id === viewPostId)?.authorName}</p>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">{discussions.find(p => p.id === viewPostId)?.authorRole}</p>
                        </div>
                      </div>
                      <h2 className="text-2xl font-black text-slate-800 mb-4">{discussions.find(p => p.id === viewPostId)?.title}</h2>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{discussions.find(p => p.id === viewPostId)?.content}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar mb-6 space-y-4">
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
                        <p className="text-slate-400 italic text-sm">No replies yet. Be the first!</p>
                      )}
                    </div>

                    <div className="mt-auto">
                      <div className="flex gap-2">
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
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="h-full bg-slate-100 rounded-[2rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                <MessageSquare size={48} className="mb-4 opacity-50" />
                <p className="font-bold text-lg">Select a discussion to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Post Modal */}
      {showNewPostModal && (
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
      )}

    </div>
  );
};

const BarChart3 = ({ className, size }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
  </svg>
);

export default StudentDashboard;
