const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// Register route
router.post('/register', validateRegistration, authController.register);

// Login route
router.post('/login', validateLogin, authController.login);

// Get profile route
router.get('/profile', authController.getProfile);

module.exports = router; 