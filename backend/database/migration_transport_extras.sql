-- migration_transport_extras.sql
-- Ajout de transports alternatifs pour destinations européennes et proches
-- À exécuter en MIGRATION (ne pas supprimer la base — juste importer ce fichier)

INSERT INTO transports (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix, places_dispo) VALUES

-- ═══════════════════════════════════════════════════════════════
-- LISBONNE  (~1 500 km de Paris — accès multimodal réaliste)
-- ═══════════════════════════════════════════════════════════════

-- Avion low-cost
((SELECT id FROM destinations WHERE slug='lisbon'), 'avion',   'Transavia',    'Paris ORY',          'Lisbonne LIS',     '2h25',  '13:20 → 14:45',   89.00, 160),
-- Train : TGV Paris–Irun + Renfe Irun–Lisbonne (liaison directe réelle)
((SELECT id FROM destinations WHERE slug='lisbon'), 'train',   'SNCF + Renfe', 'Paris Montparnasse', 'Lisbonne Oriente', '17h30', '07:07 → 00:37+1', 95.00, 280),
-- Bus Flixbus Paris–Lisbonne (dessert réellement cette ligne)
((SELECT id FROM destinations WHERE slug='lisbon'), 'bus',     'Flixbus',      'Paris Bercy Seine',  'Lisbonne Sete Rios','23h00','07:30 → 06:30+1', 42.00,  52),
-- Voiture : road trip ~1 500 km via Bayonne–Burgos–Salamanque
((SELECT id FROM destinations WHERE slug='lisbon'), 'voiture', 'Road trip',    'Paris',              'Lisbonne',         '16h00', 'Départ flexible',  68.00,  12),

-- ═══════════════════════════════════════════════════════════════
-- MARRAKECH  (~2 000 km — train Eurostar/Renfe + ferry Tarifa)
-- ═══════════════════════════════════════════════════════════════

-- Avion low-cost
((SELECT id FROM destinations WHERE slug='marrakech'), 'avion', 'Transavia',   'Paris ORY',      'Marrakech RAK',      '3h10',  '14:30 → 16:40', 130.00, 160),
-- Bus longue distance Paris–Marrakech via Algésiras–Tanger (ligne Eurolines/Alsa réelle)
((SELECT id FROM destinations WHERE slug='marrakech'), 'bus',   'Eurolines',   'Paris Gallieni', 'Marrakech (routière)','28h00','08:00 → 12:00+1', 62.00,  50),
-- Voiture : route classique via Algésiras + ferry vers Tanger
((SELECT id FROM destinations WHERE slug='marrakech'), 'voiture','Road trip',  'Paris',          'Marrakech (via ferry)','22h00','Départ flexible',  74.00,  12),

-- ═══════════════════════════════════════════════════════════════
-- SANTORIN  (~2 500 km — avion budget vers Athènes + ferry)
-- ═══════════════════════════════════════════════════════════════

-- Avion low-cost
((SELECT id FROM destinations WHERE slug='santorini'), 'avion', 'easyJet',     'Paris CDG',  'Santorin JTR',           '3h35',  '10:15 → 13:50', 185.00, 160),
-- Train Paris–Venise + ferry Venise–Patras + train Patras–Athènes–ferry Santorin
((SELECT id FROM destinations WHERE slug='santorini'), 'train', 'SNCF + ferry','Paris Gare de Lyon','Santorin (via Athènes)','36h00','08:00 → 20:00+1',168.00, 80),

-- ═══════════════════════════════════════════════════════════════
-- REYKJAVIK  (~2 900 km — avion uniquement, pas de train/bus)
-- ═══════════════════════════════════════════════════════════════

((SELECT id FROM destinations WHERE slug='reykjavik'), 'avion', 'easyJet',     'Paris CDG',  'Reykjavik KEF',          '3h10',  '11:30 → 13:40', 195.00, 160),
((SELECT id FROM destinations WHERE slug='reykjavik'), 'avion', 'Vueling',     'Paris ORY',  'Reykjavik KEF',          '3h15',  '06:45 → 09:00', 210.00, 160),

-- ═══════════════════════════════════════════════════════════════
-- LOFOTEN  (~3 000 km — avion vers Bodø / vol + ferry côtier)
-- ═══════════════════════════════════════════════════════════════

