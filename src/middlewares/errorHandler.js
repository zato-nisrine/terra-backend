// src/middlewares/errorHandler.js
// Gestionnaire d'erreurs global — intercepte toutes les erreurs Express

const multer = require('multer');
const { limitsConfig } = require('../config/multer');

const errorHandler = (err, req, res, next) => {
  // Log de l'erreur en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Erreur :', err.stack);
  }

  // Erreur de validation (express-validator)
  if (err.type === 'validation') {
    return res.status(422).json({
      success: false,
      message: 'Données invalides',
      errors:  err.errors,
    });
  }

  // Erreur Multer (upload photos)
  if (err instanceof multer.MulterError) {
    const maxMb    = limitsConfig?.maxFileMb ?? 15;
    const maxFiles = limitsConfig?.maxFiles   ?? 10;

    const messages = {
      LIMIT_FILE_SIZE: `Une photo dépasse ${maxMb} Mo. Réduisez sa taille ou choisissez une autre image.`,
      LIMIT_FILE_COUNT: `Maximum ${maxFiles} photos par envoi. Envoyez les photos en plusieurs fois si besoin.`,
      LIMIT_UNEXPECTED_FILE: 'Champ de fichier invalide.',
    };

    return res.status(400).json({
      success: false,
      message: messages[err.code] || 'Erreur lors de l\'upload des photos.',
      code: err.code,
    });
  }

  // Erreur JWT (token invalide ou expiré)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré. Veuillez vous reconnecter.',
    });
  }

  // Erreur de contrainte unique PostgreSQL / MySQL
  if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Cette adresse email est déjà utilisée.',
    });
  }

  // Erreur générique
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Erreur interne du serveur.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;