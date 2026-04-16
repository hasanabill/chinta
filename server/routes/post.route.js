const router = require('express').Router();
const Post = require('../models/Post');
const authenticate = require('../middlewares/authenticate');
const User = require('../models/User');
const mongoose = require('mongoose');

const isSameUserId = (a, b) => a?.toString() === b?.toString();
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const ALLOWED_CATEGORIES = ['general', 'tech', 'politics', 'finance', 'education', 'health', 'other'];

const parseTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.map((tag) => tag.toString().trim().toLowerCase()).filter(Boolean).slice(0, 10);
    return tags.toString().split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 10);
};

router.post('/', authenticate, async (req, res) => {
    const { title, body, category, tags, parentPost } = req.body;
    const parsedCategory = ALLOWED_CATEGORIES.includes(category) ? category : 'general';
    const parsedTags = parseTags(tags);

    try {
        if (parentPost && !isValidId(parentPost)) {
            return res.status(400).json({ error: 'Invalid parent post id' });
        }

        const newPost = new Post({
            title,
            body,
            author: req.user._id,
            category: parsedCategory,
            tags: parsedTags,
            parentPost: parentPost || null,
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
        const { category, tag, sort = 'recent' } = req.query;
        const filter = {};
        if (category && ALLOWED_CATEGORIES.includes(category)) filter.category = category;
        if (tag) filter.tags = tag.toString().trim().toLowerCase();

        const query = Post.find(filter)
            .populate({ path: 'author', select: 'username email' })
            .populate({ path: 'comments.user', select: 'username email' })
            .populate({ path: 'parentPost', select: 'title' })
            .sort({ createdAt: -1 });

        const posts = await query.lean();
        if (sort === 'top') {
            posts.sort((a, b) => {
                const scoreA = (a.upvotes?.length || 0) - (a.downvotes?.length || 0);
                const scoreB = (b.upvotes?.length || 0) - (b.downvotes?.length || 0);
                return scoreB - scoreA;
            });
        }

        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid post id' });
        const post = await Post.findById(req.params.id)
            .populate({ path: 'author', select: 'username email' })
            .populate({ path: 'comments.user', select: 'username email' })
            .populate({ path: 'parentPost', select: 'title' })
            .lean();
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

router.get('/:id/replies', async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid post id' });
        const replies = await Post.find({ parentPost: req.params.id })
            .populate({ path: 'author', select: 'username email' })
            .sort({ createdAt: 1 })
            .lean();
        res.json(replies);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch replies' });
    }
});


router.post('/:id/upvote', authenticate, async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid post id' });
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
        if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid post id' });
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
        if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid post id' });
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
