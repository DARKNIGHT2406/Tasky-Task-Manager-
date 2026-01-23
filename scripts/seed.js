/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not defined');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['MANAGER', 'EMPLOYEE'], default: 'EMPLOYEE' },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Upsert Manager
        await User.findOneAndUpdate(
            { employeeId: 'MAN001' },
            {
                name: 'Manager One',
                employeeId: 'MAN001',
                password: hashedPassword,
                role: 'MANAGER',
            },
            { upsert: true, new: true }
        );
        console.log('Manager (MAN001) password reset to: password123');

        // Upsert Employee
        await User.findOneAndUpdate(
            { employeeId: 'shiv@2026' },
            {
                name: 'shiv',
                employeeId: 'shiv@2026',
                password: hashedPassword,
                role: 'EMPLOYEE',
            },
            { upsert: true, new: true }
        );
        console.log('Employee (shiv@2026) password reset to: password123');

        console.log('Database credentials updated successfully!');

    } catch (error) {
        console.error('Seed Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
