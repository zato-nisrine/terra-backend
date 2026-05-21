// src/routes/contact.routes.js

const router            = require('express').Router();
const contactController = require('../controllers/contact.controller');
const authMiddleware    = require('../middlewares/auth.middleware');
const adminMiddleware   = require('../middlewares/admin.middleware');

// POST /api/contact         — envoyer un message (public)
router.post('/', contactController.send);

// GET  /api/contact         — tous les messages (admin)
router.get('/', authMiddleware, adminMiddleware, contactController.getAll);

// PATCH /api/contact/:id/lu — marquer comme lu (admin)
router.patch('/:id/lu', authMiddleware, adminMiddleware, contactController.markAsRead);

// DELETE /api/contact/:id   — supprimer (admin)
router.delete('/:id', authMiddleware, adminMiddleware, contactController.delete);

module.exports = router;