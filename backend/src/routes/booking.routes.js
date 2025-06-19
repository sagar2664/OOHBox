const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../config/s3.config');
const bookingController = require('../controllers/booking.controller');

const router = express.Router();

// Middleware to reject unknown fields
const rejectUnknownFields = (req, res, next) => {
    const allowedFields = [
        'hoardingId', 'startDate', 'endDate', 'notes',
        'installation', 'verification', 'status', "scheduledDate"
    ];
    if (!req.body || typeof req.body !== 'object') req.body = {};
    const unknownFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
    if (unknownFields.length > 0) {
        return res.status(400).json({
            message: 'Invalid fields in request',
            unknownFields: unknownFields
        });
    }
    next();
};

// Validation middleware for creating booking
const createBookingValidation = [
    body('hoardingId')
        .isMongoId()
        .withMessage('Invalid hoarding ID'),
    body('startDate')
        .isISO8601()
        .withMessage('Invalid start date format. Please use YYYY-MM-DD format')
        .custom((value) => {
            const startDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (startDate < today) {
                throw new Error('Start date must be today or in the future');
            }
            return true;
        }),
    body('endDate')
        .isISO8601()
        .withMessage('Invalid end date format. Please use YYYY-MM-DD format')
        .custom((value, { req }) => {
            const startDate = new Date(req.body.startDate);
            const endDate = new Date(value);
            
            if (endDate <= startDate) {
                throw new Error('End date must be after start date');
            }
            
            const maxDuration = 365; // days
            const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            if (duration > maxDuration) {
                throw new Error(`Booking duration cannot exceed ${maxDuration} days`);
            }
            
            return true;
        }),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes must not exceed 500 characters')
];

// Validation middleware for updating booking
const updateBookingValidation = [
    body('status')
        .optional()
        .isIn(['pending', 'accepted', 'rejected', 'completed', 'cancelled'])
        .withMessage('Invalid status'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes must not exceed 500 characters'),
    body('installation.scheduledDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid scheduled date format'),
    body('installation.status')
        .optional()
        .isIn(['Pending', 'Scheduled', 'Completed', 'Cancelled'])
        .withMessage('Invalid installation status'),
    body('installation.notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Installation notes must not exceed 500 characters')
];

// Public routes
router.get('/hoarding/:hoardingId', bookingController.getBookingsForHoarding);

// Protected routes
router.use(auth);

// Buyer routes
router.post(
    '/',
    authorize('buyer'),
    createBookingValidation,
    rejectUnknownFields,
    bookingController.createBooking
);

router.get('/me', bookingController.getMyBookings);
router.get('/:id', bookingController.getBookingById);

// Vendor routes
router.patch(
    '/:id/status',
    authorize('vendor'),
    updateBookingValidation,
    rejectUnknownFields,
    bookingController.updateBookingStatus
);

router.patch(
    '/:id/installation',
    authorize('vendor'),
    updateBookingValidation,
    rejectUnknownFields,
    bookingController.updateInstallation
);

router.patch(
    '/:id/proof',
    authorize('vendor'),
    upload.array('proofImages', 5),
    bookingController.uploadProof
);

// Admin routes
router.patch(
    '/:id/verification',
    authorize('admin'),
    body('status').isIn(['Pending', 'Verified', 'Rejected']),
    body('notes').optional().trim().isLength({ max: 500 }),
    bookingController.updateVerification
);

module.exports = router; 