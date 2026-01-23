import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    await dbConnect();

    const usersToCreate = [
        { name: 'Shivanshu', employeeId: 'MAN001', password: 'MAN001', role: 'MANAGER' },
        { name: 'Akshit', employeeId: 'MAN002', password: 'MAN002', role: 'MANAGER' },
        { name: 'Shiva', employeeId: 'EMP001', password: 'EMP001', role: 'EMPLOYEE' },
        { name: 'Rahul', employeeId: 'EMP002', password: 'EMP002', role: 'EMPLOYEE' },
    ];

    const results = [];

    for (const user of usersToCreate) {
        const existing = await User.findOne({ employeeId: user.employeeId });
        if (existing) {
            existing.name = user.name;
            await existing.save();
            results.push({ employeeId: user.employeeId, status: 'Updated name' });
        } else {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await User.create({
                name: user.name,
                employeeId: user.employeeId,
                password: hashedPassword,
                role: user.role,
            });
            results.push({ employeeId: user.employeeId, status: 'Created' });
        }
    }

    return NextResponse.json({ results });
}
