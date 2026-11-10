const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        interests: { type: [String], default: [] },
    },
    { timestamps: true }
);

// findOne({ email }) for login and register uniqueness
userSchema.index({ email: 1 }, { unique: true });
// Admin paginated user list sorted by createdAt
userSchema.index({ createdAt: -1 });
// Aggregation: group users by interests ($unwind on interests)
userSchema.index({ interests: 1 });

userSchema.pre('save', async function hashPassword() {
    if (!this.isModified('password')) {
        return;
    }
    if (typeof this.password === 'string' && this.password.startsWith('$2')) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', userSchema);
