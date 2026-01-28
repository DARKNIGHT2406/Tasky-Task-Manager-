import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import Leave from '@/models/Leave';
import Notification from '@/models/Notification';
import Task from '@/models/Task';

export async function GET() {
    try {
        await dbConnect();

        const deletedUsers = await User.deleteMany({});
        const deletedAttendance = await Attendance.deleteMany({});
        const deletedLeaves = await Leave.deleteMany({});
        const deletedNotifications = await Notification.deleteMany({});
        const deletedTasks = await Task.deleteMany({});

        return NextResponse.json({
            message: 'All collections cleared successfully',
            deleted: {
                users: deletedUsers.deletedCount,
                attendance: deletedAttendance.deletedCount,
                leaves: deletedLeaves.deletedCount,
                notifications: deletedNotifications.deletedCount,
                tasks: deletedTasks.deletedCount
            }
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
