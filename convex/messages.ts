import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
    handler: async (ctx) => {
        return await ctx.db.query("messages").collect();
    },
});

export const sendMessage = mutation({
    args: {
        senderId: v.string(),
        receiverId: v.string(),
        content: v.string(),
        timestamp: v.string(),
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("messages", {
            senderId: args.senderId,
            receiverId: args.receiverId,
            content: args.content,
            timestamp: args.timestamp,
            isRead: false,
        });
        return messageId;
    },
});

export const getMessagesWithUser = query({
    args: {
        userId1: v.string(),
        userId2: v.string(),
    },
    handler: async (ctx, args) => {
        const messages = await ctx.db.query("messages").collect();
        // Filter messages between the two users
        return messages
            .filter(
                (m) =>
                    (m.senderId === args.userId1 && m.receiverId === args.userId2) ||
                    (m.senderId === args.userId2 && m.receiverId === args.userId1)
            )
            .sort(
                (a, b) =>
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );
    },
});

export const getConversations = query({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const messages = await ctx.db.query("messages").collect();
        const otherUserIds = new Set<string>();

        messages.forEach((m) => {
            if (m.senderId === args.userId) {
                otherUserIds.add(m.receiverId);
            } else if (m.receiverId === args.userId) {
                otherUserIds.add(m.senderId);
            }
        });

        return Array.from(otherUserIds);
    },
});

export const markMessagesAsRead = mutation({
    args: {
        userId: v.string(), // The user who is reading
        otherUserId: v.string(), // The user who sent the messages
    },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("messages")
            .filter((q) => q.eq(q.field("receiverId"), args.userId))
            .filter((q) => q.eq(q.field("senderId"), args.otherUserId))
            .filter((q) => q.eq(q.field("isRead"), false))
            .collect();

        for (const msg of messages) {
            await ctx.db.patch(msg._id, { isRead: true });
        }
    },
});
