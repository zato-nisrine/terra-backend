-- ============================================================
--  Terra — Données initiales PostgreSQL
-- ============================================================

INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role)
VALUES
  ('Admin', 'Terra', 'admin@terra.com', '+22901000000', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
  ('Client', 'Terra', 'client@terra.com', '+22900000000', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client');

INSERT INTO listings
  (titre, description, type_logement, prix, surface, nb_pieces, nb_chambres, nb_salles_bain, ville, quartier, adresse, latitude, longitude, meuble, climatise, parking, gardiennage, eau_courante, groupe_electro, piscine, est_publie, cree_par)
VALUES
  ('Appartement Terra', 'Studio moderne en centre-ville.', 'studio', 250000.00, 35.00, 2, 1, 1, 'Cotonou', 'Quartier Central', 'Rue du Marché 12', 6.3700, 2.4263, 1, 1, 1, 0, 1, 0, 0, 1, 1);

INSERT INTO listing_images (listing_id, url, est_principale, ordre)
VALUES (1, '/uploads/listings/sample-1.jpg', 1, 0);

INSERT INTO reservations (listing_id, user_id, type, statut, date_souhaitee, message)
VALUES (1, 2, 'visite', 'en_attente', CURRENT_DATE + INTERVAL '7 days', 'Je souhaite visiter cet appartement.');
