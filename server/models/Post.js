const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Link to User model
    category: {
        type: String,
        default: 'general',
        enum: ['general', 'tech', 'politics', 'finance', 'education', 'health', 'other'],
    },
    tags: [{ type: String, lowercase: true, trim: true }],
    parentPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who upvoted
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who downvoted
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            comment: { type: String },
            date: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ parentPost: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
