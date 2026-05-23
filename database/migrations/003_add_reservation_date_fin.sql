-- Ajoute la date de fin pour les réservations logement
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS date_fin DATE;
