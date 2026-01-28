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

async function updatePassword() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('MAN123', salt);

        const result = await User.findOneAndUpdate(
            { employeeId: 'MAN001' },
            { password: hashedPassword },
            { new: true }
        );

        if (result) {
            console.log('Password updated successfully for MAN001');
        } else {
            console.log('User MAN001 not found');
        }

    } catch (error) {
        console.error('Error updating password:', error);
    } finally {
        await mongoose.disconnect();
    }
}

updatePassword();
