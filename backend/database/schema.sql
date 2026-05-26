-- ============================================================
-- VoyageVista – Schéma MySQL complet (v2 · 2026)
-- Charger : mysql -u root -proot voyagevista < schema.sql
--        ou importer via phpMyAdmin (onglet Import, fichier SQL)
-- ============================================================

CREATE DATABASE IF NOT EXISTS voyagevista
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE voyagevista;

-- ── Suppression dans l'ordre inverse des FK (enfants avant parents)
-- Cette approche fonctionne dans phpMyAdmin sans toucher FOREIGN_KEY_CHECKS
DROP TABLE IF EXISTS reservations;
DROP TABLE IF EXISTS activites;
DROP TABLE IF EXISTS hebergements;
DROP TABLE IF EXISTS transports;
DROP TABLE IF EXISTS destinations;
DROP TABLE IF EXISTS utilisateurs;

-- ── Destinations ────────────────────────────────────────────
CREATE TABLE destinations (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(60)  NOT NULL UNIQUE,
  ville         VARCHAR(150) NOT NULL,
  pays_fr       VARCHAR(100) NOT NULL,
  pays_en       VARCHAR(100) NOT NULL,
  type          VARCHAR(50)  NOT NULL,
  types_json    JSON,
  note          DECIMAL(3,1) DEFAULT 4.5,
  nb_avis       INT          DEFAULT 0,
  duree_jours   TINYINT      DEFAULT 7,
  prix_depuis   INT          NOT NULL,
  tag_fr        VARCHAR(60)  DEFAULT '',
  tag_en        VARCHAR(60)  DEFAULT '',
  resume_fr     TEXT,
  resume_en     TEXT,
  image_url     VARCHAR(500),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Hébergements ────────────────────────────────────────────
CREATE TABLE hebergements (
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
CREATE TABLE transports (
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
CREATE TABLE activites (
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
CREATE TABLE utilisateurs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nom           VARCHAR(100) NOT NULL,
  email         VARCHAR(200) NOT NULL UNIQUE,
  mot_de_passe  VARCHAR(255) NOT NULL,
  role          ENUM('user','admin') DEFAULT 'user',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Réservations ────────────────────────────────────────────
CREATE TABLE reservations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  reference       VARCHAR(20)  NOT NULL UNIQUE,
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
-- DONNÉES — 12 destinations
-- ══════════════════════════════════════════════════════════════

INSERT INTO destinations
  (slug, ville, pays_fr, pays_en, type, types_json, note, nb_avis, duree_jours, prix_depuis, tag_fr, tag_en, resume_fr, resume_en, image_url)
VALUES
  ('shanghai', 'Shanghai', 'Chine', 'China', 'ville', '["ville","culture"]', 4.8, 612, 7, 1408, 'Tendance', 'Trending',
   'Néons du Bund, ruelles du Vieux Shanghai, gratte-ciel du Pudong : la ville qui ne s''arrête jamais.',
   'Bund neon, Old Shanghai lanes, Pudong skyline — the city that never pauses.',
   'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=1200&q=80'),

  ('bali', 'Bali', 'Indonésie', 'Indonesia', 'aventure', '["aventure","plage"]', 4.7, 894, 8, 1199, 'Populaire', 'Popular',
   'Rizières d''Ubud, plages de Canggu, temples de Tirta Empul.',
   'Ubud rice terraces, Canggu beaches, Tirta Empul temples.',
   'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80'),

  ('santorini', 'Santorin', 'Grèce', 'Greece', 'plage', '["plage","ville"]', 4.6, 1240, 6, 1340, '', '',
   'Caldeira au crépuscule, dômes bleus d''Oia, vignobles d''assyrtiko.',
   'Caldera at dusk, blue domes of Oia, Assyrtiko vineyards.',
   'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80'),

  ('marrakech', 'Marrakech', 'Maroc', 'Morocco', 'culture', '["culture","ville"]', 4.5, 720, 5, 749, 'Nouveau', 'New',
   'Souks de la médina, riads cachés, mosaïques du palais Bahia.',
   'Medina souks, hidden riads, Bahia palace mosaics.',
   'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80'),

  ('kyoto', 'Kyoto', 'Japon', 'Japan', 'culture', '["culture","montagne"]', 4.9, 1080, 9, 1620, 'Saison', 'In season',
   'Mille torii de Fushimi Inari, jardins zen, ryokans de Gion.',
   'Fushimi Inari''s thousand torii, Zen gardens, Gion ryokans.',
   'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'),

  ('lisbon', 'Lisbonne', 'Portugal', 'Portugal', 'ville', '["ville","plage"]', 4.6, 540, 5, 620, '', '',
   'Tramway 28, azulejos, pasteis de nata et fado dans l''Alfama.',
   'Tram 28, azulejos, pastéis de nata, Alfama fado.',
   'https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?auto=format&fit=crop&w=1200&q=80'),

  ('tulum', 'Tulum', 'Mexique', 'Mexico', 'plage', '["plage","aventure"]', 4.4, 432, 7, 980, '', '',
   'Cenotes, ruines mayas en bord de mer, jungle yucatèque.',
   'Cenotes, Mayan ruins by the sea, Yucatán jungle.',
   'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1200&q=80'),

  ('patagonia', 'Patagonie', 'Argentine', 'Argentina', 'montagne', '["montagne","aventure"]', 4.9, 312, 12, 2240, '', '',
   'Glacier Perito Moreno, trek du Fitz Roy, estancias.',
   'Perito Moreno glacier, Fitz Roy trek, working estancias.',
   'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80'),

  ('reykjavik', 'Reykjavik', 'Islande', 'Iceland', 'aventure', '["aventure","montagne"]', 4.7, 401, 6, 1480, '', '',
   'Aurores boréales, cercle d''or, sources géothermales.',
   'Northern lights, Golden Circle, geothermal springs.',
   'https://images.unsplash.com/photo-1531168586672-d36a24562b38?auto=format&fit=crop&w=1200&q=80'),

  ('capetown', 'Cape Town', 'Afrique du Sud', 'South Africa', 'aventure', '["aventure","plage"]', 4.6, 520, 10, 1920, '', '',
   'Table Mountain, Cap de Bonne-Espérance, vignobles de Stellenbosch.',
   'Table Mountain, Cape of Good Hope, Stellenbosch wineries.',
   'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80'),

  ('hanoi', 'Hanoï', 'Vietnam', 'Vietnam', 'culture', '["culture","ville"]', 4.5, 380, 9, 1140, '', '',
   'Vieux quartier, baie d''Halong, pho fumant à l''aube.',
   'Old Quarter, Halong Bay, steaming pho at dawn.',
   'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80'),

  ('lofoten', 'Lofoten', 'Norvège', 'Norway', 'montagne', '["montagne","aventure"]', 4.8, 210, 7, 1860, '', '',
   'Cabanes de pêcheurs rouges, randonnées de Reinebringen.',
   'Red fishermen''s cabins, Reinebringen hikes.',
   'https://images.unsplash.com/photo-1520769669658-f07657f5a307?auto=format&fit=crop&w=1200&q=80');

-- ── Hébergements ────────────────────────────────────────────
INSERT INTO hebergements (destination_id, nom, quartier, type, prix_nuit, nb_etoiles, note, avantage_fr, avantage_en, image_url) VALUES
  ((SELECT id FROM destinations WHERE slug='shanghai'), 'The Middle House',   'Jing''an · Puxi',          'hotel', 285.00, 5, 4.90, 'Petit-déj inclus',        'Breakfast included',     'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'),
  ((SELECT id FROM destinations WHERE slug='shanghai'), 'URBN Boutique',      'Ex-concession française',  'hotel', 165.00, 4, 4.60, 'Hôtel carbone-neutre',    'Carbon-neutral hotel',   'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'),
  ((SELECT id FROM destinations WHERE slug='shanghai'), 'Capella Jian Ye Li', 'Xuhui · Shikumen',         'hotel', 420.00, 5, 4.95, 'Spa privatif',            'Private spa',            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'),
  ((SELECT id FROM destinations WHERE slug='shanghai'), 'Yangtze Boutique',   'People''s Square',         'hotel', 112.00, 3, 4.30, 'Annulation flexible',     'Flexible cancellation',  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'),
  ((SELECT id FROM destinations WHERE slug='bali'),     'Alaya Resort Ubud',  'Ubud · Centre',            'hotel', 195.00, 5, 4.80, 'Vue rizières',            'Rice terrace view',      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80'),
  ((SELECT id FROM destinations WHERE slug='bali'),     'The Layar Seminyak', 'Seminyak · Plage',         'villa', 380.00, 5, 4.90, 'Villa privée avec piscine','Private pool villa',     'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'),
  ((SELECT id FROM destinations WHERE slug='santorini'),'Canaves Oia',        'Oia · Vue caldeira',       'hotel', 520.00, 5, 4.95, 'Vue caldeira',            'Caldera view',           'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=800&q=80'),
  ((SELECT id FROM destinations WHERE slug='santorini'),'Kirini Suites',      'Imerovigli · Falaises',    'hotel', 280.00, 4, 4.70, 'Piscine à débordement',   'Infinity pool',          'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80'),
  ((SELECT id FROM destinations WHERE slug='kyoto'),    'Sowaka Ryokan',      'Higashiyama · Gion',       'hotel', 340.00, 5, 4.90, 'Ryokan traditionnel',     'Traditional ryokan',     'https://images.unsplash.com/photo-1578469645742-46cae010e5d4?auto=format&fit=crop&w=800&q=80'),
  ((SELECT id FROM destinations WHERE slug='kyoto'),    'The Screen Kyoto',   'Nakagyo · Centre',         'hotel', 185.00, 4, 4.60, 'Design boutique',         'Boutique design hotel',  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'),
  ((SELECT id FROM destinations WHERE slug='marrakech'),'La Mamounia',        'Médina · Remparts',        'hotel', 650.00, 5, 4.95, 'Palace légendaire',       'Legendary palace hotel', 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80'),
  ((SELECT id FROM destinations WHERE slug='lisbon'),   'Bairro Alto Hotel',  'Chiado · Centre',          'hotel', 280.00, 5, 4.80, 'Vue panoramique',         'Panoramic city view',    'https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?auto=format&fit=crop&w=800&q=80');

-- ── Transports (vols depuis Paris) ──────────────────────────
INSERT INTO transports (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix) VALUES
  ((SELECT id FROM destinations WHERE slug='shanghai'),  'avion', 'Air France',      'Paris CDG',   'Shanghai PVG',   '11h05', '11:15 → 06:20+1', 612.00),
  ((SELECT id FROM destinations WHERE slug='shanghai'),  'avion', 'China Eastern',   'Paris CDG',   'Shanghai PVG',   '11h20', '23:45 → 18:55+1', 548.00),
  ((SELECT id FROM destinations WHERE slug='bali'),      'avion', 'Air France',      'Paris CDG',   'Denpasar DPS',   '16h45', '10:30 → 05:15+1', 742.00),
  ((SELECT id FROM destinations WHERE slug='santorini'), 'avion', 'Aegean',          'Paris CDG',   'Santorin JTR',   '3h30',  '07:00 → 10:30',   320.00),
  ((SELECT id FROM destinations WHERE slug='marrakech'), 'avion', 'Royal Air Maroc', 'Paris CDG',   'Marrakech RAK',  '3h00',  '08:45 → 10:45',   180.00),
  ((SELECT id FROM destinations WHERE slug='kyoto'),     'avion', 'Air France',      'Paris CDG',   'Osaka KIX',      '13h20', '11:00 → 08:20+1', 780.00),
  ((SELECT id FROM destinations WHERE slug='lisbon'),    'avion', 'TAP',             'Paris ORY',   'Lisbonne LIS',   '2h20',  '09:30 → 10:50',   120.00),
  ((SELECT id FROM destinations WHERE slug='tulum'),     'avion', 'Aeromexico',      'Paris CDG',   'Cancún CUN',     '10h30', '14:00 → 17:30',   620.00),
  ((SELECT id FROM destinations WHERE slug='patagonia'), 'avion', 'Air France',      'Paris CDG',   'Buenos Aires EZE','14h15','22:00 → 07:15+1', 940.00),
  ((SELECT id FROM destinations WHERE slug='reykjavik'), 'avion', 'Icelandair',      'Paris CDG',   'Reykjavik KEF',  '3h00',  '07:00 → 08:00',   290.00),
  ((SELECT id FROM destinations WHERE slug='capetown'),  'avion', 'Air France',      'Paris CDG',   'Cape Town CPT',  '11h45', '20:00 → 10:45+1', 820.00),
  ((SELECT id FROM destinations WHERE slug='hanoi'),     'avion', 'Vietnam Airlines','Paris CDG',   'Hanoï HAN',      '10h30', '13:30 → 06:00+1', 680.00),
  ((SELECT id FROM destinations WHERE slug='lofoten'),   'avion', 'Norwegian',       'Paris CDG',   'Bodø BOO',       '3h45',  '06:00 → 09:45',   310.00);

-- ── Activités ───────────────────────────────────────────────
INSERT INTO activites (destination_id, nom_fr, nom_en, categorie, duree, prix, description_fr, description_en) VALUES
  ((SELECT id FROM destinations WHERE slug='shanghai'), 'Croisière nocturne sur le Huangpu',    'Huangpu river night cruise',          'croisiere',   '1h30',  28.00, 'Admirez le Bund et Pudong illuminés depuis le fleuve.', 'See the illuminated Bund and Pudong skyline from the river.'),
  ((SELECT id FROM destinations WHERE slug='shanghai'), 'Jardin Yuyuan & maison de thé',        'Yuyuan Garden & tea house',           'culture',     '3h',    35.00, 'Joyau de l''architecture Ming au cœur du vieux Shanghai.', 'Ming-dynasty gem at the heart of Old Shanghai.'),
  ((SELECT id FROM destinations WHERE slug='shanghai'), 'Atelier xiaolongbao chez l''habitant', 'Xiaolongbao workshop with a local',   'gastronomie', '2h30',  62.00, 'Apprenez à plier et cuire les raviolis à la vapeur.', 'Learn to fold and steam the iconic soup dumplings.'),
  ((SELECT id FROM destinations WHERE slug='shanghai'), 'Vue panoramique Shanghai Tower',        'Shanghai Tower panoramic view',       'panorama',    '1h',    32.00, 'Observation au sommet de la 2e plus haute tour du monde.', 'Observation deck at the world''s 2nd tallest tower.'),
  ((SELECT id FROM destinations WHERE slug='bali'),     'Trekking Tegallalang au lever du soleil','Tegallalang sunrise trek',           'aventure',    '3h',    45.00, 'Parcourez les terrasses en escalier au lever du soleil.', 'Walk the stepped rice terraces at sunrise.'),
  ((SELECT id FROM destinations WHERE slug='bali'),     'Cérémonie au temple Tirta Empul',       'Tirta Empul temple ceremony',         'culture',     '2h',    30.00, 'Rituel de purification dans les sources sacrées.', 'Purification ritual in sacred holy springs.'),
  ((SELECT id FROM destinations WHERE slug='santorini'),'Dégustation de vins Assyrtiko',         'Assyrtiko wine tasting',              'gastronomie', '2h',    55.00, 'Visitez un domaine viticole volcanique face à la caldeira.', 'Tour a volcanic vineyard overlooking the caldera.'),
  ((SELECT id FROM destinations WHERE slug='santorini'),'Croisière caldeira au coucher de soleil','Caldera sunset catamaran cruise',    'croisiere',   '5h',   120.00, 'Catamaran, bain dans les sources chaudes et coucher de soleil sur Oia.', 'Catamaran, hot spring dip and sunset over Oia.'),
  ((SELECT id FROM destinations WHERE slug='kyoto'),    'Trek des torii de Fushimi Inari',       'Fushimi Inari torii gate trail',      'randonnee',   '3h',     0.00, 'Sentier montant entre 10 000 torii vermillon.', 'Trail winding through 10,000 vermilion torii gates.'),
  ((SELECT id FROM destinations WHERE slug='kyoto'),    'Cérémonie du thé à Gion',               'Tea ceremony in Gion',                'culture',     '1h30',  48.00, 'Initiation au chado dans un machiya traditionnel.', 'Introduction to chado in a traditional machiya.'),
  ((SELECT id FROM destinations WHERE slug='marrakech'),'Visite guidée de la médina',            'Medina guided tour',                  'culture',     '3h',    35.00, 'Dédales de souks, tanneries et palais cachés.', 'Maze of souks, tanneries and hidden palaces.'),
  ((SELECT id FROM destinations WHERE slug='marrakech'),'Cours de cuisine marocaine',            'Moroccan cooking class',              'gastronomie', '4h',    65.00, 'Épices, tajine et pastilla dans un riad traditionnel.', 'Spices, tagine and pastilla in a traditional riad.'),
  ((SELECT id FROM destinations WHERE slug='lisbon'),   'Tour en tramway 28',                    'Tram 28 tour',                        'culture',     '2h',    12.00, 'Le tramway historique qui traverse les plus beaux quartiers.', 'The historic tram through Lisbon''s most beautiful neighborhoods.'),
  ((SELECT id FROM destinations WHERE slug='reykjavik'),'Chasse aux aurores boréales',           'Northern lights hunting tour',        'aventure',    '4h',    89.00, 'En 4x4 hors des lumières de la ville pour observer les aurores.', '4x4 off the city lights to hunt the northern lights.'),
  ((SELECT id FROM destinations WHERE slug='tulum'),    'Plongée en cenote',                     'Cenote diving',                       'aventure',    '3h',    75.00, 'Plongée dans les eaux cristallines des grottes mayas.', 'Dive into the crystal-clear waters of ancient Maya caves.'),
  ((SELECT id FROM destinations WHERE slug='patagonia'),'Trek du Fitz Roy',                      'Fitz Roy trek',                       'randonnee',   '8h',    55.00, 'La randonnée signature de la Patagonie, vue imprenable sur le massif.', 'Patagonia''s signature hike with breathtaking views of the massif.'),
  ((SELECT id FROM destinations WHERE slug='capetown'), 'Ascension de la Table Mountain',        'Table Mountain hike',                 'randonnee',   '5h',    25.00, 'Randonnée jusqu''au sommet emblématique avec vue sur l''océan.', 'Hike to the iconic summit with ocean views on all sides.'),
  ((SELECT id FROM destinations WHERE slug='hanoi'),    'Croisière baie d''Halong 2 jours',      'Halong Bay 2-day cruise',             'croisiere',   '2 jours',320.00,'Croisière en jonque dans le patrimoine UNESCO.', 'Traditional junk boat cruise through the UNESCO heritage bay.'),
  ((SELECT id FROM destinations WHERE slug='lofoten'),  'Randonnée Reinebringen',                'Reinebringen hike',                   'randonnee',   '4h',    20.00, 'Vue vertigineuse sur les villages de pêcheurs du fjord.', 'Vertiginous views over fjord fishing villages.');

-- ── Utilisateurs ────────────────────────────────────────────
-- Mot de passe : "password" (hash bcrypt valide)
INSERT INTO utilisateurs (nom, email, mot_de_passe, role) VALUES
  ('Jean Dupont',  'jean@exemple.com',      '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user'),
  ('Admin VV',     'admin@voyagevista.fr',  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- ── Réservations ────────────────────────────────────────────
INSERT INTO reservations (reference, utilisateur_id, destination_id, date_depart, date_retour, nb_voyageurs, montant_total, statut) VALUES
  ('VV-2H4N9K', 1, (SELECT id FROM destinations WHERE slug='bali'),     '2026-06-15', '2026-06-22', 2, 2398.00, 'confirmee'),
  ('VV-7P2X1M', 1, (SELECT id FROM destinations WHERE slug='lisbon'),   '2026-08-03', '2026-08-10', 4, 1840.00, 'en_attente'),
  ('VV-9B5K3D', 1, (SELECT id FROM destinations WHERE slug='kyoto'),    '2025-11-12', '2025-11-21', 2, 3240.00, 'terminee');
