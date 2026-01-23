import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all employees
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    // Fetch all users except the current manager (optional, or fetch all)
    const users = await User.find({ role: 'EMPLOYEE' }).sort({ createdAt: -1 });
    return NextResponse.json(users);
}

// CREATE new employee
export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, employeeId, password } = body;

        if (!name || !password || !employeeId) {
            return NextResponse.json({ error: 'Name, Employee ID, and password are required' }, { status: 400 });
        }

        await dbConnect();

        // Check if employee ID already exists
        const existingUser = await User.findOne({ employeeId });
        if (existingUser) {
            return NextResponse.json({ error: 'Employee ID already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            employeeId,
            password: hashedPassword,
            role: 'EMPLOYEE',
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE employee
export async function DELETE(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await dbConnect();
    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: 'User deleted' });
}
