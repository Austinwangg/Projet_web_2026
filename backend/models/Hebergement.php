<?php
require_once __DIR__ . '/../config/database.php';

class Hebergement {

    public static function getAll(): array {
        $stmt = getDB()->query('SELECT * FROM hebergements ORDER BY nom ASC');
        return $stmt->fetchAll();
    }

    public static function getById(int $id): array|false {
        $stmt = getDB()->prepare('SELECT * FROM hebergements WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create(array $data): int {
        $stmt = getDB()->prepare(
            'INSERT INTO hebergements (destination_id, nom, type, prix_nuit, nb_etoiles, image_url)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['destination_id'],
            $data['nom'],
            $data['type'],
            $data['prix_nuit'],
            $data['nb_etoiles'] ?? 3,
            $data['image_url'] ?? '',
        ]);
        return (int) getDB()->lastInsertId();
    }

    public static function delete(int $id): bool {
        $stmt = getDB()->prepare('DELETE FROM hebergements WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
