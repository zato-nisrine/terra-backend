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

// POST   /api/upload/car/:id        — uploader des photos de voiture (admin)
router.post(
  '/car/:id',
  authMiddleware,
  adminMiddleware,
  upload.car.fields([
    { name: 'images', maxCount: 10 },
    { name: 'image', maxCount: 10 },
  ]),
  uploadController.uploadCarImages
);

// PATCH  /api/upload/car/image/:imageId/primary — définir la photo principale d'une voiture (admin)
router.patch(
  '/car/image/:imageId/primary',
  authMiddleware,
  adminMiddleware,
  uploadController.setPrimaryCarImage
);

// DELETE /api/upload/car/image/:imageId — supprimer une photo de voiture (admin)
router.delete(
  '/car/image/:imageId',
  authMiddleware,
  adminMiddleware,
  uploadController.deleteCarImage
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