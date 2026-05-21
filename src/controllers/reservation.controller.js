// src/controllers/reservation.controller.js

const Reservation = require('../models/Reservation.model');
const { sendReservationStatusEmail } = require('../services/mail.service');

const reservationController = {

  // ── POST /api/reservations ────────────────────────────────
  // Client connecté — faire une demande de visite ou réservation
  create: async (req, res, next) => {
    try {
      const { listing_id, type, date_souhaitee, message } = req.body;

      if (!listing_id) {
        return res.status(400).json({
          success: false,
          message: 'Le logement est requis.',
        });
      }

      const id = await Reservation.create({
        listing_id,
        user_id: req.user.id, // récupéré depuis le token JWT
        type,
        date_souhaitee,
        message,
      });

      const reservation = await Reservation.findById(id);

      res.status(201).json({
        success: true,
        message: type === 'visite'
          ? 'Demande de visite envoyée avec succès !'
          : 'Demande de réservation envoyée avec succès !',
        data: reservation,
      });

    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/reservations/mes-reservations ────────────────
  // Client — voir ses propres réservations
  getMesReservations: async (req, res, next) => {
    try {
      const reservations = await Reservation.findByUser(req.user.id);
      res.json({ success: true, data: reservations });
    } catch (error) {
      next(error);
    }
  },

  // ── PATCH /api/reservations/:id/annuler ───────────────────
  // Client — annuler sa propre réservation
  annuler: async (req, res, next) => {
    try {
      const annule = await Reservation.cancel(req.params.id, req.user.id);

      if (!annule) {
        return res.status(400).json({
          success: false,
          message: 'Impossible d\'annuler cette réservation.',
        });
      }

      res.json({ success: true, message: 'Réservation annulée.' });

    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/reservations ─────────────────────────────────
  // Admin — toutes les réservations
  getAll: async (req, res, next) => {
    try {
      const reservations = await Reservation.findAll();
      res.json({ success: true, data: reservations });
    } catch (error) {
      next(error);
    }
  },

  // ── PATCH /api/reservations/:id/statut ───────────────────
  // Admin — confirmer, refuser une réservation
  updateStatut: async (req, res, next) => {
    try {
      const { statut, note_admin } = req.body;

      const statuts_valides = ['confirme', 'refuse', 'en_attente'];
      if (!statuts_valides.includes(statut)) {
        return res.status(400).json({
          success: false,
          message: 'Statut invalide. Valeurs acceptées : confirme, refuse, en_attente.',
        });
      }

      const updated = await Reservation.updateStatut(req.params.id, statut, note_admin);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Réservation introuvable.',
        });
      }

      let emailInfo = { sent: false };
      if (statut === 'confirme' || statut === 'refuse') {
        const reservation = await Reservation.findById(req.params.id);
        if (reservation) {
          try {
            emailInfo = await sendReservationStatusEmail(reservation, statut);
          } catch (mailErr) {
            console.error('Erreur envoi email réservation:', mailErr.message);
            emailInfo = { sent: false, reason: 'erreur_envoi' };
          }
        }
      }

      const statutLabel =
        statut === 'confirme' ? 'confirmée' : statut === 'refuse' ? 'refusée' : 'mise à jour';

      res.json({
        success: true,
        message: `Réservation ${statutLabel}.${emailInfo.sent ? ' Le client a été notifié par email.' : ''}`,
        email: emailInfo,
      });

    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/reservations/stats ───────────────────────────
  // Admin — statistiques pour le dashboard
  getStats: async (req, res, next) => {
    try {
      const stats = await Reservation.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

};

module.exports = reservationController;