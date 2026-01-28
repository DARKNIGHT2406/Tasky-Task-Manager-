const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

// Inline Schema
const UserSchema = new mongoose.Schema({
    role: String,
    name: String,
    base_salary: { type: Number, select: true }, // Force select to check
    penalty_rule: String
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function verify() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected.');

        // Fetch 5 users
        const users = await User.find({}).limit(5);

        console.log('--- USER DATA SAMPLE ---');
        users.forEach(u => {
            console.log(`Name: ${u.name}, Role: '${u.role}', Salary: ${u.base_salary}`);
        });

        const count = await User.countDocuments({ role: { $in: ['MANAGER', 'EMPLOYEE'] } });
        console.log(`\nQuery Check: Found ${count} users with role MANAGER or EMPLOYEE.`);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

verify();
