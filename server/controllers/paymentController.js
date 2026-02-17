const stripeService = require('../services/stripeService');
const Booking = require('../models/Booking');
const Show = require('../models/Show');

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

        const stripeResult = await stripeService.createPaymentIntent(
            totalAmount,
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

        // Find show and verify seats
        const show = await Show.findById(showId);
        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
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

        // Create booking
        const booking = await Booking.create({
            user: req.user._id,
            show: showId,
            seats,
            totalAmount,
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
