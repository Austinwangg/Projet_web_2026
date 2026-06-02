<?php
require_once __DIR__ . '/../config/database.php';

class Hebergement {

    // Retourne tous les hébergements triés par nom
    public static function getAll(): array {
        $stmt = getDB()->query('SELECT * FROM hebergements ORDER BY nom ASC');
        return $stmt->fetchAll();
    }

    // Retourne tous les hébergements avec les infos de destination jointes (ville, pays, slug)
    public static function getAllWithDest(): array {
        $stmt = getDB()->query(
            'SELECT h.*, d.ville, d.pays_fr, d.pays_en, d.slug AS dest_slug
             FROM hebergements h
             JOIN destinations d ON d.id = h.destination_id
             ORDER BY d.pays_fr ASC, h.nb_etoiles DESC'
        );
        return $stmt->fetchAll();
    }

    // Retourne les hébergements d'un pays donné (recherche partielle FR ou EN)
    public static function getByPays(string $pays): array {
        $stmt = getDB()->prepare(
            'SELECT h.*, d.ville, d.pays_fr, d.pays_en, d.slug AS dest_slug
             FROM hebergements h
             JOIN destinations d ON d.id = h.destination_id
             WHERE d.pays_fr LIKE ? OR d.pays_en LIKE ?
             ORDER BY h.nb_etoiles DESC'
        );
        $stmt->execute(["%$pays%", "%$pays%"]);
        return $stmt->fetchAll();
    }

    // Retourne tous les hébergements d'une destination par son id
    public static function getByDest(int $destId): array {
        $stmt = getDB()->prepare('SELECT * FROM hebergements WHERE destination_id = ? ORDER BY nb_etoiles DESC');
        $stmt->execute([$destId]);
        return $stmt->fetchAll();
    }

    // Retourne un hébergement par son id, ou false s'il n'existe pas
    public static function getById(int $id): array|false {
        $stmt = getDB()->prepare('SELECT * FROM hebergements WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    // Crée un nouvel hébergement et retourne son id
    public static function create(array $data): int {
        $stmt = getDB()->prepare(
            'INSERT INTO hebergements
               (destination_id, nom, quartier, type, prix_nuit, nb_etoiles, note, avantage_fr, avantage_en, image_url)
             VALUES (?,?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $data['destination_id'],
            $data['nom'],
            $data['quartier']    ?? '',
            $data['type']        ?? 'hotel',
            $data['prix_nuit'],
            $data['nb_etoiles']  ?? 4,
            $data['note']        ?? 4.5,
            $data['avantage_fr'] ?? '',
            $data['avantage_en'] ?? '',
            $data['image_url']   ?? '',
        ]);
        return (int) getDB()->lastInsertId();
    }

    // Supprime un hébergement par son id
    public static function delete(int $id): bool {
        $stmt = getDB()->prepare('DELETE FROM hebergements WHERE id = ?');
        return $stmt->execute([$id]);
    }

    // Vérifie qu'il reste au moins $nb chambres disponibles
    public static function isAvailable(int $id, int $nb = 1): bool {
        $stmt = getDB()->prepare('SELECT nb_chambres_dispo FROM hebergements WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row && (int) $row['nb_chambres_dispo'] >= $nb;
    }

    // Décrémente le compteur de chambres disponibles (protégé contre le passage en négatif)
    public static function decrementDispo(int $id, int $nb = 1): bool {
        $stmt = getDB()->prepare(
            'UPDATE hebergements SET nb_chambres_dispo = nb_chambres_dispo - ?
             WHERE id = ? AND nb_chambres_dispo >= ?'
        );
        $stmt->execute([$nb, $id, $nb]);
        return $stmt->rowCount() > 0;
    }

    // Réincrémente le compteur de chambres disponibles (utilisé lors d'une annulation)
    public static function incrementDispo(int $id, int $nb = 1): bool {
        $stmt = getDB()->prepare(
            'UPDATE hebergements SET nb_chambres_dispo = nb_chambres_dispo + ? WHERE id = ?'
        );
        return $stmt->execute([$nb, $id]);
    }
}
