import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Appointments
export const listAppointments = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("appointments").collect();
    },
});

export const requestAppointment = mutation({
    args: {
        studentId: v.string(),
        teacherId: v.string(),
        date: v.string(),
        time: v.string(),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("appointments", {
            ...args,
            status: "PENDING"
        });
    },
});

export const updateAppointmentStatus = mutation({
    args: {
        id: v.id("appointments"),
        status: v.string(), // APPROVED | REJECTED
    },
    handler: async (ctx, args) => {
        return await ctx.db.patch(args.id, { status: args.status });
    },
});

// Availability Slots
export const listSlots = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("availability_slots").collect();
    },
});

export const addSlot = mutation({
    args: {
        teacherId: v.string(),
        date: v.string(),
        time: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("availability_slots", { ...args, isBooked: false });
    },
});

export const bookSlot = mutation({
    args: {
        teacherId: v.string(),
        date: v.string(),
        time: v.string(),
    },
    handler: async (ctx, args) => {
        const slot = await ctx.db.query("availability_slots")
            .filter(q => q.and(
                q.eq(q.field("teacherId"), args.teacherId),
                q.eq(q.field("date"), args.date),
                q.eq(q.field("time"), args.time)
            ))
            .first();

        if (slot) {
            await ctx.db.patch(slot._id, { isBooked: true });
        }
    },
});
