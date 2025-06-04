const express = require('express');
const multer = require('multer');
const path = require('path');
const { uploadFile, downloadFile } = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/download/:filename', protect, downloadFile);

module.exports = router;
