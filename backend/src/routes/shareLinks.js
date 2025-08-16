const express = require('express');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const storageService = require('../utils/storage');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/resumes/:id/share - Create share link
router.post('/resumes/:id/share', 
  authenticateToken,
  validate(schemas.createShareLink),
  async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);
      const { expiresInMinutes = 1440 } = req.body; // Default 24 hours

      const resume = await prisma.resume.findUnique({
        where: { id: resumeId }
      });

      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      // Check permissions
      if (req.user.role === 'recruiter') {
        const canShare = resume.assignedToUserId === req.user.id || 
                        resume.uploadedByUserId === req.user.id;
        if (!canShare) {
          return res.status(403).json({ error: 'You can only share resumes assigned to you' });
        }
      }

      // Generate unique token
      const token = crypto.randomBytes(16).toString('hex');

      // Calculate expiration
      const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

      const shareLink = await prisma.shareLink.create({
        data: {
          resumeId,
          token,
          expiresAt,
          createdByUserId: req.user.id
        }
      });

      const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
      const shareUrl = `${baseUrl}/s/${token}`;

      res.status(201).json({
        message: 'Share link created successfully',
        shareLink: {
          id: shareLink.id,
          token: shareLink.token,
          url: shareUrl,
          expiresAt: shareLink.expiresAt,
          createdAt: shareLink.createdAt
        }
      });
    } catch (error) {
      console.error('Create share link error:', error);
      res.status(500).json({ error: 'Failed to create share link' });
    }
  }
);

// GET /api/s/:token - Public resume view via share link
router.get('/s/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const shareLink = await prisma.shareLink.findUnique({
      where: { token },
      include: {
        resume: {
          include: {
            uploadedBy: {
              select: { username: true, fullName: true }
            }
          }
        }
      }
    });

    if (!shareLink) {
      return res.status(404).json({ error: 'Share link not found' });
    }

    // Check if link is revoked
    if (shareLink.revoked) {
      return res.status(410).json({ error: 'Share link has been revoked' });
    }

    // Check if link is expired
    if (shareLink.expiresAt && new Date() > shareLink.expiresAt) {
      return res.status(410).json({ error: 'Share link has expired' });
    }

    // Get file URL
    const fileUrl = await storageService.getSignedUrl(shareLink.resume.fileKey, 3600);

    res.json({
      resume: {
        id: shareLink.resume.id,
        candidateName: shareLink.resume.candidateName,
        candidateEmail: shareLink.resume.candidateEmail,
        candidatePhone: shareLink.resume.candidatePhone,
        experienceYears: shareLink.resume.experienceYears,
        skills: shareLink.resume.skills,
        fileName: shareLink.resume.fileName,
        fileSize: shareLink.resume.fileSize,
        mimeType: shareLink.resume.mimeType,
        createdAt: shareLink.resume.createdAt,
        uploadedBy: shareLink.resume.uploadedBy
      },
      fileUrl,
      shareLink: {
        expiresAt: shareLink.expiresAt,
        createdAt: shareLink.createdAt
      }
    });
  } catch (error) {
    console.error('Get share link error:', error);
    res.status(500).json({ error: 'Failed to access shared resume' });
  }
});

// POST /api/share/:id/revoke - Revoke share link
router.post('/share/:id/revoke', 
  authenticateToken,
  async (req, res) => {
    try {
      const shareLinkId = parseInt(req.params.id);

      const shareLink = await prisma.shareLink.findUnique({
        where: { id: shareLinkId },
        include: {
          resume: true
        }
      });

      if (!shareLink) {
        return res.status(404).json({ error: 'Share link not found' });
      }

      // Check permissions
      if (req.user.role === 'recruiter') {
        const canRevoke = shareLink.createdByUserId === req.user.id ||
                         shareLink.resume.assignedToUserId === req.user.id ||
                         shareLink.resume.uploadedByUserId === req.user.id;
        if (!canRevoke) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      await prisma.shareLink.update({
        where: { id: shareLinkId },
        data: { revoked: true }
      });

      res.json({ message: 'Share link revoked successfully' });
    } catch (error) {
      console.error('Revoke share link error:', error);
      res.status(500).json({ error: 'Failed to revoke share link' });
    }
  }
);

// GET /api/resumes/:id/shares - List share links for a resume
router.get('/resumes/:id/shares', 
  authenticateToken,
  async (req, res) => {
    try {
      const resumeId = parseInt(req.params.id);

      const resume = await prisma.resume.findUnique({
        where: { id: resumeId }
      });

      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }

      // Check permissions
      if (req.user.role === 'recruiter') {
        const canView = resume.assignedToUserId === req.user.id || 
                       resume.uploadedByUserId === req.user.id;
        if (!canView) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      const shareLinks = await prisma.shareLink.findMany({
        where: { resumeId },
        include: {
          createdBy: {
            select: { username: true, fullName: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

      const formattedLinks = shareLinks.map(link => ({
        id: link.id,
        token: link.token,
        url: `${baseUrl}/s/${link.token}`,
        expiresAt: link.expiresAt,
        revoked: link.revoked,
        createdAt: link.createdAt,
        createdBy: link.createdBy
      }));

      res.json({ shareLinks: formattedLinks });
    } catch (error) {
      console.error('Get share links error:', error);
      res.status(500).json({ error: 'Failed to fetch share links' });
    }
  }
);

module.exports = router;