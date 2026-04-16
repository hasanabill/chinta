const router = require('express').Router();
const mongoose = require('mongoose');
const authenticate = require('../middlewares/authenticate');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const toId = (id) => id.toString();
const conversationHash = (a, b) => [toId(a), toId(b)].sort().join(':');

const canMessageRecipient = async (senderId, recipientId) => {
    const [sender, recipient] = await Promise.all([
        User.findById(senderId).select('following'),
        User.findById(recipientId).select('allowMessagesFrom'),
    ]);

    if (!sender || !recipient) return false;
    if (recipient.allowMessagesFrom === 'everyone') return true;
    return sender.following.some((followedId) => toId(followedId) === toId(recipientId));
};

module.exports = ({ io, userSockets }) => {
    router.get('/conversations', authenticate, async (req, res) => {
        try {
            const conversations = await Conversation.find({ participants: req.user._id })
                .populate('participants', 'username profilePicture')
                .sort({ lastMessageAt: -1 })
                .lean();
            res.json(conversations);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch conversations' });
        }
    });

    router.post('/conversations/:userId', authenticate, async (req, res) => {
        const recipientId = req.params.userId;
        const senderId = req.user._id;

        if (!isValidId(recipientId)) return res.status(400).json({ error: 'Invalid user id' });
        if (recipientId === senderId) return res.status(400).json({ error: 'Cannot message yourself' });

        try {
            const allowed = await canMessageRecipient(senderId, recipientId);
            if (!allowed) return res.status(403).json({ error: 'You must follow this user to message' });

            const participants = [senderId, recipientId].sort();
            const hash = conversationHash(senderId, recipientId);
            let conversation = await Conversation.findOne({ participantsHash: hash });

            if (!conversation) {
                conversation = await Conversation.create({
                    participants,
                    participantsHash: hash,
                });
            }

            const populatedConversation = await Conversation.findById(conversation._id)
                .populate('participants', 'username profilePicture')
                .lean();

            res.status(201).json(populatedConversation);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create conversation' });
        }
    });

    router.get('/conversations/:conversationId/messages', authenticate, async (req, res) => {
        const { conversationId } = req.params;
        if (!isValidId(conversationId)) return res.status(400).json({ error: 'Invalid conversation id' });

        try {
            const conversation = await Conversation.findById(conversationId).select('participants');
            if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

            const isParticipant = conversation.participants.some((id) => toId(id) === req.user._id);
            if (!isParticipant) return res.status(403).json({ error: 'Unauthorized conversation access' });

            const messages = await Message.find({ conversationId })
                .populate('sender', 'username profilePicture')
                .sort({ createdAt: 1 })
                .lean();

            res.json(messages);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch messages' });
        }
    });

    router.post('/conversations/:conversationId/messages', authenticate, async (req, res) => {
        const { conversationId } = req.params;
        const body = req.body.body?.trim();

        if (!isValidId(conversationId)) return res.status(400).json({ error: 'Invalid conversation id' });
        if (!body) return res.status(400).json({ error: 'Message body is required' });
        if (body.length > 2000) return res.status(400).json({ error: 'Message is too long' });

        try {
            const conversation = await Conversation.findById(conversationId).select('participants');
            if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

            const isParticipant = conversation.participants.some((id) => toId(id) === req.user._id);
            if (!isParticipant) return res.status(403).json({ error: 'Unauthorized conversation access' });

            const message = await Message.create({
                conversationId,
                sender: req.user._id,
                body,
                readBy: [req.user._id],
            });

            await Conversation.findByIdAndUpdate(conversationId, {
                $set: {
                    lastMessageAt: new Date(),
                    lastMessagePreview: body.slice(0, 120),
                },
            });

            const populatedMessage = await Message.findById(message._id)
                .populate('sender', 'username profilePicture')
                .lean();

            conversation.participants
                .map((id) => toId(id))
                .filter((id) => id !== req.user._id)
                .forEach((participantId) => {
                    const sockets = userSockets.get(participantId) || [];
                    sockets.forEach((socketId) => {
                        io.to(socketId).emit('message:receive', populatedMessage);
                    });
                });

            res.status(201).json(populatedMessage);
        } catch (error) {
            res.status(500).json({ error: 'Failed to send message' });
        }
    });

    return router;
};
