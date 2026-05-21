// src/config/multer.js
// Configuration de Multer pour l'upload des photos de logements

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// Créer le dossier uploads/listings s'il n'existe pas
const uploadDir = path.join(__dirname, '../../uploads/listings');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Stockage sur disque
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Nom unique : timestamp + nombre aléatoire + extension originale
    const ext      = path.extname(file.originalname).toLowerCase();
    const filename = `listing_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, filename);
  },
});

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

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_MB * 1024 * 1024,
    files:    MAX_FILES,
  },
});

upload.limitsConfig = { maxFileMb: MAX_FILE_MB, maxFiles: MAX_FILES };

module.exports = upload;