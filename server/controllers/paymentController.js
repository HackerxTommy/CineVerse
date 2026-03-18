const stripeService = require('../services/stripeService');
const Booking = require('../models/Booking');
const Show = require('../models/Show');

// Seat tier multipliers — must match client-side SEAT_TIERS in SeatSelection.jsx
const getSeatMultiplier = (row) => {
    if (['A', 'B'].includes(row)) return 0.8;       // Front (Budget)
    if (['C', 'D', 'E'].includes(row)) return 1.0;   // Middle (Regular)
    if (['F', 'G'].includes(row)) return 1.5;         // Recliner (Premium)
    return 1.0;
};

const CONVENIENCE_FEE = 30; // ₹30 per ticket

const calculateSeatsTotal = (show, seatIds) => {
    const baseTotal = seatIds.reduce((sum, seatId) => {
        const seat = show.seats.find(s => s.id === seatId);
        if (!seat) return sum;
        return sum + (show.price * getSeatMultiplier(seat.row));
    }, 0);
    return baseTotal + (seatIds.length * CONVENIENCE_FEE);
};

// @desc    Create payment intent
// @route   POST /api/payments/create-intent
exports.createPaymentIntent = async (req, res, next) => {
    const { showId, seats, totalAmount } = req.body;

    if (!req.user) {
        return res.status(401).json({ message: 'Please login to make payment' });
    }

    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({ message: 'Invalid booking details' });
    }

    if (!totalAmount || totalAmount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }

    try {
        const show = await Show.findById(showId).populate('movie', 'title');
        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }

        // SERVER-SIDE AMOUNT VALIDATION — prevent price tampering
        const expectedAmount = calculateSeatsTotal(show, seats);
        if (Math.abs(totalAmount - expectedAmount) > 0.01) {
            return res.status(400).json({
                message: 'Amount mismatch. Price may have changed.',
                expected: expectedAmount,
                received: totalAmount
            });
        }

        // CHECK FOR DUPLICATE BOOKING — prevent double bookings
        const existingBooking = await Booking.findOne({
            user: req.user._id,
            show: showId,
            seats: { $all: seats },
            status: { $in: ['pending', 'confirmed'] }
        });
        if (existingBooking) {
            return res.status(400).json({
                message: 'You already have a booking for these seats',
                bookingId: existingBooking._id
            });
        }

        // CHECK SEAT AVAILABILITY
        const unavailable = [];
        const now = new Date();
        for (const seatId of seats) {
            const seat = show.seats.find(s => s.id === seatId);
            if (!seat) {
                return res.status(400).json({ message: `Seat ${seatId} not found` });
            }
            if (seat.isBooked) {
                unavailable.push(seatId);
            } else if (seat.lockedUntil && new Date(seat.lockedUntil) > now) {
                // Seat is locked by another user — check if our user locked it
                // For now, allow if locked (user may have locked it themselves)
            }
        }
        if (unavailable.length > 0) {
            return res.status(400).json({
                message: 'Some seats are already booked',
                unavailable
            });
        }

        const stripeResult = await stripeService.createPaymentIntent(
            expectedAmount, // Use server-calculated amount, not client-sent
            'inr',
            {
                userId: req.user._id.toString(),
                showId: showId,
                seats: seats.join(','),
                movieTitle: show.movie?.title || 'Movie Ticket'
            }
        );

        // Handle demo mode (when Stripe is not configured)
        if (!stripeResult) {
            return res.json({
                clientSecret: null,
                paymentIntentId: null,
                demoMode: true,
                amount: expectedAmount,
                show: {
                    movie: show.movie?.title,
                    theater: show.theaterName,
                    time: show.startTime
                }
            });
        }

        res.json({
            clientSecret: stripeResult.clientSecret,
            paymentIntentId: stripeResult.paymentIntentId,
            amount: expectedAmount,
            show: {
                movie: show.movie?.title,
                theater: show.theaterName,
                time: show.startTime
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Confirm payment and create booking
// @route   POST /api/payments/confirm
exports.confirmPayment = async (req, res, next) => {
    const { paymentIntentId, showId, seats, totalAmount } = req.body;

    if (!req.user) {
        return res.status(401).json({ message: 'Please login' });
    }

    if (!paymentIntentId || !showId || !seats) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Verify payment was successful
        const isPaymentSuccessful = await stripeService.confirmPayment(paymentIntentId);

        if (!isPaymentSuccessful) {
            return res.status(400).json({ message: 'Payment not completed' });
        }

        // Find show
        const show = await Show.findById(showId);
        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }

        // SERVER-SIDE AMOUNT VALIDATION
        const expectedAmount = calculateSeatsTotal(show, seats);
        if (totalAmount && Math.abs(totalAmount - expectedAmount) > 0.01) {
            return res.status(400).json({ message: 'Amount mismatch' });
        }

        // Check seats are still available
        const unavailable = [];
        for (const seatId of seats) {
            const seat = show.seats.find(s => s.id === seatId);
            if (!seat) {
                return res.status(400).json({ message: `Seat ${seatId} not found` });
            }
            if (seat.isBooked) {
                unavailable.push(seatId);
            }
        }

        if (unavailable.length > 0) {
            return res.status(400).json({
                message: 'Some seats are no longer available',
                unavailable
            });
        }

        // DUPLICATE BOOKING CHECK
        const existingBooking = await Booking.findOne({
            paymentId: paymentIntentId,
            status: 'confirmed'
        });
        if (existingBooking) {
            return res.status(400).json({
                message: 'This payment has already been processed',
                bookingId: existingBooking._id
            });
        }

        // Create booking
        const booking = await Booking.create({
            user: req.user._id,
            show: showId,
            seats,
            totalAmount: expectedAmount,
            paymentId: paymentIntentId,
            status: 'confirmed'
        });

        // Mark seats as booked
        for (const seatId of seats) {
            const seatIndex = show.seats.findIndex(s => s.id === seatId);
            if (seatIndex !== -1) {
                show.seats[seatIndex].isBooked = true;
                show.seats[seatIndex].lockedUntil = null;
            }
        }
        await show.save();

        // Populate for response
        await booking.populate({
            path: 'show',
            populate: { path: 'movie', select: 'title poster' }
        });

        // EMIT WEBSOCKET EVENT — real-time seat update
        const io = req.app.get('io');
        if (io) {
            io.to(`show:${showId}`).emit('seatBooked', {
                showId,
                seats,
                bookedBy: req.user._id
            });
        }

        res.status(201).json({
            message: 'Booking confirmed!',
            booking: {
                _id: booking._id,
                seats: booking.seats,
                totalAmount: booking.totalAmount,
                status: booking.status,
                movie: booking.show?.movie?.title,
                theater: booking.show?.theaterName,
                showTime: booking.show?.startTime,
                poster: booking.show?.movie?.poster
            }
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Get payment configuration (publishable key)
// @route   GET /api/payments/config
exports.getPaymentConfig = (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
        currency: 'inr',
        supportedMethods: ['card', 'upi']
    });
};

// @desc    Stripe Webhook handler
// @route   POST /api/payments/webhook
exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.warn('STRIPE_WEBHOOK_SECRET not configured — webhook ignored');
        return res.status(200).json({ received: true });
    }

    let event;
    try {
        event = stripeService.verifyWebhookSignature(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ message: `Webhook Error: ${err.message}` });
    }

    // Handle events
    switch (event.type) {
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            console.log(`✅ Payment succeeded: ${paymentIntent.id}`);

            // Update any pending bookings for this payment
            await Booking.updateMany(
                { paymentId: paymentIntent.id, status: 'pending' },
                { status: 'confirmed' }
            );
            break;
        }
        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object;
            console.log(`❌ Payment failed: ${paymentIntent.id}`);

            // Cancel pending bookings and release seats
            const failedBookings = await Booking.find({
                paymentId: paymentIntent.id,
                status: 'pending'
            });

            for (const booking of failedBookings) {
                const show = await Show.findById(booking.show);
                if (show) {
                    for (const seatId of booking.seats) {
                        const seatIndex = show.seats.findIndex(s => s.id === seatId);
                        if (seatIndex !== -1) {
                            show.seats[seatIndex].isBooked = false;
                            show.seats[seatIndex].lockedUntil = null;
                        }
                    }
                    await show.save();
                }
                booking.status = 'cancelled';
                await booking.save();
            }
            break;
        }
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
};
