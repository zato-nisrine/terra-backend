// src/routes/upload.routes.js
const router           = require('express').Router();
const uploadController = require('../controllers/upload.controller');
const authMiddleware   = require('../middlewares/auth.middleware');
const adminMiddleware  = require('../middlewares/admin.middleware');
const { uploadListing, uploadCar } = require('../config/multer');

// POST /api/upload/listing/:id — uploader des photos de logement
router.post(
  '/listing/:id',
  authMiddleware,
  adminMiddleware,
  uploadListing.array('images', 10),
  uploadController.uploadListingImages
);

// POST /api/upload/car/:id — uploader des photos de voiture
router.post(
  '/car/:id',
  authMiddleware,
  adminMiddleware,
  uploadCar.array('images', 10),
  uploadController.uploadCarImages
);

// PATCH /api/upload/image/:imageId/primary — définir la photo principale
router.patch(
  '/image/:imageId/primary',
  authMiddleware,
  adminMiddleware,
  uploadController.setPrimaryImage
);

// DELETE /api/upload/image/:imageId — supprimer une photo
router.delete(
  '/image/:imageId',
  authMiddleware,
  adminMiddleware,
  uploadController.deleteImage
);

module.exports = router;
