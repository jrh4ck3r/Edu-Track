
import React, { useState } from 'react';
import { User, Mark, Feedback, WellBeingStatus, SchoolClass, Appointment, AvailabilitySlot } from '../types';
import { SUBJECTS_LIST, ASSESSMENT_TYPES } from '../constants';
import { Plus, Save, User as UserIcon, BookOpen, ClipboardCheck, History, Search, LayoutGrid, Calendar, Clock, Check, X } from 'lucide-react';

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
}

const TeacherPortal: React.FC<TeacherPortalProps> = ({
  teacher, students, onAddMark, onAddFeedback, marks, classes,
  onEnrollStudent, onUpdateClass, appointments, availabilitySlots,
  onAddAvailability, onUpdateAppointmentStatus
}) => {
  const [selectedStudentIc, setSelectedStudentIc] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [assessmentType, setAssessmentType] = useState(ASSESSMENT_TYPES[0]);
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');
  const [wellBeing, setWellBeing] = useState(WellBeingStatus.GOOD);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'classrooms' | 'appointments'>('dashboard');

  const teacherClasses = classes.filter(c => c.teacherId === teacher.id);
  const teacherClassIds = teacherClasses.map(c => c.id);

  const [enrollClassId, setEnrollClassId] = useState('');
  const [enrollStudentIc, setEnrollStudentIc] = useState('');
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const handleEnrollStudent = () => {
    if (enrollStudentIc && enrollClassId) {
      onEnrollStudent(enrollStudentIc, enrollClassId);
      setEnrollStudentIc('');
      setEnrollClassId('');
      setShowEnrollModal(false);
    }
  };

  const [viewClassId, setViewClassId] = useState<string | null>(null);
  const [timetableClassId, setTimetableClassId] = useState<string | null>(null);
  const [timetableDay, setTimetableDay] = useState('Monday');
  const [timetableTime, setTimetableTime] = useState('');
  const [timetableSubject, setTimetableSubject] = useState('');

  const handleAddTimetableEntry = () => {
    if (!timetableClassId || !timetableTime || !timetableSubject) return;
    const currentClass = classes.find(c => c.id === timetableClassId);
    if (!currentClass) return;

    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      day: timetableDay,
      time: timetableTime,
      subject: timetableSubject
    };

    const updatedTimetable = [...(currentClass.timetable || []), newEntry];
    onUpdateClass(timetableClassId, { timetable: updatedTimetable });
    setTimetableTime('');
    setTimetableSubject('');
  };

  const handleRemoveTimetableEntry = (entryId: string) => {
    if (!timetableClassId) return;
    const currentClass = classes.find(c => c.id === timetableClassId);
    if (!currentClass) return;

    const updatedTimetable = currentClass.timetable?.filter(t => t.id !== entryId) || [];
    onUpdateClass(timetableClassId, { timetable: updatedTimetable });
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

  const studentMarks = marks.filter(m => m.studentIcNumber === selectedStudentIc);
  const selectedStudent = students.find(s => s.icNumber === selectedStudentIc);

  const filteredStudents = students.filter(s =>
    (s.assignedClassId && teacherClassIds.includes(s.assignedClassId)) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.icNumber && s.icNumber.includes(searchTerm)))
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Teacher Console</h1>
          <p className="text-slate-500 font-medium">Manage academic performance and student well-being.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('classrooms')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'classrooms' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            My Classrooms
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'appointments' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Appointments
          </button>
        </div>
      </div>

      {activeTab === 'appointments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Availability Manager */}
          <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-fit">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800">
              <Calendar className="text-indigo-600" size={24} />
              My Availability
            </h3>
            <div className="space-y-4">
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const date = (form.elements.namedItem('date') as HTMLInputElement).value;
                const time = (form.elements.namedItem('time') as HTMLInputElement).value;
                if (date && time) {
                  onAddAvailability({ teacherId: teacher.id, date, time, isBooked: false });
                  form.reset();
                }
              }}>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date</label>
                  <input name="date" type="date" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Time Slot</label>
                  <input name="time" type="time" className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" required />
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                  <Plus size={18} />
                  Add Slot
                </button>
              </form>

              <div className="mt-8">
                <h4 className="font-bold text-slate-600 mb-4 text-sm uppercase tracking-widest">Open Slots</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {availabilitySlots.filter(s => s.teacherId === teacher.id && !s.isBooked).map(slot => (
                    <div key={slot.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">{slot.date}</p>
                        <p className="text-xs font-mono text-slate-400">{slot.time}</p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-bold uppercase">Open</span>
                    </div>
                  ))}
                  {availabilitySlots.filter(s => s.teacherId === teacher.id && !s.isBooked).length === 0 && (
                    <p className="text-center text-slate-400 italic text-sm py-4">No open slots added.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Requests */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800">
                <Clock className="text-orange-500" size={24} />
                Pending Requests
              </h3>
              <div className="space-y-4">
                {appointments.filter(a => a.teacherId === teacher.id && a.status === 'PENDING').map(appt => {
                  const student = students.find(s => s.id === appt.studentId);
                  return (
                    <div key={appt.id} className="p-6 bg-slate-50 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h4 className="font-black text-slate-800 text-lg">{student?.name}</h4>
                        <p className="text-slate-500 text-sm mb-2">{appt.date} at {appt.time}</p>
                        <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 text-sm italic">"{appt.reason}"</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onUpdateAppointmentStatus(appt.id, 'APPROVED')}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                        >
                          <Check size={16} /> Accept
                        </button>
                        <button
                          onClick={() => onUpdateAppointmentStatus(appt.id, 'REJECTED')}
                          className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors flex items-center gap-2"
                        >
                          <X size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
                {appointments.filter(a => a.teacherId === teacher.id && a.status === 'PENDING').length === 0 && (
                  <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold">No pending appointment requests.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800">
                <Check className="text-emerald-500" size={24} />
                Upcoming Appointments
              </h3>
              <div className="space-y-4">
                {appointments.filter(a => a.teacherId === teacher.id && a.status === 'APPROVED').map(appt => {
                  const student = students.find(s => s.id === appt.studentId);
                  return (
                    <div key={appt.id} className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center">
                      <div>
                        <h4 className="font-black text-slate-800">{student?.name}</h4>
                        <p className="text-emerald-600 font-medium text-sm">{appt.date} • {appt.time}</p>
                      </div>
                      <div className="px-4 py-2 bg-white rounded-xl text-xs font-black uppercase tracking-widest text-emerald-600 shadow-sm">
                        Confirmed
                      </div>
                    </div>
                  );
                })}
                {appointments.filter(a => a.teacherId === teacher.id && a.status === 'APPROVED').length === 0 && (
                  <p className="text-center text-slate-400 italic py-4">No upcoming appointments.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Student Selection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-slate-100 lg:sticky lg:top-10">
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
                    className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${selectedStudentIc === s.icNumber
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

              <button
                onClick={() => setShowEnrollModal(true)}
                className="w-full py-3 bg-indigo-50 text-indigo-600 font-black rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 mb-2"
              >
                <UserIcon size={18} />
                Enroll New Student
              </button>
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
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
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
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
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
                              className={`py-2 px-1 rounded-lg border text-[10px] font-black uppercase transition-all ${wellBeing === status ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
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
      )}

      {activeTab === 'classrooms' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherClasses.map(cls => {
              const classStudents = students.filter(s => s.assignedClassId === cls.id);
              return (
                <div key={cls.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">{cls.name}</h3>
                      <p className="text-sm font-bold text-slate-400">{classStudents.length} Students Enrolled</p>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <LayoutGrid size={24} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setViewClassId(cls.id)}
                      className="w-full py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <UserIcon size={18} />
                      View Students
                    </button>
                    <button
                      onClick={() => setTimetableClassId(cls.id)}
                      className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                      <History size={18} />
                      Manage Timetable
                    </button>
                  </div>
                </div>
              );
            })}
            {teacherClasses.length === 0 && (
              <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold text-lg">No classes assigned to you.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 animate-in zoom-in-50 duration-200">
            <h3 className="text-xl font-black mb-2 text-slate-800">Enroll Student</h3>
            <p className="text-sm text-slate-500 mb-6">Add a student to your class roster.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Student IC</label>
                <input
                  value={enrollStudentIc}
                  onChange={(e) => setEnrollStudentIc(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  placeholder="XXXXXX-XX-XXXX"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Target Class</label>
                <select
                  value={enrollClassId}
                  onChange={(e) => setEnrollClassId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Class</option>
                  {teacherClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowEnrollModal(false);
                    setEnrollStudentIc('');
                    setEnrollClassId('');
                  }}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnrollStudent}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
                >
                  Enroll
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Students Modal */}
      {viewClassId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl p-8 animate-in zoom-in-50 duration-200 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800">{classes.find(c => c.id === viewClassId)?.name}</h3>
                <p className="text-slate-500 font-bold">Enrolled Students List</p>
              </div>
              <button onClick={() => setViewClassId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {students.filter(s => s.assignedClassId === viewClassId).map(s => (
                  <div key={s.id} className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{s.name}</p>
                      <p className="text-xs font-mono text-slate-400">{s.icNumber}</p>
                    </div>
                  </div>
                ))}
                {students.filter(s => s.assignedClassId === viewClassId).length === 0 && (
                  <p className="col-span-full text-center py-10 text-slate-400 italic">No students enrolled yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Timetable Modal */}
      {timetableClassId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl p-8 animate-in zoom-in-50 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-black text-slate-800">{classes.find(c => c.id === timetableClassId)?.name}</h3>
                <p className="text-slate-500 font-bold">Academic Timetable</p>
              </div>
              <button onClick={() => setTimetableClassId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden h-full">
              {/* Add Entry Form */}
              <div className="lg:col-span-1 bg-slate-50 p-6 rounded-3xl h-fit">
                <h4 className="font-black text-slate-800 mb-4">Add Entry</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Day</label>
                    <select
                      value={timetableDay} onChange={(e) => setTimetableDay(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Time</label>
                    <input
                      type="text" placeholder="e.g. 09:00 AM - 10:00 AM"
                      value={timetableTime} onChange={(e) => setTimetableTime(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Subject</label>
                    <select
                      value={timetableSubject} onChange={(e) => setTimetableSubject(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Subject</option>
                      {SUBJECTS_LIST.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={handleAddTimetableEntry}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    Add to Timetable
                  </button>
                </div>
              </div>

              {/* Timetable View */}
              <div className="lg:col-span-2 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                    const dayEntries = classes.find(c => c.id === timetableClassId)?.timetable?.filter(t => t.day === day).sort((a, b) => a.time.localeCompare(b.time)) || [];
                    if (dayEntries.length === 0) return null;
                    return (
                      <div key={day} className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                        <h5 className="font-black text-indigo-600 mb-3 uppercase tracking-widest text-sm">{day}</h5>
                        <div className="space-y-2">
                          {dayEntries.map(entry => (
                            <div key={entry.id} className="bg-white p-3 rounded-xl flex justify-between items-center shadow-sm">
                              <div>
                                <p className="font-bold text-slate-800">{entry.subject}</p>
                                <p className="text-xs font-mono text-slate-400">{entry.time}</p>
                              </div>
                              <button onClick={() => handleRemoveTimetableEntry(entry.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                                <Plus size={16} className="rotate-45" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {(!classes.find(c => c.id === timetableClassId)?.timetable || classes.find(c => c.id === timetableClassId)?.timetable?.length === 0) && (
                    <div className="text-center py-20 text-slate-400 italic">Timetable is empty. start adding entries.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherPortal;
