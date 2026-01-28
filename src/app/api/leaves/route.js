import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Leave from "@/models/Leave";
import Notification from "@/models/Notification";
import User from "@/models/User";

export async function POST(req) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    try {
        const { type, reason, startDate, endDate } = await req.json();

        // Basic validation
        if (!startDate || !endDate) {
            return new Response(JSON.stringify({ error: 'Dates are required' }), { status: 400 });
        }

        // Fetch user to find manager (assuming we have logic for it, or just notify all admins/managers)
        // For simplicity now, we might skip direct manager assignment if not in User model
        // Or finding the admin. Let's assume there is at least one admin or just store it.

        const newLeave = await Leave.create({
            user: session.user.id,
            type,
            reason,
            startDate,
            endDate,
            status: 'PENDING'
        });

        // Notify Admins/Managers (Broadcasting to all "MANAGER" or "ADMIN" roles)
        const managers = await User.find({ role: { $in: ['MANAGER', 'ADMIN'] } });

        const notifications = managers.map(manager => ({
            recipient: manager._id,
            sender: session.user.id,
            message: `New Leave Request from ${session.user.name}: ${type}`,
            type: 'LEAVE_REQUEST',
            relatedId: newLeave._id
        }));

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        return new Response(JSON.stringify(newLeave), { status: 201 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to submit leave request' }), { status: 500 });
    }
}

export async function GET(req) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const all = searchParams.get('all');

        let query = { user: session.user.id };
        if (all === 'true') {
            if (session.user.role === 'MANAGER') {
                // Manager can only see leaves of their reports
                const reports = await User.find({ reports_to: session.user.user_id }).select('_id');
                const reportIds = reports.map(u => u._id);
                query = { user: { $in: reportIds } };
            } else if (session.user.role === 'HR' || session.user.role === 'ADMIN') {
                // HR/Admin can see all
                query = {};
            }
        }

        const leaves = await Leave.find(query).populate('user', 'name employeeId').sort({ createdAt: -1 });
        return new Response(JSON.stringify(leaves), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to fetch leaves' }), { status: 500 });
    }
}

export async function PATCH(req) {
    await connectDB();
    const session = await getServerSession(authOptions);
    // Allow HR/Admin/Manager to approve (refine if needed, assuming Manager for now based on prompt)
    if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'HR' && session.user.role !== 'ADMIN')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const { id, status } = await req.json();

        if (!id || !['APPROVED', 'REJECTED'].includes(status)) {
            return new Response(JSON.stringify({ error: 'Invalid ID or Status' }), { status: 400 });
        }

        // Fetch leave to verify permissions
        const leaveToUpdate = await Leave.findById(id).populate('user');
        if (!leaveToUpdate) {
            return new Response(JSON.stringify({ error: 'Leave not found' }), { status: 404 });
        }

        // Check if Manager is authorized (must be direct report)
        if (session.user.role === 'MANAGER') {
            const leaveUser = await User.findById(leaveToUpdate.user);
            if (leaveUser.reports_to !== session.user.user_id) {
                return new Response(JSON.stringify({ error: 'Unauthorized: User does not report to you' }), { status: 403 });
            }
        }

        const leave = await Leave.findByIdAndUpdate(id, { status }, { new: true });

        // Notify Employee
        await Notification.create({
            recipient: leave.user,
            sender: session.user.id,
            message: `Your leave request has been ${status.toLowerCase()}`,
            type: 'GENERAL',
            relatedId: leave._id
        });

        return new Response(JSON.stringify(leave), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to update leave' }), { status: 500 });
    }
}
