require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const resumeRoutes = require('./routes/resumes');
const shareLinkRoutes = require('./routes/shareLinks');

const app = express();
const PORT = process.env.SERVER_PORT || 8080;

// Security middleware
app.use(helmet());
// CORS configuration with debugging
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://msrms.netlify.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    console.log('CORS check - Origin:', origin);
    console.log('CORS check - Allowed origins:', allowedOrigins);
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Serve uploaded files (when using local storage)
// Always serve uploads route since we're using local storage on Render
const storageDriver = process.env.STORAGE_DRIVER || 'local';
console.log('Storage driver:', storageDriver);
if (storageDriver === 'local') {
  const uploadsPath = path.join(__dirname, '../uploads');
  console.log('Serving uploads from:', uploadsPath);
  app.use('/uploads', express.static(uploadsPath));
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api', shareLinkRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint to test API connection
app.get('/api/debug', (req, res) => {
  res.json({ 
    message: 'API is working', 
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'no-origin',
    corsAllowed: true
  });
});

// Simple CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Debug file URL generation
app.get('/api/debug/file-url', async (req, res) => {
  try {
    const storageService = require('./utils/storage');
    const testUrl = await storageService.getSignedUrl('test-file-key');
    
    res.json({
      message: 'File URL generation test',
      testFileKey: 'test-file-key',
      generatedUrl: testUrl,
      storageDriver: process.env.STORAGE_DRIVER || 'local',
      nodeEnv: process.env.NODE_ENV,
      backendUrl: process.env.BACKEND_URL,
      serverPort: process.env.SERVER_PORT
    });
  } catch (error) {
    res.status(500).json({
      error: 'File URL generation failed',
      details: error.message
    });
  }
});

// Debug file system and uploads directory
app.get('/api/debug/filesystem', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    const uploadsDir = path.join(__dirname, '../uploads');
    const resumesDir = path.join(uploadsDir, 'resumes');
    
    let uploadsDirExists = false;
    let resumesDirExists = false;
    let uploadsFiles = [];
    let resumesFiles = [];
    
    try {
      await fs.access(uploadsDir);
      uploadsDirExists = true;
      uploadsFiles = await fs.readdir(uploadsDir);
    } catch (error) {
      // Directory doesn't exist, try to create it
      try {
        await fs.mkdir(uploadsDir, { recursive: true });
        uploadsDirExists = true;
        uploadsFiles = [];
      } catch (createError) {
        uploadsDirExists = false;
      }
    }
    
    try {
      await fs.access(resumesDir);
      resumesDirExists = true;
      resumesFiles = await fs.readdir(resumesDir);
    } catch (error) {
      // Directory doesn't exist, try to create it
      try {
        await fs.mkdir(resumesDir, { recursive: true });
        resumesDirExists = true;
        resumesFiles = [];
      } catch (createError) {
        resumesDirExists = false;
      }
    }
    
    res.json({
      message: 'File system debug info',
      uploadsDirectory: uploadsDir,
      resumesDirectory: resumesDir,
      uploadsDirExists,
      resumesDirExists,
      uploadsFiles,
      resumesFiles,
      currentWorkingDir: process.cwd(),
      __dirname: __dirname
    });
  } catch (error) {
    res.status(500).json({
      error: 'File system debug failed',
      details: error.message
    });
  }
});

// Debug endpoint to check database users
app.get('/api/debug/users', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        passwordHash: true,
        createdAt: true
      }
    });
    
    res.json({
      message: 'Database users',
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database error',
      details: error.message
    });
  }
});

// Debug endpoint to check database resumes
app.get('/api/debug/resumes', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const resumes = await prisma.resume.findMany({
      take: 5 // Just get first 5
    });
    
    res.json({
      message: 'Database resumes',
      count: resumes.length,
      resumes: resumes
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database error',
      details: error.message
    });
  }
});

// Debug endpoint to check database structure
app.get('/api/debug/tables', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Try to query the information schema
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    res.json({
      message: 'Database tables',
      tables: tables
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database error',
      details: error.message
    });
  }
});

// Debug endpoint to create a test resume
app.post('/api/debug/create-test-resume', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Find admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (!adminUser) {
      return res.status(400).json({ error: 'No admin user found' });
    }
    
    const testResume = await prisma.resume.create({
      data: {
        name: 'Test Candidate',
        email: 'test@example.com',
        phone: '+1234567890',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: 'Test experience description',
        fileKey: 'test-file-key',
        fileName: 'test-resume.pdf',
        fileSize: 1024,
        uploadedBy: adminUser.id,
        status: 'new'
      }
    });
    
    res.json({
      message: 'Test resume created',
      resume: testResume
    });
  } catch (error) {
    res.status(500).json({
      error: 'Database error',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`RMS backend server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});