// src/routes/upload.routes.js
const router           = require('express').Router();
const uploadController = require('../controllers/upload.controller');
const authMiddleware   = require('../middlewares/auth.middleware');
const adminMiddleware  = require('../middlewares/admin.middleware');
const { upload }       = require('../config/multer');

// POST /api/upload/listing/:id — uploader des photos
router.post(
  '/listing/:id',
  authMiddleware,
  adminMiddleware,
  upload.array('images', 10),
  uploadController.uploadListingImages
);

// DELETE /api/upload/image/:imageId — supprimer une photo
router.delete(
  '/image/:imageId',
  authMiddleware,
  adminMiddleware,
  uploadController.deleteImage
);

module.exports = router;