<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/Hebergement.php';
require_once __DIR__ . '/Activite.php';

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
        $hebergementId = !empty($data['hebergement_id']) ? (int) $data['hebergement_id'] : null;

        if ($hebergementId && !Hebergement::isAvailable($hebergementId)) {
            throw new \RuntimeException('Hébergement complet — aucune chambre disponible.');
        }

        $ref = 'VV-' . strtoupper(substr(uniqid(), -7));
        $stmt = getDB()->prepare(
            'INSERT INTO reservations
               (reference, utilisateur_id, destination_id, hebergement_id,
                date_depart, date_retour, nb_voyageurs, montant_total, statut)
             VALUES (?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $ref,
            $data['utilisateur_id'],
            $data['destination_id'],
            $hebergementId,
            $data['date_depart'],
            $data['date_retour'],
            $data['nb_voyageurs']  ?? 1,
            $data['montant_total'] ?? 0,
            $data['statut']        ?? 'confirmee',
        ]);
        $newId = (int) getDB()->lastInsertId();

        if ($hebergementId) {
            Hebergement::decrementDispo($hebergementId);
        }

        return $newId;
    }

    public static function addActivites(int $reservationId, array $activiteIds, int $nbVoyageurs = 1): void {
        $stmt = getDB()->prepare(
            'INSERT INTO reservation_activites (reservation_id, activite_id, nb_places) VALUES (?,?,?)'
        );
        foreach ($activiteIds as $activiteId) {
            $activiteId = (int) $activiteId;
            if (!Activite::isAvailable($activiteId)) continue;
            $stmt->execute([$reservationId, $activiteId, $nbVoyageurs]);
            Activite::decrementPlaces($activiteId, $nbVoyageurs);
        }
    }

    public static function getActivites(int $reservationId): array {
        $stmt = getDB()->prepare(
            'SELECT ra.*, a.nom_fr, a.nom_en, a.prix
             FROM reservation_activites ra
             JOIN activites a ON a.id = ra.activite_id
             WHERE ra.reservation_id = ?'
        );
        $stmt->execute([$reservationId]);
        return $stmt->fetchAll();
    }

    public static function update(int $id, array $data): bool {
        $fields = [];
        $params = [];

        if (isset($data['statut']))       { $fields[] = 'statut = ?';        $params[] = $data['statut']; }
        if (isset($data['date_depart']))  { $fields[] = 'date_depart = ?';   $params[] = $data['date_depart']; }
        if (isset($data['date_retour']))  { $fields[] = 'date_retour = ?';   $params[] = $data['date_retour']; }
        if (isset($data['nb_voyageurs'])) { $fields[] = 'nb_voyageurs = ?';  $params[] = (int) $data['nb_voyageurs']; }
        if (isset($data['montant_total'])){ $fields[] = 'montant_total = ?'; $params[] = $data['montant_total']; }

        if (empty($fields)) return false;

        $params[] = $id;
        $stmt = getDB()->prepare('UPDATE reservations SET ' . implode(', ', $fields) . ' WHERE id = ?');
        return $stmt->execute($params);
    }

    public static function cancel(int $id): bool {
        $res = self::getById($id);
        if (!$res || $res['statut'] === 'annulee') return false;

        $stmt = getDB()->prepare("UPDATE reservations SET statut = 'annulee' WHERE id = ?");
        $stmt->execute([$id]);

        if (!empty($res['hebergement_id'])) {
            Hebergement::incrementDispo((int) $res['hebergement_id']);
        }

        $activites = self::getActivites($id);
        foreach ($activites as $a) {
            Activite::incrementPlaces((int) $a['activite_id'], (int) $a['nb_places']);
        }

        return true;
    }

    public static function delete(int $id): bool {
        $stmt = getDB()->prepare('DELETE FROM reservations WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
