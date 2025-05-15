const express = require('express');
const { auth, authorize } = require('../middleware/auth.middleware');
const analyticsController = require('../controllers/analytics.controller');

const router = express.Router();

// Protected routes
router.use(auth);

router.get('/owner', authorize('owner'), analyticsController.getOwnerAnalytics);
router.get('/admin', authorize('admin'), analyticsController.getAdminAnalytics);

module.exports = router; 