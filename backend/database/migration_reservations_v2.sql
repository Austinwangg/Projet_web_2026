-- Migration v2 : ajout hebergement_id dans reservations + table reservation_activites
-- MySQL 5.7 compatible
-- Charger : mysql -u root -proot voyagevista < migration_reservations_v2.sql

USE voyagevista;

-- Ajoute hebergement_id si la colonne n'existe pas encore
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'voyagevista'
    AND TABLE_NAME   = 'reservations'
    AND COLUMN_NAME  = 'hebergement_id'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE reservations ADD COLUMN hebergement_id INT NULL AFTER destination_id, ADD CONSTRAINT fk_res_hebergement FOREIGN KEY (hebergement_id) REFERENCES hebergements(id) ON DELETE SET NULL',
  'SELECT "hebergement_id already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Table de liaison réservation ↔ activités
CREATE TABLE IF NOT EXISTS reservation_activites (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id  INT NOT NULL,
  activite_id     INT NOT NULL,
  nb_places       TINYINT NOT NULL DEFAULT 1,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (activite_id)    REFERENCES activites(id)    ON DELETE CASCADE
) ENGINE=InnoDB;
