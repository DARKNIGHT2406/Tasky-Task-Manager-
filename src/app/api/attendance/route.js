import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Attendance from '@/models/Attendance';

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const history = searchParams.get('history');
    const month = searchParams.get('month'); // Format: YYYY-MM

    // Get today's ISO date (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    if (history === 'true') {
        let query = { user: session.user.id };

        if (month) {
            const [year, monthNum] = month.split('-');
            const startDate = new Date(year, monthNum - 1, 1);
            // Calculate end date for the last day of the month
            const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999); // Set to end of the last day of the month
            query.date = { $gte: startDate, $lte: endDate };
        }

        const records = await Attendance.find(query).sort({ date: -1 });
        return NextResponse.json(records);
    } else {
        // Return today's status
        const todayRecord = await Attendance.findOne({
            user: session.user.id,
            date: today
        });
        return NextResponse.json({
            marked: !!todayRecord,
            record: todayRecord
        });
    }
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();
        const body = await req.json();
        const { photo, location } = body;

        if (!photo || !location) {
            return NextResponse.json({ error: 'Photo and Location are required' }, { status: 400 });
        }

        const today = new Date().toISOString().split('T')[0];

        // Create record (Unique index handles duplicates)
        const record = await Attendance.create({
            user: session.user.id,
            date: today,
            photo,
            location,
        });

        return NextResponse.json(record, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Attendance already marked for today' }, { status: 400 });
        }
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
