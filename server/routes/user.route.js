const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authenticate = require('../middlewares/authenticate');
const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
    const { nid, username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ $or: [{ nid }, { email }] });
        if (existingUser) {
            return res.status(400).json({ error: 'NID or Email already in use' });
        }

        const newUser = new User({ nid, username, email, password });
        await newUser.save();

        const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ token });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: 'Error registering user' });
    }
});


// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.verifyPassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in user' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user' });
    }
});

router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate({
                path: 'posts',
                select: 'title createdAt upvotes downvotes',
            })
            .populate({
                path: 'upvotedPosts',
                select: 'title createdAt',
            })
            .populate({
                path: 'downvotedPosts',
                select: 'title createdAt',
            });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Error fetching user profile' });
    }
});


router.post('/profile/:id/posts', authenticate, async (req, res) => {
    const { title, body } = req.body;

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newPost = new Post({ title, body, author: user._id });
        const savedPost = await newPost.save();

        user.posts.push(savedPost._id);
        await user.save();

        res.status(201).json(savedPost);
    } catch (error) {
        res.status(500).json({ error: 'Error creating post' });
    }
});

module.exports = router;
