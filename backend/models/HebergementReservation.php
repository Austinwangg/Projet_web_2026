<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/Hebergement.php';

class HebergementReservation {

    public static function getByUser(int $userId): array {
        $stmt = getDB()->prepare(
            'SELECT rh.*, h.nom AS hotel_nom, h.type AS hotel_type, h.nb_etoiles,
                    h.image_url AS hotel_image, h.prix_nuit, h.quartier,
                    d.ville, d.pays_fr, d.pays_en, d.slug AS dest_slug
             FROM reservations_hebergement rh
             JOIN hebergements h ON h.id = rh.hebergement_id
             JOIN destinations d ON d.id = h.destination_id
             WHERE rh.utilisateur_id = ?
             ORDER BY rh.date_arrivee DESC'
        );
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function getById(int $id): array|false {
        $stmt = getDB()->prepare(
            'SELECT rh.*, h.nom AS hotel_nom, h.type AS hotel_type, h.nb_etoiles,
                    h.image_url AS hotel_image, h.prix_nuit, h.quartier,
                    d.ville, d.pays_fr, d.pays_en, d.slug AS dest_slug
             FROM reservations_hebergement rh
             JOIN hebergements h ON h.id = rh.hebergement_id
             JOIN destinations d ON d.id = h.destination_id
             WHERE rh.id = ?'
        );
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create(array $data): int {
        $today   = new \DateTime('today');
        $arrivee = \DateTime::createFromFormat('Y-m-d', $data['date_arrivee'] ?? '');
        $depart  = \DateTime::createFromFormat('Y-m-d', $data['date_depart']  ?? '');

        if (!$arrivee || !$depart) {
            throw new \InvalidArgumentException('Format de dates invalide (attendu YYYY-MM-DD).');
        }
        if ($arrivee < $today) {
            throw new \InvalidArgumentException("La date d'arrivée ne peut pas être dans le passé.");
        }
        if ($depart <= $arrivee) {
            throw new \InvalidArgumentException('La date de départ doit être postérieure à la date d\'arrivée.');
        }

        $hebergementId = (int) ($data['hebergement_id'] ?? 0);
        if (!$hebergementId) {
            throw new \InvalidArgumentException('ID d\'hébergement manquant.');
        }

        $nbNuits     = $arrivee->diff($depart)->days;
        $nbPersonnes = max(1, (int) ($data['nb_personnes'] ?? 1));

        if (!Hebergement::isAvailable($hebergementId, $nbPersonnes)) {
            $h = Hebergement::getById($hebergementId);
            $dispo = (int) ($h['nb_chambres_dispo'] ?? 0);
            if ($dispo === 0) {
                throw new \RuntimeException('Hébergement complet — aucune chambre disponible.');
            }
            throw new \RuntimeException(
                "Pas assez de chambres disponibles — il reste $dispo chambre" . ($dispo > 1 ? 's' : '') . ", vous en demandez $nbPersonnes."
            );
        }
        $hotel       = Hebergement::getById($hebergementId);
        $montant     = isset($data['montant_total']) && $data['montant_total'] > 0
            ? (float) $data['montant_total']
            : $nbNuits * (float) ($hotel['prix_nuit'] ?? 0);

        $ref = 'VVH-' . strtoupper(substr(uniqid(), -6));

        $stmt = getDB()->prepare(
            'INSERT INTO reservations_hebergement
               (reference, utilisateur_id, hebergement_id, date_arrivee, date_depart,
                nb_personnes, nb_nuits, montant_total, statut)
             VALUES (?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $ref,
            (int) $data['utilisateur_id'],
            $hebergementId,
            $data['date_arrivee'],
            $data['date_depart'],
            $nbPersonnes,
            $nbNuits,
            $montant,
            'confirmee',
        ]);
        $newId = (int) getDB()->lastInsertId();

        Hebergement::decrementDispo($hebergementId, $nbPersonnes);

        return $newId;
    }

    public static function cancel(int $id): bool {
        $res = self::getById($id);
        if (!$res || $res['statut'] === 'annulee') return false;

        $stmt = getDB()->prepare("UPDATE reservations_hebergement SET statut = 'annulee' WHERE id = ?");
        $stmt->execute([$id]);

        Hebergement::incrementDispo((int) $res['hebergement_id'], (int) $res['nb_personnes']);

        return true;
    }
}
