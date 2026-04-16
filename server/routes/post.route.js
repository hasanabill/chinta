const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const Reply = require('../models/Reply');
const authenticate = require('../middlewares/authenticate');
const User = require('../models/User');
const mongoose = require('mongoose');

const isSameUserId = (a, b) => a?.toString() === b?.toString();
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const ALLOWED_CATEGORIES = ['general', 'tech', 'politics', 'finance', 'education', 'health', 'other'];
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isFollowingFeed = (value) => ['1', 'true', 'following'].includes((value || '').toString().toLowerCase());

const getUserIdFromAuthHeader = (req) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded?._id || null;
    } catch {
        return null;
    }
};

const parseTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.map((tag) => tag.toString().trim().toLowerCase()).filter(Boolean).slice(0, 10);
    return tags.toString().split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 10);
};

router.post('/', authenticate, async (req, res) => {
    const { title, body, category, tags } = req.body;
    const parsedCategory = ALLOWED_CATEGORIES.includes(category) ? category : 'general';
    const parsedTags = parseTags(tags);

    try {
        const newPost = new Post({
            title,
            body,
            author: req.user._id,
            category: parsedCategory,
            tags: parsedTags,
            parentPost: null,
            upvotes: [],
            downvotes: []
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
        const { category, tag, q, sort = 'recent', feed } = req.query;
        const filter = {};
        if (category && ALLOWED_CATEGORIES.includes(category)) filter.category = category;
        if (tag) filter.tags = tag.toString().trim().toLowerCase();
        filter.parentPost = null;

        if (isFollowingFeed(feed)) {
            const requesterId = getUserIdFromAuthHeader(req);
            if (!requesterId) {
                return res.status(401).json({ error: 'Login required for following feed' });
            }
            const requester = await User.findById(requesterId).select('following').lean();
            if (!requester) {
                return res.status(404).json({ error: 'User not found' });
            }

            const followingIds = requester.following || [];
            filter.author = { $in: followingIds };
        }

        if (q && q.toString().trim()) {
            const searchText = q.toString().trim();
            const regex = new RegExp(escapeRegex(searchText), 'i');
            const matchedUsers = await User.find({
                $or: [{ username: regex }, { firstName: regex }, { lastName: regex }],
            }).select('_id').lean();
            const matchedUserIds = matchedUsers.map((user) => user._id);

            filter.$or = [
                { title: regex },
                { body: regex },
                { tags: regex },
                { category: regex },
                { author: { $in: matchedUserIds } },
            ];
        }

        const query = Post.find(filter)
            .populate({ path: 'author', select: 'username email' })
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

router.get('/:id/replies', async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid post id' });
        const replies = await Reply.find({ parentPost: req.params.id })
            .populate({ path: 'author', select: 'username email' })
            .sort({ createdAt: 1 })
            .lean();
        res.json(replies);
    }
    catch (error) {
        console.error('Error fetching replies:', error);
        res.status(500).json({ error: 'Failed to fetch replies' });
    }
});

router.post('/:id/replies', authenticate, async (req, res) => {
    const body = req.body.body?.trim();
    try {
        if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid post id' });
        const parentPost = await Post.findById(req.params.id).select('_id');
        if (!parentPost) return res.status(404).json({ error: 'Post not found' });
        if (!body) return res.status(400).json({ error: 'Reply body is required' });

        const reply = await Reply.create({
            parentPost: req.params.id,
            author: req.user._id,
            body,
        });

        const populatedReply = await Reply.findById(reply._id)
            .populate({ path: 'author', select: 'username email' })
            .lean();
        res.status(201).json(populatedReply);
    } catch (error) {
        console.error('Error creating reply:', error);
        res.status(500).json({ error: 'Failed to create reply' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid post id' });
        const post = await Post.findById(req.params.id)
            .populate({ path: 'author', select: 'username email' })
            .populate({ path: 'parentPost', select: 'title' })
            .lean();
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch post' });
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

module.exports = router;
