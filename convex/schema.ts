import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.optional(v.string()),
        password: v.optional(v.string()),
        role: v.union(v.literal('ADMIN'), v.literal('TEACHER'), v.literal('STUDENT'), v.literal('PARENT')),
        icNumber: v.optional(v.string()),
        childIcNumbers: v.optional(v.array(v.string())),
        assignedClassId: v.optional(v.string()),
        mustChangePassword: v.optional(v.boolean()),
        studentYear: v.optional(v.string()), // Standard 1-6
        contactNumber: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
    }),
    classes: defineTable({
        name: v.string(),
        teacherId: v.string(),
        timetable: v.optional(v.array(v.object({
            id: v.string(),
            day: v.string(),
            time: v.string(),
            subject: v.string(),
        }))),
    }),
    marks: defineTable({
        studentIcNumber: v.string(),
        subjectId: v.string(),
        score: v.number(),
        maxScore: v.number(),
        assessmentType: v.string(),
        date: v.string(),
        attachmentId: v.optional(v.string()), // For scanned mark sheet
    }),
    attendance: defineTable({
        studentId: v.string(),
        classId: v.string(),
        date: v.string(), // YYYY-MM-DD
        status: v.union(v.literal('PRESENT'), v.literal('ABSENT'), v.literal('LATE'), v.literal('EXCUSED')),
    }),
    notifications: defineTable({
        userId: v.string(),
        title: v.string(),
        message: v.string(),
        type: v.union(v.literal('GRADE'), v.literal('ATTENDANCE'), v.literal('APPOINTMENT'), v.literal('SYSTEM')),
        isRead: v.boolean(),
        relatedId: v.optional(v.string()), // ID of the related object (e.g., mark ID)
        createdAt: v.string(),
    }),
    resources: defineTable({
        classId: v.string(),
        teacherId: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        fileId: v.string(), // Storage ID
        subject: v.string(),
        createdAt: v.string(),
    }),
    feedbacks: defineTable({
        studentIcNumber: v.string(),
        teacherId: v.string(),
        comment: v.string(),
        wellBeing: v.string(),
        date: v.string(),
    }),
    appointments: defineTable({
        studentId: v.string(),
        teacherId: v.string(),
        date: v.string(),
        time: v.string(),
        reason: v.string(),
        status: v.string(),
    }),
    availability_slots: defineTable({
        teacherId: v.string(),
        date: v.string(),
        time: v.string(),
        isBooked: v.boolean(),
    }),
    discussions: defineTable({
        authorId: v.string(),
        authorName: v.string(),
        authorRole: v.string(),
        title: v.string(),
        content: v.string(),
        timestamp: v.string(),
        likes: v.number(),
        replies: v.array(v.object({
            id: v.string(),
            authorName: v.string(),
            authorRole: v.string(),
            content: v.string(),
            timestamp: v.string(),
        })),
    }),
    messages: defineTable({
        senderId: v.string(),
        receiverId: v.string(),
        content: v.string(),
        timestamp: v.string(),
        isRead: v.boolean(),
    }),
    badges: defineTable({
        studentId: v.string(),
        teacherId: v.string(),
        title: v.string(),
        icon: v.string(),
        dateAwarded: v.string(),
    }),
    behaviorLogs: defineTable({
        studentId: v.string(),
        teacherId: v.string(),
        type: v.union(v.literal('POSITIVE'), v.literal('WARNING')),
        description: v.string(),
        date: v.string(),
    }),
});
