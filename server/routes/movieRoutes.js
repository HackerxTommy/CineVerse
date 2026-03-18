const express = require('express');
const router = express.Router();
const { getMovies, getMovieById, getMovieShows } = require('../controllers/movieController');
const { cachedResponse } = require('../config/redis');

// GET /api/movies - Get all movies (cached 5 mins)
router.get('/', cachedResponse(300), getMovies);

// GET /api/movies/:id - Get movie by ID (cached 30 mins)
router.get('/:id', cachedResponse(1800), getMovieById);

// GET /api/movies/:id/shows - Get shows for a movie
router.get('/:id/shows', getMovieShows);

module.exports = router;
