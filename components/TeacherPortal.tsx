
import React, { useState } from 'react';
import { User, Mark, Feedback, WellBeingStatus, SchoolClass } from '../types';
import { SUBJECTS_LIST, ASSESSMENT_TYPES } from '../constants';
import { Plus, Save, User as UserIcon, BookOpen, ClipboardCheck, History, Search, LayoutGrid } from 'lucide-react';

interface TeacherPortalProps {
  teacher: User;
  students: User[];
  onAddMark: (mark: Omit<Mark, 'id'>) => void;
  onAddFeedback: (feedback: Omit<Feedback, 'id'>) => void;
  marks: Mark[];
  classes: SchoolClass[];
}

const TeacherPortal: React.FC<TeacherPortalProps> = ({ teacher, students, onAddMark, onAddFeedback, marks, classes }) => {
  const [selectedStudentIc, setSelectedStudentIc] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [assessmentType, setAssessmentType] = useState(ASSESSMENT_TYPES[0]);
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');
  const [wellBeing, setWellBeing] = useState(WellBeingStatus.GOOD);
  const [searchTerm, setSearchTerm] = useState('');

  const teacherClasses = classes.filter(c => c.teacherId === teacher.id);
  
  const handleSubmitMark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentIc || !selectedSubjectId || !score) return;

    onAddMark({
      studentIcNumber: selectedStudentIc,
      subjectId: selectedSubjectId,
      score: Number(score),
      maxScore: 100,
      assessmentType,
      date: new Date().toISOString().split('T')[0],
    });
    setScore('');
    alert('Mark added successfully!');
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentIc || !comment) return;

    onAddFeedback({
      studentIcNumber: selectedStudentIc,
      teacherId: teacher.id,
      comment,
      wellBeing,
      date: new Date().toISOString().split('T')[0],
    });
    setComment('');
    alert('Feedback submitted successfully!');
  };

  const studentMarks = marks.filter(m => m.studentIcNumber === selectedStudentIc);
  const selectedStudent = students.find(s => s.icNumber === selectedStudentIc);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.icNumber && s.icNumber.includes(searchTerm))
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Teacher Console</h1>
        <p className="text-slate-500 font-medium">Manage academic performance and student well-being.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Student Selection Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 sticky top-10">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <UserIcon className="text-indigo-600" size={24} />
              Students
            </h3>
            
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Search by IC or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredStudents.length > 0 ? filteredStudents.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudentIc(s.icNumber || '')}
                  className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${
                    selectedStudentIc === s.icNumber 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' 
                    : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50 text-slate-700 shadow-sm'
                  }`}
                >
                  <p className="font-black text-sm">{s.name}</p>
                  <p className={`text-[10px] font-mono mt-1 ${selectedStudentIc === s.icNumber ? 'text-indigo-200' : 'text-slate-400'}`}>
                    IC: {s.icNumber}
                  </p>
                </button>
              )) : (
                <p className="text-center py-10 text-slate-400 text-sm italic">No students found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-2 space-y-8">
          {!selectedStudentIc ? (
            <div className="bg-slate-100 border-4 border-dashed border-slate-200 rounded-[3rem] h-[600px] flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                <Search size={40} className="text-slate-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-400 mb-2">Identify a Student</h3>
              <p className="text-slate-400 max-w-xs font-medium">Please select a student from the directory to start managing their academic profile.</p>
            </div>
          ) : (
            <>
              {/* Header Info */}
              <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-100 flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{selectedStudent?.name}</h2>
                  <p className="text-indigo-200 font-bold uppercase tracking-widest text-xs mt-1">IC: {selectedStudentIc}</p>
                </div>
                <div className="px-5 py-2 bg-white/10 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest">Enrolled Class</p>
                  <p className="font-bold">{classes.find(c => c.id === selectedStudent?.assignedClassId)?.name || 'General'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Grade Entry */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <BookOpen className="text-indigo-600" size={24} />
                    Input Grade
                  </h3>
                  <form onSubmit={handleSubmitMark} className="space-y-5">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                      <select 
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Subject</option>
                        {SUBJECTS_LIST.map(sub => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Assessment</label>
                        <select 
                          value={assessmentType}
                          onChange={(e) => setAssessmentType(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {ASSESSMENT_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Score</label>
                        <input 
                          type="number" max="100" min="0" value={score}
                          onChange={(e) => setScore(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="0-100"
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-4">
                      <Save size={18} />
                      Save Marks
                    </button>
                  </form>
                </div>

                {/* Feedback Entry */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <ClipboardCheck className="text-emerald-600" size={24} />
                    Observations
                  </h3>
                  <form onSubmit={handleSubmitFeedback} className="space-y-5">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Student Well-being</label>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.values(WellBeingStatus).map(status => (
                          <button
                            key={status} type="button" onClick={() => setWellBeing(status)}
                            className={`py-2 px-1 rounded-lg border text-[10px] font-black uppercase transition-all ${
                              wellBeing === status ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            {status.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Qualitative Feedback</label>
                      <textarea 
                        value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        placeholder="Insights on progress..."
                      />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-black shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                      <Plus size={18} />
                      Update Report
                    </button>
                  </form>
                </div>
              </div>

              {/* History Section */}
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <History className="text-slate-400" size={28} />
                    Academic Timeline
                  </h3>
                  <div className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 border border-slate-100">
                    {studentMarks.length} Total Records
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-50 text-left">
                        <th className="pb-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                        <th className="pb-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment</th>
                        <th className="pb-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="pb-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Achievement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {studentMarks.map(m => (
                        <tr key={m.id} className="group">
                          <td className="py-5">
                            <p className="font-black text-slate-700">{SUBJECTS_LIST.find(s => s.id === m.subjectId)?.name}</p>
                          </td>
                          <td className="py-5">
                            <span className="text-sm font-medium text-slate-400">{m.assessmentType}</span>
                          </td>
                          <td className="py-5 text-sm font-bold text-slate-400">{m.date}</td>
                          <td className="py-5 text-right">
                            <span className="text-lg font-black text-indigo-600">{m.score}%</span>
                          </td>
                        </tr>
                      ))}
                      {studentMarks.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400 italic">No academic history recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherPortal;
