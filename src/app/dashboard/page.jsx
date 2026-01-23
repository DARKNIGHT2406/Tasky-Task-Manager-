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
        await dbConnect();


        const [totalEmployees, totalTasks, activeTasks, pendingApproval, completedTasks] = await Promise.all([
            User.countDocuments({ role: 'EMPLOYEE' }),
            Task.countDocuments({}),
            Task.countDocuments({ status: { $in: ['PENDING', 'IN_PROGRESS'] } }),
            Task.countDocuments({ status: 'SUBMITTED' }),
            Task.countDocuments({ status: 'COMPLETED' })
        ]);

        statsData = [
            { label: 'Total Employees', value: totalEmployees, color: 'blue', key: 'totalEmployees' },
            { label: 'Total Tasks Assigned', value: totalTasks, color: 'indigo', key: 'totalTasks' },
            { label: 'Active Tasks', value: activeTasks, color: 'orange', key: 'activeTasks' },
            { label: 'Pending Approval', value: pendingApproval, color: 'pink', key: 'pendingApproval' },
        ];

        // Basic AI Logic (Heuristic based)
        const generateInsights = () => {
            const insights = [];
            const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            if (pendingApproval > 3) {
                insights.push(`Attention needed: ${pendingApproval} tasks are waiting for your approval.`);
            }

            if (activeTasks > totalEmployees * 3) {
                insights.push(`High workload detected: Average of ${(activeTasks / totalEmployees).toFixed(1)} tasks per employee.`);
            } else if (activeTasks < totalEmployees) {
                insights.push("Team availability is high. Utilizing capacity is recommended.");
            }

            if (completionRate > 80) {
                insights.push("Excellent momentum! Team completion rate is above 80%.");
            } else if (completionRate < 30 && totalTasks > 5) {
                insights.push("Project progress is slower than expected.");
            }

            if (insights.length === 0) {
                return "Operations are running smoothly. No critical anomalies detected.";
            }

            return insights.join(" ");
        };

        var aiSummary = generateInsights();


    } catch (err) {
        console.error('Dashboard Fetch Error:', err);
        error = err.message || 'Database Connection Failed';
        var aiSummary = "Unable to generate insights due to connection error.";
    }

    return (
        <DashboardClient
            session={session}
            stats={statsData}
            aiSummary={aiSummary}
            error={error}
        />
    );
}
