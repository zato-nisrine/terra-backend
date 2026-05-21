// src/models/User.model.js
// Toutes les requêtes SQL liées aux utilisateurs

const { pool } = require('../config/db');

const User = {

  // ── Trouver un utilisateur par email ─────────────────────
  findByEmail: async (email) => {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? AND est_actif = 1 LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  // ── Trouver un utilisateur par ID ────────────────────────
  findById: async (id) => {
    const [rows] = await pool.execute(
      `SELECT id, nom, prenom, email, telephone, role, created_at
       FROM users WHERE id = ? AND est_actif = 1 LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  // ── Créer un nouvel utilisateur ──────────────────────────
  create: async ({ nom, prenom, email, telephone, mot_de_passe }) => {
    const [result] = await pool.execute(
      `INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role)
       VALUES (?, ?, ?, ?, ?, 'client') RETURNING id`,
      [nom, prenom, email, telephone || null, mot_de_passe]
    );
    return result.insertId;
  },

  // ── Vérifier si un email existe déjà ─────────────────────
  emailExists: async (email) => {
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows.length > 0;
  },

  // ── Mettre à jour le profil ──────────────────────────────
  update: async (id, { nom, prenom, telephone }) => {
    const [result] = await pool.execute(
      `UPDATE users SET nom = ?, prenom = ?, telephone = ?
       WHERE id = ?`,
      [nom, prenom, telephone || null, id]
    );
    return result.affectedRows > 0;
  },

};

module.exports = User;