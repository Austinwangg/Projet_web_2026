<?php
require_once __DIR__ . '/../config/database.php';

class Destination {

    public static function getAll(): array {
        $stmt = getDB()->query(
            'SELECT id, slug, ville, pays_fr, pays_en, type, types_json,
                    note, nb_avis, duree_jours, prix_depuis,
                    tag_fr, tag_en, resume_fr, resume_en, image_url
             FROM destinations ORDER BY ville ASC'
        );
        return $stmt->fetchAll();
    }

    public static function getById(int $id): array|false {
        $stmt = getDB()->prepare(
            'SELECT d.*,
               (SELECT JSON_ARRAYAGG(
                 JSON_OBJECT("id", h.id, "nom", h.nom, "quartier", h.quartier,
                             "type", h.type, "prix_nuit", h.prix_nuit,
                             "nb_etoiles", h.nb_etoiles, "note", h.note,
                             "avantage_fr", h.avantage_fr, "avantage_en", h.avantage_en,
                             "image_url", h.image_url))
                FROM hebergements h WHERE h.destination_id = d.id) AS hebergements,
               (SELECT JSON_ARRAYAGG(
                 JSON_OBJECT("id", a.id, "nom_fr", a.nom_fr, "nom_en", a.nom_en,
                             "categorie", a.categorie, "duree", a.duree, "prix", a.prix))
                FROM activites a WHERE a.destination_id = d.id) AS activites,
               (SELECT JSON_ARRAYAGG(
                 JSON_OBJECT("id", t.id, "type", t.type, "compagnie", t.compagnie,
                             "depart", t.depart, "arrivee", t.arrivee,
                             "duree", t.duree, "horaire", t.horaire, "prix", t.prix))
                FROM transports t WHERE t.destination_id = d.id) AS transports
             FROM destinations d WHERE d.id = ?'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) {
            $row['hebergements'] = json_decode($row['hebergements'] ?? '[]', true);
            $row['activites']    = json_decode($row['activites']    ?? '[]', true);
            $row['transports']   = json_decode($row['transports']   ?? '[]', true);
        }
        return $row;
    }

    public static function getBySlug(string $slug): array|false {
        $stmt = getDB()->prepare('SELECT id FROM destinations WHERE slug = ?');
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        return $row ? self::getById((int) $row['id']) : false;
    }

    public static function create(array $data): int {
        $stmt = getDB()->prepare(
            'INSERT INTO destinations
               (slug, ville, pays_fr, pays_en, type, types_json,
                note, nb_avis, duree_jours, prix_depuis,
                tag_fr, tag_en, resume_fr, resume_en, image_url)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            $data['slug']        ?? '',
            $data['ville']       ?? '',
            $data['pays_fr']     ?? '',
            $data['pays_en']     ?? '',
            $data['type']        ?? 'ville',
            isset($data['types_json']) ? json_encode($data['types_json']) : '[]',
            $data['note']        ?? 4.5,
            $data['nb_avis']     ?? 0,
            $data['duree_jours'] ?? 7,
            $data['prix_depuis'] ?? 0,
            $data['tag_fr']      ?? '',
            $data['tag_en']      ?? '',
            $data['resume_fr']   ?? '',
            $data['resume_en']   ?? '',
            $data['image_url']   ?? '',
        ]);
        return (int) getDB()->lastInsertId();
    }

    public static function update(int $id, array $data): bool {
        $stmt = getDB()->prepare(
            'UPDATE destinations SET
               slug=?, ville=?, pays_fr=?, pays_en=?, type=?,
               note=?, nb_avis=?, duree_jours=?, prix_depuis=?,
               tag_fr=?, tag_en=?, resume_fr=?, resume_en=?, image_url=?
             WHERE id=?'
        );
        return $stmt->execute([
            $data['slug']        ?? '',
            $data['ville']       ?? '',
            $data['pays_fr']     ?? '',
            $data['pays_en']     ?? '',
            $data['type']        ?? 'ville',
            $data['note']        ?? 4.5,
            $data['nb_avis']     ?? 0,
            $data['duree_jours'] ?? 7,
            $data['prix_depuis'] ?? 0,
            $data['tag_fr']      ?? '',
            $data['tag_en']      ?? '',
            $data['resume_fr']   ?? '',
            $data['resume_en']   ?? '',
            $data['image_url']   ?? '',
            $id,
        ]);
    }

    public static function delete(int $id): bool {
        $stmt = getDB()->prepare('DELETE FROM destinations WHERE id = ?');
        return $stmt->execute([$id]);
    }
}
