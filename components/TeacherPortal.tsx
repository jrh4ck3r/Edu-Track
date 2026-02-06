import React, { useState } from 'react';
import { User, Mark, Feedback, WellBeingStatus, SchoolClass, Appointment, AvailabilitySlot, AttendanceRecord, Resource, AttendanceStatus } from '../types';
import { SUBJECTS_LIST, ASSESSMENT_TYPES } from '../constants';
import { Plus, Save, User as UserIcon, BookOpen, ClipboardCheck, History, Search, LayoutGrid, Calendar, Clock, Check, X, FileText, Download, Upload, Trash2, Filter } from 'lucide-react';

interface TeacherPortalProps {
  teacher: User;
  students: User[];
  onAddMark: (mark: Omit<Mark, 'id'>) => void;
  onAddFeedback: (feedback: Omit<Feedback, 'id'>) => void;
  marks: Mark[];
  classes: SchoolClass[];
  onEnrollStudent: (studentIc: string, classId: string) => void;
  onUpdateClass: (classId: string, updates: Partial<SchoolClass>) => void;
  appointments: Appointment[];
  availabilitySlots: AvailabilitySlot[];
  onAddAvailability: (slot: Omit<AvailabilitySlot, 'id'>) => void;
  onUpdateAppointmentStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  attendance: AttendanceRecord[];
  onSaveAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  resources: Resource[];
  onUploadResource: (resource: Omit<Resource, 'id'>) => void;
  onGetUploadUrl: () => Promise<string>;
  onUploadFile: (url: string, file: File) => Promise<string | null>;
}

