import React, { useState } from 'react';
import { User, Mark, Feedback, WellBeingStatus, SchoolClass, Appointment, AvailabilitySlot, DiscussionPost, DiscussionReply, Resource, AttendanceRecord, PAJSKRecord, Announcement } from './types';
import { mockUsers, mockMarks, mockFeedbacks, mockClasses } from './mockData';
import { SUBJECTS_LIST } from './constants';
import StudentDashboard from './components/StudentDashboard';
import TeacherPortal from './components/TeacherPortal';
import AdminPortal from './components/AdminPortal';
import NotificationCenter from './components/NotificationCenter';
import MessageDrawer from './components/MessageDrawer';
import { LayoutDashboard, GraduationCap, Users, Settings, LogOut, ChevronRight, Search, PlusCircle, CreditCard, Menu, X, Lock, ArrowLeft, MessageSquare, Moon, Sun } from 'lucide-react';

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
  const attendanceSource = useQuery(api.attendance.getAll) || [];
  const resourcesSource = useQuery(api.resources.getAll) || [];
  const announcementsSource = useQuery((api as any).announcements?.getAnnouncements) || [];

  // Temporary fix since we don't have user filtering up here for simplicity
  // we'll fetch all messages. In reality, filter by user.
  // I will just use `useQuery(api.messages.getMessagesWithUser)` but we need an arg.
  // Let's create `getAll` for messages temporarily or just assume we have it.
  // Actually, we can fetch messages scoped to the user if we have their ID.
  const messagesSource = useQuery((api as any).messages?.getMessagesWithUser, { userId1: 'all', userId2: 'all' }) || [];
  // Wait, I only made getMessagesWithUser in convex/messages.ts. 
  // Let's add a quick `getAll` or `getAllUserMessages` in `messages.ts` next to make this work smoothly globally.
  // I will implement a global `messages` array for now, then fix the query next step.
  const allMessagesSource = useQuery((api as any).messages?.getAll) || [];

  // New features queries
  // In a real app we'd filter these queries by the current user/class to avoid loading everything
  // For this demo we'll load all and filter client side or assume simple scale
  // Actually, we can't easily query ALL attendance for ALL classes efficiently without args
  // So we might need to rely on the components fetching or just use specific args if we hoisted state.
  // For simplicity given the refactor, we will fetch *all* for now if the query supports it, 
  // OR we just pass the mutation/query functions to the component if it handles data fetching.
  // However, the architecture here is "hoist everything".
  // Let's assume we fetch all attendance records for now? 
  // My attendance.ts has `getByClassAndDate` which requires args.
  // So I cannot easy hover-fetch here without current class state.
  // CHANGE OF PLAN: I will modify `TeacherPortal` to accept the *mutation* and *query functions* or 
  // I'll keep the "fetch all" approach if I change backend to `listAll` for demo.
  // BETTER: I'll add a `listAll` for attendance/resources in backend quickly to support this "hoisted" architecture 
  // OR, simpler: I will just instantiate the hooks INSIDE TeacherPortal for the specific class. 
  // BUT `App.tsx` controls the props. 
  // Users refactor instruction: "Refactor TeacherPortal... and add Attendance/Resources".
  // `TeacherPortal` now takes `attendance` array. So it expects data.
  // I will update the backend to allow listing all or just pass an empty array initially?
  // No, I need data. 
  // I will add `api.attendance.getAll` and `api.resources.getAll` to backend to support this simple architecture.
  // Wait, I can't easily change backend in this step without new file writes.
  // I will just use `useQuery(api.attendance.getByClassAndDate, ...)` inside the component? 
  // NO, `TeacherPortal` is a pure UI component in this architecture generally (taking props).
  // Prop: `attendance: AttendanceRecord[]`.
  // I'll make a quick `getAll` query in backend files first.

  // Okay, looking at `TeacherPortal` props again:
  // It takes `attendance: AttendanceRecord[]`.
  // I will assume for this MVP that we fetch *recent* attendance or just add `getAll` helper.
  // Let's add `getAll` helper to `attendance.ts` and `resources.ts` quickly.


  // Local state for authentication (still needed locally until auth provider is fully set up, but we use DB users)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');



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

  const deleteClassMutation = useMutation(api.classes.deleteClass);
  const unlinkChildMutation = useMutation(api.users.unlinkChild);

  const createDiscussionMutation = useMutation(api.discussions.create);
  const replyDiscussionMutation = useMutation(api.discussions.reply);

  const saveAttendanceMutation = useMutation(api.attendance.saveAttendance);
  const uploadResourceMutation = useMutation(api.resources.create);
  const generateUploadUrlMutation = useMutation(api.resources.generateUploadUrl);
  const getDownloadUrlMutation = useMutation(api.resources.getDownloadUrl);

  const sendMessageMutation = useMutation((api as any).messages?.sendMessage);
  const awardBadgeMutation = useMutation((api as any).badges?.awardBadge);
  const logBehaviorMutation = useMutation((api as any).behavior?.logBehavior);

  // Wrappers to match existing prop signatures where possible
  const users = React.useMemo(() => usersSource.map(u => ({ ...u, id: u._id })), [usersSource]);
  const marks = React.useMemo(() => marksSource.map(m => ({ ...m, id: m._id })), [marksSource]);
  const feedbacks = React.useMemo(() => feedbacksSource.map(f => ({ ...f, id: f._id })), [feedbacksSource]);
  const classes = React.useMemo(() => classesSource.map(c => ({ ...c, id: c._id })), [classesSource]);
  const appointments = React.useMemo(() => appointmentsSource.map(a => ({ ...a, id: a._id })), [appointmentsSource]);
  const availabilitySlots = React.useMemo(() => availabilitySlotsSource.map(s => ({ ...s, id: s._id })), [availabilitySlotsSource]);
  const discussions = React.useMemo(() => discussionsSource.map(d => ({ ...d, id: d._id, replies: d.replies?.map((r: any) => ({ ...r })) || [] })), [discussionsSource]);
  const attendance = React.useMemo(() => attendanceSource.map(a => ({ ...a, id: a._id })), [attendanceSource]);
  const resources = React.useMemo(() => resourcesSource.map(r => ({ ...r, id: r._id })), [resourcesSource]);
  const messages = React.useMemo(() => allMessagesSource.map((m: any) => ({ ...m, id: m._id })), [allMessagesSource]);

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
  const [adminActiveTab, setAdminActiveTab] = useState<'analytics' | 'users' | 'classes'>('analytics');

  const [isSignUp, setIsSignUp] = useState(false);
  const [newParentName, setNewParentName] = useState('');
  const [newParentEmail, setNewParentEmail] = useState('');
  const [newParentPassword, setNewParentPassword] = useState('');

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [newPasswordChange, setNewPasswordChange] = useState('');

  const [showMessageDrawer, setShowMessageDrawer] = useState(false);
  const [preselectedMessageUserId, setPreselectedMessageUserId] = useState<string | null>(null);

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

  const saveAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    saveAttendanceMutation({
      classId: record.classId,
      date: record.date,
      records: [{ studentId: record.studentId, status: record.status }]
    });
  };

  const uploadResource = (resource: Omit<Resource, 'id'>) => {
    uploadResourceMutation(resource);
  };

  const removeResource = (id: string) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      deleteResourceMutation({ id: id as Id<"resources"> });
    }
  };

  const getUploadUrl = async () => {
    return await generateUploadUrlMutation();
  };

  const uploadFile = async (url: string, file: File) => {
    const result = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();
    return storageId;
  };

  const deleteUserMutation = useMutation(api.users.deleteUser);
  const deleteResourceMutation = useMutation(api.resources.deleteResource);

  const handleSendMessage = (receiverId: string, content: string) => {
    if (currentUser) {
      sendMessageMutation({
        senderId: currentUser.id,
        receiverId,
        content,
        timestamp: new Date().toISOString()
      });
    }
  };

  const updateClass = (classId: string, updates: Partial<SchoolClass>) => {
    if (updates.timetable) {
      updateClassTimetableMutation({ classId: classId as Id<"classes">, timetable: updates.timetable });
    }
    // Other updates not implemented
  };

  const removeUser = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation({ id: id as Id<"users"> });
    }
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    createUserMutation({
      name: userData.name,
      email: userData.email,
      password: 'password123',
      role: userData.role,
      icNumber: userData.icNumber,
      mustChangePassword: true,
      studentYear: userData.studentYear
    });
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
    if (window.confirm("Are you sure you want to unlink this child?")) {
      unlinkChildMutation({ parentId: parentId as Id<"users">, childIc });
    }
  };

  const removeClass = (classId: string) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      deleteClassMutation({ id: classId as Id<"classes"> });
    }
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

  const removeFromClass = (studentIc: string) => {
    const student = users.find(u => u.icNumber === studentIc && u.role === 'STUDENT');
    if (!student) return;

    if (window.confirm(`Are you sure you want to remove ${student.name} from their current class?`)) {
      if (student._id) {
        updateUserMutation({ id: student._id as Id<"users">, updates: { assignedClassId: undefined } })
          .then(() => alert(`Successfully removed ${student.name} from class.`));
      }
    }
  };

  const addClass = (classData: Omit<SchoolClass, 'id' | 'timetable'>) => {
    createClassMutation({ name: classData.name, teacherId: classData.teacherId });
  };

  const activeChild = currentUser?.role === 'PARENT' && selectedChildIc
    ? users.find(u => u.icNumber === selectedChildIc)
    : null;

  // LIVE CONVEX QUERIES FOR NEW FEATURES
  const userBadgesQueryArg = currentUser?.role === 'STUDENT' ? { studentId: currentUser._id as string } : (currentUser?.role === 'PARENT' && activeChild) ? { studentId: activeChild._id as string } : "skip";
  const badgesQuery = useQuery((api as any).badges?.getStudentBadges, userBadgesQueryArg === "skip" ? "skip" : userBadgesQueryArg) || [];
  const behaviorsQuery = useQuery((api as any).behavior?.getStudentBehaviorLogs, userBadgesQueryArg === "skip" ? "skip" : userBadgesQueryArg) || [];
  const pajskQuery = useQuery((api as any).pajsk?.getStudentRecords, userBadgesQueryArg === "skip" ? "skip" : userBadgesQueryArg) || [];

  const addPajskRecordMutation = useMutation((api as any).pajsk?.addRecord);
  const createAnnouncementMutation = useMutation((api as any).announcements?.createAnnouncement);

  const userBadges = React.useMemo(() => badgesQuery.map((b: any) => ({ ...b, id: b._id })), [badgesQuery]);
  const userBehaviors = React.useMemo(() => behaviorsQuery.map((b: any) => ({ ...b, id: b._id })), [behaviorsQuery]);
  const userPajsk = React.useMemo(() => pajskQuery.map((b: any) => ({ ...b, id: b._id })), [pajskQuery]);
  const announcements: Announcement[] = React.useMemo(() => announcementsSource.map((a: any) => ({ ...a, id: a._id })), [announcementsSource]);

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



  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50'}`}>
      {/* Mobile Header */}
      <div className={`md:hidden ${isDarkMode ? 'bg-slate-900' : 'bg-slate-900'} text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md`}>
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
          <button
            onClick={() => setShowProfileModal(true)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 lg:p-5 mb-4 lg:mb-6 text-left hover:bg-white/10 transition-colors block md:hidden lg:block group"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest group-hover:text-slate-400">Active User</p>
              <Settings size={14} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-indigo-400 shrink-0 overflow-hidden">
                {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-white text-sm truncate">{currentUser.name}</p>
                <p className="text-[10px] text-indigo-400 font-black uppercase mt-0.5">{currentUser.role}</p>
              </div>
            </div>
          </button>

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
        flex-1 min-h-[calc(100vh-64px)] md:min-h-screen transition-all duration-300
        md:ml-20 lg:ml-72 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}
      `}>
        <div className="p-4 md:p-6 lg:p-10">
          <div className="flex justify-end mb-6 gap-4">
            <button
              onClick={() => {
                setIsDarkMode(prev => {
                  const next = !prev;
                  localStorage.setItem('darkMode', String(next));
                  return next;
                });
              }}
              className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'text-amber-400 hover:bg-slate-800' : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'}`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            {currentUser.id && (
              <button onClick={() => setShowMessageDrawer(true)} className={`relative p-2 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-400 hover:text-indigo-600'}`}>
                <MessageSquare size={24} />
              </button>
            )}
            {currentUser.id && <NotificationCenter userId={currentUser.id} />}
          </div>
          {currentUser.role === 'STUDENT' && (
            <StudentDashboard
              student={currentUser}
              marks={marks}
              // Actual props needed:
              allFeedback={feedbacks} // Passing empty for now, assuming StudentDashboard fetches its own or we update prop
              teachers={users.filter(u => u.role === 'TEACHER')}
              appointments={appointments}
              availabilitySlots={availabilitySlots}
              onRequestAppointment={requestAppointment}
              discussions={discussions}
              onCreateDiscussion={createDiscussionPost}
              onReplyDiscussion={addDiscussionReply}
              attendance={attendance}
              resources={resources}
              onGetDownloadUrl={async (fileId) => { return await getDownloadUrlMutation({ fileId }); }}
              badges={userBadges}
              behaviorLogs={userBehaviors}
              pajskRecords={userPajsk}
              announcements={announcements}
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
              attendance={attendance}
              resources={resources}
              onGetDownloadUrl={async (fileId) => { return await getDownloadUrlMutation({ fileId }); }}
              badges={userBadges}
              behaviorLogs={userBehaviors}
              pajskRecords={userPajsk}
              announcements={announcements}
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
              attendance={attendance}
              onSaveAttendance={saveAttendance}
              resources={resources}
              onUploadResource={uploadResource}
              onDeleteResource={removeResource}
              onGetUploadUrl={getUploadUrl}
              onUploadFile={uploadFile}
              onRemoveFromClass={removeFromClass}
              onOpenMessage={(id) => { setPreselectedMessageUserId(id); setShowMessageDrawer(true); }}
              onAwardBadge={(badge) => awardBadgeMutation(badge)}
              onLogBehavior={(log) => logBehaviorMutation(log)}
              onAddPajsk={(record) => addPajskRecordMutation(record)}
              announcements={announcements}
              onCreateAnnouncement={(data) => createAnnouncementMutation(data)}
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
              onRemoveClass={removeClass}
              onRemoveFromClass={removeFromClass}
              activeTab={adminActiveTab}
              setActiveTab={setAdminActiveTab}
            />
          )}
        </div>

        {showMessageDrawer && currentUser && (
          <MessageDrawer
            currentUser={currentUser}
            users={users}
            messages={messages}
            onSendMessage={handleSendMessage}
            onClose={() => setShowMessageDrawer(false)}
            initialSelectedUserId={preselectedMessageUserId}
          />
        )}

        {/* Profile Settings Modal */}
        {showProfileModal && currentUser && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-800">Profile Settings</h3>
                <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-2xl overflow-hidden border-4 border-slate-50 shadow-sm">
                    {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} className="w-full h-full object-cover" /> : currentUser.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-lg">{currentUser.name}</p>
                    <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{currentUser.role}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avatar Image URL</label>
                  <input
                    defaultValue={currentUser.avatarUrl || ''}
                    onBlur={(e) => {
                      if (currentUser._id) updateUserMutation({ id: currentUser._id as Id<"users">, updates: { avatarUrl: e.target.value } })
                    }}
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Contact Number</label>
                  <input
                    defaultValue={currentUser.contactNumber || ''}
                    onBlur={(e) => {
                      if (currentUser._id) updateUserMutation({ id: currentUser._id as Id<"users">, updates: { contactNumber: e.target.value } })
                    }}
                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 mt-6">
                  <button
                    onClick={() => { setShowProfileModal(false); setTempUser(currentUser); setShowPasswordChange(true); }}
                    className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Lock size={16} /> Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
