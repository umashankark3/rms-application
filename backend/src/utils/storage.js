const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const AWS = require('aws-sdk');

class StorageService {
  constructor() {
    this.driver = process.env.STORAGE_DRIVER || 'local';
    this.uploadDir = process.env.UPLOAD_DIR || 'uploads';
    
    if (this.driver === 's3') {
      this.s3 = new AWS.S3({
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
        region: process.env.S3_REGION
      });
      this.bucket = process.env.S3_BUCKET;
    }
  }

  generateFileKey(originalName, candidateName = null) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex'); // Shorter random string
    const ext = path.extname(originalName);
    
    if (candidateName) {
      // Clean candidate name: remove spaces, special chars, convert to uppercase
      const cleanName = candidateName
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .toUpperCase(); // Convert to uppercase
      
      return `resumes/${cleanName}_${timestamp}_${random}${ext}`;
    } else {
      return `resumes/${timestamp}-${random}${ext}`;
    }
  }

  async saveFile(buffer, fileKey, mimeType) {
    if (this.driver === 's3') {
      return this.saveToS3(buffer, fileKey, mimeType);
    } else {
      return this.saveToLocal(buffer, fileKey);
    }
  }

  async saveToLocal(buffer, fileKey) {
    const filePath = path.join(this.uploadDir, fileKey);
    const dir = path.dirname(filePath);
    
    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });
    
    // Save file
    await fs.writeFile(filePath, buffer);
    
    return {
      url: `/uploads/${fileKey}`,
      path: filePath
    };
  }

  async saveToS3(buffer, fileKey, mimeType) {
    const params = {
      Bucket: this.bucket,
      Key: fileKey,
      Body: buffer,
      ContentType: mimeType
    };

    const result = await this.s3.upload(params).promise();
    
    return {
      url: result.Location,
      key: fileKey
    };
  }

  async getSignedUrl(fileKey, expiresIn = 3600) {
    if (this.driver === 's3') {
      const params = {
        Bucket: this.bucket,
        Key: fileKey,
        Expires: expiresIn
      };
      
      return this.s3.getSignedUrl('getObject', params);
    } else {
      // For local files, return the direct URL pointing to backend server
      // Use production URL in production, localhost in development
      // Check multiple indicators for production environment
      const isProduction = process.env.NODE_ENV === 'production' || 
                          process.env.RENDER_SERVICE_NAME || 
                          process.env.RENDER || 
                          process.env.RAILWAY_ENVIRONMENT ||
                          (typeof window === 'undefined' && !process.env.SERVER_PORT);
      
      const baseUrl = isProduction
        ? (process.env.BACKEND_URL || 'https://rms-application-1.onrender.com')
        : `http://localhost:${process.env.SERVER_PORT || '8081'}`;
      
      console.log('Storage URL generation:', {
        fileKey,
        nodeEnv: process.env.NODE_ENV,
        renderService: process.env.RENDER_SERVICE_NAME,
        render: process.env.RENDER,
        railway: process.env.RAILWAY_ENVIRONMENT,
        serverPort: process.env.SERVER_PORT,
        isProduction,
        backendUrl: process.env.BACKEND_URL,
        finalBaseUrl: baseUrl,
        finalUrl: `${baseUrl}/uploads/${fileKey}`
      });
      
      return `${baseUrl}/uploads/${fileKey}`;
    }
  }

  async deleteFile(fileKey) {
    if (this.driver === 's3') {
      const params = {
        Bucket: this.bucket,
        Key: fileKey
      };
      
      await this.s3.deleteObject(params).promise();
    } else {
      const filePath = path.join(this.uploadDir, fileKey);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // File might not exist, that's okay
        console.log('File deletion warning:', error.message);
      }
    }
  }

  async getFileStream(fileKey) {
    if (this.driver === 's3') {
      const params = {
        Bucket: this.bucket,
        Key: fileKey
      };
      
      return this.s3.getObject(params).createReadStream();
    } else {
      const filePath = path.join(this.uploadDir, fileKey);
      const fs = require('fs');
      return fs.createReadStream(filePath);
    }
  }
}

module.exports = new StorageService();