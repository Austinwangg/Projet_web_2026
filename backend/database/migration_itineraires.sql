-- ============================================================
-- VoyageVista – Migration : tables itinéraires
-- Exécuter : mysql -u root -proot voyagevista < migration_itineraires.sql
-- ============================================================

USE voyagevista;

DROP TABLE IF EXISTS itineraire_items;
DROP TABLE IF EXISTS itineraires;

CREATE TABLE itineraires (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  nom            VARCHAR(200) NOT NULL DEFAULT 'Mon itinéraire',
  destination_id INT,
  date_depart    DATE,
  date_retour    DATE,
  nb_voyageurs   TINYINT DEFAULT 2,
  statut         ENUM('brouillon','confirme','annule') DEFAULT 'brouillon',
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE itineraire_items (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  itineraire_id   INT NOT NULL,
  type            ENUM('transport','hebergement','activite','autre') NOT NULL,
  ref_id          INT,
  titre           VARCHAR(300) NOT NULL,
  sous_titre      VARCHAR(300),
  prix            DECIMAL(10,2) DEFAULT 0.00,
  icone           VARCHAR(10) DEFAULT '◇',
  date_item       DATE,
  position        TINYINT DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (itineraire_id) REFERENCES itineraires(id) ON DELETE CASCADE
) ENGINE=InnoDB;
