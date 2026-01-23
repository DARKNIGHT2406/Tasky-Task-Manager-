import mongoose from 'mongoose';

const LeaveSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for now, can be inferred from User's manager later
    },
    type: {
        type: String,
        enum: ['Sick', 'Casual', 'Emergency', 'Vacation', 'Other'],
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.models.Leave || mongoose.model('Leave', LeaveSchema);
