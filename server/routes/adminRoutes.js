const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/adminController');

// Dashboard & Users
router.get('/stats', protect, admin, ctrl.getDashboardStats);
router.get('/users', protect, admin, ctrl.getAllUsers);

// Country Management
router.route('/countries')
    .get(protect, admin, ctrl.getCountries)
    .post(protect, admin, ctrl.createCountry);
router.route('/countries/:id')
    .put(protect, admin, ctrl.updateCountry)
    .delete(protect, admin, ctrl.deleteCountry);

// City Management
router.route('/cities')
    .get(protect, admin, ctrl.getCities)
    .post(protect, admin, ctrl.createCity);
router.route('/cities/:id')
    .put(protect, admin, ctrl.updateCity)
    .delete(protect, admin, ctrl.deleteCity);

// Tour Management
router.route('/tours')
    .get(protect, admin, ctrl.getTours)
    .post(protect, admin, ctrl.createTour);
router.route('/tours/:id')
    .put(protect, admin, ctrl.updateTour)
    .delete(protect, admin, ctrl.deleteTour);

module.exports = router;