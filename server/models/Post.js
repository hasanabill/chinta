const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Link to User model
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

module.exports = mongoose.model('Post', postSchema);
