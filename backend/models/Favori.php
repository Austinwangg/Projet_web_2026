<?php
require_once __DIR__ . '/../config/database.php';

class Favori {

    public static function getByUser(int $userId): array {
        $stmt = getDB()->prepare(
            'SELECT destination_id FROM favoris WHERE utilisateur_id = ?'
        );
        $stmt->execute([$userId]);
        return array_column($stmt->fetchAll(), 'destination_id');
    }

    public static function add(int $userId, int $destinationId): void {
        $stmt = getDB()->prepare(
            'INSERT IGNORE INTO favoris (utilisateur_id, destination_id) VALUES (?, ?)'
        );
        $stmt->execute([$userId, $destinationId]);
    }

    public static function remove(int $userId, int $destinationId): void {
        $stmt = getDB()->prepare(
            'DELETE FROM favoris WHERE utilisateur_id = ? AND destination_id = ?'
        );
        $stmt->execute([$userId, $destinationId]);
    }

    public static function toggle(int $userId, int $destinationId): bool {
        $stmt = getDB()->prepare(
            'SELECT id FROM favoris WHERE utilisateur_id = ? AND destination_id = ?'
        );
        $stmt->execute([$userId, $destinationId]);
        $exists = (bool) $stmt->fetchColumn();
        if ($exists) {
            self::remove($userId, $destinationId);
            return false;
        } else {
            self::add($userId, $destinationId);
            return true;
        }
    }
}