((SELECT id FROM destinations WHERE slug='lofoten'),   'avion', 'easyJet',     'Paris CDG',  'Bodø BOO',               '3h50',  '09:15 → 13:05', 245.00, 160),
-- Vol Paris–Bergen + ferry Hurtigruten Bergen→Svolvær (expérience côtière iconique)
((SELECT id FROM destinations WHERE slug='lofoten'),   'avion', 'Norwegian',   'Paris CDG',  'Bodø BOO (via Oslo)',     '5h30',  '07:00 → 12:30', 280.00, 120),

-- ═══════════════════════════════════════════════════════════════
-- TOKYO / KYOTO  — compagnies asiatiques concurrentes
-- ═══════════════════════════════════════════════════════════════

((SELECT id FROM destinations WHERE slug='kyoto'),     'avion', 'JAL',         'Paris CDG',  'Osaka KIX',              '13h05', '10:00 → 07:05+1',750.00, 140),
((SELECT id FROM destinations WHERE slug='kyoto'),     'avion', 'ANA',         'Paris CDG',  'Tokyo NRT + Shinkansen', '15h30', '13:30 → 11:00+1',810.00, 140),

-- ═══════════════════════════════════════════════════════════════
-- SHANGHAI  — compagnies asiatiques
-- ═══════════════════════════════════════════════════════════════

((SELECT id FROM destinations WHERE slug='shanghai'),  'avion', 'Turkish Airlines','Paris CDG','Shanghai PVG (via IST)','13h45', '07:30 → 05:15+1',490.00, 160),
((SELECT id FROM destinations WHERE slug='shanghai'),  'avion', 'Cathay Pacific',  'Paris CDG','Shanghai PVG (via HKG)','14h20', '21:00 → 17:20+1',560.00, 160),

-- ═══════════════════════════════════════════════════════════════
-- BALI  — compagnies avec escales
-- ═══════════════════════════════════════════════════════════════

((SELECT id FROM destinations WHERE slug='bali'),      'avion', 'Emirates',        'Paris CDG','Denpasar DPS (via DXB)','17h30', '21:30 → 15:00+1',680.00, 160),
((SELECT id FROM destinations WHERE slug='bali'),      'avion', 'Singapore Airlines','Paris CDG','Denpasar DPS (via SIN)','16h45','13:00 → 05:45+1',720.00, 160),

-- ═══════════════════════════════════════════════════════════════
-- HANOJ  — compagnies concurrentes
-- ═══════════════════════════════════════════════════════════════

((SELECT id FROM destinations WHERE slug='hanoi'),     'avion', 'Thai Airways',    'Paris CDG','Hanoï HAN (via BKK)',  '12h30', '22:10 → 17:40+1',620.00, 160),

-- ═══════════════════════════════════════════════════════════════
-- CAPE TOWN  — compagnies alternatives
-- ═══════════════════════════════════════════════════════════════

((SELECT id FROM destinations WHERE slug='capetown'),  'avion', 'Ethiopian Airlines','Paris CDG','Cape Town CPT (via ADD)','15h30','11:00 → 02:30+1',740.00, 160),

-- ═══════════════════════════════════════════════════════════════
-- TULUM  — compagnies alternatives
-- ═══════════════════════════════════════════════════════════════

((SELECT id FROM destinations WHERE slug='tulum'),     'avion', 'Air Transat',     'Paris CDG','Cancún CUN',           '9h45',  '11:00 → 14:45', 540.00, 160),
((SELECT id FROM destinations WHERE slug='tulum'),     'avion', 'Corsair',         'Paris ORY','Cancún CUN',           '10h15', '09:30 → 13:45', 580.00, 160),

-- ═══════════════════════════════════════════════════════════════
-- PATAGONIE  — compagnies alternatives
-- ═══════════════════════════════════════════════════════════════

((SELECT id FROM destinations WHERE slug='patagonia'), 'avion', 'Iberia',          'Paris CDG','Buenos Aires EZE (via MAD)','16h30','10:00 → 02:30+1',860.00, 120),
((SELECT id FROM destinations WHERE slug='patagonia'), 'avion', 'LATAM',           'Paris CDG','Buenos Aires EZE (via SCL)','17h00','22:00 → 15:00+1',890.00, 120);
