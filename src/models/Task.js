import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for this task.'],
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description for this task.'],
    },
    imageUrl: {
        type: String, // URL to stored image
    },
    startDate: {
        type: Date,
        required: [true, 'Please provide a start date.'],
    },
    endDate: {
        type: Date,
        required: [true, 'Please provide an end date.'],
    },
    status: {
        type: String,
        enum: ['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'OVERDUE'],
        default: 'PENDING',
    },
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes for optimization
TaskSchema.index({ assignee: 1 });
TaskSchema.index({ status: 1 });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
