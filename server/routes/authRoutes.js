const express = require('express');
const router = express.Router();
const { register, login, googleAuth, googleAuthCallback, logoutUser, getCurrentUser } = require('../controllers/authController');

// Email/Password Auth
router.post('/register', register);
router.post('/login', login);

// Google Auth
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);

// Common
router.get('/logout', logoutUser);
router.get('/me', getCurrentUser);

module.exports = router;
