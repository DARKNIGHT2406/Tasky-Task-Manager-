import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    user_id: {
        type: String,
        required: [true, 'Please provide a User ID.'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password.'],
    },
    role: {
        type: String,
        enum: ['MANAGER', 'EMPLOYEE', 'HR', 'ADMIN'],
        default: 'EMPLOYEE',
    },
    reports_to: {
        type: String,
        default: null,
    },
    // --- HR SALARY DATA ( STRICTLY PRIVATE ) ---
    base_salary: {
        type: Number,
        default: 0,
        select: false // Never return by default 
    },
    per_day_salary: {
        type: Number,
        default: 0,
        select: false
    },
    per_minute_salary: {
        type: Number,
        default: 0,
        select: false
    },
    penalty_rule: {
        type: String,
        enum: ['FIXED', 'MINUTE'],
        default: 'MINUTE',
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Optimization
UserSchema.index({ role: 1 });
UserSchema.index({ reports_to: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);
