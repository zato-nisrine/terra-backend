// src/models/Car.model.js
// Toutes les requêtes SQL liées aux voitures de location

const { pool } = require('../config/db');

const Car = {

  // ── Récupérer toutes les voitures publiées (avec filtres) ──
  findAll: async ({ marque, modele, type_carburant, prix_min, prix_max, transmission, limit = 12, offset = 0 } = {}) => {
    let query = `
      SELECT
        c.*,
        (SELECT url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.est_principale DESC, ci.ordre ASC LIMIT 1) AS photo_principale
      FROM cars c
      WHERE c.est_publie = 1
    `;
    const params = [];

    if (marque) {
      query += ' AND LOWER(c.marque) LIKE ?';
      params.push(`%${marque.toLowerCase()}%`);
    }
    if (modele) {
      query += ' AND LOWER(c.modele) LIKE ?';
      params.push(`%${modele.toLowerCase()}%`);
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
      query += ' AND LOWER(marque) LIKE ?';
      params.push(`%${marque.toLowerCase()}%`);
    }
    if (modele) {
      query += ' AND LOWER(modele) LIKE ?';
      params.push(`%${modele.toLowerCase()}%`);
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
    const [rows] = await pool.execute(
      'SELECT * FROM cars WHERE id = ? AND est_publie = 1 LIMIT 1',
      [id]
    );
    if (!rows[0]) return null;

    const [images] = await pool.execute(
      'SELECT * FROM car_images WHERE car_id = ? ORDER BY est_principale DESC, ordre ASC',
      [id]
    );

    const photo_principale = images.find((img) => img.est_principale === 1)?.url || (images[0] && images[0].url) || null;
    return { ...rows[0], photo_principale, images };
  },

  // ── Récupérer une voiture par ID (admin - brouillon ou publié) ───
  findByIdAdmin: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM cars WHERE id = ? LIMIT 1',
      [id]
    );
    if (!rows[0]) return null;

    const [images] = await pool.execute(
      'SELECT * FROM car_images WHERE car_id = ? ORDER BY est_principale DESC, ordre ASC',
      [id]
    );

    const photo_principale = images.find((img) => img.est_principale === 1)?.url || (images[0] && images[0].url) || null;
    return { ...rows[0], photo_principale, images };
  },

  // ── Compter les images d'une voiture
  countImages: async (car_id) => {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM car_images WHERE car_id = ?',
      [car_id]
    );
    return rows[0]?.total || 0;
  },

  clearPrimaryImages: async (car_id) => {
    await pool.execute(
      'UPDATE car_images SET est_principale = 0 WHERE car_id = ?',
      [car_id]
    );
  },

  findImageById: async (imageId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM car_images WHERE id = ? LIMIT 1',
      [imageId]
    );
    return rows[0] || null;
  },

  setPrimaryImage: async (car_id, imageId) => {
    await Car.clearPrimaryImages(car_id);
    const [result] = await pool.execute(
      'UPDATE car_images SET est_principale = 1 WHERE id = ? AND car_id = ?',
      [imageId, car_id]
    );
    return result.affectedRows > 0;
  },

  addImage: async (car_id, url, est_principale = false, ordre = 0) => {
    if (est_principale) {
      await Car.clearPrimaryImages(car_id);
    }
    const [result] = await pool.execute(
      'INSERT INTO car_images (car_id, url, est_principale, ordre) VALUES (?, ?, ?, ?)',
      [car_id, url, est_principale ? 1 : 0, ordre]
    );
    return result.insertId;
  },

  deleteImage: async (imageId) => {
    const [result] = await pool.execute(
      'DELETE FROM car_images WHERE id = ?',
      [imageId]
    );
    return result.affectedRows > 0;
  },

  // ── Récupérer toutes les voitures (admin) ──────────────────
  findAllAdmin: async ({ limit = 50, offset = 0 } = {}) => {
    const query = `
      SELECT
        c.*,
        (SELECT url FROM car_images ci WHERE ci.car_id = c.id ORDER BY ci.est_principale DESC, ci.ordre ASC LIMIT 1) AS photo_principale
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
