const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../config/s3.config');
const bookingController = require('../controllers/booking.controller');

const router = express.Router();

// Validation middleware
const bookingValidation = [
  body('hoardingId')
    .isMongoId()
    .withMessage('Invalid hoarding ID'),
  body('startDate')
    .isISO8601()
    .withMessage('Invalid start date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
  body('endDate')
    .isISO8601()
    .withMessage('Invalid end date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];

// Public route to get bookings for a specific hoarding (for availability calendar)
router.get('/hoarding/:hoardingId', bookingController.getBookingsForHoarding);
// Protected routes
router.use(auth);

// Buyer routes
router.post(
  '/',
  authorize('buyer'),
  bookingValidation,
  bookingController.createBooking
);

router.get('/me', bookingController.getMyBookings);
router.get('/:id', bookingController.getBookingById);


// Vendor routes
router.patch(
  '/:id/status',
  authorize('vendor', 'buyer'),
  upload.single('proofImage'),
  body('status').isIn(['accepted', 'rejected', 'completed', 'cancelled']),
  bookingController.updateBookingStatus
);

router.patch(
  '/:id/proof',
  authorize('vendor'),
  upload.single('proofImage'),
  bookingController.uploadProof
);



module.exports = router; 