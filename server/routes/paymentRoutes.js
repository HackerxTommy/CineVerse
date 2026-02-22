const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createPaymentIntent, confirmPayment, getPaymentConfig, handleWebhook } = require('../controllers/paymentController');

// GET /api/payments/config - Get Stripe publishable key
router.get('/config', getPaymentConfig);

// POST /api/payments/create-intent - Create payment intent (protected)
router.post('/create-intent', protect, createPaymentIntent);

// POST /api/payments/confirm - Confirm payment and create booking (protected)
router.post('/confirm', protect, confirmPayment);

// POST /api/payments/webhook - Stripe webhook (raw body parsed in server.js)
router.post('/webhook', handleWebhook);

module.exports = router;
