<?php
require_once __DIR__ . '/../models/Transport.php';

class TransportController {
    public static function handle(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $id     = isset($_GET['id'])             ? (int) $_GET['id']             : null;
        $destId = isset($_GET['destination_id']) ? (int) $_GET['destination_id'] : null;
        header('Content-Type: application/json; charset=utf-8');

        switch ($method) {
            case 'GET':
                $checkDispo = isset($_GET['check_dispo']) ? (int) $_GET['check_dispo'] : null;

                if ($checkDispo) {
                    $nb = isset($_GET['nb']) ? (int) $_GET['nb'] : 1;
                    echo json_encode(['available' => Transport::isAvailable($checkDispo, $nb)], JSON_UNESCAPED_UNICODE);

                } elseif (isset($_GET['search'])) {
                    // Recherche avec filtres
                    $filters = [];
                    if ($destId) $filters['destination_id'] = $destId;
                    foreach (['type','compagnie','prix_min','prix_max','places_min'] as $k) {
                        if (isset($_GET[$k]) && $_GET[$k] !== '') $filters[$k] = $_GET[$k];
                    }
                    echo json_encode(Transport::search($filters), JSON_UNESCAPED_UNICODE);

                } elseif ($id) {
                    echo json_encode(Transport::getById($id) ?: ['error' => 'Non trouvé'], JSON_UNESCAPED_UNICODE);

                } elseif ($destId) {
                    echo json_encode(Transport::getByDest($destId), JSON_UNESCAPED_UNICODE);

                } else {
                    echo json_encode(Transport::getAll(), JSON_UNESCAPED_UNICODE);
                }
                break;

            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);

                // Décrémentation de places (quand on sélectionne un transport)
                if (!empty($data['action']) && $data['action'] === 'book') {
                    $transportId = (int) ($data['transport_id'] ?? 0);
                    $nb          = (int) ($data['nb'] ?? 1);

                    if (!$transportId) {
                        http_response_code(400);
                        echo json_encode(['error' => 'transport_id requis']);
                        break;
                    }
                    if (!Transport::isAvailable($transportId, $nb)) {
                        http_response_code(409);
                        echo json_encode(['error' => 'Plus assez de places disponibles.'], JSON_UNESCAPED_UNICODE);
                        break;
                    }
                    Transport::decrementPlaces($transportId, $nb);
                    echo json_encode(['message' => 'Places réservées', 'transport_id' => $transportId], JSON_UNESCAPED_UNICODE);
                    break;
                }

                // Création d'un transport (admin)
                $newId = Transport::create($data);
                http_response_code(201);
                echo json_encode(['id' => $newId, 'message' => 'Transport créé'], JSON_UNESCAPED_UNICODE);
                break;

            case 'PUT':
                // Annulation d'un transport réservé → restitue les places
                if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requis']); break; }
                $data = json_decode(file_get_contents('php://input'), true);
                $nb   = (int) ($data['nb'] ?? 1);
                Transport::incrementPlaces($id, $nb);
                echo json_encode(['message' => 'Places restituées'], JSON_UNESCAPED_UNICODE);
                break;

            case 'DELETE':
                if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requis']); break; }
                Transport::delete($id);
                echo json_encode(['message' => 'Transport supprimé'], JSON_UNESCAPED_UNICODE);
                break;

            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
    }
}
