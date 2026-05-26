<?php
require_once __DIR__ . '/../config/database.php';

class Activite {

    public static function getAll(): array {
        $stmt = getDB()->query('SELECT * FROM activites ORDER BY nom ASC');
        return $stmt->fetchAll();
    }

    public static function getById(int $id): array|false {
        $stmt = getDB()->prepare('SELECT * FROM activites WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create(array $data): int {
        $stmt = getDB()->prepare(
            'INSERT INTO activites (destination_id, nom, categorie, prix, description) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['destination_id'],
            $data['nom'],
            $data['categorie'] ?? '',
            $data['prix'] ?? 0,
            $data['description'] ?? '',
        ]);
        return (int) getDB()->lastInsertId();
    }

    public static function delete(int $id): bool {
        $stmt = getDB()->prepare('DELETE FROM activites WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
