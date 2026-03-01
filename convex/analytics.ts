import { query } from "./_generated/server";

export const getSystemStats = query({
    handler: async (ctx) => {
        // Collect all data needed for the admin dashboard
        // In a real production system, this would be highly indexed or pre-aggregated
        const users = await ctx.db.query("users").collect();
        const students = users.filter((u) => u.role === "STUDENT");
        const teachers = users.filter((u) => u.role === "TEACHER");
        const parents = users.filter((u) => u.role === "PARENT");

        const classes = await ctx.db.query("classes").collect();
        const attendanceRecords = await ctx.db.query("attendance").collect();
        const messages = await ctx.db.query("messages").collect();
        const discussions = await ctx.db.query("discussions").collect();

        // Calculate Engagement
        const totalMessages = messages.length;
        const totalDiscussions = discussions.length;

        // Calculate Attendance Roll-up
        const presentCount = attendanceRecords.filter((a) => a.status === "PRESENT").length;
        const lateCount = attendanceRecords.filter((a) => a.status === "LATE").length;

        // Weighted to consider Late as structurally "Present" but not perfect
        const attendancePercentage = attendanceRecords.length > 0
            ? Math.round(((presentCount + lateCount) / attendanceRecords.length) * 100)
            : 100;

        return {
            totalUsers: users.length,
            studentCount: students.length,
            teacherCount: teachers.length,
            parentCount: parents.length,
            totalClasses: classes.length,
            totalMessages,
            totalDiscussions,
            overallAttendancePercentage: attendancePercentage,
            totalAttendanceRecords: attendanceRecords.length,
        };
    },
});
