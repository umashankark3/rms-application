const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { upload, handleUploadError } = require('../middleware/upload');
const storageService = require('../utils/storage');

const router = express.Router();
const prisma = new PrismaClient();

// Debug route to test resume routes are working
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Resume routes are working',
    timestamp: new Date().toISOString()
  });
});

// POST /api/resumes - Create resume with file upload
router.post('/', 
  authenticateToken,
  upload.single('file'),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Resume file is required' });
      }

      const {
        candidateName,
        candidateEmail,
        candidatePhone,
        experienceYears,
        skills,
        notes
      } = req.body;

      if (!candidateName || candidateName.trim().length < 2) {
        return res.status(400).json({ error: 'Candidate name is required (min 2 characters)' });
      }

      // Generate unique file key with candidate name
      const fileKey = storageService.generateFileKey(req.file.originalname, candidateName.trim());

      // Save file to storage
      await storageService.saveFile(req.file.buffer, fileKey, req.file.mimetype);

      // Create resume record
      const resume = await prisma.resume.create({
        data: {
          name: candidateName.trim(),
          email: candidateEmail?.trim() || '',
          phone: candidatePhone?.trim() || null,
          experience: notes?.trim() || null,
          skills: skills ? JSON.parse(`["${skills.split(',').map(s => s.trim()).join('","')}"]`) : null,
          fileKey,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          uploadedBy: req.user.id,
          status: 'new'
        },
        include: {
          uploadedByUser: {
            select: { username: true, fullName: true }
          }
        }
      });

      res.status(201).json({
        message: 'Resume uploaded successfully',
        resume
      });
    } catch (error) {
      console.error('Resume upload error:', error);
      res.status(500).json({ error: 'Failed to upload resume' });
    }
  }
);

// GET /api/resumes - List resumes with filtering
router.get('/', 
  authenticateToken,
  validate(schemas.resumeQuery),
  async (req, res) => {
    try {
      console.log('GET /api/resumes - User:', req.user.username, 'Role:', req.user.role);
      console.log('Query params:', req.query);
      const { q, status, assignedTo, page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const skip = (pageNum - 1) * limitNum;

      const where = {};

      // Search in name, email, and skills
      if (q && q.trim() !== '') {
        where.OR = [
          { name: { contains: q } },
          { email: { contains: q } },
          { experience: { contains: q } }
        ];
      }

      // Filter by status
      if (status && status.trim() !== '') {
        where.status = status;
      }

      // Filter by assigned user
      if (assignedTo && assignedTo.trim() !== '') {
        const assignedUser = await prisma.user.findUnique({
          where: { username: assignedTo }
        });
        if (assignedUser) {
          where.assignedTo = assignedUser.id;
        }
      }

      // Role-based filtering
      if (req.user.role === 'recruiter') {
        // Recruiters can only see resumes assigned to them or unassigned ones they uploaded
        where.OR = [
          { assignedTo: req.user.id },
          { 
            AND: [
              { uploadedBy: req.user.id },
              { assignedTo: null }
            ]
          }
        ];
      }

      console.log('Final where clause:', JSON.stringify(where, null, 2));
      
      const [resumes, totalCount] = await Promise.all([
        prisma.resume.findMany({
          where,
          include: {
            uploadedByUser: {
              select: { id: true, username: true, fullName: true }
            },
            assignedToUser: {
              select: { id: true, username: true, fullName: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum
        }),
        prisma.resume.count({ where })
      ]);

      console.log('Found resumes:', resumes.length, 'Total count:', totalCount);
      console.log('First resume with relationships:', JSON.stringify(resumes[0], null, 2));

      res.json({
        resumes,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      });
    } catch (error) {
      console.error('Get resumes error:', error);
      res.status(500).json({ error: 'Failed to fetch resumes' });
    }
  }
);

// GET /api/resumes/:id - Get single resume
router.get('/:id', 
  authenticateToken,
  async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId },
        include: {
          uploadedByUser: {
            select: { id: true, username: true, fullName: true }
          },
          assignedToUser: {
            select: { id: true, username: true, fullName: true }
          }
        }
      });

      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      // Check permissions
      if (req.user.role === 'recruiter') {
        const canAccess = resume.assignedTo === req.user.id || 
                         resume.uploadedBy === req.user.id;
        if (!canAccess) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      res.json({ resume });
    } catch (error) {
      console.error('Get resume error:', error);
      res.status(500).json({ error: 'Failed to fetch resume' });
    }
  }
);

