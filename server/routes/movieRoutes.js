const express = require('express');
const router = express.Router();
const { getMovies, getMovieById, getMovieShows } = require('../controllers/movieController');

// GET /api/movies - Get all movies
router.get('/', getMovies);

// GET /api/movies/:id - Get movie by ID
router.get('/:id', getMovieById);

// GET /api/movies/:id/shows - Get shows for a movie
router.get('/:id/shows', getMovieShows);

module.exports = router;
