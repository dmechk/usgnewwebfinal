'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const AppError = require('../utils/appError');
const { StatusCodes } = require('http-status-codes');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const cleanOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${cleanOriginal}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

  if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Unsupported file type. Please upload an image, PDF, or Word document.', StatusCodes.BAD_REQUEST));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
});

/**
 * POST /api/upload
 * Upload a single file.
 * Open to public (needed for job applicant CV submission) but rate-limited per IP.
 * NOTE: For production, migrate to cloud storage (Cloudinary/S3) to avoid
 * ephemeral disk loss on Render redeployments.
 */
router.post('/', uploadLimiter, upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No file provided', StatusCodes.BAD_REQUEST);
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (err) {
    return next(err);
  }
});

// Upload multiple files
router.post('/multiple', uploadLimiter, upload.array('files', 5), (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('No files provided', StatusCodes.BAD_REQUEST);
    }

    const files = req.files.map((f) => ({
      fileUrl: `/uploads/${f.filename}`,
      filename: f.filename,
      originalName: f.originalname,
      size: f.size,
      mimetype: f.mimetype,
    }));

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: `${files.length} files uploaded successfully`,
      data: { files },
    });
  } catch (err) {
    return next(err);
  }
});

// Dedicated video upload endpoint with 1GB limit and any video format
const videoUpload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB limit for videos
  },
});

router.post('/video', uploadLimiter, videoUpload.single('file'), (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No video file provided', StatusCodes.BAD_REQUEST);
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
