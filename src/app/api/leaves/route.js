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
            type: 'GENERAL', // Temporary workaround until server restart updates Schema enum
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

export async function GET() {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    try {
        const leaves = await Leave.find({ user: session.user.id }).sort({ createdAt: -1 });
        return new Response(JSON.stringify(leaves), { status: 200 });
    } catch {
        return new Response(JSON.stringify({ error: 'Failed to fetch leaves' }), { status: 500 });
    }
}
