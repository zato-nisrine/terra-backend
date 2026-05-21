// src/routes/upload.routes.js

const router           = require('express').Router();
const uploadController = require('../controllers/upload.controller');
const authMiddleware   = require('../middlewares/auth.middleware');
const adminMiddleware  = require('../middlewares/admin.middleware');
const upload           = require('../config/multer');

// POST   /api/upload/listing/:id    — uploader des photos (admin)
router.post(
  '/listing/:id',
  authMiddleware,
  adminMiddleware,
  upload.array('images', 10),
  uploadController.uploadListingImages
);

// PATCH  /api/upload/image/:imageId/primary — définir la photo principale (admin)
router.patch(
  '/image/:imageId/primary',
  authMiddleware,
  adminMiddleware,
  uploadController.setPrimaryImage
);

// DELETE /api/upload/image/:imageId — supprimer une photo (admin)
router.delete(
  '/image/:imageId',
  authMiddleware,
  adminMiddleware,
  uploadController.deleteImage
);

module.exports = router;