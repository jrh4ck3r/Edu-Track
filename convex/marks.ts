import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Marks
export const getMarks = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("marks").collect();
    },
});

export const addMark = mutation({
    args: {
        studentIcNumber: v.string(),
        subjectId: v.string(),
        score: v.optional(v.number()),
        tahapPenguasaan: v.optional(v.union(
            v.literal('TP1'), v.literal('TP2'), v.literal('TP3'),
            v.literal('TP4'), v.literal('TP5'), v.literal('TP6')
        )),
        maxScore: v.optional(v.number()),
        assessmentType: v.string(),
        date: v.string(),
        attachmentId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("marks", args);
    },
});

// Feedbacks
export const getFeedbacks = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("feedbacks").collect();
    },
});

export const addFeedback = mutation({
    args: {
        studentIcNumber: v.string(),
        teacherId: v.string(),
        comment: v.string(),
        wellBeing: v.string(),
        date: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("feedbacks", args);
    },
});
