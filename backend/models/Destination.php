<?php
require_once __DIR__ . '/../config/database.php';

class Destination {

    public static function getAll(): array {
        $stmt = getDB()->query('SELECT * FROM destinations ORDER BY nom ASC');
        return $stmt->fetchAll();
    }

    public static function getById(int $id): array|false {
        $stmt = getDB()->prepare('SELECT * FROM destinations WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create(array $data): int {
        $stmt = getDB()->prepare(
            'INSERT INTO destinations (nom, pays, description, image_url) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$data['nom'], $data['pays'], $data['description'] ?? '', $data['image_url'] ?? '']);
        return (int) getDB()->lastInsertId();
    }

    public static function update(int $id, array $data): bool {
        $stmt = getDB()->prepare(
            'UPDATE destinations SET nom = ?, pays = ?, description = ?, image_url = ? WHERE id = ?'
        );
        return $stmt->execute([$data['nom'], $data['pays'], $data['description'] ?? '', $data['image_url'] ?? '', $id]);
    }

    public static function delete(int $id): bool {
        $stmt = getDB()->prepare('DELETE FROM destinations WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
