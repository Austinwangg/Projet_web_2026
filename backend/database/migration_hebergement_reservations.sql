-- VoyageVista — Table des réservations d'hébergement standalone
-- À exécuter dans phpMyAdmin ou via mysql CLI

USE voyagevista;

CREATE TABLE IF NOT EXISTS reservations_hebergement (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  reference       VARCHAR(20)  NOT NULL UNIQUE,
  utilisateur_id  INT NOT NULL,
  hebergement_id  INT NOT NULL,
  date_arrivee    DATE NOT NULL,
  date_depart     DATE NOT NULL,
  nb_personnes    TINYINT DEFAULT 1,
  nb_nuits        INT NOT NULL DEFAULT 1,
  montant_total   DECIMAL(10,2) DEFAULT 0.00,
  statut          ENUM('en_attente','confirmee','annulee') DEFAULT 'confirmee',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
  FOREIGN KEY (hebergement_id) REFERENCES hebergements(id) ON DELETE CASCADE
) ENGINE=InnoDB;
