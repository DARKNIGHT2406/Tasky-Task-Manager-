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

    await dbConnect();

    // 1. Task Status Counts
    const statusCounts = await Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 2. Employee Performance (Tasks Completed vs Assigned)
    const employeePerformance = await User.aggregate([
        { $match: { role: 'EMPLOYEE' } },
        {
            $lookup: {
                from: 'tasks',
                localField: '_id',
                foreignField: 'assignee',
                as: 'tasks'
            }
        },
        {
            $project: {
                name: 1,
                totalTasks: { $size: '$tasks' },
                completedTasks: {
                    $size: {
                        $filter: {
                            input: '$tasks',
                            as: 'task',
                            cond: { $eq: ['$$task.status', 'COMPLETED'] } // Assuming Manager approves to COMPLETED
                        }
                    }
                },
                overdueTasks: {
                    $size: {
                        $filter: {
                            input: '$tasks',
                            as: 'task',
                            cond: { $eq: ['$$task.status', 'OVERDUE'] }
                        }
                    }
                }
            }
        }
    ]);

    // 3. Weekly Trends (Mocking slightly or using real data if available)
    // For MVP, just returning status counts and employee performance

    return NextResponse.json({
        statusCounts,
        employeePerformance
    });
}
