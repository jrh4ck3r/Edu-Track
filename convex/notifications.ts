import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
    args: {
        userId: v.string(),
        title: v.string(),
        message: v.string(),
        type: v.union(v.literal('GRADE'), v.literal('ATTENDANCE'), v.literal('APPOINTMENT'), v.literal('SYSTEM')),
        relatedId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("notifications", {
            ...args,
            isRead: false,
            createdAt: new Date().toISOString(),
        });
    }
});

export const list = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const notifications = await ctx.db
            .query("notifications")
            .filter(q => q.eq(q.field("userId"), args.userId))
            .collect();
        return notifications.reverse(); // Newest first (assuming insertion order roughly correlates) OR sort client side
    }
});

export const markAsRead = mutation({
    args: { id: v.id("notifications") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { isRead: true });
    }
});

export const markAllAsRead = mutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const text = await ctx.db
            .query("notifications")
            .filter(q => q.eq(q.field("userId"), args.userId))
            .filter(q => q.eq(q.field("isRead"), false))
            .collect();

        for (const notif of text) {
            await ctx.db.patch(notif._id, { isRead: true });
        }
    }
});
