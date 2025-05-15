const express = require('express');
const { upload } = require('../config/s3.config');
const testS3Connection = require('../utils/s3Test');
const router = express.Router();

// Test S3 connection
router.get('/s3-connection', async (req, res) => {
  try {
    const result = await testS3Connection();
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing S3 connection',
      error: error.message
    });
  }
});

// Test S3 upload
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({
      message: 'File uploaded successfully',
      file: {
        location: req.file.location,
        key: req.file.key
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

module.exports = router; 