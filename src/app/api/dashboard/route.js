import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await dbConnect();

        const [
            totalEmployees,
            totalTasks,
            activeTasks,
            pendingApproval
        ] = await Promise.all([
            User.countDocuments({ role: 'EMPLOYEE' }),
            Task.countDocuments({}),
            Task.countDocuments({ status: { $in: ['PENDING', 'IN_PROGRESS'] } }), // "Active" could define differently, but usually means not done
            Task.countDocuments({ status: 'SUBMITTED' })
        ]);

        return NextResponse.json({
            totalEmployees,
            totalTasks,
            activeTasks,
            pendingApproval
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59',
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
