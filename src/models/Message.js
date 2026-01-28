import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true, // Stores the encrypted hex string
    },
    iv: {
        type: String,
        required: true, // Stores initialization vector
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Optimization: Index for querying conversations
// Optimization: Index for querying conversations
// Compound indexes including createdAt to support efficient sorting
MessageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });
MessageSchema.index({ recipient: 1, sender: 1, createdAt: 1 });
MessageSchema.index({ createdAt: -1 }); // Keep global sort index

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
