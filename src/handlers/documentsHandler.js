const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const documentsService = require('../services/documentsService');
const authMiddleware = require('../middleware/auth');
const { ClientError } = require('../utils/errors');

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new ClientError('Only PDF files are allowed', 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Public routes
router.get('/', async (req, res, next) => {
  try {
    const documents = await documentsService.getAllDocuments();
    res.json({ status: 'success', data: { documents } });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const document = await documentsService.getDocumentById(req.params.id);
    res.json({ status: 'success', data: { ...document } });
  } catch (err) {
    next(err);
  }
});

// Serve file
router.get('/:id/file', async (req, res, next) => {
  try {
    const document = await documentsService.getDocumentById(req.params.id);
    const filePath = path.resolve(document.file_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ status: 'failed', message: 'File not found' });
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.name}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    next(err);
  }
});

// Protected routes
router.post('/', authMiddleware, (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ status: 'failed', message: 'File size exceeds 5MB limit' });
      }
      return res.status(400).json({ status: 'failed', message: err.message });
    }
    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'failed', message: 'No document file uploaded' });
    }
    const document = await documentsService.uploadDocument(req.user.id, req.file);
    res.status(201).json({
      status: 'success',
      data: {
        documentId: document.id,
        filename: document.file_path,
        originalName: document.name,
        size: document.size,
        created_at: document.created_at,
        updated_at: document.updated_at,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await documentsService.deleteDocument(req.params.id, req.user.id);
    res.json({ status: 'success', message: 'Document deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
