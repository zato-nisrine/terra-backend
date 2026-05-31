// src/controllers/upload.controller.js
const Listing = require('../models/Listing.model');
const Car = require('../models/Car.model');

const resolvePrimaryIndex = (req) => {
  const raw = req.body.photo_principale_index;
  if (raw !== undefined && raw !== null && raw !== '') {
    const index = Number(raw);
    return Number.isFinite(index) ? index : -1;
  }
  return req.body.est_principale === 'true' ? 0 : -1;
};

const extractCloudinaryPublicId = (url) => {
  if (!url || !url.includes('cloudinary.com')) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
  return match?.[1] || null;
};

const uploadController = {

  // POST /api/upload/listing/:id
  uploadListingImages: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'Aucune image reçue.' });
      }

      const primaryIndex = resolvePrimaryIndex(req);
      const images = [];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const url = file.path;
        const principale = primaryIndex === i;

        const imageId = await Listing.addImage(id, url, principale, i);
        images.push({ id: imageId, url, est_principale: principale });
      }

      res.status(201).json({
        success: true,
        message: `${images.length} photo(s) uploadée(s).`,
        data: images,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/upload/car/:id
  uploadCarImages: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'Aucune image reçue.' });
      }

      const primaryIndex = resolvePrimaryIndex(req);
      const images = [];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const url = file.path;
        const principale = primaryIndex === i;

        const imageId = await Car.addImage(id, url, principale, i);
        images.push({ id: imageId, url, est_principale: principale });
      }

      res.status(201).json({
        success: true,
        message: `${images.length} photo(s) uploadée(s).`,
        data: images,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/upload/image/:imageId/primary
  setPrimaryImage: async (req, res, next) => {
    try {
      const { imageId } = req.params;

      const listingImage = await Listing.findImageById(imageId);
      if (listingImage) {
        await Listing.setPrimaryImage(listingImage.listing_id, imageId);
        return res.json({ success: true, message: 'Photo principale définie.' });
      }

      const carImage = await Car.findImageById(imageId);
      if (carImage) {
        await Car.setPrimaryImage(carImage.car_id, imageId);
        return res.json({ success: true, message: 'Photo principale définie.' });
      }

      return res.status(404).json({ success: false, message: 'Image introuvable.' });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/upload/image/:imageId
  deleteImage: async (req, res, next) => {
    try {
      const { imageId } = req.params;

      const listingImage = await Listing.findImageById(imageId);
      if (listingImage) {
        await Listing.deleteImage(imageId);
        return res.json({ success: true, message: 'Image supprimée.' });
      }

      const carImage = await Car.findImageById(imageId);
      if (carImage) {
        await Car.deleteImage(imageId);
        return res.json({ success: true, message: 'Image supprimée.' });
      }

      return res.status(404).json({ success: false, message: 'Image introuvable.' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = uploadController;
