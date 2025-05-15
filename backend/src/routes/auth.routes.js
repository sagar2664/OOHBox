const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Validation middleware
const signupValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['buyer', 'owner', 'admin'])
    .withMessage('Invalid role'),
  body('phoneNumber')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Please enter a valid phone number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Routes
router.post('/signup', signupValidation, authController.signup);
router.post('/login', loginValidation, authController.login);

module.exports = router; 