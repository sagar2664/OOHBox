const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth.middleware');
const reviewController = require('../controllers/review.controller');

const router = express.Router();

// Validation middleware
const reviewValidation = [
  body('hoardingId')
    .isMongoId()
    .withMessage('Invalid hoarding ID'),
  body('bookingId')
    .isMongoId()
    .withMessage('Invalid booking ID'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters')
];

// Public routes
router.get('/hoarding/:hoardingId', reviewController.getHoardingReviews);

// Protected routes
router.use(auth);

// Buyer routes
router.post(
  '/',
  authorize('buyer'),
  reviewValidation,
  reviewController.createReview
);

router.patch(
  '/:id',
  authorize('buyer'),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ max: 1000 }),
  reviewController.updateReview
);

router.delete('/:id', authorize('buyer'), reviewController.deleteReview);

module.exports = router; 