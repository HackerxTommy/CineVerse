const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { lockSeats, createBooking, getMyBookings } = require('../controllers/bookingController');

// POST /api/bookings/lock - Lock seats (start 5 min timer) — now protected
router.post('/lock', protect, lockSeats);

// POST /api/bookings - Create booking
router.post('/', protect, createBooking);

// GET /api/bookings/my - Get user's bookings
router.get('/my', protect, getMyBookings);

module.exports = router;
