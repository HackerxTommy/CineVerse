const Movie = require('../models/Movie');
const Show = require('../models/Show');
const axios = require('axios');

// @desc    Get all movies
// @route   GET /api/movies
exports.getMovies = async (req, res, next) => {
    try {
        const movies = await Movie.find({}).sort({ releaseDate: -1 });
        res.json(movies);
    } catch (err) {
        next(err);
    }
};

// @desc    Get movie by ID
// @route   GET /api/movies/:id
exports.getMovieById = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.json(movie);
    } catch (err) {
        // Handle invalid ObjectId
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid movie ID' });
        }
        next(err);
    }
};

// @desc    Get shows for a movie
// @route   GET /api/movies/:id/shows
exports.getMovieShows = async (req, res, next) => {
    try {
        // Only get future shows
        const now = new Date();
        const shows = await Show.find({
            movie: req.params.id,
            startTime: { $gte: now }
        })
            .populate('movie', 'title duration format')
            .sort({ startTime: 1 });

        res.json(shows);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid movie ID' });
        }
        next(err);
    }
};

// @desc    Get show details with seat map
// @route   GET /api/shows/:id
exports.getShowDetails = async (req, res, next) => {
    try {
        const show = await Show.findById(req.params.id).populate('movie');
        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }
        res.json(show);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid show ID' });
        }
        next(err);
    }
};
