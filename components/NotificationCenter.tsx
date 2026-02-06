import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationCenterProps {
    userId: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const notifications = useQuery(api.notifications.list, { userId }) || [];
    const markAsReadMutation = useMutation(api.notifications.markAsRead);
    const markAllAsReadMutation = useMutation(api.notifications.markAllAsRead);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        markAsReadMutation({ id: id as Id<"notifications"> });
    };

    const handleMarkAllRead = () => {
        markAllAsReadMutation({ userId });
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        // Less than 24 hours
        if (diff < 86400000) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors relative shadow-sm"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-slate-50 shadow-sm animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-bold text-slate-800">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                >
                                    <Check size={14} /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        className={`p-4 border-b border-slate-50 transition-colors hover:bg-slate-50 ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3 items-start">
                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-indigo-500' : 'bg-slate-300'}`} />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                                                        {notif.title}
                                                    </h4>
                                                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                        {formatTime(notif.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 leading-relaxed mb-2">{notif.message}</p>
                                                {!notif.isRead && (
                                                    <button
                                                        onClick={(e) => handleMarkAsRead(notif._id, e)}
                                                        className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 uppercase tracking-wide flex items-center gap-1"
                                                    >
                                                        <Check size={12} /> Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400">
                                    <Bell size={32} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-medium">No notifications yet</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
