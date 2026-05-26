<?php
require_once __DIR__ . '/../config/database.php';

class Reservation {

    public static function getAll(): array {
        $stmt = getDB()->query(
            'SELECT r.*, d.slug, d.ville, d.pays_fr, d.pays_en, d.image_url AS dest_image
             FROM reservations r
             JOIN destinations d ON d.id = r.destination_id
             ORDER BY r.date_depart DESC'
        );
        return $stmt->fetchAll();
    }

    public static function getByUser(int $userId): array {
        $stmt = getDB()->prepare(
            'SELECT r.*, d.slug, d.ville, d.pays_fr, d.pays_en, d.image_url AS dest_image
             FROM reservations r
             JOIN destinations d ON d.id = r.destination_id
             WHERE r.utilisateur_id = ?
             ORDER BY r.date_depart DESC'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function getById(int $id): array|false {
        $stmt = getDB()->prepare(
            'SELECT r.*, d.slug, d.ville, d.pays_fr, d.pays_en, d.image_url AS dest_image
             FROM reservations r
             JOIN destinations d ON d.id = r.destination_id
             WHERE r.id = ?'
        );
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create(array $data): int {
        // Génère une référence unique VV-XXXXXXX
        $ref = 'VV-' . strtoupper(substr(uniqid(), -7));
        $stmt = getDB()->prepare(
            'INSERT INTO reservations
               (reference, utilisateur_id, destination_id,
                date_depart, date_retour, nb_voyageurs, montant_total, statut)
             VALUES (?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $ref,
            $data['utilisateur_id'],
            $data['destination_id'],
            $data['date_depart'],
            $data['date_retour'],
            $data['nb_voyageurs']  ?? 1,
            $data['montant_total'] ?? 0,
            $data['statut']        ?? 'en_attente',
        ]);
        return (int) getDB()->lastInsertId();
    }

    public static function update(int $id, array $data): bool {
        $stmt = getDB()->prepare('UPDATE reservations SET statut=? WHERE id=?');
        return $stmt->execute([$data['statut'], $id]);
    }

    public static function delete(int $id): bool {
        $stmt = getDB()->prepare('DELETE FROM reservations WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
