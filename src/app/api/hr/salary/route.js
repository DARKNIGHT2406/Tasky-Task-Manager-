import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Attendance from '@/models/Attendance';

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'HR') {
        return NextResponse.json({ error: 'Unauthorized: HR Only' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // YYYY-MM

    if (!month) {
        return NextResponse.json({ error: 'Month is required (YYYY-MM)' }, { status: 400 });
    }

    try {
        const [year, monthNum] = month.split('-');
        const startDate = new Date(year, monthNum - 1, 1);
        const endDate = new Date(year, monthNum, 0, 23, 59, 59);

        console.log(`DEBUG SALARY: Fetching for ${month} (${startDate.toISOString()} - ${endDate.toISOString()})`);

        // Fetch ALL users to debug Role issue, explicitly selecting hidden salary fields
        // Using .lean() for performance and plain objects
        const allUsers = await User.find({})
            .select('+base_salary +per_day_salary +per_minute_salary +penalty_rule')
            .lean();

        console.log(`DEBUG SALARY: Total Users Found: ${allUsers.length}`);

        // Filter for specific roles in Memory (Safer against casing issues)
        const users = allUsers.filter(u => ['MANAGER', 'EMPLOYEE'].includes(u.role));

        console.log(`DEBUG SALARY: Target Users (Manager/Employee): ${users.length}`);

        if (users.length === 0) {
            console.log("DEBUG SALARY: Warning - No users match the role filter.");
            // Dump available roles to help debug
            const availableRoles = [...new Set(allUsers.map(u => u.role))];
            console.log("DEBUG SALARY: Available Roles in DB:", availableRoles);
        }

        // Fetch all attendance for the month (IGNORING STATUS FILTER FOR DEBUGGING)
        // using .lean() for consistency
        const attendanceRecords = await Attendance.find({
            date: { $gte: startDate, $lte: endDate }
            // status: 'PRESENT' // Commented out to see if we have ANY data
        }).lean();

        console.log(`DEBUG SALARY: Found ${attendanceRecords.length} TOTAL attendance records (Any Status).`);

        if (attendanceRecords.length > 0) {
            console.log("DEBUG SALARY RAW ATTENDANCE SAMPLE:", attendanceRecords[0]);
        }

        const payroll = users.map((user, index) => {
            // Loose matching to handle ObjectId vs String vs Populated objects
            const userAttendance = attendanceRecords.filter(r => {
                const attUserId = r.user?._id ? String(r.user._id) : String(r.user);
                const targetUserId = String(user._id);

                // Detailed debug for first user only
                if (index === 0 && attendanceRecords.length > 0) {
                    // Log only once per user loop, to avoid spamming 400 times
                    // console.log(`DEBUG COMPARE: AttUser: ${attUserId} vs Target: ${targetUserId}`);
                }

                return attUserId === targetUserId;
            });

            if (index === 0) {
                console.log(`DEBUG SALARY: Checking User: ${user.name} (ID: ${user._id})`);
                console.log(`DEBUG SALARY: Matches Found: ${userAttendance.length}`);
                if (userAttendance.length === 0 && attendanceRecords.length > 0) {
                    const firstAttUser = attendanceRecords[0].user;
                    console.log(`DEBUG MISMATCH SAMPLE: First Att Record User: ${firstAttUser} (Type: ${typeof firstAttUser})`);
                    console.log(`DEBUG MISMATCH SAMPLE: Target User ID: ${user._id} (Type: ${typeof user._id})`);
                }
            }

            // Calculate Days Present (PRESENT = 1, HALF_DAY = 0.5)
            const daysPresent = userAttendance.reduce((acc, r) => {
                const status = r.status || 'PRESENT'; // Default to PRESENT if missing in seed
                if (status === 'PRESENT') return acc + 1;
                if (status === 'HALF_DAY') return acc + 0.5;
                if (status === 'ABSENT') return acc;
                return acc + 1; // Default fallback
            }, 0);

            const totalLateMinutes = userAttendance.reduce((sum, r) => sum + (r.late_minutes || 0), 0);

            // Calculate Base Pay
            const earnedBase = daysPresent * user.per_day_salary;

            // Calculate Deductions
            let lateDeduction = 0;
            if (user.penalty_rule === 'FIXED') {
                // Example: Flat 500 per late instance
                const lateDays = userAttendance.filter(r => r.is_late).length;
                lateDeduction = lateDays * 50; // Configurable? Using 50 for now
            } else {
                // MINUTE based
                lateDeduction = totalLateMinutes * user.per_minute_salary;
            }

            const netSalary = Math.max(0, earnedBase - lateDeduction);

            return {
                id: user._id,
                name: user.name,
                role: user.role,
                base_salary: user.base_salary,
                days_present: daysPresent,
                total_late_minutes: totalLateMinutes,
                late_deduction: Math.round(lateDeduction),
                net_salary: Math.round(netSalary),
                status: 'GENERATED'
            };
        });

        console.log(`DEBUG SALARY: Generated Payroll for ${payroll.length} users.`);

        return NextResponse.json({ month, payroll });

    } catch (error) {
        console.error("Salary Calculation Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
