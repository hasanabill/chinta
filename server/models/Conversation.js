const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    participantsHash: {
        type: String,
        required: true,
        unique: true,
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
    },
    lastMessagePreview: {
        type: String,
        default: '',
        trim: true,
    },
}, { timestamps: true });

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
