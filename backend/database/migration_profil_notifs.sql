-- VoyageVista — Migration : profil étendu + notifications
-- Exécuter dans phpMyAdmin ou : mysql -u root -proot voyagevista < migration_profil_notifs.sql

USE voyagevista;

-- Ajout des colonnes profil étendu (ignorées si elles existent déjà)
ALTER TABLE utilisateurs
  ADD COLUMN IF NOT EXISTS telephone    VARCHAR(30)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS date_naissance DATE        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS prenom       VARCHAR(100) DEFAULT NULL;

-- Table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  icone          VARCHAR(10)  NOT NULL DEFAULT '✦',
  message_fr     VARCHAR(300) NOT NULL,
  message_en     VARCHAR(300) NOT NULL DEFAULT '',
  lu             TINYINT(1)   NOT NULL DEFAULT 0,
  created_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Données de démo
INSERT INTO notifications (utilisateur_id, icone, message_fr, message_en, lu) VALUES
  (1, '✓', 'Réservation Bali confirmée', 'Bali booking confirmed', 0),
  (1, '✈', 'Départ dans 2 jours · vol AF 116', 'Departure in 2 days · flight AF 116', 0),
  (1, '◇', 'Atelier xiaolongbao : rappel J-1', 'Xiaolongbao workshop: D-1 reminder', 1),
  (1, '✦', 'Offre Kyoto -15% pour vous', 'Kyoto offer -15% just for you', 1);
