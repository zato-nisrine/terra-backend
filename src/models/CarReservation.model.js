// src/models/CarReservation.model.js
// Toutes les requêtes SQL liées aux réservations de voitures

const { pool } = require('../config/db');

const CarReservation = {

  // ── Créer une réservation de voiture ──────────────────────
  create: async ({
    car_id,
    user_id,
    date_debut,
    date_fin,
    nb_jours,
    prix_total,
    statut,
    message,
  }) => {
    const query = `
      INSERT INTO car_reservations (
        car_id, user_id, date_debut, date_fin, nb_jours, prix_total, statut, message, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      RETURNING id
    `;

    const values = [
      car_id,
      user_id,
      date_debut,
      date_fin,
      nb_jours,
      prix_total,
      statut || 'en_attente',
      message || null,
    ];

    const [result] = await pool.execute(query, values);
    return { id: result.insertId ?? result[0]?.id };
  },

  // ── Récupérer les réservations de l'utilisateur ───────────
  findByUserId: async (user_id, { limit = 50, offset = 0 } = {}) => {
    const query = `
      SELECT 
        cr.*,
        c.marque,
        c.modele,
        c.annee,
        c.couleur,
        c.prix_par_jour,
        c.marque AS car_marque,
        c.modele AS car_modele,
        c.prix_par_jour AS car_prix_jour,
        (SELECT url FROM car_images ci WHERE ci.car_id = c.id AND ci.est_principale = 1 LIMIT 1) AS photo_principale,
        (SELECT url FROM car_images ci WHERE ci.car_id = c.id AND ci.est_principale = 1 LIMIT 1) AS car_photo
      FROM car_reservations cr
      JOIN cars c ON cr.car_id = c.id
      WHERE cr.user_id = ?
      ORDER BY cr.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.execute(query, [user_id, Number(limit), Number(offset)]);
    return rows;
  },

  // ── Récupérer une réservation par ID ──────────────────────
  findById: async (id) => {
    const query = `
      SELECT 
        cr.*,
        c.marque,
        c.modele,
        c.annee,
        c.couleur,
        c.plaque_immatriculation,
        c.description,
        u.nom,
        u.prenom,
        u.email,
        u.telephone,
        (SELECT url FROM car_images ci WHERE ci.car_id = c.id AND ci.est_principale = 1 LIMIT 1) AS photo_principale
      FROM car_reservations cr
      JOIN cars c ON cr.car_id = c.id
      JOIN users u ON cr.user_id = u.id
      WHERE cr.id = ?
    `;

    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  },

  // ── Récupérer toutes les réservations (admin) ─────────────
  findAll: async ({ car_id, statut, limit = 50, offset = 0 } = {}) => {
    let query = `
      SELECT 
        cr.*,
        c.marque,
        c.modele,
        u.nom,
        u.prenom,
        u.email,
        u.telephone
      FROM car_reservations cr
      JOIN cars c ON cr.car_id = c.id
      JOIN users u ON cr.user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (car_id) {
      query += ' AND cr.car_id = ?';
      params.push(car_id);
    }

    if (statut) {
      query += ' AND cr.statut = ?';
      params.push(statut);
    }

    query += ' ORDER BY cr.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  // ── Compter les réservations (avec filtres) ───────────────
  count: async ({ car_id, statut } = {}) => {
    let query = 'SELECT COUNT(*) as total FROM car_reservations WHERE 1=1';
    const params = [];

    if (car_id) {
      query += ' AND car_id = ?';
      params.push(car_id);
    }

    if (statut) {
      query += ' AND statut = ?';
      params.push(statut);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0]?.total || 0;
  },

  // ── Mettre à jour le statut d'une réservation ─────────────
  updateStatus: async (id, statut, note_admin = null) => {
    const query = `
      UPDATE car_reservations
      SET statut = ?, note_admin = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const [result] = await pool.execute(query, [statut, note_admin, id]);
    return result.affectedRows > 0 ? { id } : null;
  },

  // ── Supprimer une réservation ────────────────────────────
  delete: async (id) => {
    const query = 'DELETE FROM car_reservations WHERE id = ?';

    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  },

  // ── Vérifier la disponibilité d'une voiture ──────────────
  checkAvailability: async (car_id, date_debut, date_fin) => {
    const query = `
      SELECT COUNT(*) as count
      FROM car_reservations
      WHERE car_id = ?
      AND statut IN ('en_attente', 'confirme')
      AND (
        (date_debut <= ? AND date_fin >= ?)
        OR (date_debut <= ? AND date_fin >= ?)
        OR (date_debut >= ? AND date_fin <= ?)
      )
    `;

    const [rows] = await pool.execute(query, [
      car_id,
      date_fin,
      date_debut,
      date_fin,
      date_debut,
      date_debut,
      date_fin,
    ]);

    return Number(rows[0]?.count ?? 0) === 0;
  },
};

module.exports = CarReservation;
