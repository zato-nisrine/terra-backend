// src/controllers/car.controller.js

const Car = require('../models/Car.model');

const carController = {

  // ── GET /api/cars ─────────────────────────────────────
  // Public — liste des voitures avec filtres et pagination
  getAll: async (req, res, next) => {
    try {
      const { marque, modele, type_carburant, carburant, prix_min, prix_max, transmission, page = 1, limit = 12 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const filtres = {
        marque,
        modele,
        type_carburant: type_carburant || carburant,
        prix_min,
        prix_max,
        transmission,
        limit,
        offset,
      };

      const [cars, total] = await Promise.all([
        Car.findAll(filtres),
        Car.count(filtres),
      ]);

      res.json({
        success: true,
        data: cars,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          total_pages: Math.ceil(total / Number(limit)),
        },
      });

    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/cars/admin/all ───────────────────────────
  // Admin — toutes les voitures (publiées + brouillons)
  getAllAdmin: async (req, res, next) => {
    try {
      const { page = 1, limit = 50 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const cars = await Car.findAllAdmin({ limit, offset });

      res.json({
        success: true,
        data: cars,
        pagination: {
          page: Number(page),
          limit: Number(limit),
        },
      });

    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/cars/:id ─────────────────────────────────
  // Public — détail d'une voiture avec ses photos
  getOne: async (req, res, next) => {
    try {
      const car = await Car.findById(req.params.id);

      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Voiture introuvable.',
        });
      }

      res.json({ success: true, data: car });

    } catch (error) {
      next(error);
    }
  },

  // ── GET /api/cars/admin/:id ───────────────────────────
  // Admin — détail d'une voiture (brouillon ou publié)
  getOneAdmin: async (req, res, next) => {
    try {
      const car = await Car.findByIdAdmin(req.params.id);

      if (!car) {
        return res.status(404).json({
          success: false,
          message: 'Voiture introuvable.',
        });
      }

      res.json({ success: true, data: car });

    } catch (error) {
      next(error);
    }
  },

  // ── POST /api/cars ────────────────────────────────────
  // Admin — créer une nouvelle voiture
  create: async (req, res, next) => {
    try {
      const body = req.body;
      const marque = body.marque;
      const modele = body.modele;
      const annee = body.annee;
      const type_carburant = body.type_carburant || body.typeCarburant;
      const transmission = body.transmission;
      const nb_places = body.nb_places ?? body.nbPlaces;
      const couleur = body.couleur;
      const plaque_immatriculation = body.plaque_immatriculation || body.plaqueImmatriculation;
      const prix_par_jour = body.prix_par_jour ?? body.prixParJour;
      const description = body.description;
      const climatise = body.climatise === true || body.climatise === 'true' || body.climatise === 1 || body.climatise === '1';
      const wifi = body.wifi === true || body.wifi === 'true' || body.wifi === 1 || body.wifi === '1';
      const cruise_control = body.cruise_control ?? body.cruiseControl;
      const siege_chauffant = body.siege_chauffant ?? body.siegeChauffant;
      const toit_panoramique = body.toit_panoramique ?? body.toitPanoramique;
      const est_publie = body.est_publie === true || body.est_publie === 'true' || body.est_publie === 1 || body.est_publie === '1';

      const missingFields = [];
      if (!marque) missingFields.push('marque');
      if (!modele) missingFields.push('modele');
      if (!type_carburant) missingFields.push('type_carburant');
      if (!transmission) missingFields.push('transmission');
      if (nb_places == null || nb_places === '') missingFields.push('nb_places');
      if (!plaque_immatriculation) missingFields.push('plaque_immatriculation');
      if (prix_par_jour == null || prix_par_jour === '') missingFields.push('prix_par_jour');

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Veuillez fournir les champs obligatoires suivants : ${missingFields.join(', ')}.`,
        });
      }

      const result = await Car.create({
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
        cruise_control: cruise_control || false,
        siege_chauffant: siege_chauffant || false,
        toit_panoramique: toit_panoramique || false,
        cree_par: req.user.id,
        est_publie,
      });

      res.status(201).json({
        success: true,
        message: 'Voiture créée avec succès.',
        data: result,
      });

    } catch (error) {
      next(error);
    }
  },

  // ── PUT /api/cars/:id ─────────────────────────────────
  // Admin — modifier une voiture
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const result = await Car.update(id, updates);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Voiture introuvable.',
        });
      }

      res.json({
        success: true,
        message: 'Voiture mise à jour avec succès.',
        data: result,
      });

    } catch (error) {
      next(error);
    }
  },

  // ── PATCH /api/cars/:id/publish ──────────────────────
  // Admin — publier ou dépublier une voiture
  togglePublish: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { est_publie } = req.body;

      if (typeof est_publie !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Le champ "est_publie" doit être un booléen.',
        });
      }

      const result = await Car.togglePublish(id, est_publie);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Voiture introuvable.',
        });
      }

      res.json({
        success: true,
        message: `Voiture ${est_publie ? 'publiée' : 'dépubliée'} avec succès.`,
        data: result,
      });

    } catch (error) {
      next(error);
    }
  },

  // ── DELETE /api/cars/:id ──────────────────────────────
  // Admin — supprimer une voiture
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      const success = await Car.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Voiture introuvable.',
        });
      }

      res.json({
        success: true,
        message: 'Voiture supprimée avec succès.',
      });

    } catch (error) {
      next(error);
    }
  },
};

module.exports = carController;
