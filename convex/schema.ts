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
});
