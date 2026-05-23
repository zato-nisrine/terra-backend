-- ============================================================
--  Terra — Schéma de base de données PostgreSQL
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('client', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_type') THEN
    CREATE TYPE listing_type AS ENUM ('appartement', 'studio', 'maison', 'villa', 'chambre');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_status') THEN
    CREATE TYPE listing_status AS ENUM ('disponible', 'reserve', 'loue', 'indisponible');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_type') THEN
    CREATE TYPE reservation_type AS ENUM ('visite', 'reservation');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
    CREATE TYPE reservation_status AS ENUM ('en_attente', 'confirme', 'refuse', 'annule');
  END IF;
END$$;

-- ============================================================
-- 1. USERS — clients inscrits + admin
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  nom          VARCHAR(100) NOT NULL,
  prenom       VARCHAR(100) NOT NULL,
  email        VARCHAR(191) NOT NULL UNIQUE,
  telephone    VARCHAR(20),
  mot_de_passe VARCHAR(255) NOT NULL,
  role         user_role NOT NULL DEFAULT 'client',
  est_actif    SMALLINT NOT NULL DEFAULT 1,
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_role ON users (role);

-- ============================================================
-- 2. LISTINGS — annonces de logements
-- ============================================================
CREATE TABLE IF NOT EXISTS listings (
  id              SERIAL PRIMARY KEY,
  titre           VARCHAR(200) NOT NULL,
  description     TEXT NOT NULL,
  type_logement   listing_type NOT NULL,
  statut          listing_status NOT NULL DEFAULT 'disponible',
  prix            NUMERIC(12,2) NOT NULL,
  surface         NUMERIC(8,2),
  nb_pieces       SMALLINT,
  nb_chambres     SMALLINT,
  nb_salles_bain  SMALLINT,
  ville           VARCHAR(100) NOT NULL,
  quartier        VARCHAR(100),
  adresse         VARCHAR(255),
  latitude        NUMERIC(10,7),
  longitude       NUMERIC(10,7),
  meuble          SMALLINT NOT NULL DEFAULT 0,
  climatise       SMALLINT NOT NULL DEFAULT 0,
  parking         SMALLINT NOT NULL DEFAULT 0,
  gardiennage     SMALLINT NOT NULL DEFAULT 0,
  eau_courante    SMALLINT NOT NULL DEFAULT 0,
  groupe_electro  SMALLINT NOT NULL DEFAULT 0,
  piscine         SMALLINT NOT NULL DEFAULT 0,
  est_publie      SMALLINT NOT NULL DEFAULT 0,
  cree_par        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ville ON listings (ville);
CREATE INDEX IF NOT EXISTS idx_type_logement ON listings (type_logement);
CREATE INDEX IF NOT EXISTS idx_statut ON listings (statut);
CREATE INDEX IF NOT EXISTS idx_prix ON listings (prix);
CREATE INDEX IF NOT EXISTS idx_est_publie ON listings (est_publie);

-- ============================================================
-- 3. LISTING_IMAGES — photos liées à un logement
-- ============================================================
CREATE TABLE IF NOT EXISTS listing_images (
  id             SERIAL PRIMARY KEY,
  listing_id     INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  url            VARCHAR(500) NOT NULL,
  est_principale SMALLINT NOT NULL DEFAULT 0,
  ordre          SMALLINT NOT NULL DEFAULT 0,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_id ON listing_images (listing_id);

-- ============================================================
-- 4. RESERVATIONS — demandes de réservation / visite
-- ============================================================
CREATE TABLE IF NOT EXISTS reservations (
  id            SERIAL PRIMARY KEY,
  listing_id    INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          reservation_type NOT NULL DEFAULT 'visite',
  statut        reservation_status NOT NULL DEFAULT 'en_attente',
  date_souhaitee DATE,
  date_fin       DATE,
  message       TEXT,
  note_admin    TEXT,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resa_listing_id ON reservations (listing_id);
CREATE INDEX IF NOT EXISTS idx_resa_user_id ON reservations (user_id);
CREATE INDEX IF NOT EXISTS idx_resa_statut ON reservations (statut);

-- ============================================================
-- 5. CONTACTS — messages depuis le formulaire de contact
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  id          SERIAL PRIMARY KEY,
  nom         VARCHAR(100) NOT NULL,
  email       VARCHAR(191) NOT NULL,
  telephone   VARCHAR(20),
  sujet       VARCHAR(200),
  message     TEXT NOT NULL,
  est_lu      SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_est_lu ON contacts (est_lu);

-- ============================================================
-- Triggers pour mise à jour automatique de updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS listings_updated_at ON listings;
CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS reservations_updated_at ON reservations;
CREATE TRIGGER reservations_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ============================================================
-- 6. CARS — voitures de location
-- ============================================================
CREATE TABLE IF NOT EXISTS cars (
  id                      SERIAL PRIMARY KEY,
  marque                  VARCHAR(100) NOT NULL,
  modele                  VARCHAR(100) NOT NULL,
  annee                   SMALLINT,
  type_carburant          VARCHAR(50),
  transmission            VARCHAR(50),
  nb_places               SMALLINT NOT NULL,
  couleur                 VARCHAR(50),
  plaque_immatriculation  VARCHAR(50) NOT NULL UNIQUE,
  prix_par_jour           NUMERIC(12,2) NOT NULL,
  description             TEXT,
  climatise               SMALLINT NOT NULL DEFAULT 0,
  wifi                    SMALLINT NOT NULL DEFAULT 0,
  cruise_control          SMALLINT NOT NULL DEFAULT 0,
  siege_chauffant         SMALLINT NOT NULL DEFAULT 0,
  toit_panoramique        SMALLINT NOT NULL DEFAULT 0,
  est_publie              SMALLINT NOT NULL DEFAULT 0,
  cree_par                INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marque ON cars (marque);
CREATE INDEX IF NOT EXISTS idx_type_carburant ON cars (type_carburant);
CREATE INDEX IF NOT EXISTS idx_prix_par_jour ON cars (prix_par_jour);
CREATE INDEX IF NOT EXISTS idx_est_publie_cars ON cars (est_publie);

-- ============================================================
-- 7. CAR_IMAGES — photos liées à une voiture
-- ============================================================
CREATE TABLE IF NOT EXISTS car_images (
  id             SERIAL PRIMARY KEY,
  car_id         INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  url            VARCHAR(500) NOT NULL,
  est_principale SMALLINT NOT NULL DEFAULT 0,
  ordre          SMALLINT NOT NULL DEFAULT 0,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_car_id ON car_images (car_id);

-- ============================================================
-- 8. CAR_RESERVATIONS — réservations de voitures
-- ============================================================
CREATE TABLE IF NOT EXISTS car_reservations (
  id            SERIAL PRIMARY KEY,
  car_id        INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_debut    DATE NOT NULL,
  date_fin      DATE NOT NULL,
  nb_jours      SMALLINT NOT NULL,
  prix_total    NUMERIC(12,2) NOT NULL,
  statut        VARCHAR(50) NOT NULL DEFAULT 'en_attente',
  message       TEXT,
  note_admin    TEXT,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_car_reservation_car_id ON car_reservations (car_id);
CREATE INDEX IF NOT EXISTS idx_car_reservation_user_id ON car_reservations (user_id);
CREATE INDEX IF NOT EXISTS idx_car_reservation_statut ON car_reservations (statut);
CREATE INDEX IF NOT EXISTS idx_car_reservation_dates ON car_reservations (date_debut, date_fin);

-- ============================================================
-- Trigger pour la table cars
-- ============================================================
DROP TRIGGER IF EXISTS cars_updated_at ON cars;
CREATE TRIGGER cars_updated_at
  BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Trigger pour la table car_reservations
-- ============================================================
DROP TRIGGER IF EXISTS car_reservations_updated_at ON car_reservations;
CREATE TRIGGER car_reservations_updated_at
  BEFORE UPDATE ON car_reservations
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
