-- ============================================================
-- VoyageVista – Schéma de base de données MySQL
-- Charger dans phpMyAdmin ou via : mysql -u root voyagevista < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS voyagevista CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE voyagevista;

-- ── Destinations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS destinations (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nom         VARCHAR(150) NOT NULL,
    pays        VARCHAR(100) NOT NULL,
    description TEXT,
    image_url   VARCHAR(500),
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Hébergements ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hebergements (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    destination_id  INT NOT NULL,
    nom             VARCHAR(150) NOT NULL,
    type            ENUM('hotel','villa','auberge','appartement') NOT NULL,
    prix_nuit       DECIMAL(8,2) NOT NULL,
    nb_etoiles      TINYINT DEFAULT 3,
    image_url       VARCHAR(500),
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Transports ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transports (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    type        ENUM('avion','train','bus','voiture') NOT NULL,
    compagnie   VARCHAR(150),
    depart      VARCHAR(150) NOT NULL,
    arrivee     VARCHAR(150) NOT NULL,
    prix        DECIMAL(8,2) NOT NULL,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Activités ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activites (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    destination_id  INT NOT NULL,
    nom             VARCHAR(150) NOT NULL,
    categorie       VARCHAR(100),
    prix            DECIMAL(8,2) DEFAULT 0.00,
    description     TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Utilisateurs ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS utilisateurs (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nom         VARCHAR(100) NOT NULL,
    email       VARCHAR(200) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,  -- stocké hashé (password_hash)
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Réservations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id  INT NOT NULL,
    destination_id  INT NOT NULL,
    date_depart     DATE NOT NULL,
    date_retour     DATE NOT NULL,
    statut          ENUM('en_attente','confirmee','annulee') DEFAULT 'en_attente',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Données de test ─────────────────────────────────────────
INSERT INTO destinations (nom, pays, description, image_url) VALUES
('Paris',      'France',  'La Ville Lumière.',      'https://images.unsplash.com/photo-1499856871958-5b9357976b82?w=800'),
('Tokyo',      'Japon',   'Modernité et tradition.','https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'),
('Barcelone',  'Espagne', 'Architecture et soleil.','https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800');
