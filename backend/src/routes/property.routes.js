const express = require('express');
const { auth } = require('../middleware/auth.middleware');
const { upload } = require('../config/s3.config');
const {
  createProperty,
  getAllProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  deletePropertyImage
} = require('../controllers/property.controller');

const router = express.Router();

// Public routes
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);

// Protected routes
router.use(auth);

// Create property with image upload
router.post('/', upload.array('images', 5), createProperty);

// Update property with image upload
router.patch('/:id', upload.array('images', 5), updateProperty);

// Delete property
router.delete('/:id', deleteProperty);

// Delete property image
router.delete('/:id/images/:imageKey', deletePropertyImage);

module.exports = router; 