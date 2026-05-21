// src/config/jwt.js
// Génération et vérification des tokens JWT

const jwt = require('jsonwebtoken');

const JWT_SECRET     = process.env.JWT_SECRET     || 'terra_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const jwtConfig = {

  // Générer un token pour un utilisateur
  generate: (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  // Vérifier et décoder un token
  verify: (token) => {
    return jwt.verify(token, JWT_SECRET);
  },

};

module.exports = jwtConfig;