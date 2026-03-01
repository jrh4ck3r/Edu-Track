import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const awardBadge = mutation({
    args: {
        studentId: v.string(),
        teacherId: v.string(),
        title: v.string(),
        icon: v.string(),
        dateAwarded: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("badges", args);
    },
});

export const getStudentBadges = query({
    args: {
        studentId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("badges")
            .filter((q) => q.eq(q.field("studentId"), args.studentId))
            .collect();
    },
});
