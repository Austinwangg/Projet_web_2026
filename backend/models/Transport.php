<?php
require_once __DIR__ . '/../config/database.php';

class Transport {

    public static function getAll(): array {
        $stmt = getDB()->query('SELECT * FROM transports ORDER BY type ASC');
        return $stmt->fetchAll();
    }

    public static function getById(int $id): array|false {
        $stmt = getDB()->prepare('SELECT * FROM transports WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create(array $data): int {
        $stmt = getDB()->prepare(
            'INSERT INTO transports (type, compagnie, depart, arrivee, prix) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['type'],
            $data['compagnie'] ?? '',
            $data['depart'],
            $data['arrivee'],
            $data['prix'],
        ]);
        return (int) getDB()->lastInsertId();
    }

    public static function delete(int $id): bool {
        $stmt = getDB()->prepare('DELETE FROM transports WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
