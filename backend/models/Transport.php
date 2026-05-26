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
}
