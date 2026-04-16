const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

const port = process.env.PORT || 5000;
const mongoURI = process.env.MONGO_URI || "";
const userSockets = new Map();
const toId = (id) => id.toString();
const isTestEnv = process.env.NODE_ENV === 'test';
const roomName = (conversationId) => `conversation:${conversationId}`;

const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST', 'DELETE'] },
});

if (!isTestEnv && mongoURI) {
    mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => console.log("DB Connected"))
        .catch((err) => console.log(err));
}

app.get('/', (req, res) => {
    res.send("Server is running");
});

const followLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
});

const messageLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api/posts", require('./routes/post.route.js'));
app.use("/api/user", require("./routes/user.route.js"));
app.use('/api/follow', followLimiter, require('./routes/follow.route'));
app.use('/api/messages', messageLimiter, require('./routes/message.route')({ io, userSockets }));

io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token provided'));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded._id.toString();
        return next();
    } catch (error) {
        return next(new Error('Invalid token'));
    }
});

io.on('connection', (socket) => {
    socket.on('message:send', async ({ conversationId, body }) => {
        const text = body?.trim();
        if (!conversationId || !text) return;
        try {
            const conversation = await Conversation.findById(conversationId).select('participants');
            if (!conversation) return;
            const isParticipant = conversation.participants.some((id) => toId(id) === socket.userId);
            if (!isParticipant) return;

            const message = await Message.create({
                conversationId,
                sender: socket.userId,
                body: text.slice(0, 2000),
                readBy: [socket.userId],
            });

            await Conversation.findByIdAndUpdate(conversationId, {
                $set: {
                    lastMessageAt: new Date(),
                    lastMessagePreview: text.slice(0, 120),
                },
            });

            const populatedMessage = await Message.findById(message._id)
                .populate('sender', 'username profilePicture')
                .lean();

            conversation.participants
                .map((id) => toId(id))
                .forEach((participantId) => {
                    const socketsForUser = userSockets.get(participantId) || [];
                    socketsForUser.forEach((socketId) => {
                        io.to(socketId).emit('message:receive', populatedMessage);
                    });
                });
        } catch (error) {
            console.error('Socket message:send failed', error);
        }
    });

    const sockets = userSockets.get(socket.userId) || [];
    sockets.push(socket.id);
    userSockets.set(socket.userId, sockets);

    socket.on('conversation:join', async ({ conversationId }) => {
        if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) return;
        try {
            const conversation = await Conversation.findById(conversationId).select('participants');
            if (!conversation) return;
            const isParticipant = conversation.participants.some((id) => toId(id) === socket.userId);
            if (!isParticipant) return;
            socket.join(roomName(conversationId));
        } catch (error) {
            console.error('Socket conversation:join failed', error);
        }
    });

    socket.on('conversation:leave', ({ conversationId }) => {
        if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) return;
        socket.leave(roomName(conversationId));
    });

    socket.on('typing:start', ({ conversationId }) => {
        if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) return;
        socket.to(roomName(conversationId)).emit('typing:start', { conversationId, userId: socket.userId });
    });

    socket.on('typing:stop', ({ conversationId }) => {
        if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) return;
        socket.to(roomName(conversationId)).emit('typing:stop', { conversationId, userId: socket.userId });
    });

    socket.on('conversation:read', ({ conversationId }) => {
        if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) return;
        socket.to(roomName(conversationId)).emit('conversation:read', { conversationId, userId: socket.userId });
    });

    socket.on('disconnect', () => {
        const current = userSockets.get(socket.userId) || [];
        const filtered = current.filter((id) => id !== socket.id);
        if (filtered.length === 0) {
            userSockets.delete(socket.userId);
        } else {
            userSockets.set(socket.userId, filtered);
        }
    });
});


if (!isTestEnv) {
    server.listen(port, () => {
        console.log(`Server is listening at http://localhost:${port}`);
    });
}

module.exports = { app, server, io };
