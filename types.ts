
export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export enum WellBeingStatus {
  GOOD = 'Good',
  MODERATE = 'Moderate',
  NEEDS_ATTENTION = 'Needs Attention'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  icNumber?: string; // Unique ID for students
  childIcNumbers?: string[]; // For parents to track multiple children
  assignedClassId?: string; // For teachers and students
}

export interface SchoolClass {
  id: string;
  name: string;
  teacherId: string;
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
