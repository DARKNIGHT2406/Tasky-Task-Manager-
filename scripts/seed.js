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
    user_id: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['MANAGER', 'EMPLOYEE', 'HR', 'ADMIN'], default: 'EMPLOYEE' },
    reports_to: { type: String, default: null },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);

        // Drop legacy index if exists
        try {
            await User.collection.dropIndex('employeeId_1');
            console.log('Dropped legacy index: employeeId_1');
        } catch (e) {
            // Index might not exist, ignore
            if (e.code !== 27) {
                console.log('Index drop info:', e.message);
            }
        }

        const salt = await bcrypt.genSalt(10);

        // Helper to hash password
        const hash = async (pwd) => await bcrypt.hash(pwd, salt);

        const managers = [
            // Managers have been seeded.
        ];

        for (const manager of managers) {
            await User.findOneAndUpdate(
                { user_id: manager.user_id },
                manager,
                { upsert: true, new: true }
            );
            console.log(`Upserted manager: ${manager.name} (${manager.user_id})`);
        }

        const employees = [
            // Managers and employees have been seeded.
            // Add new users here if needed.
        ];

        for (const emp of employees) {
            // Hash password for employee
            emp.password = await hash(emp.password);

            await User.findOneAndUpdate(
                { user_id: emp.user_id },
                emp,
                { upsert: true, new: true }
            );
            console.log(`Upserted employee: ${emp.name} (${emp.user_id})`);
        }

        console.log('Database seeding completed successfully!');

    } catch (error) {
        console.error('Seed Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}


seed();
