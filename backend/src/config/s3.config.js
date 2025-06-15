const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Define allowed file types
const allowedMimeTypes = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'video/mp4': 'video',
  'video/quicktime': 'video',
  'video/x-msvideo': 'video',
  'video/x-ms-wmv': 'video',
  'application/octet-stream': '360-view' // For 360-degree views
};

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { 
        fieldName: file.fieldname,
        contentType: file.mimetype
      });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(file.originalname);
      const mediaType = allowedMimeTypes[file.mimetype] || 'other';
      cb(null, `${mediaType}/${file.fieldname}-${uniqueSuffix}${fileExtension}`);
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos
    files: 5 // Maximum 5 files per upload
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type! Please upload only images, videos, or 360-degree views.'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large. Maximum size is 50MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Too many files. Maximum is 5 files per upload.'
      });
    }
    return res.status(400).json({
      message: err.message
    });
  }
  if (err) {
    return res.status(400).json({
      message: err.message
    });
  }
  next();
};

module.exports = {
  s3Client,
  upload,
  handleMulterError
}; 