const TeacherPortal: React.FC<TeacherPortalProps> = ({
  teacher, students, onAddMark, onAddFeedback, marks, classes,
  onEnrollStudent, onUpdateClass, appointments, availabilitySlots,
  onAddAvailability, onUpdateAppointmentStatus,
  attendance, onSaveAttendance, resources, onUploadResource, onGetUploadUrl, onUploadFile
}) => {
  const [selectedStudentIc, setSelectedStudentIc] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [assessmentType, setAssessmentType] = useState(ASSESSMENT_TYPES[0]);
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');
  const [wellBeing, setWellBeing] = useState(WellBeingStatus.GOOD);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'classrooms' | 'appointments'>('dashboard');

  // Class Management State
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [classTab, setClassTab] = useState<'students' | 'attendance' | 'resources' | 'timetable'>('students');

  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Resource State
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDesc, setResourceDesc] = useState('');
  const [resourceSubject, setResourceSubject] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Timetable State
  const [timetableDay, setTimetableDay] = useState('Monday');
  const [timetableTime, setTimetableTime] = useState('');
  const [timetableSubject, setTimetableSubject] = useState('');

  // Enrollment State
  const [enrollStudentIc, setEnrollStudentIc] = useState('');
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const teacherClasses = classes.filter(c => c.teacherId === teacher.id);
  const teacherClassIds = teacherClasses.map(c => c.id);

  // --- Handlers ---

  const handleEnrollStudent = () => {
    if (enrollStudentIc && activeClassId) {
      onEnrollStudent(enrollStudentIc, activeClassId);
      setEnrollStudentIc('');
      setShowEnrollModal(false);
    }
  };

  const handleMarkAttendance = (studentId: string, status: AttendanceStatus) => {
    if (!activeClassId) return;
    onSaveAttendance({
      classId: activeClassId,
      studentId,
      date: attendanceDate,
      status
    });
  };

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClassId || !selectedFile || !resourceTitle || !resourceSubject) return;

    setIsUploading(true);
    try {
      const uploadUrl = await onGetUploadUrl();
      const fileId = await onUploadFile(uploadUrl, selectedFile);

      if (fileId) {
        onUploadResource({
          classId: activeClassId,
          teacherId: teacher.id,
          title: resourceTitle,
          description: resourceDesc,
          fileId: fileId,
          subject: resourceSubject,
          createdAt: new Date().toISOString()
        });
        setResourceTitle('');
        setResourceDesc('');
        setResourceSubject('');
        setSelectedFile(null);
        alert("Resource uploaded successfully!");
      } else {
        alert("Failed to upload file.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading resource.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTimetableEntry = () => {
    if (!activeClassId || !timetableTime || !timetableSubject) return;
    const currentClass = classes.find(c => c.id === activeClassId);
    if (!currentClass) return;

    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      day: timetableDay,
      time: timetableTime,
      subject: timetableSubject
    };

    const updatedTimetable = [...(currentClass.timetable || []), newEntry];
    onUpdateClass(activeClassId, { timetable: updatedTimetable });
    setTimetableTime('');
    setTimetableSubject('');
  };

  const handleRemoveTimetableEntry = (entryId: string) => {
    if (!activeClassId) return;
    const currentClass = classes.find(c => c.id === activeClassId);
    if (!currentClass) return;

    const updatedTimetable = currentClass.timetable?.filter(t => t.id !== entryId) || [];
    onUpdateClass(activeClassId, { timetable: updatedTimetable });
  };

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

  const filteredStudents = students.filter(s =>
    (s.assignedClassId && teacherClassIds.includes(s.assignedClassId)) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.icNumber && s.icNumber.includes(searchTerm)))
  );

  const selectedStudent = students.find(s => s.icNumber === selectedStudentIc);
  const studentMarks = marks.filter(m => m.studentIcNumber === selectedStudentIc);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Teacher Console</h1>
          <p className="text-slate-500 font-medium">Manage academic performance and student well-being.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
          <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('classrooms')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'classrooms' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}>My Classrooms</button>
          <button onClick={() => setActiveTab('appointments')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'appointments' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}>Appointments</button>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-slate-100 lg:sticky lg:top-10">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2"><UserIcon className="text-indigo-600" size={24} /> Students</h3>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search by IC or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredStudents.length > 0 ? filteredStudents.map(s => (
                  <button key={s.id} onClick={() => setSelectedStudentIc(s.icNumber || '')} className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${selectedStudentIc === s.icNumber ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50 text-slate-700 shadow-sm'}`}>
                    <p className="font-black text-sm">{s.name}</p>
                    <p className={`text-[10px] font-mono mt-1 ${selectedStudentIc === s.icNumber ? 'text-indigo-200' : 'text-slate-400'}`}>IC: {s.icNumber}</p>
                  </button>
                )) : <p className="text-center py-10 text-slate-400 text-sm italic">No students found.</p>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {!selectedStudentIc ? (
              <div className="bg-slate-100 border-4 border-dashed border-slate-200 rounded-[3rem] h-[600px] flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6"><Search size={40} className="text-slate-400" /></div>
                <h3 className="text-2xl font-black text-slate-400 mb-2">Identify a Student</h3>
                <p className="text-slate-400 max-w-xs font-medium">Please select a student from the directory to start managing their academic profile.</p>
              </div>
            ) : (
              <>
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
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2"><BookOpen className="text-indigo-600" size={24} /> Input Grade</h3>
                    <form onSubmit={handleSubmitMark} className="space-y-5">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Subject</label>
                        <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="">Select Subject</option>
                          {SUBJECTS_LIST.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Assessment</label>
                          <select value={assessmentType} onChange={(e) => setAssessmentType(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                            {ASSESSMENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Score</label>
                          <input type="number" max="100" min="0" value={score} onChange={(e) => setScore(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0-100" />
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-4"><Save size={18} /> Save Marks</button>
                    </form>
                  </div>

                  <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-2"><ClipboardCheck className="text-emerald-600" size={24} /> Observations</h3>
                    <form onSubmit={handleSubmitFeedback} className="space-y-5">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Student Well-being</label>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.values(WellBeingStatus).map(status => (
                            <button key={status} type="button" onClick={() => setWellBeing(status)} className={`py-2 px-1 rounded-lg border text-[10px] font-black uppercase transition-all ${wellBeing === status ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}>{status.split(' ')[0]}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Qualitative Feedback</label>
                        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Insights on progress..." />
                      </div>
                      <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-black shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"><Plus size={18} /> Update Report</button>
                    </form>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3"><History className="text-slate-400" size={28} /> Academic Timeline</h3>
                    <div className="bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 border border-slate-100">{studentMarks.length} Total Records</div>
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
                            <td className="py-5"><p className="font-black text-slate-700">{SUBJECTS_LIST.find(s => s.id === m.subjectId)?.name}</p></td>
                            <td className="py-5"><span className="text-sm font-medium text-slate-400">{m.assessmentType}</span></td>
                            <td className="py-5 text-sm font-bold text-slate-400">{m.date}</td>
                            <td className="py-5 text-right"><span className="text-lg font-black text-indigo-600">{m.score}%</span></td>
                          </tr>
                        ))}
                        {studentMarks.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-slate-400 italic">No academic history recorded.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'classrooms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherClasses.map(cls => {
            const classStudents = students.filter(s => s.assignedClassId === cls.id);
            return (
              <div key={cls.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group cursor-pointer" onClick={() => setActiveClassId(cls.id)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{cls.name}</h3>
                    <p className="text-sm font-bold text-slate-400">{classStudents.length} Students Enrolled</p>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors"><LayoutGrid size={24} /></div>
                </div>
                <div className="w-full py-3 bg-slate-50 text-slate-600 font-bold rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 mt-4">
                  Manage Class
                </div>
              </div>
            );
          })}
          {teacherClasses.length === 0 && <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200"><p className="text-slate-400 font-bold text-lg">No classes assigned to you.</p></div>}
        </div>
      )}

      {/* Class Manager Modal */}
      {activeClassId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl shadow-2xl p-8 animate-in zoom-in-50 duration-200 h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-3xl font-black text-slate-800">{classes.find(c => c.id === activeClassId)?.name}</h3>
                <p className="text-slate-500 font-bold">Class Management Portal</p>
              </div>
              <button onClick={() => setActiveClassId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="flex gap-4 border-b border-slate-100 mb-6 flex-wrap">
              {(['students', 'attendance', 'resources', 'timetable'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setClassTab(tab)}
                  className={`pb-4 px-2 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 ${classTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {classTab === 'students' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-slate-800 text-xl">Roster</h4>
                    <button onClick={() => setShowEnrollModal(true)} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"><Plus size={16} /> Enroll Student</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.filter(s => s.assignedClassId === activeClassId).map(s => (
                      <div key={s.id} className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">{s.name.charAt(0)}</div>
                        <div>
                          <p className="font-bold text-slate-800">{s.name}</p>
                          <p className="text-xs font-mono text-slate-400">{s.icNumber}</p>
                        </div>
                      </div>
                    ))}
                    {students.filter(s => s.assignedClassId === activeClassId).length === 0 && <p className="col-span-full text-center py-10 text-slate-400 italic">No students enrolled yet.</p>}
                  </div>
                </div>
              )}

              {classTab === 'attendance' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl mb-6">
                    <Calendar className="text-slate-400" size={20} />
                    <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-transparent font-bold text-slate-700 outline-none" />
                  </div>
                  <div className="space-y-2">
                    {students.filter(s => s.assignedClassId === activeClassId).map(s => {
                      const status = attendance.find(a => a.studentId === s.id && a.date === attendanceDate && a.classId === activeClassId)?.status;
                      return (
                        <div key={s.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-shadow">
                          <p className="font-bold text-slate-800">{s.name}</p>
                          <div className="flex gap-2">
                            {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as AttendanceStatus[]).map(st => (
                              <button
                                key={st}
                                onClick={() => handleMarkAttendance(s.id, st)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${status === st
                                  ? (st === 'PRESENT' ? 'bg-emerald-500 text-white' : st === 'ABSENT' ? 'bg-rose-500 text-white' : st === 'LATE' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white')
                                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {students.filter(s => s.assignedClassId === activeClassId).length === 0 && <p className="text-center py-10 text-slate-400 italic">No students enrolled to mark attendance.</p>}
                  </div>
                </div>
              )}

              {classTab === 'resources' && (
                <div className="space-y-8">
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2"><Upload size={20} /> Upload Resource</h4>
                    <form onSubmit={handleUploadResource} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Resource Title" value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)} className="p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" required />
                        <select value={resourceSubject} onChange={(e) => setResourceSubject(e.target.value)} className="p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" required>
                          <option value="">Select Subject</option>
                          {SUBJECTS_LIST.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <textarea placeholder="Description (optional)" value={resourceDesc} onChange={(e) => setResourceDesc(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" rows={2} />
                      <div className="flex gap-4">
                        <input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required />
                        <button disabled={isUploading} type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
                          {isUploading ? 'Uploading...' : 'Upload'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-800 mb-4">Class Resources</h4>
                    <div className="space-y-3">
                      {resources.filter(r => r.classId === activeClassId).map(res => (
                        <div key={res.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><FileText size={20} /></div>
                            <div>
                              <h5 className="font-bold text-slate-800">{res.title}</h5>
                              <p className="text-xs text-slate-500">{SUBJECTS_LIST.find(s => s.id === res.subject)?.name} • {new Date(res.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {/* TODO: Add Delete or View options here if needed */}
                        </div>
                      ))}
                      {resources.filter(r => r.classId === activeClassId).length === 0 && <p className="text-center py-10 text-slate-400 italic">No resources uploaded yet.</p>}
                    </div>
                  </div>
                </div>
              )}

              {classTab === 'timetable' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 bg-slate-50 p-6 rounded-3xl h-fit">
                    <h4 className="font-black text-slate-800 mb-4">Add Entry</h4>
                    <div className="space-y-4">
                      <select value={timetableDay} onChange={(e) => setTimetableDay(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <input type="text" placeholder="e.g. 09:00 AM - 10:00 AM" value={timetableTime} onChange={(e) => setTimetableTime(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" />
                      <select value={timetableSubject} onChange={(e) => setTimetableSubject(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Select Subject</option>
                        {SUBJECTS_LIST.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                      <button onClick={handleAddTimetableEntry} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">Add to Timetable</button>
                    </div>
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                      const dayEntries = classes.find(c => c.id === activeClassId)?.timetable?.filter(t => t.day === day).sort((a, b) => a.time.localeCompare(b.time)) || [];
                      if (dayEntries.length === 0) return null;
                      return (
                        <div key={day} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                          <h5 className="font-black text-indigo-600 mb-3 uppercase tracking-widest text-sm">{day}</h5>
                          <div className="space-y-2">
                            {dayEntries.map(entry => (
                              <div key={entry.id} className="bg-white p-3 rounded-xl flex justify-between items-center shadow-sm">
                                <div><p className="font-bold text-slate-800">{entry.subject}</p><p className="text-xs font-mono text-slate-400">{entry.time}</p></div>
                                <button onClick={() => handleRemoveTimetableEntry(entry.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"><Plus size={16} className="rotate-45" /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enrollment Modal (Reused) */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 animate-in zoom-in-50 duration-200">
            <h3 className="text-xl font-black mb-2 text-slate-800">Enroll Student</h3>
            <p className="text-sm text-slate-500 mb-6">Add a student to {classes.find(c => c.id === activeClassId)?.name || 'this class'}.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Student IC</label>
                <input value={enrollStudentIc} onChange={(e) => setEnrollStudentIc(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono" placeholder="XXXXXX-XX-XXXX" autoFocus />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowEnrollModal(false); setEnrollStudentIc(''); }} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                <button onClick={handleEnrollStudent} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">Enroll</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-fit">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800"><Calendar className="text-indigo-600" size={24} /> My Availability</h3>
            <div className="space-y-4">
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const date = (form.elements.namedItem('date') as HTMLInputElement).value;
                const time = (form.elements.namedItem('time') as HTMLInputElement).value;
                if (date && time) { onAddAvailability({ teacherId: teacher.id, date, time, isBooked: false }); form.reset(); }
              }}>
                <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date</label><input name="date" type="date" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" required /></div>
                <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Time Slot</label><input name="time" type="time" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" required /></div>
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"><Plus size={18} /> Add Slot</button>
              </form>
              <div className="mt-8">
                <h4 className="font-bold text-slate-600 mb-4 text-sm uppercase tracking-widest">Open Slots</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {availabilitySlots.filter(s => s.teacherId === teacher.id && !s.isBooked).map(slot => (
                    <div key={slot.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div><p className="font-bold text-slate-800">{slot.date}</p><p className="text-xs font-mono text-slate-400">{slot.time}</p></div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-bold uppercase">Open</span>
                    </div>
                  ))}
                  {availabilitySlots.filter(s => s.teacherId === teacher.id && !s.isBooked).length === 0 && <p className="text-center text-slate-400 italic text-sm py-4">No open slots added.</p>}
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800"><Clock className="text-orange-500" size={24} /> Pending Requests</h3>
              <div className="space-y-4">
                {appointments.filter(a => a.teacherId === teacher.id && a.status === 'PENDING').map(appt => {
                  const student = students.find(s => s.id === appt.studentId);
                  return (
                    <div key={appt.id} className="p-6 bg-slate-50 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div><h4 className="font-black text-slate-800 text-lg">{student?.name}</h4><p className="text-slate-500 text-sm mb-2">{appt.date} at {appt.time}</p><p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 text-sm italic">"{appt.reason}"</p></div>
                      <div className="flex gap-2">
                        <button onClick={() => onUpdateAppointmentStatus(appt.id, 'APPROVED')} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"><Check size={16} /> Accept</button>
                        <button onClick={() => onUpdateAppointmentStatus(appt.id, 'REJECTED')} className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors flex items-center gap-2"><X size={16} /> Reject</button>
                      </div>
                    </div>
                  );
                })}
                {appointments.filter(a => a.teacherId === teacher.id && a.status === 'PENDING').length === 0 && <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200"><p className="text-slate-400 font-bold">No pending appointment requests.</p></div>}
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800"><Check className="text-emerald-500" size={24} /> Upcoming Appointments</h3>
              <div className="space-y-4">
                {appointments.filter(a => a.teacherId === teacher.id && a.status === 'APPROVED').map(appt => {
                  const student = students.find(s => s.id === appt.studentId);
                  return (
                    <div key={appt.id} className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center">
                      <div><h4 className="font-black text-slate-800">{student?.name}</h4><p className="text-emerald-600 font-medium text-sm">{appt.date} • {appt.time}</p></div>
                      <div className="px-4 py-2 bg-white rounded-xl text-xs font-black uppercase tracking-widest text-emerald-600 shadow-sm">Confirmed</div>
                    </div>
                  );
                })}
                {appointments.filter(a => a.teacherId === teacher.id && a.status === 'APPROVED').length === 0 && <p className="text-center text-slate-400 italic py-4">No upcoming appointments.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPortal;
