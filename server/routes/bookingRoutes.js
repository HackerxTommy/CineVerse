const express = require('express');
const router = express.Router();
const { lockSeats, createBooking, getMyBookings } = require('../controllers/bookingController');

// Auth middleware
const protect = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Please login to access this resource' });
};

// POST /api/bookings/lock - Lock seats (start 5 min timer)
router.post('/lock', lockSeats);

// POST /api/bookings - Create booking
router.post('/', protect, createBooking);

// GET /api/bookings/my - Get user's bookings
router.get('/my', protect, getMyBookings);

module.exports = router;
