<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/Hebergement.php';
require_once __DIR__ . '/Activite.php';
require_once __DIR__ . '/Transport.php';

class Reservation {

    // Retourne toutes les réservations avec destination et transport joints
    public static function getAll(): array {
        $stmt = getDB()->query(
            'SELECT r.*, d.slug, d.ville, d.pays_fr, d.pays_en, d.image_url AS dest_image,
                    t.compagnie, t.type AS transport_type, t.depart AS transport_depart, t.arrivee AS transport_arrivee
             FROM reservations r
             JOIN destinations d ON d.id = r.destination_id
             LEFT JOIN transports t ON t.id = r.transport_id
             ORDER BY r.date_depart DESC'
        );
        return $stmt->fetchAll();
    }

    // Retourne toutes les réservations d'un utilisateur, les plus récentes en premier
    public static function getByUser(int $userId): array {
        $stmt = getDB()->prepare(
            'SELECT r.*, d.slug, d.ville, d.pays_fr, d.pays_en, d.image_url AS dest_image,
                    t.compagnie, t.type AS transport_type, t.depart AS transport_depart, t.arrivee AS transport_arrivee
             FROM reservations r
             JOIN destinations d ON d.id = r.destination_id
             LEFT JOIN transports t ON t.id = r.transport_id
             WHERE r.utilisateur_id = ?
             ORDER BY r.date_depart DESC'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    // Retourne une réservation par son id, ou false si inexistante
    public static function getById(int $id): array|false {
        $stmt = getDB()->prepare(
            'SELECT r.*, d.slug, d.ville, d.pays_fr, d.pays_en, d.image_url AS dest_image,
                    t.compagnie, t.type AS transport_type, t.depart AS transport_depart, t.arrivee AS transport_arrivee
             FROM reservations r
             JOIN destinations d ON d.id = r.destination_id
             LEFT JOIN transports t ON t.id = r.transport_id
             WHERE r.id = ?'
        );
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    // Valide que les dates sont cohérentes (non passées, retour après départ, max 365 jours)
    public static function validateDates(string $dateDepart, string $dateRetour): ?string {
        $today  = new \DateTime('today');
        $depart = \DateTime::createFromFormat('Y-m-d', $dateDepart);
        $retour = \DateTime::createFromFormat('Y-m-d', $dateRetour);

        if (!$depart || !$retour) {
            return 'Format de dates invalide (attendu YYYY-MM-DD).';
        }
        if ($depart < $today) {
            return 'La date de départ ne peut pas être dans le passé.';
        }
        if ($retour <= $depart) {
            return 'La date de retour doit être postérieure à la date de départ.';
        }
        $diff = $depart->diff($retour)->days;
        if ($diff > 365) {
            return 'La durée du séjour ne peut pas dépasser 365 jours.';
        }
        return null; // null = pas d'erreur
    }

    // Crée une réservation voyage complète (destination + transport + hébergement + activités)
    // Décrémente les stocks transport et hébergement, puis enregistre les activités.
    public static function create(array $data): int {
        // Validation des dates avant tout
        $errDates = self::validateDates($data['date_depart'] ?? '', $data['date_retour'] ?? '');
        if ($errDates) {
            throw new \InvalidArgumentException($errDates);
        }

        $hebergementId = !empty($data['hebergement_id']) ? (int) $data['hebergement_id'] : null;
        $transportId   = !empty($data['transport_id'])   ? (int) $data['transport_id']   : null;
        $nbVoyageurs   = (int) ($data['nb_voyageurs'] ?? 1);

        // Vérifie la disponibilité de l'hébergement et du transport avant insertion
        if ($hebergementId && !Hebergement::isAvailable($hebergementId, $nbVoyageurs)) {
            throw new \RuntimeException('Hébergement complet — aucune chambre disponible.');
        }
        if ($transportId && !Transport::isAvailable($transportId, $nbVoyageurs)) {
            throw new \RuntimeException('Transport complet — plus assez de places disponibles.');
        }

        // Génère une référence unique au format VV-XXXXXXX
        $ref = 'VV-' . strtoupper(substr(uniqid(), -7));
        $stmt = getDB()->prepare(
            'INSERT INTO reservations
               (reference, utilisateur_id, destination_id, hebergement_id, transport_id,
                date_depart, date_retour, nb_voyageurs, montant_total, statut)
             VALUES (?,?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $ref,
            $data['utilisateur_id'],
            $data['destination_id'],
            $hebergementId,
            $transportId,
            $data['date_depart'],
            $data['date_retour'],
            $nbVoyageurs,
            $data['montant_total'] ?? 0,
            $data['statut']        ?? 'confirmee',
        ]);
        $newId = (int) getDB()->lastInsertId();

        // Décrémente les stocks selon ce qui a été réservé
        if ($hebergementId) {
            Hebergement::decrementDispo($hebergementId, $nbVoyageurs);
        }
        if ($transportId) {
            Transport::decrementPlaces($transportId, $nbVoyageurs);
            self::logTransport($newId, $transportId, $nbVoyageurs, $data['date_depart']);
        }

        return $newId;
    }

    // Enregistre le transport utilisé dans la table d'historique (peut échouer silencieusement
    // si la table n'existe pas encore sur les anciennes bases de données)
    private static function logTransport(int $resId, int $transId, int $nb, string $date): void {
        try {
            $stmt = getDB()->prepare(
                'INSERT IGNORE INTO reservation_transports (reservation_id, transport_id, nb_places, date_trajet)
                 VALUES (?,?,?,?)'
            );
            $stmt->execute([$resId, $transId, $nb, $date]);
        } catch (\Throwable $e) { /* silently skip if table doesn't exist */ }
    }

    // Associe des activités à une réservation existante et décrémente les places de chaque activité
    public static function addActivites(int $reservationId, array $activiteIds, int $nbVoyageurs = 1): void {
        $stmt = getDB()->prepare(
            'INSERT INTO reservation_activites (reservation_id, activite_id, nb_places) VALUES (?,?,?)'
        );
        foreach ($activiteIds as $activiteId) {
            $activiteId = (int) $activiteId;
            if (!Activite::isAvailable($activiteId)) continue; // ignore si complet
            $stmt->execute([$reservationId, $activiteId, $nbVoyageurs]);
            Activite::decrementPlaces($activiteId, $nbVoyageurs);
        }
    }

    // Retourne les activités liées à une réservation (avec nom et prix)
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

    // Met à jour les champs modifiables d'une réservation (statut, dates, voyageurs, montant, transport)
    public static function update(int $id, array $data): bool {
        // Revalide les dates si elles sont modifiées
        if (isset($data['date_depart']) && isset($data['date_retour'])) {
            $errDates = self::validateDates($data['date_depart'], $data['date_retour']);
            if ($errDates) {
                throw new \InvalidArgumentException($errDates);
            }
        }

        $fields = [];
        $params = [];

        // Construit dynamiquement la clause SET selon les champs fournis
        if (isset($data['statut']))        { $fields[] = 'statut = ?';        $params[] = $data['statut']; }
        if (isset($data['date_depart']))   { $fields[] = 'date_depart = ?';   $params[] = $data['date_depart']; }
        if (isset($data['date_retour']))   { $fields[] = 'date_retour = ?';   $params[] = $data['date_retour']; }
        if (isset($data['nb_voyageurs']))  { $fields[] = 'nb_voyageurs = ?';  $params[] = (int) $data['nb_voyageurs']; }
        if (isset($data['montant_total'])) { $fields[] = 'montant_total = ?'; $params[] = $data['montant_total']; }
        if (array_key_exists('transport_id', $data)) {
            $fields[] = 'transport_id = ?';
            $params[] = $data['transport_id'] ? (int) $data['transport_id'] : null;
        }

        if (empty($fields)) return false; // rien à mettre à jour

        $params[] = $id;
        $stmt = getDB()->prepare('UPDATE reservations SET ' . implode(', ', $fields) . ' WHERE id = ?');
        return $stmt->execute($params);
    }

    // Annule une réservation et restitue toutes les places (hébergement, transport, activités)
    public static function cancel(int $id): bool {
        $res = self::getById($id);
        if (!$res || $res['statut'] === 'annulee') return false;

        $stmt = getDB()->prepare("UPDATE reservations SET statut = 'annulee' WHERE id = ?");
        $stmt->execute([$id]);

        // Restitue les places hébergement et transport
        if (!empty($res['hebergement_id'])) {
            Hebergement::incrementDispo((int) $res['hebergement_id'], (int) $res['nb_voyageurs']);
        }
        if (!empty($res['transport_id'])) {
            Transport::incrementPlaces((int) $res['transport_id'], (int) $res['nb_voyageurs']);
        }

        // Restitue les places de chaque activité liée
        $activites = self::getActivites($id);
        foreach ($activites as $a) {
            Activite::incrementPlaces((int) $a['activite_id'], (int) $a['nb_places']);
        }

        return true;
    }

    // Retire une activité spécifique d'une réservation et restitue ses places
    public static function cancelActivite(int $reservationId, int $activiteId): void {
        $stmt = getDB()->prepare(
            'SELECT nb_places FROM reservation_activites WHERE reservation_id = ? AND activite_id = ?'
        );
        $stmt->execute([$reservationId, $activiteId]);
        $row = $stmt->fetch();
        if (!$row) {
            throw new \InvalidArgumentException('Activité non trouvée dans cette réservation.');
        }
        $nb = (int) $row['nb_places'];

        $del = getDB()->prepare(
            'DELETE FROM reservation_activites WHERE reservation_id = ? AND activite_id = ?'
        );
        $del->execute([$reservationId, $activiteId]);

        // Restitue les places de l'activité
        Activite::incrementPlaces($activiteId, $nb);
    }

    // Supprime définitivement une réservation (admin uniquement)
    public static function delete(int $id): bool {
        $stmt = getDB()->prepare('DELETE FROM reservations WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
