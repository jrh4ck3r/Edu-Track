
export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export enum WellBeingStatus {
  GOOD = 'Good',
  MODERATE = 'Moderate',
  NEEDS_ATTENTION = 'Needs Attention'
}

export interface User {
  id: string;
  name: string;
  email?: string;
  password?: string; // For authentication
  mustChangePassword?: boolean; // Force password change on next login
  role: UserRole;
  icNumber?: string; // Unique ID for students
  childIcNumbers?: string[]; // For parents to track multiple children
  assignedClassId?: string; // For teachers and students
  studentYear?: string; // Standard 1-6
}

export interface TimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  teacherId: string;
  timetable?: TimetableEntry[];
}

export interface Subject {
  id: string;
  name: string;
}

export interface Mark {
  id: string;
  studentIcNumber: string;
  subjectId: string;
  score: number;
  maxScore: number;
  assessmentType: string;
  date: string;
}

export interface Feedback {
  id: string;
  studentIcNumber: string;
  teacherId: string;
  comment: string;
  wellBeing: WellBeingStatus;
  date: string;
}

export interface PerformanceSummary {
  average: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

// Appointment Types
export type AppointmentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Appointment {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
}

export interface AvailabilitySlot {
  id: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:00 AM"
  isBooked: boolean;
}

// Discussion Types
export interface DiscussionReply {
  id: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  timestamp: string;
}

export interface DiscussionPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: DiscussionReply[];
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
}

export interface Resource {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  description?: string;
  fileId: string;
  subject: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'GRADE' | 'ATTENDANCE' | 'APPOINTMENT' | 'SYSTEM';
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}
