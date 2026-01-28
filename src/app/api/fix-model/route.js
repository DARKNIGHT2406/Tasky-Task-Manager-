import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
    try {
        if (mongoose.models.User) {
            delete mongoose.models.User;
        }
        return NextResponse.json({ message: 'User model cleared from cache' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
