// src/routes/car.routes.js

const router = require('express').Router();
const carController = require('../controllers/car.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');

// ── Routes publiques ──────────────────────────────────────
// GET  /api/cars              — liste avec filtres & pagination
router.get('/', carController.getAll);

// ── Routes admin (avant /:id pour éviter que "admin" soit pris comme id) ──
// GET  /api/cars/admin/all    — toutes les voitures (publiées + brouillons)
router.get('/admin/all', authMiddleware, adminMiddleware, carController.getAllAdmin);

// GET  /api/cars/admin/:id    — détail admin (brouillon ou publié)
router.get('/admin/:id', authMiddleware, adminMiddleware, carController.getOneAdmin);

// GET  /api/cars/:id          — détail d'une voiture (public)
router.get('/:id', carController.getOne);

// POST /api/cars              — créer une voiture
router.post('/', authMiddleware, adminMiddleware, carController.create);

// PUT  /api/cars/:id          — modifier une voiture
router.put('/:id', authMiddleware, adminMiddleware, carController.update);

// PATCH /api/cars/:id/publish — publier / dépublier
router.patch('/:id/publish', authMiddleware, adminMiddleware, carController.togglePublish);

// DELETE /api/cars/:id        — supprimer une voiture
router.delete('/:id', authMiddleware, adminMiddleware, carController.delete);

module.exports = router;
