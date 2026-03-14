const Movie = require('../models/Movie');
const Show = require('../models/Show');
const { getOrSetCache } = require('../middleware/cacheMiddleware');

// @desc    Get all movies
// @route   GET /api/movies
exports.getMovies = async (req, res, next) => {
    let attempts = 0;
    const maxAttempts = 2;
    
    const tryFetch = async () => {
        try {
            const movies = await getOrSetCache('cache:movies:all', async () => {
                return await Movie.find({}).sort({ releaseDate: -1 });
            }, 3600);
            res.json(movies);
        } catch (err) {
            attempts++;
            if (attempts < maxAttempts) {
                console.log(`⚠️  Movie fetch failed (attempt ${attempts}), retrying...`);
                // Wait 500ms before retry to allow DB pool to stabilize
                setTimeout(tryFetch, 500);
            } else {
                next(err);
            }
        }
    };

    tryFetch();
};

// @desc    Get movie by ID
// @route   GET /api/movies/:id
exports.getMovieById = async (req, res, next) => {
    try {
        const movieId = req.params.id;
        const movie = await getOrSetCache(`cache:movies:${movieId}`, async () => {
            return await Movie.findById(movieId);
        }, 3600);

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
        // Don't strongly cache dynamic time-based shows in Redis for long to prevent stale availability
        const now = new Date();
        const shows = await Show.find({
            movie: movieId,
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
