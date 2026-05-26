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
}
