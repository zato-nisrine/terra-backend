-- Ajoute le type de prix (par mois ou par jour) pour les logements
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS type_prix VARCHAR(20) DEFAULT 'mois';
