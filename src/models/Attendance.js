import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true,
    },
    checkInTime: {
        type: Date,
        default: Date.now,
    },
    photo: {
        type: String, // Base64 string
        required: true,
    },
    location: {
        lat: Number,
        lng: Number,
        address: String, // Optional reverse geocode
    },
});

// Compound index to ensure one record per user per day
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
