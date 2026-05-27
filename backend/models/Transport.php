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

    /**
     * Recherche avec filtres optionnels.
     * $filters : destination_id, type, compagnie, prix_max, prix_min, places_min, date_trajet (YYYY-MM-DD)
     */
    public static function search(array $filters): array {
        $where  = [];
        $params = [];

        if (!empty($filters['destination_id'])) {
            $where[]  = 'destination_id = ?';
            $params[] = (int) $filters['destination_id'];
        }
        if (!empty($filters['type'])) {
            $where[]  = 'type = ?';
            $params[] = $filters['type'];
        }
        if (!empty($filters['compagnie'])) {
            $where[]  = 'LOWER(compagnie) LIKE ?';
            $params[] = '%' . strtolower($filters['compagnie']) . '%';
        }
        if (isset($filters['prix_min']) && $filters['prix_min'] !== '') {
            $where[]  = 'prix >= ?';
            $params[] = (float) $filters['prix_min'];
        }
        if (isset($filters['prix_max']) && $filters['prix_max'] !== '') {
            $where[]  = 'prix <= ?';
            $params[] = (float) $filters['prix_max'];
        }
        if (isset($filters['places_min']) && $filters['places_min'] !== '') {
            $where[]  = 'places_dispo >= ?';
            $params[] = (int) $filters['places_min'];
        }
        // Exclut les transports complets (0 place)
        $where[] = 'places_dispo > 0';

        $sql = 'SELECT * FROM transports';
        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' ORDER BY prix ASC';

        $stmt = getDB()->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function create(array $data): int {
        $stmt = getDB()->prepare(
            'INSERT INTO transports
               (destination_id, type, compagnie, depart, arrivee, duree, horaire, prix, places_dispo)
             VALUES (?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $data['destination_id'] ?? null,
            $data['type']           ?? 'avion',
            $data['compagnie']      ?? '',
            $data['depart'],
            $data['arrivee'],
            $data['duree']          ?? '',
            $data['horaire']        ?? '',
            $data['prix'],
            $data['places_dispo']   ?? 50,
        ]);
        return (int) getDB()->lastInsertId();
    }

    public static function delete(int $id): bool {
        $stmt = getDB()->prepare('DELETE FROM transports WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public static function isAvailable(int $id, int $nb = 1): bool {
        $stmt = getDB()->prepare('SELECT places_dispo FROM transports WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row && (int) $row['places_dispo'] >= $nb;
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
