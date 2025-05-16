const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../config/s3.config');
const hoardingController = require('../controllers/hoarding.controller');

const router = express.Router();

// Middleware to parse JSON data from form-data
const parseJsonData = (req, res, next) => {
  try {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid JSON data' });
  }
};

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
    .withMessage('Coordinates must be an array of [longitude, latitude]')
];

// Public routes
router.get('/', hoardingController.getHoardings);
router.get('/:id', hoardingController.getHoardingById);

// Protected routes
router.use(auth);

// Get vendor's hoardings
router.get('/my-hoardings', hoardingController.getMyHoardings);

// Create hoarding with image upload
router.post('/', upload.single('image'), parseJsonData, hoardingValidation, hoardingController.createHoarding);

// Update hoarding with image upload
router.patch('/:id', upload.single('image'), parseJsonData, hoardingValidation, hoardingController.updateHoarding);

// Delete hoarding
router.delete('/:id', hoardingController.deleteHoarding);

// Admin routes
router.patch(
  '/:id/status',
  authorize('admin'),
  body('status').isIn(['approved', 'rejected']),
  hoardingController.updateHoardingStatus
);

module.exports = router; 