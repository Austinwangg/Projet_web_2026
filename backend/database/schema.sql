-- ============================================================
-- VoyageVista – Schéma MySQL complet (v2 · 2026)
-- Charger : mysql -u root -proot voyagevista < schema.sql
--        ou importer via phpMyAdmin
-- ============================================================

CREATE DATABASE IF NOT EXISTS voyagevista
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE voyagevista;

-- ── Destinations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS destinations (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(60)  NOT NULL UNIQUE,       -- identifiant front (ex: 'shanghai')
  ville         VARCHAR(150) NOT NULL,
  pays_fr       VARCHAR(100) NOT NULL,
  pays_en       VARCHAR(100) NOT NULL,
  type          VARCHAR(50)  NOT NULL,               -- 'ville' | 'plage' | 'aventure' | 'culture' | 'montagne'
  types_json    JSON,                                -- ['ville','culture']
  note          DECIMAL(3,1) DEFAULT 4.5,
  nb_avis       INT          DEFAULT 0,
  duree_jours   TINYINT      DEFAULT 7,
  prix_depuis   INT          NOT NULL,               -- €
  tag_fr        VARCHAR(60)  DEFAULT '',
  tag_en        VARCHAR(60)  DEFAULT '',
  resume_fr     TEXT,
  resume_en     TEXT,
  image_url     VARCHAR(500),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Hébergements ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hebergements (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  destination_id  INT NOT NULL,
  nom             VARCHAR(150) NOT NULL,
  quartier        VARCHAR(150),
  type            ENUM('hotel','villa','auberge','appartement') NOT NULL DEFAULT 'hotel',
  prix_nuit       DECIMAL(8,2) NOT NULL,
  nb_etoiles      TINYINT DEFAULT 4,
  note            DECIMAL(3,2) DEFAULT 4.50,
  avantage_fr     VARCHAR(200),
  avantage_en     VARCHAR(200),
  image_url       VARCHAR(500),
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Transports ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transports (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  destination_id INT,
  type           ENUM('avion','train','bus','voiture') NOT NULL DEFAULT 'avion',
  compagnie      VARCHAR(150),
  depart         VARCHAR(150) NOT NULL,
  arrivee        VARCHAR(150) NOT NULL,
  duree          VARCHAR(20),
  horaire        VARCHAR(50),
  prix           DECIMAL(8,2) NOT NULL,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── Activités ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activites (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  destination_id  INT NOT NULL,
  nom_fr          VARCHAR(200) NOT NULL,
  nom_en          VARCHAR(200) NOT NULL,
  categorie       VARCHAR(100),
  duree           VARCHAR(30),
  prix            DECIMAL(8,2) DEFAULT 0.00,
  description_fr  TEXT,
  description_en  TEXT,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Utilisateurs ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS utilisateurs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nom           VARCHAR(100) NOT NULL,
  email         VARCHAR(200) NOT NULL UNIQUE,
  mot_de_passe  VARCHAR(255) NOT NULL,        -- bcrypt hash
  role          ENUM('user','admin') DEFAULT 'user',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Réservations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  reference       VARCHAR(20)  NOT NULL UNIQUE,      -- 'VV-2H4N9K'
  utilisateur_id  INT NOT NULL,
  destination_id  INT NOT NULL,
  date_depart     DATE NOT NULL,
  date_retour     DATE NOT NULL,
  nb_voyageurs    TINYINT DEFAULT 1,
  montant_total   DECIMAL(10,2) DEFAULT 0.00,
  statut          ENUM('en_attente','confirmee','annulee','terminee') DEFAULT 'en_attente',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ══════════════════════════════════════════════════════════════
-- DONNÉES DE SEED — 12 destinations réelles du site
-- ══════════════════════════════════════════════════════════════

-- Vider si rechargement
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE activites;
TRUNCATE TABLE hebergements;
TRUNCATE TABLE transports;
TRUNCATE TABLE reservations;
TRUNCATE TABLE destinations;
TRUNCATE TABLE utilisateurs;
SET FOREIGN_KEY_CHECKS = 1;

-- ── Destinations ────────────────────────────────────────────
INSERT INTO destinations
  (slug, ville, pays_fr, pays_en, type, types_json, note, nb_avis, duree_jours, prix_depuis, tag_fr, tag_en, resume_fr, resume_en, image_url)
VALUES
  ('shanghai',  'Shanghai',  'Chine',         'China',        'ville',    '["ville","culture"]',    4.8, 612,  7,  1408, 'Tendance',  'Trending',
   "Néons du Bund, ruelles du Vieux Shanghai, gratte-ciel du Pudong : la ville qui ne s'arrête jamais.",
   "Bund neon, Old Shanghai lanes, Pudong skyline — the city that never pauses.",
   'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=1200&q=80'),

  ('bali',      'Bali',      'Indonésie',     'Indonesia',    'aventure', '["aventure","plage"]',    4.7, 894,  8,  1199, 'Populaire', 'Popular',
   "Rizières d'Ubud, plages de Canggu, temples de Tirta Empul.",
   "Ubud rice terraces, Canggu beaches, Tirta Empul temples.",
   'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80'),

  ('santorini', 'Santorin',  'Grèce',         'Greece',       'plage',    '["plage","ville"]',       4.6, 1240, 6,  1340, '',          '',
   "Caldeira au crépuscule, dômes bleus d'Oia, vignobles d'assyrtiko.",
   "Caldera at dusk, blue domes of Oia, Assyrtiko vineyards.",
   'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80'),

  ('marrakech', 'Marrakech', 'Maroc',          'Morocco',      'culture',  '["culture","ville"]',    4.5, 720,  5,   749, 'Nouveau',   'New',
   "Souks de la médina, riads cachés, mosaïques du palais Bahia.",
   "Medina souks, hidden riads, Bahia palace mosaics.",
   'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80'),

  ('kyoto',     'Kyoto',     'Japon',          'Japan',        'culture',  '["culture","montagne"]', 4.9, 1080, 9,  1620, 'Saison',    'In season',
   "Mille torii de Fushimi Inari, jardins zen, ryokans de Gion.",
   "Fushimi Inari's thousand torii, Zen gardens, Gion ryokans.",
   'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'),

  ('lisbon',    'Lisbonne',  'Portugal',       'Portugal',     'ville',    '["ville","plage"]',       4.6, 540,  5,   620, '',          '',
   "Tramway 28, azulejos, pasteis de nata et fado dans l'Alfama.",
   "Tram 28, azulejos, pastéis de nata, Alfama fado.",
   'https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?auto=format&fit=crop&w=1200&q=80'),

  ('tulum',     'Tulum',     'Mexique',        'Mexico',       'plage',    '["plage","aventure"]',    4.4, 432,  7,   980, '',          '',
   "Cenotes, ruines mayas en bord de mer, jungle yucatèque.",
   "Cenotes, Mayan ruins by the sea, Yucatán jungle.",
   'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80'),

  ('patagonia', 'Patagonie', 'Argentine',      'Argentina',    'montagne', '["montagne","aventure"]', 4.9, 312,  12, 2240, '',          '',
   "Glacier Perito Moreno, trek du Fitz Roy, estancias.",
   "Perito Moreno glacier, Fitz Roy trek, working estancias.",
   'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80'),

  ('reykjavik', 'Reykjavik', 'Islande',        'Iceland',      'aventure', '["aventure","montagne"]', 4.7, 401,  6,  1480, '',          '',
   "Aurores boréales, cercle d'or, sources géothermales.",
   "Northern lights, Golden Circle, geothermal springs.",
   'https://images.unsplash.com/photo-1531168586672-d36a24562b38?auto=format&fit=crop&w=1200&q=80'),

  ('capetown',  'Cape Town', 'Afrique du Sud', 'South Africa', 'aventure', '["aventure","plage"]',    4.6, 520,  10, 1920, '',          '',
   "Table Mountain, Cap de Bonne-Espérance, vignobles de Stellenbosch.",
   "Table Mountain, Cape of Good Hope, Stellenbosch wineries.",
   'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80'),

  ('hanoi',     'Hanoï',     'Vietnam',        'Vietnam',      'culture',  '["culture","ville"]',    4.5, 380,  9,  1140, '',          '',
   "Vieux quartier, baie d'Halong, pho fumant à l'aube.",
   "Old Quarter, Halong Bay, steaming pho at dawn.",
   'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80'),

  ('lofoten',   'Lofoten',   'Norvège',        'Norway',       'montagne', '["montagne","aventure"]', 4.8, 210,  7,  1860, '',          '',
   "Cabanes de pêcheurs rouges, randonnées de Reinebringen.",
   "Red fishermen's cabins, Reinebringen hikes.",
   'https://images.unsplash.com/photo-1520769669658-f07657f5a307?auto=format&fit=crop&w=1200&q=80');

-- ── Hébergements (Shanghai — full detail) ───────────────────
INSERT INTO hebergements (destination_id, nom, quartier, type, prix_nuit, nb_etoiles, note, avantage_fr, avantage_en, image_url)
SELECT id, 'The Middle House',    "Jing'an · Puxi",             'hotel', 285.00, 5, 4.90, 'Petit-déj inclus',        'Breakfast included',       'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' FROM destinations WHERE slug='shanghai';
INSERT INTO hebergements (destination_id, nom, quartier, type, prix_nuit, nb_etoiles, note, avantage_fr, avantage_en, image_url)
SELECT id, 'URBN Boutique',       'Ex-concession française',     'hotel', 165.00, 4, 4.60, 'Hôtel carbone-neutre',    'Carbon-neutral hotel',     'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80' FROM destinations WHERE slug='shanghai';
INSERT INTO hebergements (destination_id, nom, quartier, type, prix_nuit, nb_etoiles, note, avantage_fr, avantage_en, image_url)
SELECT id, 'Capella Jian Ye Li',  'Xuhui · Shikumen',            'hotel', 420.00, 5, 4.95, 'Spa privatif',            'Private spa',              'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80' FROM destinations WHERE slug='shanghai';
INSERT INTO hebergements (destination_id, nom, quartier, type, prix_nuit, nb_etoiles, note, avantage_fr, avantage_en, image_url)
SELECT id, 'Yangtze Boutique',    "People's Square",             'hotel', 112.00, 3, 4.30, 'Annulation flexible',     'Flexible cancellation',    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80' FROM destinations WHERE slug='shanghai';

-- Bali
INSERT INTO hebergements (destination_id, nom, quartier, type, prix_nuit, nb_etoiles, note, avantage_fr, avantage_en, image_url)
SELECT id, 'Alaya Resort Ubud',   'Ubud · Centre',               'hotel', 195.00, 5, 4.80, 'Vue rizières',            'Rice terrace view',        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80' FROM destinations WHERE slug='bali';
INSERT INTO hebergements (destination_id, nom, quartier, type, prix_nuit, nb_etoiles, note, avantage_fr, avantage_en, image_url)
SELECT id, 'The Layar Seminyak',  'Seminyak · Plage',            'villa', 380.00, 5, 4.90, 'Villa privée avec piscine','Private pool villa',       'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80' FROM destinations WHERE slug='bali';

-- Santorini
INSERT INTO hebergements (destination_id, nom, quartier, type, prix_nuit, nb_etoiles, note, avantage_fr, avantage_en, image_url)
SELECT id, 'Canaves Oia',         'Oia · Vue caldeira',          'hotel', 520.00, 5, 4.95, 'Vue caldeira',            'Caldera view',             'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=800&q=80' FROM destinations WHERE slug='santorini';
INSERT INTO hebergements (destination_id, nom, quartier, type, prix_nuit, nb_etoiles, note, avantage_fr, avantage_en, image_url)
SELECT id, 'Kirini Suites',       'Imerovigli · Falaises',       'hotel', 280.00, 4, 4.70, 'Piscine à débordement',   'Infinity pool',            'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80' FROM destinations WHERE slug='santorini';

-- Kyoto
INSERT INTO hebergements (destination_id, nom, quartier, type, prix_nuit, nb_etoiles, note, avantage_fr, avantage_en, image_url)
SELECT id, 'Sowaka Ryokan',       'Higashiyama · Gion',          'hotel', 340.00, 5, 4.90, 'Ryokan traditionnel',     'Traditional ryokan',       'https://images.unsplash.com/photo-1578469645742-46cae010e5d4?auto=format&fit=crop&w=800&q=80' FROM destinations WHERE slug='kyoto';
INSERT INTO hebergements (destination_id, nom, quartier, type, prix_nuit, nb_etoiles, note, avantage_fr, avantage_en, image_url)
SELECT id, 'The Screen Kyoto',    'Nakagyo · Centre',            'hotel', 185.00, 4, 4.60, 'Design boutique',         'Boutique design hotel',    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80' FROM destinations WHERE slug='kyoto';

-- ── Transports (vols depuis Paris) ──────────────────────────
INSERT INTO transports (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix)
SELECT id, 'avion', 'Air France',    'Paris CDG',  'Shanghai PVG', '11h05', '11:15 → 06:20+1', 612.00  FROM destinations WHERE slug='shanghai';
INSERT INTO transports (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix)
SELECT id, 'avion', 'China Eastern', 'Paris CDG',  'Shanghai PVG', '11h20', '23:45 → 18:55+1', 548.00  FROM destinations WHERE slug='shanghai';
INSERT INTO transports (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix)
SELECT id, 'avion', 'Air France',    'Paris CDG',  'Denpasar DPS', '16h45', '10:30 → 05:15+1', 742.00  FROM destinations WHERE slug='bali';
INSERT INTO transports (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix)
SELECT id, 'avion', 'Aegean',        'Paris CDG',  'Santorin JTR', '3h30',  '07:00 → 10:30',   320.00  FROM destinations WHERE slug='santorini';
INSERT INTO transports (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix)
SELECT id, 'avion', 'Royal Air Maroc','Paris CDG', 'Marrakech RAK','3h00',  '08:45 → 10:45',   180.00  FROM destinations WHERE slug='marrakech';
INSERT INTO transports (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix)
SELECT id, 'avion', 'Air France',    'Paris CDG',  'Osaka KIX',    '13h20', '11:00 → 08:20+1', 780.00  FROM destinations WHERE slug='kyoto';
INSERT INTO transports (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix)
SELECT id, 'avion', 'TAP',           'Paris ORY',  'Lisbonne LIS', '2h20',  '09:30 → 10:50',   120.00  FROM destinations WHERE slug='lisbon';
INSERT INTO transports (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix)
SELECT id, 'avion', 'Aeromexico',    'Paris CDG',  'Cancún CUN',   '10h30', '14:00 → 17:30',   620.00  FROM destinations WHERE slug='tulum';
INSERT INTO transports (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix)
SELECT id, 'avion', 'Air France',    'Paris CDG',  'Buenos Aires EZE','14h15','22:00 → 07:15+1',940.00 FROM destinations WHERE slug='patagonia';
INSERT INTO transports (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix)
SELECT id, 'avion', 'Icelandair',    'Paris CDG',  'Reykjavik KEF','3h00',  '07:00 → 08:00',   290.00  FROM destinations WHERE slug='reykjavik';
INSERT INTO transports (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix)
SELECT id, 'avion', 'Air France',    'Paris CDG',  'Cape Town CPT','11h45', '20:00 → 10:45+1', 820.00  FROM destinations WHERE slug='capetown';
INSERT INTO transports (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix)
SELECT id, 'avion', 'Vietnam Airlines','Paris CDG','Hanoï HAN',    '10h30', '13:30 → 06:00+1', 680.00  FROM destinations WHERE slug='hanoi';
INSERT INTO transports (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix)
SELECT id, 'avion', 'Norwegian',     'Paris CDG',  'Bodø BOO',     '3h45',  '06:00 → 09:45',   310.00  FROM destinations WHERE slug='lofoten';

-- ── Activités ───────────────────────────────────────────────
-- Shanghai
INSERT INTO activites (destination_id, nom_fr, nom_en, categorie, duree, prix, description_fr, description_en)
SELECT id,
  'Croisière nocturne sur le Huangpu',  'Huangpu river night cruise',
  'croisiere', '1h30', 28.00,
  'Admirez le Bund et Pudong illuminés depuis le fleuve.',
  'See the illuminated Bund and Pudong skyline from the river.'
FROM destinations WHERE slug='shanghai';

INSERT INTO activites (destination_id, nom_fr, nom_en, categorie, duree, prix, description_fr, description_en)
SELECT id,
  'Jardin Yuyuan & maison de thé',      'Yuyuan Garden & tea house',
  'culture', '3h', 35.00,
  'Joyau de l'architecture Ming au cœur du vieux Shanghai.',
  'Ming-dynasty gem at the heart of Old Shanghai.'
FROM destinations WHERE slug='shanghai';

INSERT INTO activites (destination_id, nom_fr, nom_en, categorie, duree, prix, description_fr, description_en)
SELECT id,
  "Atelier xiaolongbao chez l'habitant", 'Xiaolongbao workshop with a local',
  'gastronomie', '2h30', 62.00,
  'Apprenez à plier et cuire les raviolis à la vapeur emblématiques.',
  'Learn to fold and steam the iconic soup dumplings.'
FROM destinations WHERE slug='shanghai';

INSERT INTO activites (destination_id, nom_fr, nom_en, categorie, duree, prix, description_fr, description_en)
SELECT id,
  'Vue panoramique Shanghai Tower (118e)', 'Shanghai Tower panoramic view (118th fl.)',
  'panorama', '1h', 32.00,
  'Observation au sommet de la 2e plus haute tour du monde.',
  "Observation deck at the world's 2nd tallest tower."
FROM destinations WHERE slug='shanghai';

-- Bali
INSERT INTO activites (destination_id, nom_fr, nom_en, categorie, duree, prix, description_fr, description_en)
SELECT id,
  'Trekking Tegallalang au lever du soleil', 'Tegallalang sunrise trek',
  'aventure', '3h', 45.00,
  'Parcourez les terrasses en escalier au lever du soleil.',
  'Walk the stepped rice terraces at sunrise.'
FROM destinations WHERE slug='bali';

INSERT INTO activites (destination_id, nom_fr, nom_en, categorie, duree, prix, description_fr, description_en)
SELECT id,
  'Cérémonie au temple Tirta Empul',    'Tirta Empul temple ceremony',
  'culture', '2h', 30.00,
  'Rituel de purification dans les sources sacrées.',
  'Purification ritual in sacred holy springs.'
FROM destinations WHERE slug='bali';

-- Santorini
INSERT INTO activites (destination_id, nom_fr, nom_en, categorie, duree, prix, description_fr, description_en)
SELECT id,
  'Dégustation de vins Assyrtiko',      'Assyrtiko wine tasting',
  'gastronomie', '2h', 55.00,
  'Visitez un domaine viticole volcanique face à la caldeira.',
  'Tour a volcanic vineyard overlooking the caldera.'
FROM destinations WHERE slug='santorini';

INSERT INTO activites (destination_id, nom_fr, nom_en, categorie, duree, prix, description_fr, description_en)
SELECT id,
  'Croisière caldeira au coucher de soleil', 'Caldera sunset catamaran cruise',
  'croisiere', '5h', 120.00,
  'Catamaran, bain dans les sources chaudes et coucher de soleil sur Oia.',
  'Catamaran, hot spring dip and sunset over Oia.'
FROM destinations WHERE slug='santorini';

-- Kyoto
INSERT INTO activites (destination_id, nom_fr, nom_en, categorie, duree, prix, description_fr, description_en)
SELECT id,
  'Trek des torii de Fushimi Inari',    'Fushimi Inari torii gate trail',
  'randonnee', '3h', 0.00,
  'Sentier montant entre 10 000 torii vermillon.',
  'Trail winding through 10,000 vermilion torii gates.'
FROM destinations WHERE slug='kyoto';

INSERT INTO activites (destination_id, nom_fr, nom_en, categorie, duree, prix, description_fr, description_en)
SELECT id,
  'Cérémonie du thé à Gion',            'Tea ceremony in Gion',
  'culture', '1h30', 48.00,
  'Initiation au chado dans un machiya traditionnel.',
  'Introduction to chado in a traditional machiya.'
FROM destinations WHERE slug='kyoto';

-- Marrakech
INSERT INTO activites (destination_id, nom_fr, nom_en, categorie, duree, prix, description_fr, description_en)
SELECT id,
  'Visite guidée de la médina',         'Medina guided tour',
  'culture', '3h', 35.00,
  'Dédales de souks, tanneries et palais cachés.',
  'Maze of souks, tanneries and hidden palaces.'
FROM destinations WHERE slug='marrakech';

INSERT INTO activites (destination_id, nom_fr, nom_en, categorie, duree, prix, description_fr, description_en)
SELECT id,
  'Cours de cuisine marocaine',         'Moroccan cooking class',
  'gastronomie', '4h', 65.00,
  'Épices, tajine et pastilla dans un riad traditionnel.',
  'Spices, tagine and pastilla in a traditional riad.'
FROM destinations WHERE slug='marrakech';

-- ── Utilisateurs ────────────────────────────────────────────
INSERT INTO utilisateurs (nom, email, mot_de_passe, role) VALUES
  ('Jean Dupont',  'jean@exemple.com',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
  ('Admin VV',     'admin@voyagevista.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
-- mot de passe par défaut : "password" (hash bcrypt)

-- ── Réservations ────────────────────────────────────────────
INSERT INTO reservations (reference, utilisateur_id, destination_id, date_depart, date_retour, nb_voyageurs, montant_total, statut)
SELECT 'VV-2H4N9K', 1, d.id, '2026-06-15', '2026-06-22', 2, 2398.00, 'confirmee'
  FROM destinations d WHERE d.slug='bali';

INSERT INTO reservations (reference, utilisateur_id, destination_id, date_depart, date_retour, nb_voyageurs, montant_total, statut)
SELECT 'VV-7P2X1M', 1, d.id, '2026-08-03', '2026-08-10', 4, 1840.00, 'en_attente'
  FROM destinations d WHERE d.slug='lisbon';

INSERT INTO reservations (reference, utilisateur_id, destination_id, date_depart, date_retour, nb_voyageurs, montant_total, statut)
SELECT 'VV-9B5K3D', 1, d.id, '2025-11-12', '2025-11-21', 2, 3240.00, 'terminee'
  FROM destinations d WHERE d.slug='kyoto';
