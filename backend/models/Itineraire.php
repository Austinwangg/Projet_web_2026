<?php
require_once __DIR__ . '/../config/database.php';

class Itineraire {

    public static function getByUser(int $userId): array {
        $stmt = getDB()->prepare(
            'SELECT i.*, d.ville, d.pays_fr, d.pays_en, d.slug
             FROM itineraires i
             LEFT JOIN destinations d ON d.id = i.destination_id
             WHERE i.utilisateur_id = ?
             ORDER BY i.updated_at DESC'
        );
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$row) {
            $row['items'] = self::getItems((int) $row['id']);
        }
        return $rows;
    }

    public static function getById(int $id): array|false {
        $stmt = getDB()->prepare(
            'SELECT i.*, d.ville, d.pays_fr, d.pays_en, d.slug
             FROM itineraires i
             LEFT JOIN destinations d ON d.id = i.destination_id
             WHERE i.id = ?'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) {
            $row['items'] = self::getItems($id);
        }
        return $row;
    }

    public static function getItems(int $itineraireId): array {
        $stmt = getDB()->prepare(
            'SELECT * FROM itineraire_items WHERE itineraire_id = ? ORDER BY position, id'
        );
        $stmt->execute([$itineraireId]);
        return $stmt->fetchAll();
    }

    public static function create(array $data): int {
        $db = getDB();
        $stmt = $db->prepare(
            'INSERT INTO itineraires
               (utilisateur_id, nom, destination_id, date_depart, date_retour, nb_voyageurs, statut)
             VALUES (?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $data['utilisateur_id'],
            $data['nom']            ?? 'Mon itinéraire',
            $data['destination_id'] ?? null,
            $data['date_depart']    ?? null,
            $data['date_retour']    ?? null,
            $data['nb_voyageurs']   ?? 2,
            $data['statut']         ?? 'brouillon',
        ]);
        $itineraireId = (int) $db->lastInsertId();

        if (!empty($data['items']) && is_array($data['items'])) {
            self::replaceItems($itineraireId, $data['items']);
        }

        return $itineraireId;
    }

    public static function update(int $id, array $data): bool {
        $db = getDB();
        $fields = [];
        $values = [];

        $allowed = ['nom', 'destination_id', 'date_depart', 'date_retour', 'nb_voyageurs', 'statut'];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $data)) {
                $fields[] = "$f = ?";
                $values[] = $data[$f];
            }
        }

        if (!empty($fields)) {
            $values[] = $id;
            $db->prepare('UPDATE itineraires SET ' . implode(', ', $fields) . ' WHERE id = ?')
               ->execute($values);
        }

        if (array_key_exists('items', $data) && is_array($data['items'])) {
            self::replaceItems($id, $data['items']);
        }

        return true;
    }

    public static function delete(int $id): bool {
        $stmt = getDB()->prepare('DELETE FROM itineraires WHERE id = ?');
        return $stmt->execute([$id]);
    }

    private static function replaceItems(int $itineraireId, array $items): void {
        $db = getDB();
        $db->prepare('DELETE FROM itineraire_items WHERE itineraire_id = ?')->execute([$itineraireId]);

        $stmt = $db->prepare(
            'INSERT INTO itineraire_items
               (itineraire_id, type, ref_id, titre, sous_titre, prix, icone, date_item, position)
             VALUES (?,?,?,?,?,?,?,?,?)'
        );
        foreach ($items as $pos => $item) {
            $stmt->execute([
                $itineraireId,
                $item['type']      ?? 'autre',
                $item['ref_id']    ?? null,
                $item['titre']     ?? '',
                $item['sous_titre'] ?? null,
                $item['prix']      ?? 0,
                $item['icone']     ?? '◇',
                $item['date_item'] ?? null,
                $pos,
            ]);
        }
    }
}
