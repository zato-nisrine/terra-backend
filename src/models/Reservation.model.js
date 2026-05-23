// src/models/Reservation.model.js

const { pool } = require('../config/db');

const Reservation = {

  // ── Créer une réservation / demande de visite ─────────────
  create: async ({ listing_id, user_id, type, date_souhaitee, date_fin, message }) => {
    const [result] = await pool.execute(
      `INSERT INTO reservations (listing_id, user_id, type, date_souhaitee, date_fin, message)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
      [
        listing_id,
        user_id,
        type || 'visite',
        date_souhaitee || null,
        date_fin || null,
        message || null,
      ]
    );
    return result.insertId ?? result[0]?.id;
  },

  getConfirmedBookings: async (listing_id) => {
    const [rows] = await pool.execute(
      `SELECT date_souhaitee, date_fin
       FROM reservations
       WHERE listing_id = ?
         AND type = 'reservation'
         AND statut = 'confirme'
         AND date_souhaitee IS NOT NULL`,
      [listing_id]
    );
    return rows.map((row) => ({
      date_debut: row.date_souhaitee,
      date_fin: row.date_fin || row.date_souhaitee,
    }));
  },

  checkAvailability: async (listing_id, date_debut, date_fin) => {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS count
       FROM reservations
       WHERE listing_id = ?
         AND type = 'reservation'
         AND statut = 'confirme'
         AND date_souhaitee IS NOT NULL
         AND (
           (date_souhaitee <= ? AND COALESCE(date_fin, date_souhaitee) >= ?)
           OR (date_souhaitee <= ? AND COALESCE(date_fin, date_souhaitee) >= ?)
           OR (date_souhaitee >= ? AND COALESCE(date_fin, date_souhaitee) <= ?)
         )`,
      [
        listing_id,
        date_fin,
        date_debut,
        date_fin,
        date_debut,
        date_debut,
        date_fin,
      ]
    );
    return Number(rows[0]?.count ?? 0) === 0;
  },

  // ── Réservations d'un client ──────────────────────────────
  findByUser: async (user_id) => {
    const [rows] = await pool.execute(
      `SELECT r.*,
         l.titre      AS logement_titre,
         l.ville      AS logement_ville,
         l.quartier   AS logement_quartier,
         l.prix       AS logement_prix,
         (SELECT url FROM listing_images li WHERE li.listing_id = l.id AND li.est_principale = 1 LIMIT 1) AS logement_photo
       FROM reservations r
       JOIN listings l ON l.id = r.listing_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [user_id]
    );
    return rows;
  },

  // ── Toutes les réservations (admin) ───────────────────────
  findAll: async () => {
    const [rows] = await pool.execute(
      `SELECT r.*,
         l.titre    AS logement_titre,
         l.ville    AS logement_ville,
         l.quartier AS logement_quartier,
         u.nom      AS client_nom,
         u.prenom   AS client_prenom,
         u.email    AS client_email,
         u.telephone AS client_telephone
       FROM reservations r
       JOIN listings l ON l.id = r.listing_id
       JOIN users    u ON u.id = r.user_id
       ORDER BY r.created_at DESC`
    );
    return rows;
  },

  // ── Une réservation par ID ────────────────────────────────
  findById: async (id) => {
    const [rows] = await pool.execute(
      `SELECT r.*,
         l.titre    AS logement_titre,
         l.ville    AS logement_ville,
         u.nom      AS client_nom,
         u.prenom   AS client_prenom,
         u.email    AS client_email
       FROM reservations r
       JOIN listings l ON l.id = r.listing_id
       JOIN users    u ON u.id = r.user_id
       WHERE r.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  // ── Changer le statut (admin) ─────────────────────────────
  updateStatut: async (id, statut, note_admin = null) => {
    const [result] = await pool.execute(
      'UPDATE reservations SET statut = ?, note_admin = ? WHERE id = ?',
      [statut, note_admin, id]
    );
    return result.affectedRows > 0;
  },

  // ── Annuler (client) ──────────────────────────────────────
  cancel: async (id, user_id) => {
    const [result] = await pool.execute(
      `UPDATE reservations SET statut = 'annule'
       WHERE id = ? AND user_id = ? AND statut = 'en_attente'`,
      [id, user_id]
    );
    return result.affectedRows > 0;
  },

  // ── Stats pour le dashboard admin ────────────────────────
  getStats: async () => {
    const [rows] = await pool.execute(
      `SELECT
         COUNT(*)                                      AS total,
         SUM(statut = 'en_attente')                    AS en_attente,
         SUM(statut = 'confirme')                      AS confirmes,
         SUM(statut = 'refuse')                        AS refuses,
         SUM(statut = 'annule')                        AS annules,
         SUM(type   = 'visite')                        AS visites,
         SUM(type   = 'reservation')                   AS reservations
       FROM reservations`
    );
    return rows[0];
  },

};

module.exports = Reservation;