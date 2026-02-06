import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("users").collect();
    },
});

export const getByEmail = query({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
        role: v.union(v.literal('ADMIN'), v.literal('TEACHER'), v.literal('STUDENT'), v.literal('PARENT')),
        icNumber: v.optional(v.string()),
        mustChangePassword: v.optional(v.boolean()),
        studentYear: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check for duplicate Email (only if email is provided and not empty)
        if (args.email && args.email.trim().length > 0) {
            const existingEmail = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("email"), args.email))
                .first();
            if (existingEmail) return existingEmail._id;
        }

        // Check for duplicate IC (only if IC is provided)
        if (args.icNumber && args.icNumber.trim().length > 0) {
            const existingIC = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("icNumber"), args.icNumber))
                .first();
            if (existingIC) return existingIC._id;
        }

        return await ctx.db.insert("users", args);
    },
});

export const update = mutation({
    args: {
        id: v.id("users"),
        updates: v.object({
            name: v.optional(v.string()),
            email: v.optional(v.string()),
            role: v.optional(v.union(v.literal('ADMIN'), v.literal('TEACHER'), v.literal('STUDENT'), v.literal('PARENT'))),
            assignedClassId: v.optional(v.string()),
            childIcNumbers: v.optional(v.array(v.string())),
            password: v.optional(v.string()),
            mustChangePassword: v.optional(v.boolean()),
        }),
    },
    handler: async (ctx, args) => {
        return await ctx.db.patch(args.id, args.updates);
    },
});

export const deleteUser = mutation({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const unlinkChild = mutation({
    args: {
        parentId: v.id("users"),
        childIc: v.string()
    },
    handler: async (ctx, args) => {
        const parent = await ctx.db.get(args.parentId);
        if (!parent || !parent.childIcNumbers) return;

        const updatedChildren = parent.childIcNumbers.filter(ic => ic !== args.childIc);
        await ctx.db.patch(args.parentId, { childIcNumbers: updatedChildren });
    },
});
