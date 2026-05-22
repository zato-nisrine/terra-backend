// src/routes/carReservation.routes.js

const router = require('express').Router();
const carReservationController = require('../controllers/carReservation.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

// ── Routes client (authentifiées) ───────────────────────────
// GET  /api/car-reservations         — mes réservations
router.get('/', authMiddleware, carReservationController.getMyReservations);

// GET  /api/car-reservations/:id     — détail d'une réservation
router.get('/:id', authMiddleware, carReservationController.getOne);

// POST /api/car-reservations         — créer une réservation
router.post('/', authMiddleware, carReservationController.create);

// DELETE /api/car-reservations/:id   — annuler une réservation
router.delete('/:id', authMiddleware, carReservationController.delete);

// ── Routes admin ────────────────────────────────────────────
// GET  /api/car-reservations/admin/all — toutes les réservations
router.get('/admin/all', authMiddleware, adminMiddleware, carReservationController.getAll);

// PATCH /api/car-reservations/:id/status — mettre à jour le statut
router.patch('/:id/status', authMiddleware, adminMiddleware, carReservationController.updateStatus);

module.exports = router;
