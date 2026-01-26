import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("classes").collect();
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        teacherId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("classes", { ...args, timetable: [] });
    },
});

export const updateTimetable = mutation({
    args: {
        classId: v.id("classes"),
        timetable: v.array(v.object({
            id: v.string(),
            day: v.string(),
            time: v.string(),
            subject: v.string(),
        })),
    },
    handler: async (ctx, args) => {
        return await ctx.db.patch(args.classId, { timetable: args.timetable });
    },
});
