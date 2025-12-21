
import { User, Mark, Feedback, WellBeingStatus, SchoolClass } from './types';

export const mockUsers: User[] = [
  { id: 'a1', name: 'Admin User', email: 'admin@school.com', role: 'ADMIN' },
  { id: 't1', name: 'Dr. Sarah Smith', email: 'sarah.smith@school.com', role: 'TEACHER', assignedClassId: 'c1' },
  { id: 's1', name: 'Alice Johnson', email: 'alice@school.com', role: 'STUDENT', icNumber: '050123-10-1234', assignedClassId: 'c1' },
  { id: 's2', name: 'Bob Wilson', email: 'bob@school.com', role: 'STUDENT', icNumber: '050520-14-5678', assignedClassId: 'c1' },
  { id: 'p1', name: 'Robert Johnson', email: 'robert@home.com', role: 'PARENT', childIcNumbers: ['050123-10-1234'] },
];

export const mockClasses: SchoolClass[] = [
  { id: 'c1', name: 'Grade 10 - Alpha', teacherId: 't1' },
  { id: 'c2', name: 'Grade 11 - Beta', teacherId: 't2' }
];

export const mockMarks: Mark[] = [
  { id: 'm1', studentIcNumber: '050123-10-1234', subjectId: '1', score: 85, maxScore: 100, assessmentType: 'Midterm', date: '2023-10-15' },
  { id: 'm2', studentIcNumber: '050123-10-1234', subjectId: '2', score: 42, maxScore: 100, assessmentType: 'Midterm', date: '2023-10-16' },
  { id: 'm3', studentIcNumber: '050123-10-1234', subjectId: '3', score: 78, maxScore: 100, assessmentType: 'Midterm', date: '2023-10-17' },
  { id: 'm4', studentIcNumber: '050123-10-1234', subjectId: '4', score: 92, maxScore: 100, assessmentType: 'Midterm', date: '2023-10-18' },
  { id: 'm5', studentIcNumber: '050123-10-1234', subjectId: '5', score: 48, maxScore: 100, assessmentType: 'Midterm', date: '2023-10-19' },
  { id: 'm6', studentIcNumber: '050123-10-1234', subjectId: '6', score: 88, maxScore: 100, assessmentType: 'Midterm', date: '2023-10-20' },
];

export const mockFeedbacks: Feedback[] = [
  {
    id: 'f1',
    studentIcNumber: '050123-10-1234',
    teacherId: 't1',
    comment: 'Alice is excelling in Science and Math but needs more focus on History and English Literature.',
    wellBeing: WellBeingStatus.GOOD,
    date: '2023-10-25'
  }
];
