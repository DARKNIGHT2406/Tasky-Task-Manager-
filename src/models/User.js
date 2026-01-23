import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for this employee.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    employeeId: {
        type: String,
        required: [true, 'Please provide an employee ID.'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password.'],
    },
    role: {
        type: String,
        enum: ['MANAGER', 'EMPLOYEE'],
        default: 'EMPLOYEE',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Optimization
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
