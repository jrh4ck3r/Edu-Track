import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { X, Send, User as UserIcon } from 'lucide-react';

interface ComponentProps {
    currentUser: User;
    users: User[];
    messages: any[];
    onSendMessage: (receiverId: string, content: string) => void;
    onClose: () => void;
    initialSelectedUserId?: string | null;
}

const MessageDrawer: React.FC<ComponentProps> = ({ currentUser, users, messages, onSendMessage, onClose, initialSelectedUserId }) => {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(initialSelectedUserId || null);
    const [newMessageContent, setNewMessageContent] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Group messages by conversation
    const conversationsMap = new Map<string, any[]>();
    messages.forEach(m => {
        const otherUserId = m.senderId === currentUser.id ? m.receiverId : m.senderId;
        if (!conversationsMap.has(otherUserId)) conversationsMap.set(otherUserId, []);
        conversationsMap.get(otherUserId)!.push(m);
    });

    const conversationUserIds = Array.from(conversationsMap.keys());

    // Also include users that we might want to start a chat with (teachers/parents depending on role)
    const contactableUsers = users.filter(u => u.id !== currentUser.id && (currentUser.role !== 'STUDENT' || u.role === 'TEACHER'));

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedUserId]);

    const handleSend = () => {
        if (!selectedUserId || !newMessageContent.trim()) return;
        onSendMessage(selectedUserId, newMessageContent.trim());
        setNewMessageContent('');
    };

    const selectedUser = users.find(u => u.id === selectedUserId);
    const currentChatMsgs = selectedUserId ? conversationsMap.get(selectedUserId) || [] : [];

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10">
                    <h2 className="text-xl font-black text-slate-800">Messages</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">

                    {/* Conversation List (Hidden on mobile if a chat is selected) */}
                    <div className={`w-full md:w-1/3 border-r border-slate-100 flex flex-col ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-slate-50">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2 mb-2">Recent Chats</p>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {contactableUsers.map(user => {
                                const hasHistory = conversationsMap.has(user.id);
                                // For now, list all contactable users, or limit to history if preferred.
                                // Let's show history ones first.
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => setSelectedUserId(user.id)}
                                        className={`w-full p-3 rounded-xl flex items-center gap-3 transition-colors text-left ${selectedUserId === user.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 flex-shrink-0">
                                            {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover" /> : user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-bold text-sm text-slate-800 truncate">{user.name}</p>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">{user.role}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Active Chat Area */}
                    <div className={`flex-1 flex flex-col bg-slate-50 ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
                        {selectedUserId && selectedUser ? (
                            <>
                                <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-3 shadow-sm z-10">
                                    <button onClick={() => setSelectedUserId(null)} className="md:hidden p-2 text-slate-400"><X size={16} /></button>
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                        {selectedUser.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-sm">{selectedUser.name}</h3>
                                        <p className="text-[10px] text-slate-500">{selectedUser.role}</p>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                                    {currentChatMsgs.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                            <p className="text-sm font-medium">Say hello to {selectedUser.name} 👋</p>
                                        </div>
                                    ) : (
                                        currentChatMsgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(msg => {
                                            const isMe = msg.senderId === currentUser.id;
                                            return (
                                                <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] ${isMe ? 'ml-auto' : 'mr-auto'}`}>
                                                    <div className={`p-3 rounded-2xl ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'} shadow-sm text-sm`}>
                                                        {msg.content}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 mt-1 px-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            )
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
                                    <input
                                        value={newMessageContent}
                                        onChange={e => setNewMessageContent(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                                        placeholder="Type a message..."
                                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    />
                                    <button onClick={handleSend} disabled={!newMessageContent.trim()} className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-sm">
                                        <Send size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                <UserIcon size={48} className="mb-4 opacity-20" />
                                <p className="font-bold text-slate-500">Select a conversation</p>
                                <p className="text-sm mt-2">Choose someone from the list to start messaging.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MessageDrawer;
