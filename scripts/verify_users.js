const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const UserSchema = new mongoose.Schema({
    name: { type: String },
    user_id: { type: String },
    role: { type: String },
    reports_to: { type: String }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function verify() {
    try {
        await mongoose.connect(MONGODB_URI);
        const users = await User.find({});
        console.log('All Users found:', JSON.stringify(users, null, 2));
        console.log('Total count:', users.length);
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
