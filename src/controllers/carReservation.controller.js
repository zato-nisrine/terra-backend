// src/controllers/carReservation.controller.js

const CarReservation = require('../models/CarReservation.model');
const Car = require('../models/Car.model');

const carReservationController = {

  // ── POST /api/car-reservations ────────────────────────────
  // Client — créer une réservation de voiture
  create: async (req, res, next) => {
    try {
      const { car_id, date_debut, date_fin, message } = req.body;
      let { nb_jours, prix_total } = req.body;

      if (!car_id || !date_debut || !date_fin) {
        return res.status(400).json({
          success: false,
          message: 'Veuillez fournir car_id, date_debut et date_fin.',
        });
      }

      // Vérifier les dates
      if (new Date(date_debut) >= new Date(date_fin)) {
        return res.status(400).json({
          success: false,
          message: 'La date de fin doit être après la date de début.',
        });
      }

      const car = await Car.findByIdAdmin(car_id) || await Car.findById(car_id);
      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Voiture introuvable.',
        });
      }

      if (!nb_jours) {
        const debut = new Date(date_debut);
        const fin = new Date(date_fin);
        nb_jours = Math.max(1, Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)));
      }

      if (!prix_total) {
        const prixJour = Number(car.prix_par_jour);
        if (!Number.isFinite(prixJour)) {
          return res.status(400).json({
            success: false,
            message: 'Prix journalier de la voiture invalide.',
          });
        }
        prix_total = prixJour * Number(nb_jours);
      }

      // Vérifier la disponibilité
      const isAvailable = await CarReservation.checkAvailability(car_id, date_debut, date_fin);
      if (!isAvailable) {
        return res.status(409).json({
          success: false,
          message: 'Cette voiture n\'est pas disponible pour les dates sélectionnées.',
        });
      }

      // Créer la réservation
      const result = await CarReservation.create({
        car_id,
        user_id: req.user.id,
        date_debut,
        date_fin,
        nb_jours,
        prix_total,
        statut: 'en_attente',
        message,
      });

      res.status(201).json({
        success: true,
        message: 'Réservation créée avec succès.',
        data: result,
      });

    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/car-reservations ─────────────────────────────
  // Client — récupérer ses réservations
  getMyReservations: async (req, res, next) => {
    try {
      const { page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const reservations = await CarReservation.findByUserId(req.user.id, { limit, offset });

      res.json({
        success: true,
        data: reservations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
        },
      });

    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/car-reservations/:id ─────────────────────────
  // Client/Admin — récupérer une réservation
  getOne: async (req, res, next) => {
    try {
      const reservation = await CarReservation.findById(req.params.id);

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Réservation introuvable.',
        });
      }

      // Vérifier que l'utilisateur est propriétaire ou admin
      if (req.user.id !== reservation.user_id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé.',
        });
      }

      res.json({ success: true, data: reservation });

    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/car-reservations/admin/all ───────────────────
  // Admin — toutes les réservations
  getAll: async (req, res, next) => {
    try {
      const { car_id, statut, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const [reservations, total] = await Promise.all([
        CarReservation.findAll({ car_id, statut, limit, offset }),
        CarReservation.count({ car_id, statut }),
      ]);

      res.json({
        success: true,
        data: reservations,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          total_pages: Math.ceil(total / Number(limit)),
        },
      });

    } catch (error) {
      next(error);
    }
  },

  // ── PATCH /api/car-reservations/:id/status ────────────────
  // Admin — mettre à jour le statut
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { statut, note_admin } = req.body;

      if (!['en_attente', 'confirme', 'refuse', 'annule'].includes(statut)) {
        return res.status(400).json({
          success: false,
          message: 'Statut invalide. Utilisez: en_attente, confirme, refuse, annule',
        });
      }

      const result = await CarReservation.updateStatus(id, statut, note_admin);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Réservation introuvable.',
        });
      }

      res.json({
        success: true,
        message: 'Statut de la réservation mise à jour.',
        data: result,
      });

    } catch (error) {
      next(error);
    }
  },

  // ── DELETE /api/car-reservations/:id ──────────────────────
  // Client/Admin — annuler une réservation
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      const reservation = await CarReservation.findById(id);

      if (!reservation) {
        return res.status(404).json({
          success: false,
          message: 'Réservation introuvable.',
        });
      }

      // Vérifier les permissions
      if (req.user.id !== reservation.user_id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé.',
        });
      }

      const success = await CarReservation.delete(id);

      if (!success) {
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de la suppression.',
        });
      }

      res.json({
        success: true,
        message: 'Réservation annulée.',
      });

    } catch (error) {
      next(error);
    }
  },
};

module.exports = carReservationController;
