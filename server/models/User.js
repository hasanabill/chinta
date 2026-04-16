const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    legacyNid: {
        type: String,
        required: false,
        sparse: true,
    },
    username: {
        type: String,
        required: true,
        trim: true,
    },
    firstName: {
        type: String,
        default: '',
        trim: true,
    },
    lastName: {
        type: String,
        default: '',
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
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
    dateOfBirth: {
        type: Date,
        default: null,
    },
    location: {
        type: String,
        default: '',
        trim: true,
    },
    occupation: {
        type: String,
        default: '',
        trim: true,
    },
    website: {
        type: String,
        default: '',
        trim: true,
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // Authored posts
    upvotedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // Posts upvoted by user
    downvotedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], // Posts downvoted by user
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    allowMessagesFrom: {
        type: String,
        enum: ['everyone', 'following'],
        default: 'following',
    },
});

userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });

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
