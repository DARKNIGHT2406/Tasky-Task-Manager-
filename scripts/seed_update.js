const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

// Inline Schemas to avoid module loading issues in standalone script
const UserSchema = new mongoose.Schema({
    role: String,
    name: String,
    user_id: String,
    base_salary: { type: Number, default: 0 },
    per_day_salary: { type: Number, default: 0 },
    per_minute_salary: { type: Number, default: 0 },
    penalty_rule: { type: String, default: 'MINUTE' }
}, { strict: false }); // Allow other fields to exist without validation

const AttendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date,
    in_time: Date,
    out_time: Date,
    status: String,
    is_late: Boolean,
    late_minutes: Number,
    location: Object,
    photo: String
});

// Ensure we don't overwrite if compiled
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);

async function seedData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Fetch Users
        const users = await User.find({});
        console.log(`📊 Found ${users.length} users.`);

        // 2. Update Salary
        for (const user of users) {
            let salary = 0;
            switch (user.role) {
                case 'HR':
                    salary = rand(80000, 120000);
                    break;
                case 'MANAGER':
                    salary = rand(60000, 80000);
                    break;
                case 'EMPLOYEE':
                    salary = rand(30000, 50000);
                    break;
                default:
                    salary = 30000;
            }

            // Calculations
            user.base_salary = salary;
            user.per_day_salary = parseFloat((salary / 30).toFixed(2));
            user.per_minute_salary = parseFloat((user.per_day_salary / (9 * 60)).toFixed(2)); // Assuming 9 hours
            user.penalty_rule = 'MINUTE';

            await user.save();
            console.log(`💰 Updated ${user.name} (${user.role}) - Base: ₹${salary}`);
        }

        // 3. Clear Attendance
        await Attendance.deleteMany({});
        console.log('🗑️  Cleared existing Attendance records.');

        // 4. Generate 30 Days Attendance
        const today = new Date();
        const past30Days = [];
        for (let i = 1; i <= 30; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            if (d.getDay() !== 0) { // Skip Sundays (0)
                past30Days.push(d);
            }
        }

        let totalAtt = 0;

        for (const user of users) {
            const records = [];
            for (const date of past30Days) {
                const randVal = Math.random();
                let status = 'PRESENT';

                // 90% Present, 5% Absent, 5% Half Day
                if (randVal > 0.95) status = 'ABSENT';
                else if (randVal > 0.90) status = 'HALF_DAY';

                if (status === 'ABSENT') continue;

                // Random Login Time (09:00 - 10:30)
                // 9 AM = 9 * 60 = 540 mins
                // Delay up to 90 mins
                const delayMins = Math.floor(Math.random() * 90);
                const inTime = new Date(date);
                inTime.setHours(9, delayMins, 0); // 09:00 + delay

                // Check Late
                const isLate = delayMins > 0;

                records.push({
                    user: user._id,
                    date: date,
                    in_time: inTime,
                    status: status,
                    is_late: isLate,
                    late_minutes: isLate ? delayMins : 0,
                    location: { address: 'Seeded Location' },
                    photo: 'Seeded Photo'
                });
            }
            if (records.length > 0) {
                await Attendance.insertMany(records);
                totalAtt += records.length;
                console.log(`📅 Generated ${records.length} records for ${user.name}`);
            }
        }

        console.log(`✨ DONE! Generated ${totalAtt} total attendance records.`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

seedData();
