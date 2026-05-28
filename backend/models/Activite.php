<?php
require_once __DIR__ . '/../config/database.php';

class Activite {

    private static function joinSQL(): string {
        return 'SELECT a.*, d.pays_fr, d.pays_en, d.ville, d.slug, d.image_url AS dest_image_url
                FROM activites a
                LEFT JOIN destinations d ON d.id = a.destination_id';
    }

    public static function getAll(): array {
        $stmt = getDB()->query(self::joinSQL() . ' ORDER BY d.pays_fr ASC, a.nom_fr ASC');
        return $stmt->fetchAll();
    }

    public static function getByDest(int $destId): array {
        $stmt = getDB()->prepare(self::joinSQL() . ' WHERE a.destination_id = ? ORDER BY a.prix ASC');
        $stmt->execute([$destId]);
        return $stmt->fetchAll();
    }

    public static function getById(int $id): array|false {
        $stmt = getDB()->prepare(self::joinSQL() . ' WHERE a.id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create(array $data): int {
        $stmt = getDB()->prepare(
            'INSERT INTO activites
               (destination_id, nom_fr, nom_en, categorie, duree, prix, description_fr, description_en)
             VALUES (?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $data['destination_id'],
            $data['nom_fr']         ?? $data['nom'] ?? '',
            $data['nom_en']         ?? $data['nom'] ?? '',
            $data['categorie']      ?? '',
            $data['duree']          ?? '',
            $data['prix']           ?? 0,
            $data['description_fr'] ?? '',
            $data['description_en'] ?? '',
        ]);
        return (int) getDB()->lastInsertId();
    }

    public static function delete(int $id): bool {
        $stmt = getDB()->prepare('DELETE FROM activites WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public static function isAvailable(int $id): bool {
        $stmt = getDB()->prepare('SELECT places_restantes FROM activites WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row && (int) $row['places_restantes'] > 0;
    }

    public static function decrementPlaces(int $id, int $nb = 1): bool {
        $stmt = getDB()->prepare(
            'UPDATE activites SET places_restantes = places_restantes - ?
             WHERE id = ? AND places_restantes >= ?'
        );
        $stmt->execute([$nb, $id, $nb]);
        return $stmt->rowCount() > 0;
    }

    public static function incrementPlaces(int $id, int $nb = 1): bool {
        $stmt = getDB()->prepare(
            'UPDATE activites SET places_restantes = places_restantes + ? WHERE id = ?'
        );
        return $stmt->execute([$nb, $id]);
    }
}
