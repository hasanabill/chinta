const router = require('express').Router();
const Post = require('../models/Post');
const authenticate = require('../middlewares/authenticate');
const User = require('../models/User');

const isSameUserId = (a, b) => a?.toString() === b?.toString();

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
        await User.findByIdAndUpdate(
            req.user._id,
            { $push: { posts: newPost._id } },
            { new: true }
        );
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
        if (!post) return res.status(404).json({ error: 'Post not found' });
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

        const hasUpvoted = post.upvotes.some(userId => isSameUserId(userId, req.user._id));
        if (hasUpvoted) {
            post.upvotes = post.upvotes.filter(userId => !isSameUserId(userId, req.user._id));
            await User.findByIdAndUpdate(req.user._id, { $pull: { upvotedPosts: post._id } });
        } else {
            post.upvotes.push(req.user._id);
            post.downvotes = post.downvotes.filter(userId => !isSameUserId(userId, req.user._id));
            await User.findByIdAndUpdate(req.user._id, {
                $addToSet: { upvotedPosts: post._id },
                $pull: { downvotedPosts: post._id },
            });
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

        const hasDownvoted = post.downvotes.some(userId => isSameUserId(userId, req.user._id));
        if (hasDownvoted) {
            post.downvotes = post.downvotes.filter(userId => !isSameUserId(userId, req.user._id));
            await User.findByIdAndUpdate(req.user._id, { $pull: { downvotedPosts: post._id } });
        } else {
            post.downvotes.push(req.user._id);
            post.upvotes = post.upvotes.filter(userId => !isSameUserId(userId, req.user._id));
            await User.findByIdAndUpdate(req.user._id, {
                $addToSet: { downvotedPosts: post._id },
                $pull: { upvotedPosts: post._id },
            });
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
        const comment = req.body.comment?.trim();
        if (!comment) return res.status(400).json({ error: 'Comment is required' });

        post.comments.push({ user: req.user._id, comment });
        await post.save();

        const populatedPost = await Post.findById(req.params.id)
            .populate('author', 'username')
            .populate('comments.user', 'username');

        res.json(populatedPost);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
});



module.exports = router;
