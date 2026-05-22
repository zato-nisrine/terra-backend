// src/models/Car.model.js
// Toutes les requêtes SQL liées aux voitures de location

const { pool } = require('../config/db');

const Car = {

  // ── Récupérer toutes les voitures publiées (avec filtres) ──
  findAll: async ({ marque, modele, type_carburant, prix_min, prix_max, transmission, limit = 12, offset = 0 } = {}) => {
    let query = `
      SELECT
        c.*,
        (SELECT url FROM car_images ci WHERE ci.car_id = c.id AND ci.est_principale = 1 LIMIT 1) AS photo_principale
      FROM cars c
      WHERE c.est_publie = 1
    `;
    const params = [];

    if (marque) {
      query += ' AND c.marque ILIKE ?';
      params.push(`%${marque}%`);
    }
    if (modele) {
      query += ' AND c.modele ILIKE ?';
      params.push(`%${modele}%`);
    }
    if (type_carburant) {
      query += ' AND c.type_carburant = ?';
      params.push(type_carburant);
    }
    if (prix_min) {
      query += ' AND c.prix_par_jour >= ?';
      params.push(Number(prix_min));
    }
    if (prix_max) {
      query += ' AND c.prix_par_jour <= ?';
      params.push(Number(prix_max));
    }
    if (transmission) {
      query += ' AND c.transmission = ?';
      params.push(transmission);
    }

    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  // ── Compter le total (pour la pagination) ────────────────
  count: async ({ marque, modele, type_carburant, prix_min, prix_max, transmission } = {}) => {
    let query = 'SELECT COUNT(*) as total FROM cars WHERE est_publie = 1';
    const params = [];

    if (marque) {
      query += ' AND marque ILIKE ?';
      params.push(`%${marque}%`);
    }
    if (modele) {
      query += ' AND modele ILIKE ?';
      params.push(`%${modele}%`);
    }
    if (type_carburant) {
      query += ' AND type_carburant = ?';
      params.push(type_carburant);
    }
    if (prix_min) {
      query += ' AND prix_par_jour >= ?';
      params.push(Number(prix_min));
    }
    if (prix_max) {
      query += ' AND prix_par_jour <= ?';
      params.push(Number(prix_max));
    }
    if (transmission) {
      query += ' AND transmission = ?';
      params.push(transmission);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0]?.total || 0;
  },

  // ── Récupérer une voiture par ID ───────────────────────────
  findById: async (id) => {
    const query = `
      SELECT 
        c.*,
        JSON_AGG(
          JSON_OBJECT(
            'id', ci.id,
            'url', ci.url,
            'est_principale', ci.est_principale,
            'ordre', ci.ordre
          ) ORDER BY ci.ordre ASC
        ) FILTER (WHERE ci.id IS NOT NULL) AS images
      FROM cars c
      LEFT JOIN car_images ci ON c.id = ci.car_id
      WHERE c.id = ?
      GROUP BY c.id
    `;

    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  },

  // ── Récupérer une voiture par ID (admin - brouillon ou publié) ───
  findByIdAdmin: async (id) => {
    const query = `
      SELECT 
        c.*,
        JSON_AGG(
          JSON_OBJECT(
            'id', ci.id,
            'url', ci.url,
            'est_principale', ci.est_principale,
            'ordre', ci.ordre
          ) ORDER BY ci.ordre ASC
        ) FILTER (WHERE ci.id IS NOT NULL) AS images
      FROM cars c
      LEFT JOIN car_images ci ON c.id = ci.car_id
      WHERE c.id = ?
      GROUP BY c.id
    `;

    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  },

  // ── Récupérer toutes les voitures (admin) ──────────────────
  findAllAdmin: async ({ limit = 50, offset = 0 } = {}) => {
    const query = `
      SELECT
        c.*,
        (SELECT url FROM car_images ci WHERE ci.car_id = c.id AND ci.est_principale = 1 LIMIT 1) AS photo_principale
      FROM cars c
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.execute(query, [Number(limit), Number(offset)]);
    return rows;
  },

  // ── Créer une nouvelle voiture ────────────────────────────────
  create: async ({
    marque,
    modele,
    annee,
    type_carburant,
    transmission,
    nb_places,
    couleur,
    plaque_immatriculation,
    prix_par_jour,
    description,
    climatise,
    wifi,
    cruise_control,
    siege_chauffant,
    toit_panoramique,
    cree_par,
  }) => {
    const query = `
      INSERT INTO cars (
        marque, modele, annee, type_carburant, transmission, nb_places,
        couleur, plaque_immatriculation, prix_par_jour, description,
        climatise, wifi, cruise_control, siege_chauffant, toit_panoramique,
        cree_par, est_publie, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
    `;

    const values = [
      marque,
      modele,
      annee,
      type_carburant,
      transmission,
      nb_places,
      couleur,
      plaque_immatriculation,
      prix_par_jour,
      description,
      climatise ? 1 : 0,
      wifi ? 1 : 0,
      cruise_control ? 1 : 0,
      siege_chauffant ? 1 : 0,
      toit_panoramique ? 1 : 0,
      cree_par,
    ];

    const [result] = await pool.execute(query, values);
    return { id: result.insertId };
  },

  // ── Mettre à jour une voiture ─────────────────────────────────
  update: async (id, updates) => {
    const allowedFields = [
      'marque',
      'modele',
      'annee',
      'type_carburant',
      'transmission',
      'nb_places',
      'couleur',
      'plaque_immatriculation',
      'prix_par_jour',
      'description',
      'climatise',
      'wifi',
      'cruise_control',
      'siege_chauffant',
      'toit_panoramique',
    ];

    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        if (['climatise', 'wifi', 'cruise_control', 'siege_chauffant', 'toit_panoramique'].includes(key)) {
          values.push(value ? 1 : 0);
        } else {
          values.push(value);
        }
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE cars SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;

    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0 ? { id } : null;
  },

  // ── Publier ou dépublier une voiture ──────────────────────────
  togglePublish: async (id, est_publie) => {
    const query = 'UPDATE cars SET est_publie = ?, updated_at = NOW() WHERE id = ?';

    const [result] = await pool.execute(query, [est_publie ? 1 : 0, id]);
    return result.affectedRows > 0 ? { id } : null;
  },

  // ── Supprimer une voiture ────────────────────────────────────
  delete: async (id) => {
    const query = 'DELETE FROM cars WHERE id = ?';

    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  },
};

module.exports = Car;
