import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("discussions").order("desc").collect();
    },
});

export const create = mutation({
    args: {
        authorId: v.string(),
        authorName: v.string(),
        authorRole: v.string(),
        title: v.string(),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("discussions", {
            ...args,
            timestamp: new Date().toISOString(),
            likes: 0,
            replies: []
        });
    },
});

export const reply = mutation({
    args: {
        discussionId: v.id("discussions"),
        authorName: v.string(),
        authorRole: v.string(),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const discussion = await ctx.db.get(args.discussionId);
        if (!discussion) throw new Error("Discussion not found");

        const newReply = {
            id: Math.random().toString(36).substr(2, 9),
            authorName: args.authorName,
            authorRole: args.authorRole,
            content: args.content,
            timestamp: new Date().toISOString(),
        };

        return await ctx.db.patch(args.discussionId, {
            replies: [...(discussion.replies || []), newReply]
        });
    },
});
