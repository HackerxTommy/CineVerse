const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    poster: {
        type: String,
        default: null
    },
    backdrop: {
        type: String,
        default: null
    },
    genre: {
        type: [String],
        default: []
    },
    duration: {
        type: Number,
        min: [1, 'Duration must be at least 1 minute']
    },
    rating: {
        type: Number,
        min: [0, 'Rating cannot be negative'],
        max: [10, 'Rating cannot exceed 10']
    },
    format: {
        is3D: { type: Boolean, default: false },
        is4K: { type: Boolean, default: false },
        isIMAX: { type: Boolean, default: false },
        isDolby: { type: Boolean, default: false }
    },
    releaseDate: {
        type: Date
    },
    trailer: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Text index for search
movieSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Movie', movieSchema);
