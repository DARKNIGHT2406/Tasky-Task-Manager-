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
            const startDateStr = `${year}-${monthNum}-01`;
            // Get last day of month
            const lastDay = new Date(year, monthNum, 0).getDate();
            const endDateStr = `${year}-${monthNum}-${lastDay}`;

            query.date = { $gte: startDateStr, $lte: endDateStr };
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

        if (!photo || !location || !location.lat || !location.lng) {
            return NextResponse.json({ error: 'Photo and location required' }, { status: 400 });
        }

        const today = new Date().toISOString().split('T')[0];

        // Ensure user hasn't marked today
        const existing = await Attendance.findOne({ user: session.user.id, date: today });
        if (existing) {
            return NextResponse.json({ error: 'Attendance already marked' }, { status: 400 });
        }

        const record = await Attendance.create({
            user: session.user.id,
            date: today,
            photo, // Base64
            location: {
                lat: location.lat,
                lng: location.lng,
                address: location.address || 'Unknown Location'
            }
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
