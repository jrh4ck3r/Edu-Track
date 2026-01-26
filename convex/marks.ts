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
        score: v.number(),
        maxScore: v.number(),
        assessmentType: v.string(),
        date: v.string(),
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
