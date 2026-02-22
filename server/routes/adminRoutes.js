const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getDashboard,
    createMovie,
    updateMovie,
    deleteMovie,
    createShow,
    updateShow,
    deleteShow,
    getAllBookings,
    cancelBooking,
    getAllUsers,
    updateUserRole
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboard);

// Movies CRUD
router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);

// Shows CRUD
router.post('/shows', createShow);
router.put('/shows/:id', updateShow);
router.delete('/shows/:id', deleteShow);

// Bookings
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/cancel', cancelBooking);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
