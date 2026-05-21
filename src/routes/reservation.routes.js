// src/routes/reservation.routes.js

const router                 = require('express').Router();
const reservationController  = require('../controllers/reservation.controller');
const authMiddleware         = require('../middlewares/auth.middleware');
const adminMiddleware        = require('../middlewares/admin.middleware');

// ── Routes client (token requis) ──────────────────────────

// POST  /api/reservations               — faire une demande
router.post('/', authMiddleware, reservationController.create);

// GET   /api/reservations/mes-reservations — mes réservations
router.get('/mes-reservations', authMiddleware, reservationController.getMesReservations);

// PATCH /api/reservations/:id/annuler   — annuler ma réservation
router.patch('/:id/annuler', authMiddleware, reservationController.annuler);

// ── Routes admin ──────────────────────────────────────────

// GET   /api/reservations               — toutes les réservations
router.get('/', authMiddleware, adminMiddleware, reservationController.getAll);

// GET   /api/reservations/stats         — stats dashboard
router.get('/stats', authMiddleware, adminMiddleware, reservationController.getStats);

// PATCH /api/reservations/:id/statut    — confirmer / refuser
router.patch('/:id/statut', authMiddleware, adminMiddleware, reservationController.updateStatut);

module.exports = router;