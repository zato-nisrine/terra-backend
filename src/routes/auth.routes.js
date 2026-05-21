// src/routes/auth.routes.js

const router         = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// POST /api/auth/register — créer un compte client
router.post('/register', authController.register);

// POST /api/auth/login — se connecter (client ou admin)
router.post('/login', authController.login);

// GET /api/auth/me — profil de l'utilisateur connecté (token requis)
router.get('/me', authMiddleware, authController.me);

module.exports = router;