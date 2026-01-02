const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getDashboardStats, getAllUsers, addRegion, addPackage, deletePackage, updatePackage } = require('../controllers/adminController');

// All routes are protected and require Admin status
router.get('/stats', protect, admin, getDashboardStats);
router.get('/users', protect, admin, getAllUsers);
router.post('/region', protect, admin, addRegion);
router.post('/package', protect, admin, addPackage);
router.delete('/package/:regionId/:packageId', protect, admin, deletePackage);
router.put('/package/:regionId/:packageId', protect, admin, updatePackage);

module.exports = router;