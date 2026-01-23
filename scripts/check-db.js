/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not defined');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    name: String,
    employeeId: String,
    role: String,
});
// Use existing model if possible or define a minimal one for reading
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function checkDb() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- ${u.name} (${u.role}) ID: ${u.employeeId}`);
        });

        if (users.length === 0) {
            console.log('No users found. You might need to seed the database.');
        }

    } catch (error) {
        console.error('DB Check Failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkDb();
