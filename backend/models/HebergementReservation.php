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

        $nbPersonnes = (int) ($data['nb_personnes'] ?? 1);
        $nbNuits     = $arrivee->diff($depart)->days;

        if (!Hebergement::isAvailable($hebergementId, $nbPersonnes)) {
            throw new \RuntimeException("Pas assez de places disponibles pour {$nbPersonnes} personne(s).");
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

    public static function update(int $id, array $data): bool {
        $res = self::getById($id);
        if (!$res || $res['statut'] === 'annulee') return false;

        $arrivee = \DateTime::createFromFormat('Y-m-d', $data['date_arrivee'] ?? $res['date_arrivee']);
        $depart  = \DateTime::createFromFormat('Y-m-d', $data['date_depart']  ?? $res['date_depart']);
        if (!$arrivee || !$depart || $depart <= $arrivee) {
            throw new \InvalidArgumentException('Dates invalides.');
        }

        $nbPersonnes = (int) ($data['nb_personnes'] ?? $res['nb_personnes']);
        $nbNuits     = $arrivee->diff($depart)->days;
        $hotel       = Hebergement::getById((int) $res['hebergement_id']);
        $montant     = $nbNuits * (float) ($hotel['prix_nuit'] ?? 0) * $nbPersonnes;

        $diffPersonnes = $nbPersonnes - (int) $res['nb_personnes'];
        if ($diffPersonnes > 0 && !Hebergement::isAvailable((int) $res['hebergement_id'], $diffPersonnes)) {
            throw new \RuntimeException("Pas assez de places disponibles.");
        }
        if ($diffPersonnes > 0) Hebergement::decrementDispo((int) $res['hebergement_id'], $diffPersonnes);
        if ($diffPersonnes < 0) Hebergement::incrementDispo((int) $res['hebergement_id'], abs($diffPersonnes));

        $stmt = getDB()->prepare(
            'UPDATE reservations_hebergement
             SET date_arrivee = ?, date_depart = ?, nb_personnes = ?, nb_nuits = ?, montant_total = ?
             WHERE id = ?'
        );
        return $stmt->execute([$data['date_arrivee'] ?? $res['date_arrivee'], $data['date_depart'] ?? $res['date_depart'], $nbPersonnes, $nbNuits, $montant, $id]);
    }

    public static function cancel(int $id): bool {
        $res = self::getById($id);
        if (!$res || $res['statut'] === 'annulee') return false;

        $stmt = getDB()->prepare("UPDATE reservations_hebergement SET statut = 'annulee' WHERE id = ?");
        $stmt->execute([$id]);

        $nbPersonnes = (int) ($res['nb_personnes'] ?? 1);
        Hebergement::incrementDispo((int) $res['hebergement_id'], $nbPersonnes);

        return true;
    }
}
