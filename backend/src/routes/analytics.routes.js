const express = require('express');
const { auth, authorize } = require('../middleware/auth.middleware');
const analyticsController = require('../controllers/analytics.controller');

const router = express.Router();

// Protected routes
router.use(auth);

router.get('/vendor', authorize('vendor'), analyticsController.getVendorAnalytics);
router.get('/admin', authorize('admin'), analyticsController.getAdminAnalytics);

module.exports = router; 