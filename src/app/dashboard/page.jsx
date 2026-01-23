import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import User from '@/models/User';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    if (session.user.role !== 'MANAGER') {
        redirect('/my-tasks');
    }

    let statsData = [
        { label: 'Total Employees', value: 0, color: 'blue', key: 'totalEmployees' },
        { label: 'Total Tasks Assigned', value: 0, color: 'indigo', key: 'totalTasks' },
        { label: 'Active Tasks', value: 0, color: 'orange', key: 'activeTasks' },
        { label: 'Pending Approval', value: 0, color: 'pink', key: 'pendingApproval' },
    ];
    let error = null;

    try {
        console.log('Dashboard: Connecting to DB...');
        await dbConnect();
        console.log('Dashboard: Fetching stats...');

        const [totalEmployees, totalTasks, activeTasks, pendingApproval] = await Promise.all([
            User.countDocuments({ role: 'EMPLOYEE' }),
            Task.countDocuments({}),
            Task.countDocuments({ status: { $in: ['PENDING', 'IN_PROGRESS'] } }),
            Task.countDocuments({ status: 'SUBMITTED' })
        ]);

        statsData = [
            { label: 'Total Employees', value: totalEmployees, color: 'blue', key: 'totalEmployees' },
            { label: 'Total Tasks Assigned', value: totalTasks, color: 'indigo', key: 'totalTasks' },
            { label: 'Active Tasks', value: activeTasks, color: 'orange', key: 'activeTasks' },
            { label: 'Pending Approval', value: pendingApproval, color: 'pink', key: 'pendingApproval' },
        ];
        console.log('Dashboard: Stats fetched successfully');
    } catch (err) {
        console.error('Dashboard Fetch Error:', err);
        error = err.message || 'Database Connection Failed';
        // render page with empty stats + error message
    }

    const aiSummary = "Productivity is up 12% this week. 3 tasks are critical.";

    return (
        <DashboardClient
            session={session}
            stats={statsData}
            aiSummary={aiSummary}
            error={error}
        />
    );
}
