
import React, { useState } from 'react';
import { User, UserRole, SchoolClass } from '../types';
import { UserPlus, ShieldAlert, Trash2, Edit3, Search, LayoutGrid, Users as UsersIcon } from 'lucide-react';

interface AdminPortalProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onRemoveUser: (id: string) => void;
  classes: SchoolClass[];
  setClasses: React.Dispatch<React.SetStateAction<SchoolClass[]>>;
}

const AdminPortal: React.FC<AdminPortalProps> = ({ users, onAddUser, onRemoveUser, classes, setClasses }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'classes'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('STUDENT');
  const [newUserIc, setNewUserIc] = useState('');

  const [newClassName, setNewClassName] = useState('');
  const [newClassTeacherId, setNewClassTeacherId] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    onAddUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      icNumber: newUserRole === 'STUDENT' ? newUserIc : undefined
    });
    setNewUserName('');
    setNewUserEmail('');
    setNewUserIc('');
    setShowAddForm(false);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName || !newClassTeacherId) return;
    const newClass: SchoolClass = {
      id: 'c_' + Math.random().toString(36).substr(2, 5),
      name: newClassName,
      teacherId: newClassTeacherId
    };
    setClasses(prev => [...prev, newClass]);
    setNewClassName('');
    setNewClassTeacherId('');
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.icNumber && u.icNumber.includes(searchTerm))
  );

  const teachers = users.filter(u => u.role === 'TEACHER');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Admin</h1>
          <p className="text-slate-500 font-medium">Global governance and institution management.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            User Directory
          </button>
          <button 
            onClick={() => setActiveTab('classes')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'classes' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Classroom Registry
          </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, email or IC..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              />
            </div>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-indigo-600 text-white px-8 py-3 rounded-2xl flex items-center gap-2 font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              <UserPlus size={20} />
              {showAddForm ? 'Cancel' : 'Register User'}
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-indigo-100 mb-8 animate-in slide-in-from-top duration-500">
              <h3 className="text-xl font-black mb-6 text-slate-800">New User Registration</h3>
              <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input 
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Alice Johnson"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input 
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="alice@school.com"
                    type="email"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Role</label>
                  <select 
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="PARENT">Parent</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
                {newUserRole === 'STUDENT' && (
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">IC Number</label>
                    <input 
                      value={newUserIc}
                      onChange={(e) => setNewUserIc(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="XXXXXX-XX-XXXX"
                    />
                  </div>
                )}
                <div className="lg:col-span-4 flex justify-end">
                  <button type="submit" className="bg-slate-900 text-white px-10 py-3 rounded-xl font-black hover:bg-slate-800 transition-all shadow-lg">
                    Finalize Registration
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Identified User</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Auth Role</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">System ID</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shadow-sm">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-800">{user.name}</p>
                            <p className="text-xs font-medium text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          user.role === 'ADMIN' ? 'bg-amber-50 border-amber-200 text-amber-700' : 
                          user.role === 'TEACHER' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                          user.role === 'STUDENT' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs font-mono font-bold text-slate-500">
                          {user.icNumber || user.id}
                        </p>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-3 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors">
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => onRemoveUser(user.id)}
                            className="p-3 hover:bg-rose-100 rounded-xl text-rose-600 transition-colors" 
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 sticky top-10">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                <LayoutGrid className="text-indigo-600" size={24} />
                Create New Class
              </h3>
              <form onSubmit={handleAddClass} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Class Name</label>
                  <input 
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="e.g. Grade 10 Alpha"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Assign Teacher</label>
                  <select 
                    value={newClassTeacherId}
                    onChange={(e) => setNewClassTeacherId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                  Initialize Classroom
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classes.map(c => {
                const teacher = users.find(u => u.id === c.teacherId);
                const classSize = users.filter(u => u.assignedClassId === c.id).length;
                return (
                  <div key={c.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                          <UsersIcon size={24} />
                        </div>
                        <button className="text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <h4 className="text-xl font-black text-slate-800 mb-1">{c.name}</h4>
                      <p className="text-xs font-bold text-slate-400 mb-4">Class ID: {c.id}</p>
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                          {teacher?.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-700">{teacher?.name || 'Unassigned'}</p>
                          <p className="text-[10px] font-bold text-indigo-500 uppercase">Class Teacher</p>
                        </div>
                      </div>
                      <div className="mt-4 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg w-fit">
                        {classSize} Enrolled Students
                      </div>
                    </div>
                    {/* Background blob */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
