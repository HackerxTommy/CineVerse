const Movie = require('../models/Movie');
const Show = require('../models/Show');
const { getOrSetCache } = require('../middleware/cacheMiddleware');
const { withRetry } = require('../utils/dbRetry');

// @desc    Get all movies
// @route   GET /api/movies
exports.getMovies = async (req, res, next) => {
    try {
        const movies = await withRetry(async () => {
            // No need for caching wrapper here since we rely on Upstash REST middleware (router-level)
            // But we can still keep it fast via aggregation
            return await Movie.aggregate([
                { $sort: { releaseDate: -1 } },
                { 
                    $project: { 
                        title: 1, 
                        poster: 1, 
                        genre: 1, // Fixed mismatch from previous iteration
                        format: 1,
                        duration: 1, 
                        releaseDate: 1, 
                        rating: 1 
                    } 
                }
            ]);
        });
        res.json(movies);
    } catch (err) {
        next(err);
    }
};

// @desc    Get movie by ID
// @route   GET /api/movies/:id
exports.getMovieById = async (req, res, next) => {
    try {
        const movieId = req.params.id;
        const movie = await withRetry(async () => {
            return await getOrSetCache(`cache:movies:${movieId}`, async () => {
                return await Movie.findById(movieId);
            }, 3600);
        });

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
        const movieId = req.params.id;
        const now = new Date();
        const shows = await withRetry(async () => {
            return await Show.find({
                movie: movieId
            })
                .populate('movie', 'title duration format')
                .sort({ startTime: 1 });
        });

        if (shows.length === 0) {
            console.warn(`[CineVerse] No upcoming shows found for movie: ${movieId}. Consider re-seeding data.`);
        }
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
        const show = await withRetry(async () => {
            return await Show.findById(req.params.id).populate('movie');
        });
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
