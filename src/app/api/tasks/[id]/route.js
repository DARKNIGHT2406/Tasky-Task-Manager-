import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req, { params }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });


    await dbConnect();
    const task = await Task.findById(id).populate('assignee', 'name');

    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });


    // Access control
    if (session.user.role === 'EMPLOYEE' && task.assignee._id.toString() !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(task);
}

export async function PUT(req, { params }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const { status } = body;

    const task = await Task.findById(id);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    // State transitions strictness can be implemented here (e.g. Employee can only move from PENDING -> IN_PROGRESS -> SUBMITTED)
    // Manager can move from SUBMITTED -> COMPLETED (Approved) or PENDING (Rejected)

    if (session.user.role === 'EMPLOYEE') {
        if (task.assignee.toString() !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        // Employee can only create submission
        if (status && !['IN_PROGRESS', 'SUBMITTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid invalid status change for employee' }, { status: 400 });
        }
    }

    const updatedTask = await Task.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updatedTask);
}
