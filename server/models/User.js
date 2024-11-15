const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nid: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        default: "https://via.placeholder.com/150",
    },
    bio: {
        type: String,
        default: "This user hasn't added a bio yet.",
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // Authored posts
    upvotedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // Posts upvoted by user
    downvotedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // Posts downvoted by user
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
