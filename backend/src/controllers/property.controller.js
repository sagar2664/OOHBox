const Property = require('../models/property.model');
const { s3Client } = require('../config/s3.config');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Create new property
exports.createProperty = async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      vendor: req.user._id,
      images: req.files.map(file => ({
        url: file.location,
        key: file.key
      }))
    };

    const property = await Property.create(propertyData);
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ message: 'Error creating property', error: error.message });
  }
};

// Get all properties
exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('vendor', 'firstName lastName email')
      .populate('reviews');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
};

// Get property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('vendor', 'firstName lastName email')
      .populate('reviews')
      .populate('bookings');
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching property', error: error.message });
  }
};

// Update property
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: file.location,
        key: file.key
      }));
      property.images = [...property.images, ...newImages];
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'images') {
        property[key] = req.body[key];
      }
    });

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(400).json({ message: 'Error updating property', error: error.message });
  }
};

// Delete property
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    // Delete images from S3
    for (const image of property.images) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: image.key
      }));
    }

    await property.remove();
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting property', error: error.message });
  }
};

// Delete property image
exports.deletePropertyImage = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete images from this property' });
    }

    const imageIndex = property.images.findIndex(img => img.key === req.params.imageKey);
    
    if (imageIndex === -1) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete image from S3
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.params.imageKey
    }));

    // Remove image from property
    property.images.splice(imageIndex, 1);
    await property.save();

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
}; 