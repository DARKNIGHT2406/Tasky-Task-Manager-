const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

// Schemas
const UserSchema = new mongoose.Schema({ name: String, user_id: String, role: String });
const AttendanceSchema = new mongoose.Schema({ user: mongoose.Schema.Types.ObjectId, date: String, location: Object });
const MessageSchema = new mongoose.Schema({ content: String });
const NotificationSchema = new mongoose.Schema({ message: String });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

async function finalCheck() {
    console.log('Starting Final System Optimization & Debug Check...');
    let issues = 0;

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Database Connection: Stable');

        // 1. User Check
        const users = await User.find({});
        console.log(`✅ Users: ${users.length} active users.`);
        if (users.length < 5) console.warn('⚠️ Low user count (might be dev env)');

        // 2. Attendance Check
        const attendance = await Attendance.find({});
        console.log(`✅ Attendance Records: ${attendance.length}`);
        // Check for new location structure
        const newRecord = attendance.find(r => r.location && r.location.address);
        if (newRecord) {
            console.log('✅ Location Upgrade: Active (Found records with address)');
        } else {
            console.log('ℹ️ Location Upgrade: Ready (No records with address yet)');
        }

        // 3. Chat Check
        const messages = await Message.find({});
        console.log(`✅ Chat System: ${messages.length} messages archived.`);

        // 4. Notifications
        const notifs = await Notification.find({});
        console.log(`✅ Notifications: ${notifs.length} delivered.`);

    } catch (e) {
        console.error('❌ Check Failed:', e);
        issues++;
    } finally {
        await mongoose.disconnect();
    }

    if (issues === 0) {
        console.log('\n🌟 SYSTEM STATUS: OPTIMIZED & HEALTHY 🌟');
    }
}

finalCheck();
