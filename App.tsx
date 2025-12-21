
import React, { useState } from 'react';
import { User, UserRole, Mark, Feedback, SchoolClass } from './types';
import { mockUsers, mockMarks, mockFeedbacks, mockClasses } from './mockData';
import StudentDashboard from './components/StudentDashboard';
import TeacherPortal from './components/TeacherPortal';
import AdminPortal from './components/AdminPortal';
import { LayoutDashboard, GraduationCap, Users, Settings, LogOut, ChevronRight, Search, PlusCircle, CreditCard, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [marks, setMarks] = useState<Mark[]>(mockMarks);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(mockFeedbacks);
  const [classes, setClasses] = useState<SchoolClass[]>(mockClasses);

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [selectedChildIc, setSelectedChildIc] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === loginIdentifier || u.icNumber === loginIdentifier);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'PARENT' && user.childIcNumbers && user.childIcNumbers.length > 0) {
        setSelectedChildIc(user.childIcNumbers[0]);
      }
    } else {
      alert("Invalid Email or IC Number. Try: 'alice@school.com' or '050123-10-1234'");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginIdentifier('');
    setSelectedChildIc(null);
  };

  const addMark = (markData: Omit<Mark, 'id'>) => {
    const newMark: Mark = {
      ...markData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setMarks(prev => [newMark, ...prev]);
  };

  const addFeedback = (feedbackData: Omit<Feedback, 'id'>) => {
    const newFeedback: Feedback = {
      ...feedbackData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setFeedbacks(prev => [newFeedback, ...prev]);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: 'user_' + Math.random().toString(36).substr(2, 9)
    };
    setUsers(prev => [...prev, newUser]);
  };

  const removeUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const linkChild = (ic: string) => {
    if (!currentUser || currentUser.role !== 'PARENT') return;
    const childExists = users.some(u => u.icNumber === ic && u.role === 'STUDENT');
    if (!childExists) {
      alert("No student found with that IC Number.");
      return;
    }
    const updatedUser = {
      ...currentUser,
      childIcNumbers: [...(currentUser.childIcNumbers || []), ic]
    };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    setSelectedChildIc(ic);
  };

  if (!currentUser) {
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
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Login to Portal</h2>
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
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              Sign In
              <ChevronRight size={20} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center mb-4">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setLoginIdentifier('admin@school.com')} className="text-[10px] bg-slate-100 p-2 rounded hover:bg-slate-200 text-slate-600">Admin: admin@school.com</button>
              <button onClick={() => setLoginIdentifier('sarah.smith@school.com')} className="text-[10px] bg-slate-100 p-2 rounded hover:bg-slate-200 text-slate-600">Teacher: sarah.smith@school.com</button>
              <button onClick={() => setLoginIdentifier('050123-10-1234')} className="text-[10px] bg-slate-100 p-2 rounded hover:bg-slate-200 text-slate-600">Student IC: 050123-10-1234</button>
              <button onClick={() => setLoginIdentifier('robert@home.com')} className="text-[10px] bg-slate-100 p-2 rounded hover:bg-slate-200 text-slate-600">Parent: robert@home.com</button>
            </div>
          </div>
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

          <button className="w-full flex items-center gap-4 p-3 lg:p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/20 transition-all justify-start md:justify-center lg:justify-start">
            <LayoutDashboard size={22} />
            <span className="block md:hidden lg:block font-bold">Main Console</span>
          </button>

          {currentUser.role === 'ADMIN' && (
            <button className="w-full flex items-center gap-4 p-3 lg:p-4 hover:bg-white/5 rounded-2xl transition-all justify-start md:justify-center lg:justify-start">
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
              studentName={currentUser.name}
              marks={marks.filter(m => m.studentIcNumber === currentUser.icNumber)}
              feedbacks={feedbacks.filter(f => f.studentIcNumber === currentUser.icNumber)}
            />
          )}

          {currentUser.role === 'PARENT' && activeChild && (
            <StudentDashboard
              studentName={activeChild.name}
              marks={marks.filter(m => m.studentIcNumber === activeChild.icNumber)}
              feedbacks={feedbacks.filter(f => f.studentIcNumber === activeChild.icNumber)}
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
            />
          )}

          {currentUser.role === 'ADMIN' && (
            <AdminPortal
              users={users}
              onAddUser={addUser}
              onRemoveUser={removeUser}
              classes={classes}
              setClasses={setClasses}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
