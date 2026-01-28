import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        await dbConnect();

        // Ensure model is refreshed if needed (though fix-model should have handled it)

        const password = await bcrypt.hash('HR001', 10);

        // Check if exists first to avoid duplicate error if run multiple times
        const existing = await User.findOne({ user_id: 'HR001' });
        if (existing) {
            return NextResponse.json({ message: 'HR User already exists', user: existing });
        }

        const hrUser = await User.create({
            name: "Mansi Sharma",
            user_id: "HR001",
            password: password,
            role: "HR",
            reports_to: null
        });

        return NextResponse.json({
            message: 'HR User Created successfully',
            user: hrUser
        });
    } catch (error) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
