<?php
require_once __DIR__ . '/../config/database.php';

class Notification {

    public static function getByUser(int $userId): array {
        $stmt = getDB()->prepare(
            'SELECT * FROM notifications WHERE utilisateur_id = ? ORDER BY created_at DESC'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function create(int $userId, string $type, string $titre, string $message = ''): int {
        $stmt = getDB()->prepare(
            'INSERT INTO notifications (utilisateur_id, type, titre, message) VALUES (?,?,?,?)'
        );
        $stmt->execute([$userId, $type, $titre, $message]);
        return (int) getDB()->lastInsertId();
    }

    public static function markRead(int $id): bool {
        $stmt = getDB()->prepare('UPDATE notifications SET lu = 1 WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public static function markAllRead(int $userId): bool {
        $stmt = getDB()->prepare('UPDATE notifications SET lu = 1 WHERE utilisateur_id = ?');
        return $stmt->execute([$userId]);
    }

    public static function countUnread(int $userId): int {
        $stmt = getDB()->prepare('SELECT COUNT(*) FROM notifications WHERE utilisateur_id = ? AND lu = 0');
        $stmt->execute([$userId]);
        return (int) $stmt->fetchColumn();
    }
}
