// src/models/Contact.model.js

const { pool } = require('../config/db');

const Contact = {

  // ── Enregistrer un message de contact ─────────────────────
  create: async ({ nom, email, telephone, sujet, message }) => {
    const [result] = await pool.execute(
      `INSERT INTO contacts (nom, email, telephone, sujet, message)
       VALUES (?, ?, ?, ?, ?) RETURNING id`,
      [nom, email, telephone || null, sujet || null, message]
    );
    return result.insertId;
  },

  // ── Tous les messages (admin) ─────────────────────────────
  findAll: async () => {
    const [rows] = await pool.execute(
      'SELECT * FROM contacts ORDER BY created_at DESC'
    );
    return rows;
  },

  // ── Marquer comme lu (admin) ──────────────────────────────
  markAsRead: async (id) => {
    const [result] = await pool.execute(
      'UPDATE contacts SET est_lu = 1 WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  // ── Supprimer un message (admin) ──────────────────────────
  delete: async (id) => {
    const [result] = await pool.execute(
      'DELETE FROM contacts WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  // ── Nombre de messages non lus (dashboard) ────────────────
  countUnread: async () => {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM contacts WHERE est_lu = 0'
    );
    return rows[0].total;
  },

};

module.exports = Contact;