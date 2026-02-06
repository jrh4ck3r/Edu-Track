import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

export const create = mutation({
    args: {
        classId: v.string(),
        teacherId: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        fileId: v.string(),
        subject: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("resources", {
            ...args,
            createdAt: new Date().toISOString(),
        });
    },
});

export const list = query({
    args: { classId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db.query("resources").filter(q => q.eq(q.field("classId"), args.classId)).collect();
    }
});

export const getAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("resources").collect();
    }
});

export const getDownloadUrl = mutation({
    args: { fileId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.storage.getUrl(args.fileId);
    }
});
