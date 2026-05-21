// src/routes/listing.routes.js

const router            = require('express').Router();
const listingController = require('../controllers/listing.controller');
const authMiddleware    = require('../middlewares/auth.middleware');
const adminMiddleware   = require('../middlewares/admin.middleware');

// ── Routes publiques ──────────────────────────────────────
// GET  /api/listings              — liste avec filtres & pagination
router.get('/', listingController.getAll);

// ── Routes admin (token requis + rôle admin) ──────────────
// GET  /api/listings/admin/all    — tous les logements (publiés + non publiés)
router.get('/admin/all', authMiddleware, adminMiddleware, listingController.getAllAdmin);

// GET  /api/listings/admin/:id      — détail admin (brouillon ou publié)
router.get('/admin/:id', authMiddleware, adminMiddleware, listingController.getOneAdmin);

// GET  /api/listings/:id          — détail d'un logement (public)
router.get('/:id', listingController.getOne);

// POST /api/listings              — créer un logement
router.post('/', authMiddleware, adminMiddleware, listingController.create);

// PUT  /api/listings/:id          — modifier un logement
router.put('/:id', authMiddleware, adminMiddleware, listingController.update);

// PATCH /api/listings/:id/publish — publier / dépublier
router.patch('/:id/publish', authMiddleware, adminMiddleware, listingController.togglePublish);

// DELETE /api/listings/:id        — supprimer un logement
router.delete('/:id', authMiddleware, adminMiddleware, listingController.delete);

module.exports = router;