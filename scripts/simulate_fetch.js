const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    iv: { type: String },
    createdAt: { type: Date, default: Date.now },
});
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);

const UserSchema = new mongoose.Schema({
    name: { type: String },
    user_id: { type: String },
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function simulate() {
    try {
        await mongoose.connect(MONGODB_URI);

        console.log('Finding Amit and Mansi...');
        // Adjust these if names/ids are different in your seed
        const amit = await User.findOne({ user_id: 'MAN001' });
        const mansi = await User.findOne({ user_id: 'EMP016' });

        if (!amit || !mansi) {
            console.error('Could not find users.');
            return;
        }

        console.log(`Amit: ${amit._id} (String: ${amit._id.toString()})`);
        console.log(`Mansi: ${mansi._id} (String: ${mansi._id.toString()})`);

        // Case 1: Mansi fetching Amit's messages (Mansi is Session, Amit is Other)
        console.log('\n--- Case 1: Mansi (Session) fetching chat with Amit (Other) ---');
        const sessionUserId1 = mansi._id.toString(); // String
        const otherUserId1 = amit._id; // ObjectId

        const query1 = {
            $or: [
                { sender: sessionUserId1, recipient: otherUserId1 },
                { sender: otherUserId1, recipient: sessionUserId1 }
            ]
        };
        console.log('Query 1:', JSON.stringify(query1));
        const msgs1 = await Message.find(query1);
        console.log(`Found ${msgs1.length} messages.`);

        // Case 2: Amit fetching Mansi's messages (Amit is Session, Mansi is Other)
        console.log('\n--- Case 2: Amit (Session) fetching chat with Mansi (Other) ---');
        const sessionUserId2 = amit._id.toString(); // String
        const otherUserId2 = mansi._id; // ObjectId

        const query2 = {
            $or: [
                { sender: sessionUserId2, recipient: otherUserId2 },
                { sender: otherUserId2, recipient: sessionUserId2 }
            ]
        };
        console.log('Query 2:', JSON.stringify(query2));
        const msgs2 = await Message.find(query2);
        console.log(`Found ${msgs2.length} messages.`);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

simulate();
