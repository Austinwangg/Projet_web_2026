-- ============================================================
-- VoyageVista – Schéma de base de données MySQL
-- Charger dans phpMyAdmin ou via : mysql -u root -proot voyagevista < schema.sql
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
    id           INT AUTO_INCREMENT PRIMARY KEY,
    nom          VARCHAR(100) NOT NULL,
    email        VARCHAR(200) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
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
('Paris',      'France',   'La Ville Lumière, capitale de la mode et de la gastronomie.',      'https://images.unsplash.com/photo-1499856871958-5b9357976b82?w=800'),
('Tokyo',      'Japon',    'Métropole fascinante mêlant modernité et tradition millénaire.',   'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'),
('Barcelone',  'Espagne',  'Architecture surréaliste, plages et gastronomie méditerranéenne.', 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800'),
('New York',   'États-Unis','La ville qui ne dort jamais : culture, architecture et énergie.', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800'),
('Rome',       'Italie',   'La Ville Éternelle, berceau de la civilisation occidentale.',      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800');

INSERT INTO hebergements (destination_id, nom, type, prix_nuit, nb_etoiles, image_url) VALUES
(1, 'Hôtel Lumière', 'hotel', 180.00, 4, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'),
(1, 'Villa Montmartre', 'villa', 250.00, 5, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'),
(2, 'Tokyo Grand Hotel', 'hotel', 220.00, 5, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'),
(2, 'Auberge Sakura', 'auberge', 60.00, 2, 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'),
(3, 'Appartement Gaudí', 'appartement', 120.00, 3, 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'),
(4, 'Manhattan Suites', 'hotel', 350.00, 5, 'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=800'),
(5, 'Villa Romana', 'villa', 200.00, 4, 'https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=800');

INSERT INTO transports (type, compagnie, depart, arrivee, prix) VALUES
('avion',   'Air France',     'Paris CDG',    'Tokyo Narita',  850.00),
('avion',   'Iberia',         'Paris Orly',   'Barcelone BCN', 120.00),
('train',   'Eurostar',       'Paris Gare du Nord', 'Londres St Pancras', 95.00),
('train',   'Renfe',          'Barcelone',    'Madrid',         65.00),
('bus',     'FlixBus',        'Paris',        'Barcelone',      45.00),
('avion',   'Delta Airlines', 'Paris CDG',    'New York JFK',  680.00),
('avion',   'Alitalia',       'Paris CDG',    'Rome FCO',      150.00),
('voiture', 'Europcar',       'Paris',        'Bordeaux',       80.00);

INSERT INTO activites (destination_id, nom, categorie, prix, description) VALUES
(1, 'Visite de la Tour Eiffel',  'Culture',  25.00, 'Montez au sommet de la Dame de Fer pour une vue panoramique.'),
(1, 'Croisière sur la Seine',    'Détente',  18.00, 'Découvrez Paris depuis l''eau au coucher du soleil.'),
(2, 'Cérémonie du thé',          'Culture',  35.00, 'Participez à une cérémonie du thé traditionnelle japonaise.'),
(2, 'Randonnée Mont Fuji',       'Sport',    50.00, 'Gravissez le sommet emblématique du Japon.'),
(3, 'Visite Sagrada Família',    'Culture',  30.00, 'Découvrez le chef-d''œuvre inachevé de Gaudí.'),
(3, 'Cours de flamenco',         'Culture',  40.00, 'Initiez-vous à la danse flamenco avec un professeur local.'),
(4, 'Visite Statue de la Liberté', 'Culture', 25.00, 'Naviguez jusqu''à l''île Liberty pour visiter l''icône américaine.'),
(5, 'Visite du Colisée',         'Culture',  18.00, 'Explorez l''amphithéâtre le plus célèbre de l''Antiquité.');

INSERT INTO utilisateurs (nom, email, mot_de_passe) VALUES
('Jean Dupont', 'jean@exemple.com', '$2y$10$examplehashedpassword1234567890');

INSERT INTO reservations (utilisateur_id, destination_id, date_depart, date_retour, statut) VALUES
(1, 1, '2026-07-10', '2026-07-17', 'confirmee'),
(1, 2, '2026-08-01', '2026-08-14', 'en_attente'),
(1, 3, '2026-09-05', '2026-09-12', 'en_attente');
