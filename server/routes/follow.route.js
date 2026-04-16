const router = require('express').Router();
const mongoose = require('mongoose');
const authenticate = require('../middlewares/authenticate');
const User = require('../models/User');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

router.post('/:userId', authenticate, async (req, res) => {
    const targetId = req.params.userId;
    const actorId = req.user._id;

    if (!isValidId(targetId)) return res.status(400).json({ error: 'Invalid user id' });
    if (targetId === actorId) return res.status(400).json({ error: 'You cannot follow yourself' });

    try {
        const [targetUser, actorUser] = await Promise.all([
            User.findById(targetId),
            User.findById(actorId),
        ]);

        if (!targetUser || !actorUser) return res.status(404).json({ error: 'User not found' });

        await Promise.all([
            User.findByIdAndUpdate(actorId, { $addToSet: { following: targetId } }),
            User.findByIdAndUpdate(targetId, { $addToSet: { followers: actorId } }),
        ]);

        const updatedActor = await User.findById(actorId).select('following');
        res.status(200).json({ followingCount: updatedActor.following.length, followedUserId: targetId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to follow user' });
    }
});

router.delete('/:userId', authenticate, async (req, res) => {
    const targetId = req.params.userId;
    const actorId = req.user._id;

    if (!isValidId(targetId)) return res.status(400).json({ error: 'Invalid user id' });
    if (targetId === actorId) return res.status(400).json({ error: 'You cannot unfollow yourself' });

    try {
        await Promise.all([
            User.findByIdAndUpdate(actorId, { $pull: { following: targetId } }),
            User.findByIdAndUpdate(targetId, { $pull: { followers: actorId } }),
        ]);

        const updatedActor = await User.findById(actorId).select('following');
        res.status(200).json({ followingCount: updatedActor.following.length, unfollowedUserId: targetId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to unfollow user' });
    }
});

router.get('/:userId/followers', async (req, res) => {
    const targetId = req.params.userId;
    if (!isValidId(targetId)) return res.status(400).json({ error: 'Invalid user id' });

    try {
        const user = await User.findById(targetId)
            .select('followers')
            .populate('followers', 'username email profilePicture');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ followers: user.followers });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch followers' });
    }
});

router.get('/:userId/following', async (req, res) => {
    const targetId = req.params.userId;
    if (!isValidId(targetId)) return res.status(400).json({ error: 'Invalid user id' });

    try {
        const user = await User.findById(targetId)
            .select('following')
            .populate('following', 'username email profilePicture');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ following: user.following });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch following users' });
    }
});

module.exports = router;
