const Booking = require('../models/Booking');
const Show = require('../models/Show');

// Seat tier multipliers — must match client-side SEAT_TIERS in SeatSelection.jsx
const getSeatMultiplier = (row) => {
    if (['A', 'B'].includes(row)) return 0.8;       // Front (Budget)
    if (['C', 'D', 'E'].includes(row)) return 1.0;   // Middle (Regular)
    if (['F', 'G'].includes(row)) return 1.5;         // Recliner (Premium)
    return 1.0;
};

const calculateSeatsTotal = (show, seatIds) => {
    return seatIds.reduce((sum, seatId) => {
        const seat = show.seats.find(s => s.id === seatId);
        if (!seat) return sum;
        return sum + (show.price * getSeatMultiplier(seat.row));
    }, 0);
};

// @desc    Lock seats (start booking timer)
// @route   POST /api/bookings/lock
exports.lockSeats = async (req, res, next) => {
    const { showId, selectedSeats } = req.body;

    // Validation
    if (!showId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
        return res.status(400).json({ message: 'Please provide showId and selectedSeats array' });
    }

    if (selectedSeats.length > 8) {
        return res.status(400).json({ message: 'Cannot book more than 8 seats at once' });
    }

    try {
        const show = await Show.findById(showId);
        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }

        const now = new Date();

        // Check seat availability
        const unavailableSeats = [];
        for (const seatId of selectedSeats) {
            const seat = show.seats.find(s => s.id === seatId);
            if (!seat) {
                return res.status(400).json({ message: `Seat ${seatId} does not exist` });
            }
            if (seat.isBooked) {
                unavailableSeats.push(seatId);
            } else if (seat.lockedUntil && new Date(seat.lockedUntil) > now) {
                unavailableSeats.push(seatId);
            }
        }

        if (unavailableSeats.length > 0) {
            return res.status(400).json({
                message: 'Some seats are not available',
                unavailableSeats
            });
        }

        // Lock seats for 5 minutes
        const lockExpiry = new Date(now.getTime() + 5 * 60 * 1000);

        for (const seatId of selectedSeats) {
            const seatIndex = show.seats.findIndex(s => s.id === seatId);
            if (seatIndex !== -1) {
                show.seats[seatIndex].lockedUntil = lockExpiry;
            }
        }

        await show.save();

        // EMIT WEBSOCKET EVENT — real-time seat lock notification
        const io = req.app.get('io');
        if (io) {
            io.to(`show:${showId}`).emit('seatLocked', {
                showId,
                seats: selectedSeats,
                lockExpires: lockExpiry
            });
        }

        res.json({
            message: 'Seats locked successfully',
            lockExpires: lockExpiry,
            lockedSeats: selectedSeats
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Create booking (confirm payment)
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
    const { showId, seats, totalAmount } = req.body;

    // Validation
    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({ message: 'Please provide showId and seats array' });
    }

    if (!totalAmount || totalAmount <= 0) {
        return res.status(400).json({ message: 'Invalid total amount' });
    }

    // Check authentication
    if (!req.user) {
        return res.status(401).json({ message: 'Please login to book tickets' });
    }

    try {
        const show = await Show.findById(showId);
        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }

        // SERVER-SIDE AMOUNT VALIDATION
        const expectedAmount = calculateSeatsTotal(show, seats);
        if (Math.abs(totalAmount - expectedAmount) > 0.01) {
            return res.status(400).json({
                message: 'Amount mismatch. Price may have changed.',
                expected: expectedAmount
            });
        }

        // Verify seats are available
        const unavailableSeats = [];
        for (const seatId of seats) {
            const seat = show.seats.find(s => s.id === seatId);
            if (!seat) {
                return res.status(400).json({ message: `Seat ${seatId} does not exist` });
            }
            if (seat.isBooked) {
                unavailableSeats.push(seatId);
            }
        }

        if (unavailableSeats.length > 0) {
            return res.status(400).json({
                message: 'Some seats are already booked',
                unavailableSeats
            });
        }

        // Create booking
        const booking = await Booking.create({
            user: req.user._id,
            show: showId,
            seats,
            totalAmount: expectedAmount,
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

        // Populate booking for response
        await booking.populate({
            path: 'show',
            populate: { path: 'movie', select: 'title poster' }
        });

        // EMIT WEBSOCKET EVENT
        const io = req.app.get('io');
        if (io) {
            io.to(`show:${showId}`).emit('seatBooked', {
                showId,
                seats,
                bookedBy: req.user._id
            });
        }

        res.status(201).json({
            message: 'Booking confirmed successfully',
            booking
        });

    } catch (err) {
        next(err);
    }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my
exports.getMyBookings = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Please login to view bookings' });
    }

    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate({
                path: 'show',
                populate: { path: 'movie', select: 'title poster duration' }
            })
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (err) {
        next(err);
    }
};
