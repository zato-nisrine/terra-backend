// src/controllers/upload.controller.js

const path    = require('path');
const fs      = require('fs');
const Listing = require('../models/Listing.model');

const uploadController = {

  // ── POST /api/upload/listing/:id ─────────────────────────
  // Admin — uploader des photos pour un logement
  uploadListingImages: async (req, res, next) => {
    try {
      const { id } = req.params;
      const markPrimary = req.body.est_principale !== 'false';
      const primaryIndex = Math.min(
        Math.max(0, parseInt(req.body.photo_principale_index ?? '0', 10) || 0),
        Math.max(0, (req.files?.length || 1) - 1)
      );

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Aucune image reçue.',
        });
      }

      if (markPrimary) {
        await Listing.clearPrimaryImages(id);
      }

      const baseOrdre = await Listing.countImages(id);
      const images = [];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const url  = `/uploads/listings/${file.filename}`;

        const principale = markPrimary && i === primaryIndex;

        const imageId = await Listing.addImage(id, url, principale, baseOrdre + i);
        images.push({ id: imageId, url, est_principale: principale });
      }

      res.status(201).json({
        success: true,
        message: `${images.length} photo(s) uploadée(s) avec succès.`,
        data: images,
      });

    } catch (error) {
      next(error);
    }
  },

  // ── PATCH /api/upload/image/:imageId/primary ─────────────
  setPrimaryImage: async (req, res, next) => {
    try {
      const { imageId } = req.params;
      const image = await Listing.findImageById(imageId);

      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Image introuvable.',
        });
      }

      await Listing.setPrimaryImage(image.listing_id, imageId);

      res.json({
        success: true,
        message: 'Photo principale mise à jour.',
      });
    } catch (error) {
      next(error);
    }
  },

  // ── DELETE /api/upload/image/:imageId ────────────────────
  // Admin — supprimer une photo
  deleteImage: async (req, res, next) => {
    try {
      const { imageId } = req.params;

      // Récupérer l'URL avant suppression pour effacer le fichier
      const deleted = await Listing.deleteImage(imageId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Image introuvable.',
        });
      }

      res.json({ success: true, message: 'Image supprimée.' });

    } catch (error) {
      next(error);
    }
  },

};

module.exports = uploadController;