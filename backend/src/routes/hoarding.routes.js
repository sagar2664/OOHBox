const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth.middleware');
const hoardingController = require('../controllers/hoarding.controller');

const router = express.Router();

// Validation middleware
const hoardingValidation = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('specs.width')
    .isNumeric()
    .withMessage('Width must be a number'),
  body('specs.height')
    .isNumeric()
    .withMessage('Height must be a number'),
  body('specs.type')
    .isIn(['billboard', 'digital', 'wall', 'other'])
    .withMessage('Invalid hoarding type'),
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than or equal to 0'),
  body('location.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('location.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('location.coordinates.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be an array of [longitude, latitude]'),
  body('imageData')
    .notEmpty()
    .withMessage('Image data is required')
];

// Public routes
router.get('/', hoardingController.getHoardings);
router.get('/:id', hoardingController.getHoardingById);

// Protected routes
router.use(auth);

// Owner routes
router.post(
  '/',
  authorize('owner'),
  hoardingValidation,
  hoardingController.createHoarding
);

router.get('/my-hoardings', authorize('owner'), hoardingController.getMyHoardings);

router.patch(
  '/:id',
  authorize('owner'),
  hoardingValidation,
  hoardingController.updateHoarding
);

router.delete('/:id', authorize('owner'), hoardingController.deleteHoarding);

// Admin routes
router.patch(
  '/:id/status',
  authorize('admin'),
  body('status').isIn(['approved', 'rejected']),
  hoardingController.updateHoardingStatus
);

module.exports = router; 