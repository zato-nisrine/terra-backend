// src/middlewares/auth.middleware.js
// Vérifie que le token JWT est valide avant d'accéder à une route protégée

const jwtConfig = require('../config/jwt');

const authMiddleware = (req, res, next) => {
  try {
    // 1. Récupérer le token dans le header Authorization
    // Format attendu : "Bearer eyJhbGci..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Token manquant.',
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Vérifier et décoder le token
    const decoded = jwtConfig.verify(token);

    // 3. Attacher les infos de l'utilisateur à la requête
    req.user = decoded; // { id, role, iat, exp }

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré. Veuillez vous reconnecter.',
    });
  }
};

module.exports = authMiddleware;