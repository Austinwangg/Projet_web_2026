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
}
