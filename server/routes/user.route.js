const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');
const authenticate = require('../middlewares/authenticate');
const router = express.Router();
const editableProfileFields = ['username', 'firstName', 'lastName', 'bio', 'location', 'occupation', 'website', 'profilePicture', 'dateOfBirth'];
const sanitizeString = (value) => (typeof value === 'string' ? value.trim() : value);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Register user
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const newUser = new User({ username, email, password });
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

router.get('/search', async (req, res) => {
    const query = req.query.q?.toString().trim();
    if (!query) return res.json([]);

    try {
        const regex = new RegExp(escapeRegex(query), 'i');
        const users = await User.find({
            $or: [
                { username: regex },
                { firstName: regex },
                { lastName: regex },
                { location: regex },
            ],
        })
            .select('username firstName lastName profilePicture location occupation')
            .limit(20)
            .lean();

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error searching users' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
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
                match: { parentPost: null },
                select: 'title createdAt upvotes downvotes category tags',
            })
            .populate({
                path: 'upvotedPosts',
                select: 'title createdAt',
            })
            .populate({
                path: 'downvotedPosts',
                select: 'title createdAt',
            })
            .populate({
                path: 'followers',
                select: 'username profilePicture',
            })
            .populate({
                path: 'following',
                select: 'username profilePicture',
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

router.patch('/profile/:id', authenticate, async (req, res) => {
    const profileId = req.params.id;
    if (req.user._id?.toString() !== profileId) {
        return res.status(403).json({ error: 'You can only edit your own profile' });
    }

    try {
        const updates = {};
        editableProfileFields.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = sanitizeString(req.body[field]);
            }
        });

        if (Object.prototype.hasOwnProperty.call(updates, 'dateOfBirth')) {
            if (!updates.dateOfBirth) {
                updates.dateOfBirth = null;
            } else {
                const parsed = new Date(updates.dateOfBirth);
                if (Number.isNaN(parsed.getTime())) {
                    return res.status(400).json({ error: 'Invalid date of birth' });
                }
                updates.dateOfBirth = parsed;
            }
        }

        const user = await User.findByIdAndUpdate(profileId, updates, { new: true, runValidators: true })
            .select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Error updating profile' });
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
