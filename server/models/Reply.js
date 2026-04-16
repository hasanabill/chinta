const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    parentPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    body: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

replySchema.index({ parentPost: 1, createdAt: 1 });

module.exports = mongoose.model('Reply', replySchema);
