const { s3Client } = require('../config/s3.config');
const { ListBucketsCommand } = require('@aws-sdk/client-s3');

async function testS3Connection() {
  try {
    // Test listing buckets
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    
    console.log('Successfully connected to AWS S3!');
    console.log('Available buckets:', response.Buckets.map(bucket => bucket.Name));
    
    return {
      success: true,
      message: 'Successfully connected to AWS S3',
      buckets: response.Buckets.map(bucket => bucket.Name)
    };
  } catch (error) {
    console.error('Error connecting to AWS S3:', error);
    return {
      success: false,
      message: 'Failed to connect to AWS S3',
      error: error.message
    };
  }
}

module.exports = testS3Connection; 