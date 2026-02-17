const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const twoFactorController = require('../controllers/twoFactorController');

// Protected routes (require login)
router.get('/status', protect, twoFactorController.get2FAStatus);
router.post('/setup', protect, twoFactorController.setup2FA);
router.post('/verify', protect, twoFactorController.verify2FA);
router.post('/disable', protect, twoFactorController.disable2FA);

// Public route for 2FA validation during login
router.post('/validate', twoFactorController.validate2FA);

module.exports = router;
