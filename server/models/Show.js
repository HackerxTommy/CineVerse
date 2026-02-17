const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: [true, 'Movie reference is required']
    },
    theaterName: {
        type: String,
        required: [true, 'Theater name is required'],
        trim: true
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    seats: [{
        id: {
            type: String,
            required: true
        },
        row: {
            type: String,
            required: true
        },
        number: {
            type: Number,
            required: true
        },
        seatType: {
            type: String,
            enum: ['standard', 'premium', 'recliner'],
            default: 'standard'
        },
        isBooked: {
            type: Boolean,
            default: false
        },
        lockedUntil: {
            type: Date,
            default: null
        }
    }]
}, {
    timestamps: true
});

// Index for faster queries
showSchema.index({ movie: 1, startTime: 1 });

module.exports = mongoose.model('Show', showSchema);
