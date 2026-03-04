import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createAnnouncement = mutation({
    args: {
        authorId: v.string(),
        authorName: v.string(),
        authorRole: v.string(),
        title: v.string(),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("announcements", {
            ...args,
            date: new Date().toISOString(),
        });
    },
});

export const getAnnouncements = query({
    handler: async (ctx) => {
        return await ctx.db.query("announcements").order("desc").take(20);
    },
});

export const deleteAnnouncement = mutation({
    args: { id: v.id("announcements") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
