const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    show: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Show',
        required: [true, 'Show is required']
    },
    seats: {
        type: [String],
        required: [true, 'At least one seat is required'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'At least one seat must be selected'
        }
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'confirmed', 'cancelled'],
            message: '{VALUE} is not a valid status'
        },
        default: 'pending'
    },
    paymentId: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Index for faster user bookings lookup
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ show: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
