const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

// Minimal schemas
const UserSchema = new mongoose.Schema({ name: String, user_id: String });
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const MessageSchema = new mongoose.Schema({ content: String });
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
const NotificationSchema = new mongoose.Schema({ message: String });
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

// We can't truly simulate the Next.js API handler here easily because of next-auth getServerSession.
// However, we can simulate the DB operations to see if they work.

// OR, we can try to "mock" the request processing logic in a standalone script.

async function simulateDB() {
    try {
        await mongoose.connect(MONGODB_URI);

        console.log('Finding sender (employee) and recipient (manager)...');
        // Let's assume EMP016 sending to MAN001
        const sender = await User.findOne({ user_id: 'EMP016' });
        const recipient = await User.findOne({ user_id: 'MAN001' });

        if (!sender || !recipient) {
            console.error('Users not found');
            return;
        }

        console.log(`Sender: ${sender.name} (${sender._id})`);
        console.log(`Recipient: ${recipient.name} (${recipient._id})`);

        console.log('Attempting to create Notification...');
        // Simulating the code in route.js
        try {
            const notif = await Notification.create({
                recipient: recipient._id,
                sender: sender._id,
                message: `New message from ${sender.name}`,
                type: 'GENERAL',
                // relatedId: '...' // mocking
            });
            console.log('Notification created successfully:', notif);
        } catch (e) {
            console.error('Notification creation FAILED:', e);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

simulateDB();
