-- VoyageVista — Migration : profil étendu + données de démo notifications
-- La table notifications existe déjà dans schema.sql avec les colonnes
-- (id, utilisateur_id, type, titre, message, lu, created_at).
-- Cette migration ajoute uniquement les colonnes profil sur utilisateurs
-- et insère des notifications de démo.
--
-- Exécuter APRÈS schema.sql :
--   mysql -u root -proot voyagevista < migration_profil_notifs.sql

USE voyagevista;

-- ── Profil étendu ────────────────────────────────────────────────────────────
ALTER TABLE utilisateurs
  ADD COLUMN  telephone      VARCHAR(30)  DEFAULT NULL,
  ADD COLUMN  date_naissance DATE         DEFAULT NULL,
  ADD COLUMN  prenom         VARCHAR(100) DEFAULT NULL;

-- ── Notifications de démo ────────────────────────────────────────────────────
-- On purge d'abord les éventuels doublons avant d'insérer.
DELETE FROM notifications WHERE utilisateur_id = 1;

INSERT INTO notifications (utilisateur_id, type, titre, message, lu) VALUES
  (1, 'reservation', 'Réservation Bali confirmée',         'Votre réservation VV-2H4N9K est confirmée.',          0),
  (1, 'transport',   'Départ dans 2 jours · vol AF 116',   'Pensez à enregistrer vos bagages en ligne.',          0),
  (1, 'activite',    'Atelier xiaolongbao : rappel J-1',   'Rendez-vous demain à 10h au 123 rue de la Paix.',     1),
  (1, 'info',        'Offre Kyoto -15 % pour vous',        'Profitez de cette offre exclusive jusqu''au 30 juin.',1);
