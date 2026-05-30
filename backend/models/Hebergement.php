<?php
require_once __DIR__ . '/../config/database.php';

class Hebergement {

    public static function getAll(): array {
        $stmt = getDB()->query('SELECT * FROM hebergements ORDER BY nom ASC');
        return $stmt->fetchAll();
    }

    public static function getAllWithDest(): array {
        $stmt = getDB()->query(
            'SELECT h.*, d.ville, d.pays_fr, d.pays_en, d.slug AS dest_slug
             FROM hebergements h
             JOIN destinations d ON d.id = h.destination_id
             ORDER BY d.pays_fr ASC, h.nb_etoiles DESC'
        );
        return $stmt->fetchAll();
    }

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

    public static function getByDest(int $destId): array {
        $stmt = getDB()->prepare('SELECT * FROM hebergements WHERE destination_id = ? ORDER BY nb_etoiles DESC');
        $stmt->execute([$destId]);
        return $stmt->fetchAll();
    }

    public static function getById(int $id): array|false {
        $stmt = getDB()->prepare('SELECT * FROM hebergements WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

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

    public static function delete(int $id): bool {
        $stmt = getDB()->prepare('DELETE FROM hebergements WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public static function isAvailable(int $id, int $nb = 1): bool {
        $stmt = getDB()->prepare('SELECT nb_chambres_dispo FROM hebergements WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row && (int) $row['nb_chambres_dispo'] >= $nb;
    }

    public static function decrementDispo(int $id, int $nb = 1): bool {
        $stmt = getDB()->prepare(
            'UPDATE hebergements SET nb_chambres_dispo = nb_chambres_dispo - ?
             WHERE id = ? AND nb_chambres_dispo >= ?'
        );
        $stmt->execute([$nb, $id, $nb]);
        return $stmt->rowCount() > 0;
    }

    public static function incrementDispo(int $id, int $nb = 1): bool {
        $stmt = getDB()->prepare(
            'UPDATE hebergements SET nb_chambres_dispo = nb_chambres_dispo + ? WHERE id = ?'
        );
        return $stmt->execute([$nb, $id]);
    }
}
