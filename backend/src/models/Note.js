const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

// User listing their own notes: filter userId, sort createdAt
noteSchema.index({ userId: 1, createdAt: -1 });
// Admin listing all notes sorted by createdAt
noteSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Note', noteSchema);
