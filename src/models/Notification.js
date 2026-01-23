import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['TASK_ASSIGNED', 'APPROVAL_REQUEST', 'TASK_UPDATED', 'GENERAL', 'LEAVE_REQUEST'],
        default: 'GENERAL',
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

NotificationSchema.index({ recipient: 1, read: 1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
