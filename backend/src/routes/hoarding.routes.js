const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../config/s3.config');
const hoardingController = require('../controllers/hoarding.controller');

const router = express.Router();

// Middleware to parse JSON data from form-data
const parseJsonData = (req, res, next) => {
    try {
        console.log('Raw request body:', req.body);
        if (req.body.data) {
            console.log('Parsing JSON data:', req.body.data);
            req.body = JSON.parse(req.body.data);
            console.log('Parsed request body:', req.body);
        }
        next();
    } catch (error) {
        console.error('Error parsing JSON data:', error);
        return res.status(400).json({ message: 'Invalid JSON data' });
    }
};

// Middleware to reject unknown fields
const rejectUnknownFields = (req, res, next) => {
    const allowedFields = [
        'name', 'description', 'mediaType', 'specs', 'pricing', 'location',
        'audience', 'installation', 'legal', 'verification', 'deleteMediaKeys'
    ];
    
    const unknownFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
    
    if (unknownFields.length > 0) {
        return res.status(400).json({
            message: 'Invalid fields in request',
            unknownFields: unknownFields
        });
    }
    
    next();
};

// Validation middleware for creating hoarding (POST)
const createHoardingValidation = [
    body('name')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long'),
    body('description')
        .trim()
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters long'),
    body('mediaType')
        .isIn(['Static Billboard', 'Digital OOH (DOOH)', 'Transit', 'Street Furniture', 'Wallscape', 'Gantry', 'Other'])
        .withMessage('Invalid media type'),
    body('specs.width')
        .isNumeric()
        .withMessage('Width must be a number'),
    body('specs.height')
        .isNumeric()
        .withMessage('Height must be a number'),
    body('specs.units')
        .isIn(['ft', 'm'])
        .withMessage('Invalid units'),
    body('specs.illumination')
        .optional()
        .isIn(['Backlit', 'Frontlit', 'Digital', 'Non-Illuminated'])
        .withMessage('Invalid illumination type'),
    body('pricing.basePrice')
        .isNumeric()
        .withMessage('Base price must be a number')
        .isFloat({ min: 0 })
        .withMessage('Base price must be greater than or equal to 0'),
    body('pricing.per')
        .isIn(['day', 'week', 'month', 'slot'])
        .withMessage('Invalid pricing period'),
    body('pricing.model')
        .isIn(['Flat Rate', 'Impression-based', 'Programmatic'])
        .withMessage('Invalid pricing model'),
    body('location.address')
        .trim()
        .notEmpty()
        .withMessage('Address is required'),
    body('location.area')
        .trim()
        .notEmpty()
        .withMessage('Area is required'),
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

// Validation middleware for updating hoarding (PATCH)
const updateHoardingValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters long'),
    body('mediaType')
        .optional()
        .isIn(['Static Billboard', 'Digital OOH (DOOH)', 'Transit', 'Street Furniture', 'Wallscape', 'Gantry', 'Other'])
        .withMessage('Invalid media type'),
    body('specs.width')
        .optional()
        .isNumeric()
        .withMessage('Width must be a number'),
    body('specs.height')
        .optional()
        .isNumeric()
        .withMessage('Height must be a number'),
    body('specs.units')
        .optional()
        .isIn(['ft', 'm'])
        .withMessage('Invalid units'),
    body('specs.illumination')
        .optional()
        .isIn(['Backlit', 'Frontlit', 'Digital', 'Non-Illuminated'])
        .withMessage('Invalid illumination type'),
    body('pricing.basePrice')
        .optional()
        .isNumeric()
        .withMessage('Base price must be a number')
        .isFloat({ min: 0 })
        .withMessage('Base price must be greater than or equal to 0'),
    body('pricing.per')
        .optional()
        .isIn(['day', 'week', 'month', 'slot'])
        .withMessage('Invalid pricing period'),
    body('pricing.model')
        .optional()
        .isIn(['Flat Rate', 'Impression-based', 'Programmatic'])
        .withMessage('Invalid pricing model'),
    body('location.address')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Address is required'),
    body('location.area')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Area is required'),
    body('location.city')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('City is required'),
    body('location.state')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('State is required'),
    body('location.coordinates.coordinates')
        .optional()
        .isArray({ min: 2, max: 2 })
        .withMessage('Coordinates must be an array of [longitude, latitude]'),
    body('deleteMediaKeys')
        .optional()
        .isArray()
        .withMessage('deleteMediaKeys must be an array')
        .custom((value) => {
            if (!Array.isArray(value)) return false;
            return value.every(key => typeof key === 'string' && key.length > 0);
        })
        .withMessage('Each media key must be a non-empty string')
];

// Public routes
router.get('/', hoardingController.getHoardings);

// Get my hoardings
router.get('/me', auth, hoardingController.getMyHoardings);

// Get hoarding by id
router.get('/:id', hoardingController.getHoardingById);

// Protected routes
router.use(auth);

// Vendor routes
router.post(
    '/',
    authorize('vendor'),
    upload.array('media', 5),
    parseJsonData,
    rejectUnknownFields,
    createHoardingValidation,
    hoardingController.createHoarding
);

router.patch(
    '/:id',
    authorize('vendor'),
    upload.array('media', 5),
    parseJsonData,
    rejectUnknownFields,
    updateHoardingValidation,
    hoardingController.updateHoarding
);

router.delete('/:id', authorize('vendor'), hoardingController.deleteHoarding);

// Legal status update (vendor only)
router.patch(
    '/:id/legal',
    authorize('vendor'),
    upload.single('permitDocument'),
    parseJsonData,
    hoardingController.updateLegalStatus
);

// Admin routes
router.patch(
    '/:id/status',
    authorize('admin'),
    body('status').isIn(['approved', 'rejected', 'booked', 'unavailable']),
    hoardingController.updateHoardingStatus
);

router.patch(
    '/:id/verification',
    authorize('admin'),
    body('status').isIn(['Verified', 'Unverified', 'Pending']),
    hoardingController.updateVerificationStatus
);

module.exports = router;