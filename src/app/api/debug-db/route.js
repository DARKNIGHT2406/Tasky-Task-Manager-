import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await dbConnect();

        const count = await User.countDocuments({});
        const users = await User.find({}).limit(5);
        const dbName = mongoose.connection.name;
        const host = mongoose.connection.host;

        return NextResponse.json({
            message: 'Debug Info',
            userCount: count,
            dbName,
            host,
            sampleUsers: users
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
