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

async function debug() {
    try {
        await mongoose.connect(MONGODB_URI);

        console.log('--- USERS ---');
        const users = await User.find({});
        users.forEach(u => {
            console.log(`Name: ${u.name}, CustomID: ${u.user_id}, ObjID: ${u._id}`);
        });

        console.log('\n--- MESSAGES ---');
        const messages = await Message.find({});
        if (messages.length === 0) console.log('No messages found.');

        messages.forEach(msg => {
            console.log(`MsgID: ${msg._id}`);
            console.log(`  Sender:    ${msg.sender} (Type: ${typeof msg.sender})`);
            console.log(`  Recipient: ${msg.recipient} (Type: ${typeof msg.recipient})`);
            // Try to resolve names
            const sName = users.find(u => u._id.toString() === msg.sender.toString())?.name || 'UNKNOWN';
            const rName = users.find(u => u._id.toString() === msg.recipient.toString())?.name || 'UNKNOWN';
            console.log(`  Resolved:  ${sName} -> ${rName}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

debug();