// PATCH /api/resumes/:id - Update resume
router.patch('/:id', 
  authenticateToken,
  validate(schemas.updateResume),
  async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const { status, notes } = req.body;

      const resume = await prisma.resume.findUnique({
        where: { id: resumeId }
      });

      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      // Check permissions
      if (req.user.role === 'recruiter') {
        const canEdit = resume.assignedTo === req.user.id;
        if (!canEdit) {
          return res.status(403).json({ error: 'You can only update resumes assigned to you' });
        }
      }

      const updatedResume = await prisma.resume.update({
        where: { id: resumeId },
        data: {
          ...(status && { status }),
          ...(notes !== undefined && { notes })
        },
        include: {
          uploadedBy: {
            select: { username: true, fullName: true }
          },
          assignedTo: {
            select: { username: true, fullName: true }
          }
        }
      });

      res.json({
        message: 'Resume updated successfully',
        resume: updatedResume
      });
    } catch (error) {
      console.error('Update resume error:', error);
      res.status(500).json({ error: 'Failed to update resume' });
    }
  }
);

// POST /api/resumes/:id/assign - Assign resume to user
router.post('/:id/assign', 
  authenticateToken,
  requireRole(['admin']),
  validate(schemas.assignResume),
  async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const { username } = req.body;

      const [resume, assignee] = await Promise.all([
        prisma.resume.findUnique({ where: { id: resumeId } }),
        prisma.user.findUnique({ where: { username } })
      ]);

      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      if (!assignee) {
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedResume = await prisma.resume.update({
        where: { id: resumeId },
        data: { 
          assignedTo: assignee.id,
          status: 'assigned'
        },
        include: {
          uploadedBy: {
            select: { username: true, fullName: true }
          },
          assignedTo: {
            select: { username: true, fullName: true }
          }
        }
      });

      res.json({
        message: `Resume assigned to ${username}`,
        resume: updatedResume
      });
    } catch (error) {
      console.error('Assign resume error:', error);
      res.status(500).json({ error: 'Failed to assign resume' });
    }
  }
);

// GET /api/resumes/:id/file - Get signed URL for file
router.get('/:id/file', 
  authenticateToken,
  async (req, res) => {
    try {
      console.log('File route accessed - Resume ID:', req.params.id);
      console.log('User:', req.user.username, 'Role:', req.user.role);
      
      const resumeId = parseInt(req.params.id);
      
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId }
      });

      console.log('Resume found:', !!resume);
      if (resume) {
        console.log('Resume fileKey:', resume.fileKey);
      }

      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      // Check permissions
      if (req.user.role === 'recruiter') {
        const canAccess = resume.assignedTo === req.user.id || 
                         resume.uploadedBy === req.user.id;
        if (!canAccess) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      const signedUrl = await storageService.getSignedUrl(resume.fileKey);

      res.json({ 
        url: signedUrl,
        fileName: resume.fileName,
        mimeType: resume.mimeType
      });
    } catch (error) {
      console.error('Get file URL error:', error);
      res.status(500).json({ error: 'Failed to get file URL' });
    }
  }
);

// GET /api/resumes/:id/download - Direct file download through API
router.get('/:id/download', 
  authenticateToken,
  async (req, res) => {
    try {
      console.log('Direct download route accessed - Resume ID:', req.params.id);
      
      const resumeId = parseInt(req.params.id);
      
      const resume = await prisma.resume.findUnique({
        where: { id: resumeId }
      });

      console.log('Resume found for download:', !!resume);
      if (resume) {
        console.log('Resume fileKey for download:', resume.fileKey);
        console.log('Resume fileName for download:', resume.fileName);
      }

      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      // Check permissions
      if (req.user.role === 'recruiter') {
        const canAccess = resume.assignedTo === req.user.id || 
                         resume.uploadedBy === req.user.id;
        if (!canAccess) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      // For now, just return the file URL instead of streaming
      // This avoids the 502 error while we debug
      const signedUrl = await storageService.getSignedUrl(resume.fileKey);
      
      console.log('Generated download URL:', signedUrl);
      
      // Redirect to the file URL
      res.redirect(signedUrl);
      
    } catch (error) {
      console.error('Direct download error:', error);
      res.status(500).json({ error: 'Failed to download file', details: error.message });
    }
  }
);

module.exports = router;