const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
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

        const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token });
    } catch (error) {
        console.error("Error registering user:", error); // Add this line to log the error
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

        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in user' });
    }
});

module.exports = router;