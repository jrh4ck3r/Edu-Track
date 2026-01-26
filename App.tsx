import React, { useState } from 'react';
import { User, Mark, Feedback, WellBeingStatus, SchoolClass, Appointment, AvailabilitySlot, DiscussionPost, DiscussionReply } from './types';
import { mockUsers, mockMarks, mockFeedbacks, mockClasses } from './mockData';
import { SUBJECTS_LIST } from './constants';
import StudentDashboard from './components/StudentDashboard';
import TeacherPortal from './components/TeacherPortal';
import AdminPortal from './components/AdminPortal';
import { LayoutDashboard, GraduationCap, Users, Settings, LogOut, ChevronRight, Search, PlusCircle, CreditCard, Menu, X, Lock, ArrowLeft } from 'lucide-react';

import { useQuery, useMutation } from "convex/react";
import { api } from "./convex/_generated/api";
import { Id } from "./convex/_generated/dataModel";

const App: React.FC = () => {
  // convex queries
  // convex queries
  const usersSource = useQuery(api.users.get) || [];
  const marksSource = useQuery(api.marks.getMarks) || [];
  const feedbacksSource = useQuery(api.marks.getFeedbacks) || [];
  const classesSource = useQuery(api.classes.list) || [];
  const appointmentsSource = useQuery(api.appointments.listAppointments) || [];
  const availabilitySlotsSource = useQuery(api.appointments.listSlots) || [];
  const discussionsSource = useQuery(api.discussions.list) || [];

  // Local state for authentication (still needed locally until auth provider is fully set up, but we use DB users)
  const [currentUser, setCurrentUser] = useState<User | null>(null);



  // Adapting Convex Data to Types (Convex _id to string id map if needed, or just casting)
  // For now, we will simply cast or assume the shapes match closely enough.
  // Note: timestamps in Convex are often weird if not specified, but we stored strings.

  // Mutations
  const createUserMutation = useMutation(api.users.create);
  const updateUserMutation = useMutation(api.users.update);
  const addMarkMutation = useMutation(api.marks.addMark);
  const addFeedbackMutation = useMutation(api.marks.addFeedback);
  const createClassMutation = useMutation(api.classes.create);
  const updateClassTimetableMutation = useMutation(api.classes.updateTimetable);

  const requestAppointmentMutation = useMutation(api.appointments.requestAppointment);
  const updateAppointmentStatusMutation = useMutation(api.appointments.updateAppointmentStatus);
  const addAvailabilitySlotMutation = useMutation(api.appointments.addSlot);
  const bookSlotMutation = useMutation(api.appointments.bookSlot);

  const createDiscussionMutation = useMutation(api.discussions.create);
  const replyDiscussionMutation = useMutation(api.discussions.reply);

  // Wrappers to match existing prop signatures where possible
  // Wrappers to match existing prop signatures where possible
  const users = React.useMemo(() => usersSource.map(u => ({ ...u, id: u._id })), [usersSource]);
  const marks = React.useMemo(() => marksSource.map(m => ({ ...m, id: m._id })), [marksSource]);
  const feedbacks = React.useMemo(() => feedbacksSource.map(f => ({ ...f, id: f._id })), [feedbacksSource]);
  const classes = React.useMemo(() => classesSource.map(c => ({ ...c, id: c._id })), [classesSource]);
  const appointments = React.useMemo(() => appointmentsSource.map(a => ({ ...a, id: a._id })), [appointmentsSource]);
  const availabilitySlots = React.useMemo(() => availabilitySlotsSource.map(s => ({ ...s, id: s._id })), [availabilitySlotsSource]);
  const discussions = React.useMemo(() => discussionsSource.map(d => ({ ...d, id: d._id, replies: d.replies?.map((r: any) => ({ ...r })) || [] })), [discussionsSource]);

  // Persistence: Check for logged in user on load
  React.useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId && users.length > 0) {
      const foundUser = users.find(u => u.id === savedUserId);
      if (foundUser) {
        setCurrentUser(foundUser);
        if (foundUser.role === 'PARENT' && foundUser.childIcNumbers && foundUser.childIcNumbers.length > 0) {
          setSelectedChildIc(foundUser.childIcNumbers[0]);
        }
      }
    }
  }, [users]); // Re-run when users load from DB

  // Handlers
  const addAvailabilitySlot = (slot: Omit<AvailabilitySlot, 'id'>) => {
    addAvailabilitySlotMutation({ teacherId: slot.teacherId, date: slot.date, time: slot.time });
  };

  const requestAppointment = (appt: Omit<Appointment, 'id' | 'status'>) => {
    requestAppointmentMutation({
      studentId: appt.studentId,
      teacherId: appt.teacherId,
      date: appt.date,
      time: appt.time,
      reason: appt.reason
    }).then(() => {
      // Also book the slot so it disappears or shows booked
      bookSlotMutation({ teacherId: appt.teacherId, date: appt.date, time: appt.time });
    });
  };

  const updateAppointmentStatus = (id: string, status: 'APPROVED' | 'REJECTED') => {
    updateAppointmentStatusMutation({ id: id as Id<"appointments">, status });
  };

  const createDiscussionPost = (post: Omit<DiscussionPost, 'id' | 'timestamp' | 'likes' | 'replies'>) => {
    createDiscussionMutation(post);
  };

  const addDiscussionReply = (postId: string, reply: Omit<DiscussionReply, 'id' | 'timestamp'>) => {
    replyDiscussionMutation({
      discussionId: postId as Id<"discussions">,
      authorName: reply.authorName,
      authorRole: reply.authorRole,
      content: reply.content
    });
  };

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [selectedChildIc, setSelectedChildIc] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState<'users' | 'classes'>('users');

  const [isSignUp, setIsSignUp] = useState(false);
  const [newParentName, setNewParentName] = useState('');
  const [newParentEmail, setNewParentEmail] = useState('');
  const [newParentPassword, setNewParentPassword] = useState('');

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [newPasswordChange, setNewPasswordChange] = useState('');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (users.some(u => u.email === newParentEmail)) {
      alert("Email already registered.");
      return;
    }
    createUserMutation({
      name: newParentName,
      email: newParentEmail,
      password: newParentPassword,
      role: 'PARENT',
      icNumber: undefined // or generated
    }).then(() => {
      alert("Account created! Please login.");
      setIsSignUp(false);
      setNewParentName('');
      setNewParentEmail('');
      setNewParentPassword('');
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUser || !newPasswordChange) return;

    // Optimistic update locally or wait for mutation
    if (tempUser.id && tempUser._id) { // Ensure we have ID
      updateUserMutation({
        id: tempUser._id as Id<"users">,
        updates: { password: newPasswordChange, mustChangePassword: false }
      }).then(() => {
        alert("Password updated successfully!");
        setShowPasswordChange(false);
        setTempUser(null);
        setNewPasswordChange('');
      });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app we would use an Auth provider. Here we query the users list client side.
    // Ensure 'users' is populated before checking.
    const user = users.find(u => u.email === loginIdentifier || u.icNumber === loginIdentifier);

    if (user && user.password === password) {
      if (user.mustChangePassword) {
        setTempUser(user);
        setShowPasswordChange(true);
        setPassword('');
        return;
      }

      setCurrentUser(user);
      if (user.id) localStorage.setItem('userId', user.id); // Persist login

      if (user.role === 'PARENT' && user.childIcNumbers && user.childIcNumbers.length > 0) {
        setSelectedChildIc(user.childIcNumbers[0]);
      }
    } else {
      alert("Invalid Email/IC or Password. Try: 'alice@school.com' and 'password123'");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId'); // Clear persistence
    setCurrentUser(null);
    setLoginIdentifier('');
    setPassword('');
    setSelectedChildIc(null);
  };

  const addMark = (markData: Omit<Mark, 'id'>) => {
    addMarkMutation(markData);
  };

  const addFeedback = (feedbackData: Omit<Feedback, 'id'>) => {
    addFeedbackMutation(feedbackData);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    createUserMutation({
      name: userData.name,
      email: userData.email,
      password: 'password123',
      role: userData.role,
      icNumber: userData.icNumber
    });
  };

  const updateClass = (classId: string, updates: Partial<SchoolClass>) => {
    if (updates.timetable) {
      updateClassTimetableMutation({ classId: classId as Id<"classes">, timetable: updates.timetable });
    }
    // Other updates not implemented
  };

  const removeUser = (id: string) => {
    alert("Delete user not implemented in this demo.");
  };

  const linkChild = (ic: string) => {
    if (!currentUser || currentUser.role !== 'PARENT') return;

    // We need to find the student by IC. We have 'users' list.
    // Note: In a large app, we'd do a specific backend query, but client-side filter is fine for demo.
    const student = users.find(u => u.icNumber === ic && u.role === 'STUDENT');
    if (!student) {
      alert("No student found with that IC Number.");
      return;
    }

    const isAlreadyLinked = users.some(u => u.role === 'PARENT' && u.childIcNumbers?.includes(ic));
    if (isAlreadyLinked) {
      alert("This student account is already linked to a parent.");
      return;
    }

    const newChildren = [...(currentUser.childIcNumbers || []), ic];

    if (currentUser._id) {
      updateUserMutation({
        id: currentUser._id as Id<"users">,
        updates: { childIcNumbers: newChildren }
      }).then(() => {
        // Optimistic update for currentUser since it's local state
        setCurrentUser({ ...currentUser, childIcNumbers: newChildren });
        setSelectedChildIc(ic);
        alert("Child linked successfully!");
      });
    }
  };

  const unlinkChild = (parentId: string, childIc: string) => {
    // Implement if needed for future
    alert("Unlink not implemented in this demo.");
  };

  const enrollStudent = (studentIc: string, classId: string) => {
    const student = users.find(u => u.icNumber === studentIc && u.role === 'STUDENT');
    if (!student) {
      alert("Student not found with this IC.");
      return;
    }
    if (student._id) {
      updateUserMutation({ id: student._id as Id<"users">, updates: { assignedClassId: classId } })
        .then(() => alert(`Successfully enrolled ${student.name} to class.`));
    }
  };

  const addClass = (classData: Omit<SchoolClass, 'id' | 'timetable'>) => {
    createClassMutation({ name: classData.name, teacherId: classData.teacherId });
  };

  if (!currentUser && !showPasswordChange) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-200 mb-6 text-white">
            <GraduationCap size={48} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">EduTrack</h1>
          <p className="text-slate-500 text-lg">Student Performance Analysis & Transparency System</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100 w-full max-w-md">
          <div className="flex justify-center mb-6 border-b border-slate-100 pb-4">
            <button
              onClick={() => setIsSignUp(false)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${!isSignUp ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${isSignUp ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign Up (Parents)
            </button>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            {isSignUp ? 'Create Parent Account' : 'Login to Portal'}
          </h2>

          {isSignUp ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                <input
                  type="text" required value={newParentName} onChange={(e) => setNewParentName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <input
                  type="email" required value={newParentEmail} onChange={(e) => setNewParentEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <input
                  type="password" required value={newParentPassword} onChange={(e) => setNewParentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Create a password"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-6"
              >
                Sign Up
                <ChevronRight size={20} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email or IC Number</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Enter email or student IC..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Enter password..."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                Sign In
                <ChevronRight size={20} />
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="flex justify-center">
              <button onClick={() => { setLoginIdentifier('admin@school.com'); setPassword('password123'); }} className="text-xs bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 text-slate-600 font-medium">Use Admin Demo Credentials</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showPasswordChange) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100 w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center p-4 bg-amber-500 rounded-3xl shadow-xl shadow-amber-200 mb-4 text-white">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Change Password</h2>
            <p className="text-slate-500 mt-2">Please set a new password for your account.</p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
              <input
                type="password"
                required
                value={newPasswordChange}
                onChange={(e) => setNewPasswordChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="Enter new password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-all"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    );
  }

  const activeChild = currentUser.role === 'PARENT' && selectedChildIc
    ? users.find(u => u.icNumber === selectedChildIc)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
            <GraduationCap size={20} />
          </div>
          <span className="text-xl font-black tracking-tight">EduTrack</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out
        w-72 md:w-20 lg:w-72
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 md:p-4 lg:p-8 flex items-center gap-3 justify-between md:justify-center lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-indigo-600 rounded-xl lg:rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
              <GraduationCap size={24} className="lg:w-7 lg:h-7" />
            </div>
            <span className="text-2xl font-black text-white md:hidden lg:block tracking-tight">EduTrack</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-slate-500 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 mt-2 lg:mt-6 px-4 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-500 uppercase px-4 mb-2 lg:mb-4 md:hidden lg:block tracking-[0.2em]">Menu</div>

          <button
            onClick={() => setAdminActiveTab('users')}
            className={`w-full flex items-center gap-4 p-3 lg:p-4 rounded-2xl shadow-xl transition-all justify-start md:justify-center lg:justify-start ${adminActiveTab === 'users' ? 'bg-indigo-600 text-white shadow-indigo-500/20' : 'text-slate-500 hover:bg-white/5'
              }`}
          >
            <LayoutDashboard size={22} />
            <span className="block md:hidden lg:block font-bold">Main Console</span>
          </button>

          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => setAdminActiveTab('classes')}
              className={`w-full flex items-center gap-4 p-3 lg:p-4 rounded-2xl transition-all justify-start md:justify-center lg:justify-start ${adminActiveTab === 'classes' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-500 hover:bg-white/5'
                }`}
            >
              <Users size={22} />
              <span className="block md:hidden lg:block font-bold">Class Manager</span>
            </button>
          )}

          {currentUser.role === 'PARENT' && (
            <div className="pt-6 block md:hidden lg:block">
              <div className="text-[10px] font-bold text-slate-500 uppercase px-4 mb-4 tracking-[0.2em]">Your Children</div>
              <div className="space-y-2">
                {currentUser.childIcNumbers?.map(ic => {
                  const child = users.find(u => u.icNumber === ic);
                  return (
                    <button
                      key={ic}
                      onClick={() => {
                        setSelectedChildIc(ic);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-sm font-semibold ${selectedChildIc === ic ? 'bg-white/10 text-white border border-white/10' : 'hover:bg-white/5 text-slate-500'
                        }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${selectedChildIc === ic ? 'bg-indigo-400' : 'bg-slate-700'}`}></div>
                      {child?.name || ic}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    const ic = prompt("Enter Child's IC Number (e.g. 050520-14-5678):");
                    if (ic) linkChild(ic);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-emerald-900/20 text-emerald-500 rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
                >
                  <PlusCircle size={16} />
                  Link New Child
                </button>
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 lg:p-6 mt-auto">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-5 block md:hidden lg:block mb-4 lg:mb-6">
            <p className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest">Active User</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-indigo-400 shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-white text-sm truncate">{currentUser.name}</p>
                <p className="text-[10px] text-indigo-400 font-black uppercase mt-0.5">{currentUser.role}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 hover:bg-rose-900/40 hover:text-rose-400 rounded-2xl transition-all font-bold justify-start md:justify-center lg:justify-start"
          >
            <LogOut size={22} />
            <span className="block md:hidden lg:block">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`
        flex-1 bg-slate-50 min-h-[calc(100vh-64px)] md:min-h-screen transition-all duration-300
        md:ml-20 lg:ml-72
      `}>
        <div className="p-4 md:p-6 lg:p-10">
          {currentUser.role === 'STUDENT' && (
            <StudentDashboard
              student={currentUser}
              marks={marks}
              feedback={users.filter(u => u.role === 'TEACHER').map(t => ({ // Mocking feedback lookup for now or passing generic
                id: '1', studentIcNumber: currentUser.icNumber!, teacherId: t.id, comment: '', wellBeing: WellBeingStatus.GOOD, date: ''
              }))} // This prop seems unused or needs fix in StudentDashboard, but passing existing data structure logic
              // Actual props needed:
              allFeedback={feedbacks} // Passing empty for now, assuming StudentDashboard fetches its own or we update prop
              teachers={users.filter(u => u.role === 'TEACHER')}
              appointments={appointments}
              availabilitySlots={availabilitySlots}
              onRequestAppointment={requestAppointment}
              discussions={discussions}
              onCreateDiscussion={createDiscussionPost}
              onReplyDiscussion={addDiscussionReply}
            />
          )}

          {currentUser.role === 'PARENT' && activeChild && (
            <StudentDashboard
              student={activeChild}
              marks={marks.filter(m => m.studentIcNumber === activeChild.icNumber)}
              allFeedback={feedbacks.filter(f => f.studentIcNumber === activeChild.icNumber)}
              teachers={users.filter(u => u.role === 'TEACHER')}
              appointments={appointments}
              availabilitySlots={availabilitySlots}
              onRequestAppointment={requestAppointment}
              discussions={discussions}
              onCreateDiscussion={createDiscussionPost}
              onReplyDiscussion={addDiscussionReply}
            />
          )}

          {currentUser.role === 'TEACHER' && (
            <TeacherPortal
              teacher={currentUser}
              students={users.filter(u => u.role === 'STUDENT')}
              onAddMark={addMark}
              onAddFeedback={addFeedback}
              marks={marks}
              classes={classes}
              onEnrollStudent={enrollStudent}
              onUpdateClass={updateClass}
              appointments={appointments}
              availabilitySlots={availabilitySlots}
              onAddAvailability={addAvailabilitySlot}
              onUpdateAppointmentStatus={updateAppointmentStatus}
            />
          )}

          {currentUser.role === 'ADMIN' && (
            <AdminPortal
              users={users}
              onAddUser={addUser}
              onRemoveUser={removeUser}
              onUnlinkChild={unlinkChild}
              onEnrollStudent={enrollStudent}
              classes={classes}
              onAddClass={addClass}
              activeTab={adminActiveTab}
              setActiveTab={setAdminActiveTab}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
