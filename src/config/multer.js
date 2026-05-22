// src/config/multer.js
// Configuration de Multer pour l'upload des photos de logements

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const createUploader = (subfolder, prefix) => {
  const uploadDir = path.join(__dirname, '../../uploads', subfolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const ext      = path.extname(file.originalname).toLowerCase();
        const filename = `${prefix}_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
        cb(null, filename);
      },
    }),
    fileFilter,
    limits: {
      fileSize: MAX_FILE_MB * 1024 * 1024,
      files:    MAX_FILES,
    },
  });
};

// Filtre — accepter uniquement les images
const fileFilter = (req, file, cb) => {
  const typesAcceptes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (typesAcceptes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format non accepté. Utilisez JPEG, PNG ou WebP.'), false);
  }
};

const MAX_FILE_MB = Number(process.env.UPLOAD_MAX_FILE_MB) || 15;
const MAX_FILES   = Number(process.env.UPLOAD_MAX_FILES)   || 10;

const upload = createUploader('listings', 'listing');
upload.car = createUploader('cars', 'car');

upload.limitsConfig = { maxFileMb: MAX_FILE_MB, maxFiles: MAX_FILES };

module.exports = upload;