-- ============================================================
-- VoyageVista – Migration transport v2
-- Ajoute transport_id dans reservations + table reservation_transports
-- Exécuter APRÈS schema.sql + migrations précédentes :
--   mysql -u root -proot voyagevista < migration_transport_v2.sql
-- ============================================================

USE voyagevista;

-- ── Ajoute transport_id sur reservations (si absent) ─────────
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'voyagevista'
    AND TABLE_NAME   = 'reservations'
    AND COLUMN_NAME  = 'transport_id'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE reservations
     ADD COLUMN transport_id INT NULL AFTER hebergement_id,
     ADD CONSTRAINT fk_res_transport FOREIGN KEY (transport_id) REFERENCES transports(id) ON DELETE SET NULL',
  'SELECT "transport_id already exists"'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ── Ajoute date_depart_transport sur reservations (si absent) ─
SET @col2 = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = 'voyagevista'
    AND TABLE_NAME   = 'reservations'
    AND COLUMN_NAME  = 'date_depart_transport'
);

SET @sql2 = IF(@col2 = 0,
  'ALTER TABLE reservations
     ADD COLUMN date_depart_transport DATE NULL AFTER transport_id',
  'SELECT "date_depart_transport already exists"'
);
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- ── Table reservation_transports (historique annulations) ─────
CREATE TABLE IF NOT EXISTS reservation_transports (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id  INT NOT NULL,
  transport_id    INT NOT NULL,
  nb_places       TINYINT NOT NULL DEFAULT 1,
  date_trajet     DATE    NOT NULL,
  statut          ENUM('actif','annule') DEFAULT 'actif',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
  FOREIGN KEY (transport_id)   REFERENCES transports(id)   ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Met à jour les réservations de demo avec un transport ─────
UPDATE reservations SET transport_id = (SELECT id FROM transports WHERE destination_id = destination_id ORDER BY prix ASC LIMIT 1)
WHERE transport_id IS NULL AND id IN (
  SELECT r.id FROM (SELECT id, destination_id FROM reservations) r
  WHERE EXISTS (SELECT 1 FROM transports t WHERE t.destination_id = r.destination_id)
);
