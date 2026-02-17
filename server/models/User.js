const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        select: false
    },
    googleId: {
        type: String,
        sparse: true
    },
    avatar: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'admin'],
            message: '{VALUE} is not a valid role'
        },
        default: 'user'
    },
    // Profile fields
    phone: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: null,
        maxlength: 500
    },
    // 2FA fields
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        select: false
    },
    twoFactorBackupCodes: {
        type: [String],
        select: false
    }
}, {
    timestamps: true
});

userSchema.index({ googleId: 1 });

module.exports = mongoose.model('User', userSchema);
