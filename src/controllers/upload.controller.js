// src/controllers/upload.controller.js
const { cloudinary } = require('../config/multer');
const Listing = require('../models/Listing.model');

const uploadController = {

  // POST /api/upload/listing/:id
  uploadListingImages: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { est_principale } = req.body;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'Aucune image reçue.' });
      }

      const images = [];
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        // Cloudinary retourne l'URL directement dans req.files
        const url        = file.path;       // URL Cloudinary (https://res.cloudinary.com/...)
        const principale = i === 0 && est_principale === 'true';

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

  // DELETE /api/upload/image/:imageId
  deleteImage: async (req, res, next) => {
    try {
      const deleted = await Listing.deleteImage(req.params.imageId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Image introuvable.' });
      }
      res.json({ success: true, message: 'Image supprimée.' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = uploadController;