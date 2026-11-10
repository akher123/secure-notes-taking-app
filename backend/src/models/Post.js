const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

// $lookup posts by userId (foreignField)
postSchema.index({ userId: 1 });

module.exports = mongoose.model('Post', postSchema);
