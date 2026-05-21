// src/controllers/auth.controller.js
// Logique d'inscription et de connexion

const bcrypt    = require('bcryptjs');
const User      = require('../models/User.model');
const jwtConfig = require('../config/jwt');

const authController = {

  // ── POST /api/auth/register ───────────────────────────────
  register: async (req, res, next) => {
    try {
      const { nom, prenom, email, telephone, mot_de_passe } = req.body;

      // 1. Vérifier que l'email n'est pas déjà utilisé
      const existe = await User.emailExists(email);
      if (existe) {
        return res.status(409).json({
          success: false,
          message: 'Cette adresse email est déjà utilisée.',
        });
      }

      // 2. Hasher le mot de passe (saltRounds = 10)
      const hash = await bcrypt.hash(mot_de_passe, 10);

      // 3. Créer l'utilisateur en base
      const userId = await User.create({
        nom,
        prenom,
        email,
        telephone,
        mot_de_passe: hash,
      });

      // 4. Récupérer l'utilisateur créé
      const user = await User.findById(userId);

      // 5. Générer le token JWT
      const token = jwtConfig.generate({
        id:   user.id,
        role: user.role,
      });

      res.status(201).json({
        success: true,
        message: 'Compte créé avec succès. Bienvenue sur Terra !',
        token,
        user: {
          id:        user.id,
          nom:       user.nom,
          prenom:    user.prenom,
          email:     user.email,
          telephone: user.telephone,
          role:      user.role,
        },
      });

    } catch (error) {
      next(error);
    }
  },

  // ── POST /api/auth/login ──────────────────────────────────
  login: async (req, res, next) => {
    try {
      const { email, mot_de_passe } = req.body;

      // 1. Chercher l'utilisateur par email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect.',
        });
      }

      // 2. Vérifier le mot de passe
      const motDePasseValide = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
      if (!motDePasseValide) {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect.',
        });
      }

      // 3. Générer le token JWT
      const token = jwtConfig.generate({
        id:   user.id,
        role: user.role,
      });

      res.json({
        success: true,
        message: `Bienvenue ${user.prenom} !`,
        token,
        user: {
          id:        user.id,
          nom:       user.nom,
          prenom:    user.prenom,
          email:     user.email,
          telephone: user.telephone,
          role:      user.role,
        },
      });

    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/auth/me ──────────────────────────────────────
  // Retourne le profil de l'utilisateur connecté (token requis)
  me: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur introuvable.',
        });
      }

      res.json({
        success: true,
        user,
      });

    } catch (error) {
      next(error);
    }
  },

};

module.exports = authController;