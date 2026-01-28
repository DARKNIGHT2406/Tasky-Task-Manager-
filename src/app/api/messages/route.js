import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';
import { encrypt, decrypt } from '@/lib/encryption';
import mongoose from 'mongoose';
import Notification from '@/models/Notification';

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();
        const { recipientId, content } = await req.json();

        if (!recipientId || !content) {
            return NextResponse.json({ error: 'Recipient and content required' }, { status: 400 });
        }

        // Verify recipient exists
        const recipient = await User.findOne({ user_id: recipientId });
        if (!recipient) {
            return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
        }

        // Encrypt message
        const { iv, content: encryptedContent } = encrypt(content);

        const newMessage = await Message.create({
            sender: session.user.id,
            recipient: recipient._id,
            content: encryptedContent,
            iv,
        });



        // Create Notification for Recipient
        try {
            await Notification.create({
                recipient: recipient._id,
                sender: session.user.id,
                message: `New message from ${session.user.name}`,
                type: 'GENERAL',
                relatedId: newMessage._id,
            });

        } catch (notifError) {
            console.error('Notification creation failed:', notifError);
            // Don't fail the message send if notification fails?
            // Actually, for now let's log and proceed or throw? 
            // If we want stricter consistency... but for debugging let's proceed.
        }

        return NextResponse.json({ message: 'Sent' }, { status: 201 });
    } catch (error) {
        console.error('Send Error:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const otherUserId = searchParams.get('userId'); // Fetch conversation with specific user

        if (!otherUserId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const otherUser = await User.findOne({ user_id: otherUserId });
        if (!otherUser) {

            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }



        // Fetch messages between current user and other user
        const currentUserId = new mongoose.Types.ObjectId(session.user.id);
        const targetUserId = new mongoose.Types.ObjectId(otherUser._id);

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: targetUserId },
                { sender: targetUserId, recipient: currentUserId }
            ]
        }).sort({ createdAt: 1 }).limit(50).lean();

        // Decrypt messages
        const decryptedMessages = messages.map(msg => ({
            _id: msg._id,
            sender: msg.sender,
            recipient: msg.recipient,
            content: decrypt({ content: msg.content, iv: msg.iv }),
            createdAt: msg.createdAt,
            isMe: msg.sender.toString() === session.user.id
        }));

        return NextResponse.json(decryptedMessages);
    } catch (error) {
        console.error('Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}
