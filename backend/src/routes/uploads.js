const express = require('express');
const multer = require('multer');
const { uploadFileToGoogleDrive } = require('../services/googleDrive');
const { authenticate, requireApproved } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload file to Google Drive
router.post('/', authenticate, requireApproved, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { studentName } = req.body;
    const result = await uploadFileToGoogleDrive(
      req.file.originalname,
      req.file.buffer,
      req.file.mimetype,
      studentName || req.user.name
    );

    res.json({
      success: true,
      driveFileId: result.driveFileId,
      fileName: req.file.originalname,
      webViewLink: result.webViewLink
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

module.exports = router;
