import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const logBehavior = mutation({
    args: {
        studentId: v.string(),
        teacherId: v.string(),
        type: v.union(v.literal('POSITIVE'), v.literal('WARNING')),
        description: v.string(),
        date: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("behaviorLogs", args);
    },
});

export const getStudentBehaviorLogs = query({
    args: {
        studentId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("behaviorLogs")
            .filter((q) => q.eq(q.field("studentId"), args.studentId))
            .collect();
    },
});
