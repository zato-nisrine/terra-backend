// src/controllers/listing.controller.js

const Listing = require('../models/Listing.model');
const Reservation = require('../models/Reservation.model');

const listingController = {

  // ── GET /api/listings ─────────────────────────────────────
  // Public — liste des logements avec filtres et pagination
  getAll: async (req, res, next) => {
    try {
      const { ville, type_logement, prix_min, prix_max, meuble, page = 1, limit = 12 } = req.query;

      const offset  = (Number(page) - 1) * Number(limit);
      const filtres = { ville, type_logement, prix_min, prix_max, meuble, limit, offset };

      const [listings, total] = await Promise.all([
        Listing.findAll(filtres),
        Listing.count(filtres),
      ]);

      res.json({
        success: true,
        data: listings,
        pagination: {
          total,
          page:        Number(page),
          limit:       Number(limit),
          total_pages: Math.ceil(total / Number(limit)),
        },
      });

    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/listings/:id/availability ────────────────────
  // Public — dates déjà réservées (confirmées) pour le calendrier
  getAvailability: async (req, res, next) => {
    try {
      const listing = await Listing.findById(req.params.id);
      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Logement introuvable.',
        });
      }

      const booked = await Reservation.getConfirmedBookings(req.params.id);
      res.json({ success: true, data: booked });
    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/listings/:id ─────────────────────────────────
  // Public — détail d'un logement avec ses photos
  getOne: async (req, res, next) => {
    try {
      const listing = await Listing.findById(req.params.id);

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Logement introuvable.',
        });
      }

      res.json({ success: true, data: listing });

    } catch (error) {
      next(error);
    }
  },

  // ── POST /api/listings ────────────────────────────────────
  // Admin seulement — créer un logement
  create: async (req, res, next) => {
    try {
      const listingId = await Listing.create({
        ...req.body,
        cree_par: req.user.id,
      });

      const listing = await Listing.findByIdAdmin(listingId);

      res.status(201).json({
        success: true,
        message: 'Logement créé avec succès.',
        data: listing,
      });

    } catch (error) {
      next(error);
    }
  },

  // ── PUT /api/listings/:id ─────────────────────────────────
  // Admin seulement — modifier un logement
  update: async (req, res, next) => {
    try {
      const updated = await Listing.update(req.params.id, req.body);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Logement introuvable.',
        });
      }

      const listing = await Listing.findByIdAdmin(req.params.id);

      res.json({
        success: true,
        message: 'Logement mis à jour.',
        data: listing,
      });

    } catch (error) {
      next(error);
    }
  },

  // ── PATCH /api/listings/:id/publish ──────────────────────
  // Admin — publier ou dépublier un logement
  togglePublish: async (req, res, next) => {
    try {
      const { est_publie } = req.body;
      await Listing.togglePublish(req.params.id, est_publie);

      res.json({
        success: true,
        message: est_publie ? 'Logement publié.' : 'Logement dépublié.',
      });

    } catch (error) {
      next(error);
    }
  },

  // ── DELETE /api/listings/:id ──────────────────────────────
  // Admin seulement — supprimer un logement
  delete: async (req, res, next) => {
    try {
      const deleted = await Listing.delete(req.params.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Logement introuvable.',
        });
      }

      res.json({
        success: true,
        message: 'Logement supprimé.',
      });

    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/listings/admin/:id ───────────────────────────
  // Admin — détail d'un logement (publié ou brouillon)
  getOneAdmin: async (req, res, next) => {
    try {
      const listing = await Listing.findByIdAdmin(req.params.id);

      if (!listing) {
        return res.status(404).json({
          success: false,
          message: 'Logement introuvable.',
        });
      }

      res.json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/listings/admin/all ───────────────────────────
  // Admin — tous les logements (publiés + non publiés)
  getAllAdmin: async (req, res, next) => {
    try {
      const listings = await Listing.findAllAdmin();
      res.json({ success: true, data: listings });
    } catch (error) {
      next(error);
    }
  },

};

module.exports = listingController;