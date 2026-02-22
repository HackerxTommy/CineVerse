const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const User = require('../models/User');

// ==================== DASHBOARD ====================

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
    try {
        const [totalMovies, totalShows, totalBookings, totalUsers, recentBookings] = await Promise.all([
            Movie.countDocuments(),
            Show.countDocuments(),
            Booking.countDocuments(),
            User.countDocuments(),
            Booking.find()
                .populate('user', 'name email')
                .populate({
                    path: 'show',
                    populate: { path: 'movie', select: 'title' }
                })
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        const revenue = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.json({
            stats: {
                totalMovies,
                totalShows,
                totalBookings,
                totalUsers,
                totalRevenue: revenue[0]?.total || 0
            },
            recentBookings
        });
    } catch (err) {
        next(err);
    }
};

// ==================== MOVIES CRUD ====================

// @desc    Create a movie
// @route   POST /api/admin/movies
exports.createMovie = async (req, res, next) => {
    try {
        const movie = await Movie.create(req.body);
        res.status(201).json({ message: 'Movie created successfully', movie });
    } catch (err) {
        next(err);
    }
};

// @desc    Update a movie
// @route   PUT /api/admin/movies/:id
exports.updateMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json({ message: 'Movie updated successfully', movie });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid movie ID' });
        }
        next(err);
    }
};

// @desc    Delete a movie
// @route   DELETE /api/admin/movies/:id
exports.deleteMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        // Delete associated shows and bookings
        const shows = await Show.find({ movie: req.params.id });
        const showIds = shows.map(s => s._id);

        await Booking.deleteMany({ show: { $in: showIds } });
        await Show.deleteMany({ movie: req.params.id });
        await movie.deleteOne();

        res.json({ message: 'Movie and associated data deleted successfully' });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid movie ID' });
        }
        next(err);
    }
};

// ==================== SHOWS CRUD ====================

// @desc    Create a show
// @route   POST /api/admin/shows
exports.createShow = async (req, res, next) => {
    try {
        const { movieId, theaterName, startTime, price } = req.body;

        if (!movieId || !theaterName || !startTime || !price) {
            return res.status(400).json({ message: 'Please provide movieId, theaterName, startTime, and price' });
        }

        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        // Generate seats
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        const seatsPerRow = 12;
        const seats = [];
        rows.forEach(row => {
            for (let i = 1; i <= seatsPerRow; i++) {
                seats.push({
                    id: `${row}${i}`,
                    row,
                    number: i,
                    seatType: row <= 'B' ? 'recliner' : row <= 'D' ? 'premium' : 'standard',
                    isBooked: false,
                    lockedUntil: null
                });
            }
        });

        const show = await Show.create({
            movie: movieId,
            theaterName,
            startTime: new Date(startTime),
            price,
            seats
        });

        res.status(201).json({ message: 'Show created successfully', show });
    } catch (err) {
        next(err);
    }
};

// @desc    Update a show
// @route   PUT /api/admin/shows/:id
exports.updateShow = async (req, res, next) => {
    try {
        const { theaterName, startTime, price } = req.body;
        const show = await Show.findById(req.params.id);

        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }

        if (theaterName) show.theaterName = theaterName;
        if (startTime) show.startTime = new Date(startTime);
        if (price) show.price = price;

        await show.save();
        res.json({ message: 'Show updated successfully', show });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid show ID' });
        }
        next(err);
    }
};

// @desc    Delete a show
// @route   DELETE /api/admin/shows/:id
exports.deleteShow = async (req, res, next) => {
    try {
        const show = await Show.findById(req.params.id);
        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }

        await Booking.deleteMany({ show: req.params.id });
        await show.deleteOne();

        res.json({ message: 'Show and associated bookings deleted successfully' });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid show ID' });
        }
        next(err);
    }
};

// ==================== BOOKINGS ====================

// @desc    Get all bookings
// @route   GET /api/admin/bookings
exports.getAllBookings = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [bookings, total] = await Promise.all([
            Booking.find()
                .populate('user', 'name email')
                .populate({
                    path: 'show',
                    populate: { path: 'movie', select: 'title poster' }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Booking.countDocuments()
        ]);

        res.json({
            bookings,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Cancel a booking (admin)
// @route   PUT /api/admin/bookings/:id/cancel
exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        // Release the seats
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

        res.json({ message: 'Booking cancelled successfully', booking });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid booking ID' });
        }
        next(err);
    }
};

// ==================== USERS ====================

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password -twoFactorSecret -twoFactorBackupCodes').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        next(err);
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password -twoFactorSecret -twoFactorBackupCodes');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: `User role updated to ${role}`, user });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        next(err);
    }
};
