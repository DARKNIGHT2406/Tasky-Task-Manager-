const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

// Mock schemas
const Schema = mongoose.Schema;
const UserSchema = new Schema({ name: String, user_id: String, role: String, reports_to: String });
const MessageSchema = new Schema({ sender: Schema.Types.ObjectId, recipient: Schema.Types.ObjectId, content: String, iv: String });
const TaskSchema = new Schema({ title: String, assignee: Schema.Types.ObjectId, status: String });
const LeaveSchema = new Schema({ user: Schema.Types.ObjectId, type: String, status: String });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
const Leave = mongoose.models.Leave || mongoose.model('Leave', LeaveSchema);

async function runHealthCheck() {
    console.log('Starting Full System Health Check...');
    let issues = 0;

    try {
        // 1. Database Connection
        console.log('[1/5] Testing Database Connection...');
        if (!MONGODB_URI) throw new Error('MONGODB_URI not found in .env.local');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Database connected.');

        // 2. User Integrity Check
        console.log('[2/5] Checking User Data Integrity...');
        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        if (users.length === 0) {
            console.error('❌ WARNING: No users found!');
            issues++;
        } else {
            const managers = users.filter(u => u.role === 'MANAGER');
            if (managers.length === 0) console.warn('⚠️ No Managers found (might be intended?)');
        }
        console.log('✅ User integrity check complete.');

        // 3. Message Security Check
        console.log('[3/5] Checking Message Security...');
        const messages = await Message.find({}).limit(10);
        console.log(`Found ${messages.length} messages.`);
        messages.forEach(msg => {
            if (!msg.iv || !msg.content) {
                console.error(`❌ Message ${msg._id} missing IV or Content!`);
                issues++;
            }
        });
        console.log('✅ Message security check complete.');

        // 4. Task Check
        console.log('[4/5] Checking Tasks...');
        await Task.find({});
        console.log('✅ Task check complete.');

        // 5. Leave Check
        console.log('[5/5] Checking Leaves...');
        await Leave.find({});
        console.log('✅ Leave check complete.');

    } catch (error) {
        console.error('❌ FATAL ERROR during health check:', error);
        issues++;
    } finally {
        await mongoose.disconnect();
    }

    if (issues === 0) {
        console.log('🎉 SYSTEM HEALTHY. All checks passed.');
    } else {
        console.log(`⚠️ SYSTEM CHECK COMPLETED WITH ${issues} ISSUES.`);
    }
}

runHealthCheck();
