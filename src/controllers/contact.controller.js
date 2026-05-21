// src/controllers/contact.controller.js

const Contact = require('../models/Contact.model');

const contactController = {

  // ── POST /api/contact ─────────────────────────────────────
  // Public — envoyer un message (pas besoin d'être connecté)
  send: async (req, res, next) => {
    try {
      const { nom, email, telephone, sujet, message } = req.body;

      if (!nom || !email || !message) {
        return res.status(400).json({
          success: false,
          message: 'Nom, email et message sont requis.',
        });
      }

      await Contact.create({ nom, email, telephone, sujet, message });

      res.status(201).json({
        success: true,
        message: 'Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
      });

    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/contact ──────────────────────────────────────
  // Admin — tous les messages reçus
  getAll: async (req, res, next) => {
    try {
      const messages = await Contact.findAll();
      res.json({ success: true, data: messages });
    } catch (error) {
      next(error);
    }
  },

  // ── PATCH /api/contact/:id/lu ─────────────────────────────
  // Admin — marquer un message comme lu
  markAsRead: async (req, res, next) => {
    try {
      await Contact.markAsRead(req.params.id);
      res.json({ success: true, message: 'Message marqué comme lu.' });
    } catch (error) {
      next(error);
    }
  },

  // ── DELETE /api/contact/:id ───────────────────────────────
  // Admin — supprimer un message
  delete: async (req, res, next) => {
    try {
      const deleted = await Contact.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Message introuvable.',
        });
      }
      res.json({ success: true, message: 'Message supprimé.' });
    } catch (error) {
      next(error);
    }
  },

};

module.exports = contactController;