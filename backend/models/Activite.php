<?php
require_once __DIR__ . '/../config/database.php';

class Activite {

    public static function getAll(): array {
        $stmt = getDB()->query('SELECT * FROM activites ORDER BY nom_fr ASC');
        return $stmt->fetchAll();
    }

    public static function getByDest(int $destId): array {
        $stmt = getDB()->prepare('SELECT * FROM activites WHERE destination_id = ? ORDER BY prix ASC');
        $stmt->execute([$destId]);
        return $stmt->fetchAll();
    }

    public static function getById(int $id): array|false {
        $stmt = getDB()->prepare('SELECT * FROM activites WHERE id = ?');
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
}
