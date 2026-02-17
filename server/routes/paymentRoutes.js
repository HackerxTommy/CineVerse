const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPayment, getPaymentConfig } = require('../controllers/paymentController');

// Auth middleware
const protect = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Please login to continue' });
};

// GET /api/payments/config - Get Stripe publishable key
router.get('/config', getPaymentConfig);

// POST /api/payments/create-intent - Create payment intent (protected)
router.post('/create-intent', protect, createPaymentIntent);

// POST /api/payments/confirm - Confirm payment and create booking (protected)
router.post('/confirm', protect, confirmPayment);

module.exports = router;
