// server.js
// Point d'entrée du serveur Terra — Express + MySQL

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const { testConnection, runMigrations } = require('./src/config/db');

// ── Import des routes ──────────────────────────────────────
const authRoutes         = require('./src/routes/auth.routes');
const listingRoutes      = require('./src/routes/listing.routes');
const contactRoutes      = require('./src/routes/contact.routes');
const uploadRoutes       = require('./src/routes/upload.routes');
const adminRoutes        = require('./src/routes/admin.routes');
const reservationRoutes  = require('./src/routes/reservation.routes');
const carRoutes          = require('./src/routes/car.routes');
const carReservationRoutes = require('./src/routes/carReservation.routes');

// ── Import du gestionnaire d'erreurs ──────────────────────
const errorHandler = require('./src/middlewares/errorHandler');

// ── Initialisation de l'app ───────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middlewares globaux ───────────────────────────────────

// CORS — autorise toutes les origines
app.use(cors({
  origin: true,
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse le JSON des requêtes (body)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir les images uploadées en statique
// ex: http://localhost:5000/uploads/listings/photo.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes de l'API ───────────────────────────────────────
app.use('/api/auth',              authRoutes);
app.use('/api/listings',          listingRoutes);
app.use('/api/contact',           contactRoutes);
app.use('/api/upload',            uploadRoutes);
app.use('/api/admin',             adminRoutes);
app.use('/api/reservations',      reservationRoutes);
app.use('/api/cars',              carRoutes);
app.use('/api/car-reservations',  carReservationRoutes);

// ── Route de santé — vérifier que le serveur tourne ──────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Terra API opérationnelle 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Route inconnue (404) ──────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route introuvable : ${req.method} ${req.originalUrl}`,
  });
});

// ── Gestionnaire d'erreurs global (doit être en dernier) ─
app.use(errorHandler);

// ── Démarrage du serveur ──────────────────────────────────
const start = async () => {
  // 1. Tester la connexion MySQL avant de démarrer
  await testConnection();
  await runMigrations();

  // 2. Lancer Express
  app.listen(PORT, () => {
    console.log(`\n🏠 Terra Backend démarré`);
    console.log(`📡 API        : http://localhost:${PORT}/api`);
    console.log(`❤️  Health     : http://localhost:${PORT}/api/health`);
    console.log(`🌍 Env        : ${process.env.NODE_ENV || 'development'}`);
    console.log(`─────────────────────────────────────\n`);
  });
};

start();