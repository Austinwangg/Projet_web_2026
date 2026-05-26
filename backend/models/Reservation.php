<?php
require_once __DIR__ . '/../config/database.php';

class Reservation {

    public static function getAll(): array {
        $stmt = getDB()->query('SELECT * FROM reservations ORDER BY date_depart DESC');
        return $stmt->fetchAll();
    }

    public static function getById(int $id): array|false {
        $stmt = getDB()->prepare('SELECT * FROM reservations WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create(array $data): int {
        $stmt = getDB()->prepare(
            'INSERT INTO reservations (utilisateur_id, destination_id, date_depart, date_retour, statut)
             VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['utilisateur_id'],
            $data['destination_id'],
            $data['date_depart'],
            $data['date_retour'],
            $data['statut'] ?? 'en_attente',
        ]);
        return (int) getDB()->lastInsertId();
    }

    public static function update(int $id, array $data): bool {
        $stmt = getDB()->prepare(
            'UPDATE reservations SET statut = ? WHERE id = ?'
        );
        return $stmt->execute([$data['statut'], $id]);
    }

    public static function delete(int $id): bool {
        $stmt = getDB()->prepare('DELETE FROM reservations WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
