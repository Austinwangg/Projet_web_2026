<?php
require_once __DIR__ . '/../config/database.php';

class Transport {

    public static function getAll(): array {
        $stmt = getDB()->query('SELECT * FROM transports ORDER BY prix ASC');
        return $stmt->fetchAll();
    }

    public static function getByDest(int $destId): array {
        $stmt = getDB()->prepare('SELECT * FROM transports WHERE destination_id = ? ORDER BY prix ASC');
        $stmt->execute([$destId]);
        return $stmt->fetchAll();
    }

    public static function getById(int $id): array|false {
        $stmt = getDB()->prepare('SELECT * FROM transports WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create(array $data): int {
        $stmt = getDB()->prepare(
            'INSERT INTO transports
               (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix)
             VALUES (?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $data['destination_id'] ?? null,
            $data['type']     ?? 'avion',
            $data['compagnie'] ?? '',
            $data['depart'],
            $data['arrivee'],
            $data['duree']    ?? '',
            $data['horaire']  ?? '',
            $data['prix'],
        ]);
        return (int) getDB()->lastInsertId();
    }

    public static function delete(int $id): bool {
        $stmt = getDB()->prepare('DELETE FROM transports WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public static function isAvailable(int $id): bool {
        $stmt = getDB()->prepare('SELECT places_dispo FROM transports WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row && (int) $row['places_dispo'] > 0;
    }

    public static function decrementPlaces(int $id, int $nb = 1): bool {
        $stmt = getDB()->prepare(
            'UPDATE transports SET places_dispo = places_dispo - ?
             WHERE id = ? AND places_dispo >= ?'
        );
        $stmt->execute([$nb, $id, $nb]);
        return $stmt->rowCount() > 0;
    }

    public static function incrementPlaces(int $id, int $nb = 1): bool {
        $stmt = getDB()->prepare(
            'UPDATE transports SET places_dispo = places_dispo + ? WHERE id = ?'
        );
        return $stmt->execute([$nb, $id]);
    }
}
