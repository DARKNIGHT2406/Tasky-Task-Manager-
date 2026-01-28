import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all employees
export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    await dbConnect();

    let query = {};

    // HIERARCHY VISIBILITY RULES
    if (type === 'chat') {
        // CHAT EXCEPTION: Open for all
        // Everyone can chat with everyone, but exclude self
        query = { user_id: { $ne: session.user.user_id } };
    } else {
        // TEAM PAGE RULES
        if (session.user.role === 'HR' || session.user.role === 'ADMIN') {
            // HR/Admin sees ALL
            query = {};
            // Exclude self for HR/Admin list
            query.user_id = { $ne: session.user.user_id };
        } else if (session.user.role === 'MANAGER') {
            // MANAGER sees ONLY their direct reports
            query = { reports_to: session.user.user_id };
        } else if (session.user.role === 'EMPLOYEE') {
            // EMPLOYEE sees ONLY their team (same manager)
            if (session.user.reports_to) {
                query = { reports_to: session.user.reports_to };
            } else {
                query = { reports_to: session.user.reports_to };
            }
        }

        // Apply self-exclusion for Team Page (Non-Employees)
        if (session.user.role !== 'EMPLOYEE' && type !== 'chat') {
            if (query.user_id) {
                query.user_id = { ...query.user_id, $ne: session.user.user_id };
            } else {
                query.user_id = { $ne: session.user.user_id };
            }
        }
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
}

// CREATE new employee
export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { role } = session.user;

    // Permission Check
    if (role === 'EMPLOYEE') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, employeeId, password, role: reqBodyRole, reports_to } = body;

        if (!name || !password || !employeeId) {
            return NextResponse.json({ error: 'Name, User ID, and password are required' }, { status: 400 });
        }

        // Manager Restriction: Can only create EMPLOYEES under THEMSELVES
        if (role === 'MANAGER') {
            if (reqBodyRole !== 'EMPLOYEE') {
                return NextResponse.json({ error: 'Managers can only create Employees' }, { status: 403 });
            }
            // Enforce reports_to to be the Manager
            // Ignore whatever was sent in reports_to
        }

        await dbConnect();

        // Check availability
        const existingUser = await User.findOne({ user_id: employeeId });
        if (existingUser) {
            return NextResponse.json({ error: 'User ID already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Determine final reports_to
        let finalReportsTo = reports_to;
        if (role === 'MANAGER') {
            finalReportsTo = session.user.user_id;
        }

        const newUser = await User.create({
            name,
            user_id: employeeId,
            password: hashedPassword,
            role: reqBodyRole || 'EMPLOYEE',
            reports_to: finalReportsTo || null,
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE employee
export async function DELETE(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { role } = session.user;
    if (role === 'EMPLOYEE') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await dbConnect();

    // If Manager, check if target user reports to them before deleting
    if (role === 'MANAGER') {
        const targetUser = await User.findById(id);
        if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (targetUser.reports_to !== session.user.user_id) {
            return NextResponse.json({ error: 'You can only remove your own employees' }, { status: 403 });
        }
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: 'User deleted' });
}
