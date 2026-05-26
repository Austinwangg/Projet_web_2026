<?php
require_once __DIR__ . '/../config/database.php';

/**
 * Modèle Destination – accès aux données de la table `destinations`.
 * Toutes les requêtes SQL passent par des requêtes préparées (protection injection).
 */
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
        $stmt->execute([$data['nom'], $data['pays'], $data['description'], $data['image_url']]);
        return (int) getDB()->lastInsertId();
    }
}
