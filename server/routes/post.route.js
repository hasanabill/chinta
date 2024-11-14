const router = require('express').Router();
const Post = require('../models/Post');

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author').populate('comments.user');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

router.post('/:id/upvote', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.upvotes.includes(req.user._id)) {
            post.upvotes = post.upvotes.filter(userId => userId.toString() !== req.user._id);
        } else {
            post.upvotes.push(req.user._id);
            post.downvotes = post.downvotes.filter(userId => userId.toString() !== req.user._id);
        }
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to upvote post' });
    }
});

router.post('/:id/downvote', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.downvotes.includes(req.user._id)) {
            post.downvotes = post.downvotes.filter(userId => userId.toString() !== req.user._id);
        } else {
            post.downvotes.push(req.user._id);
            post.upvotes = post.upvotes.filter(userId => userId.toString() !== req.user._id);
        }
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to downvote post' });
    }
});

router.post('/:id/comments', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        post.comments.push({ user: req.user._id, comment: req.body.comment });
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

module.exports = router;
