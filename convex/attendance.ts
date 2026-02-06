import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveAttendance = mutation({
    args: {
        classId: v.string(),
        date: v.string(),
        records: v.array(v.object({
            studentId: v.string(),
            status: v.union(v.literal('PRESENT'), v.literal('ABSENT'), v.literal('LATE'), v.literal('EXCUSED')),
        })),
    },
    handler: async (ctx, args) => {
        for (const record of args.records) {
            const existing = await ctx.db
                .query("attendance")
                .filter(q => q.eq(q.field("studentId"), record.studentId))
                .filter(q => q.eq(q.field("date"), args.date))
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, { status: record.status });
            } else {
                await ctx.db.insert("attendance", {
                    classId: args.classId,
                    date: args.date,
                    studentId: record.studentId,
                    status: record.status
                });
            }
        }
    }
});

export const getByClassAndDate = query({
    args: { classId: v.string(), date: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("attendance")
            .filter(q => q.eq(q.field("classId"), args.classId))
            .filter(q => q.eq(q.field("date"), args.date))
            .collect();
    }
});

export const getByStudent = query({
    args: { studentId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("attendance")
            .filter(q => q.eq(q.field("studentId"), args.studentId))
            .collect();
    }
});

export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("attendance").collect();
    }
});
