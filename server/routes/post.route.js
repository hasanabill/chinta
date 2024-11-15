const router = require('express').Router();
const Post = require('../models/Post');
const authenticate = require('../middlewares/authenticate');

router.post('/', authenticate, async (req, res) => {
    const { title, body } = req.body;

    try {
        const newPost = new Post({
            title,
            body,
            author: req.user._id,
            upvotes: [],
            downvotes: [],
            comments: []
        });

        await newPost.save();

        res.status(201).json(newPost);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: 'Failed to create post' });
    }
});


router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate({ path: 'author', select: 'username email' })
            .populate({ path: 'comments.user', select: 'username email' })
            .lean();

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate({ path: 'author', select: 'username email' })
            .populate({ path: 'comments.user', select: 'username email' })
            .lean();
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});


router.post('/:id/upvote', authenticate, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (post.upvotes.includes(req.user._id)) {
            post.upvotes = post.upvotes.filter(userId => userId.toString() !== req.user._id);
        } else {
            post.upvotes.push(req.user._id);
            post.downvotes = post.downvotes.filter(userId => userId.toString() !== req.user._id);
        }
        await post.save();
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to upvote post' });
    }
});


router.post('/:id/downvote', authenticate, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

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

router.post('/:id/comments', authenticate, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });

        post.comments.push({ user: req.user._id, comment: req.body.comment });
        await post.save();
        const populatedPost = await post.populate('comments.user', 'username').execPopulate();
        res.json(populatedPost);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
});


module.exports = router;
