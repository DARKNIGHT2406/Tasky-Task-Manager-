import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, description, assigneeId, startDate, endDate } = body;

        if (!title || !startDate || !endDate || !assigneeId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        // Verify assignee exists
        const assignee = await User.findById(assigneeId);
        if (!assignee) {
            return NextResponse.json({ error: 'Assignee not found' }, { status: 404 });
        }

        const newTask = await Task.create({
            title,
            description,
            startDate,
            endDate,
            assignee: assigneeId,
            createdBy: session.user.id,
            status: 'PENDING',
        });

        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId'); // Filter by assignee

    let query = {};

    // Rules:
    // Manager can see all tasks, or filter by specific employee
    // Employee can only see their own tasks (enforced if they try to access this route, 
    // though dedicated /my-tasks route might be better, we can reuse this with logic)

    if (session.user.role === 'EMPLOYEE') {
        query = { assignee: session.user.id };
    } else if (employeeId) {
        query = { assignee: employeeId };
    }

    const tasks = await Task.find(query)
        .populate('assignee', 'name employeeId')
        .sort({ createdAt: -1 });

    return NextResponse.json(tasks);
}
