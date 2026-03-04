import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addRecord = mutation({
    args: {
        studentId: v.string(),
        teacherId: v.string(),
        type: v.union(v.literal('KELAB'), v.literal('BADAN_BERUNIFORM'), v.literal('SUKAN')),
        activityName: v.string(),
        grade: v.string(),
        date: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("pajskRecords", args);
    },
});

export const getStudentRecords = query({
    args: { studentId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db.query("pajskRecords")
            .filter(q => q.eq(q.field("studentId"), args.studentId))
            .collect();
    },
});
