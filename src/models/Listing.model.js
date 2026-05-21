// src/models/Listing.model.js
// Toutes les requêtes SQL liées aux logements

const { pool } = require('../config/db');

const Listing = {

  // ── Récupérer tous les logements publiés (avec filtres) ──
  findAll: async ({ ville, type_logement, prix_min, prix_max, meuble, limit = 12, offset = 0 } = {}) => {
    let query = `
      SELECT
        l.*,
        (SELECT url FROM listing_images li WHERE li.listing_id = l.id AND li.est_principale = 1 LIMIT 1) AS photo_principale
      FROM listings l
      WHERE l.est_publie = 1
    `;
    const params = [];

    if (ville) {
      query += ' AND l.ville = ?';
      params.push(ville);
    }
    if (type_logement) {
      query += ' AND l.type_logement = ?';
      params.push(type_logement);
    }
    if (prix_min) {
      query += ' AND l.prix >= ?';
      params.push(Number(prix_min));
    }
    if (prix_max) {
      query += ' AND l.prix <= ?';
      params.push(Number(prix_max));
    }
    if (meuble !== undefined) {
      query += ' AND l.meuble = ?';
      params.push(meuble ? 1 : 0);
    }

    query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  // ── Compter le total (pour la pagination) ────────────────
  count: async ({ ville, type_logement, prix_min, prix_max, meuble } = {}) => {
    let query = 'SELECT COUNT(*) as total FROM listings WHERE est_publie = 1';
    const params = [];

    if (ville)         { query += ' AND ville = ?';        params.push(ville); }
    if (type_logement) { query += ' AND type_logement = ?'; params.push(type_logement); }
    if (prix_min)      { query += ' AND prix >= ?';         params.push(Number(prix_min)); }
    if (prix_max)      { query += ' AND prix <= ?';         params.push(Number(prix_max)); }
    if (meuble !== undefined) { query += ' AND meuble = ?'; params.push(meuble ? 1 : 0); }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  },

  // ── Récupérer un logement par ID avec ses photos ─────────
  findById: async (id) => {
    const [rows] = await pool.execute(
      `SELECT l.*,
        u.nom AS admin_nom, u.prenom AS admin_prenom
       FROM listings l
       LEFT JOIN users u ON u.id = l.cree_par
       WHERE l.id = ? AND l.est_publie = 1 LIMIT 1`,
      [id]
    );
    if (!rows[0]) return null;

    // Récupérer les photos du logement
    const [images] = await pool.execute(
      'SELECT * FROM listing_images WHERE listing_id = ? ORDER BY est_principale DESC, ordre ASC',
      [id]
    );

    return { ...rows[0], images };
  },

  // ── Récupérer un logement par ID (admin, publié ou brouillon) ─
  findByIdAdmin: async (id) => {
    const [rows] = await pool.execute(
      `SELECT l.*,
        u.nom AS admin_nom, u.prenom AS admin_prenom
       FROM listings l
       LEFT JOIN users u ON u.id = l.cree_par
       WHERE l.id = ? LIMIT 1`,
      [id]
    );
    if (!rows[0]) return null;

    const [images] = await pool.execute(
      'SELECT * FROM listing_images WHERE listing_id = ? ORDER BY est_principale DESC, ordre ASC',
      [id]
    );

    return { ...rows[0], images };
  },

  // ── Créer un logement (admin) ─────────────────────────────
  create: async (data) => {
    const {
      titre, description, type_logement, prix, surface,
      nb_pieces, nb_chambres, nb_salles_bain,
      ville, quartier, adresse, latitude, longitude,
      meuble, climatise, parking, gardiennage,
      eau_courante, groupe_electro, piscine,
      cree_par
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO listings
        (titre, description, type_logement, prix, surface,
         nb_pieces, nb_chambres, nb_salles_bain,
         ville, quartier, adresse, latitude, longitude,
         meuble, climatise, parking, gardiennage,
         eau_courante, groupe_electro, piscine,
         est_publie, cree_par)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?) RETURNING id`,
      [
        titre, description, type_logement, prix, surface || null,
        nb_pieces || null, nb_chambres || null, nb_salles_bain || null,
        ville, quartier || null, adresse || null, latitude || null, longitude || null,
        meuble ? 1 : 0, climatise ? 1 : 0, parking ? 1 : 0, gardiennage ? 1 : 0,
        eau_courante ? 1 : 0, groupe_electro ? 1 : 0, piscine ? 1 : 0,
        cree_par
      ]
    );
    return result.insertId;
  },

  // ── Modifier un logement (admin) ──────────────────────────
  update: async (id, data) => {
    const {
      titre, description, type_logement, statut, prix, surface,
      nb_pieces, nb_chambres, nb_salles_bain,
      ville, quartier, adresse, latitude, longitude,
      meuble, climatise, parking, gardiennage,
      eau_courante, groupe_electro, piscine
    } = data;

    const [result] = await pool.execute(
      `UPDATE listings SET
        titre=?, description=?, type_logement=?, statut=?, prix=?, surface=?,
        nb_pieces=?, nb_chambres=?, nb_salles_bain=?,
        ville=?, quartier=?, adresse=?, latitude=?, longitude=?,
        meuble=?, climatise=?, parking=?, gardiennage=?,
        eau_courante=?, groupe_electro=?, piscine=?
       WHERE id=?`,
      [
        titre, description, type_logement, statut || 'disponible', prix, surface || null,
        nb_pieces || null, nb_chambres || null, nb_salles_bain || null,
        ville, quartier || null, adresse || null, latitude || null, longitude || null,
        meuble ? 1 : 0, climatise ? 1 : 0, parking ? 1 : 0, gardiennage ? 1 : 0,
        eau_courante ? 1 : 0, groupe_electro ? 1 : 0, piscine ? 1 : 0,
        id
      ]
    );
    return result.affectedRows > 0;
  },

  // ── Publier / dépublier un logement (admin) ───────────────
  togglePublish: async (id, estPublie) => {
    const [result] = await pool.execute(
      'UPDATE listings SET est_publie = ? WHERE id = ?',
      [estPublie ? 1 : 0, id]
    );
    return result.affectedRows > 0;
  },

  // ── Supprimer un logement (admin) ─────────────────────────
  delete: async (id) => {
    const [result] = await pool.execute(
      'DELETE FROM listings WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },

  // ── Tous les logements pour l'admin (publiés + non publiés)
  findAllAdmin: async () => {
    const [rows] = await pool.execute(
      `SELECT l.*,
        (SELECT url FROM listing_images li WHERE li.listing_id = l.id AND li.est_principale = 1 LIMIT 1) AS photo_principale,
        (SELECT COUNT(*) FROM listing_images li WHERE li.listing_id = l.id) AS nb_photos
       FROM listings l
       ORDER BY l.created_at DESC`
    );
    return rows;
  },

  // ── Retirer le flag « principale » sur toutes les photos d'un logement
  countImages: async (listing_id) => {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM listing_images WHERE listing_id = ?',
      [listing_id]
    );
    return rows[0].total;
  },

  clearPrimaryImages: async (listing_id) => {
    await pool.execute(
      'UPDATE listing_images SET est_principale = 0 WHERE listing_id = ?',
      [listing_id]
    );
  },

  findImageById: async (imageId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM listing_images WHERE id = ? LIMIT 1',
      [imageId]
    );
    return rows[0] || null;
  },

  setPrimaryImage: async (listing_id, imageId) => {
    await Listing.clearPrimaryImages(listing_id);
    const [result] = await pool.execute(
      'UPDATE listing_images SET est_principale = 1 WHERE id = ? AND listing_id = ?',
      [imageId, listing_id]
    );
    return result.affectedRows > 0;
  },

  // ── Ajouter une image à un logement ──────────────────────
  addImage: async (listing_id, url, est_principale = false, ordre = 0) => {
    if (est_principale) {
      await Listing.clearPrimaryImages(listing_id);
    }
    const [result] = await pool.execute(
      'INSERT INTO listing_images (listing_id, url, est_principale, ordre) VALUES (?, ?, ?, ?) RETURNING id',
      [listing_id, url, est_principale ? 1 : 0, ordre]
    );
    return result.insertId;
  },

  // ── Supprimer une image ───────────────────────────────────
  deleteImage: async (imageId) => {
    const [result] = await pool.execute(
      'DELETE FROM listing_images WHERE id = ?',
      [imageId]
    );
    return result.affectedRows > 0;
  },

};

module.exports = Listing;