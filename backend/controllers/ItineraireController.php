<?php
require_once __DIR__ . '/../models/Itineraire.php';

class ItineraireController {

    public static function handle(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $id     = isset($_GET['id'])      ? (int) $_GET['id']      : null;
        $userId = isset($_GET['user_id']) ? (int) $_GET['user_id'] : null;

        header('Content-Type: application/json; charset=utf-8');

        switch ($method) {
            case 'GET':
                if ($id) {
                    $item = Itineraire::getById($id);
                    echo json_encode($item ?: ['error' => 'Non trouvé'], JSON_UNESCAPED_UNICODE);
                } elseif ($userId) {
                    echo json_encode(Itineraire::getByUser($userId), JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'user_id ou id requis']);
                }
                break;

            case 'POST':
                $data  = json_decode(file_get_contents('php://input'), true);
                if (empty($data['utilisateur_id'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'utilisateur_id requis']);
                    break;
                }
                $newId = Itineraire::create($data);
                http_response_code(201);
                $full = Itineraire::getById($newId);
                echo json_encode($full, JSON_UNESCAPED_UNICODE);
                break;

            case 'PUT':
                if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requis']); break; }
                $data = json_decode(file_get_contents('php://input'), true);
                Itineraire::update($id, $data);
                $full = Itineraire::getById($id);
                echo json_encode($full, JSON_UNESCAPED_UNICODE);
                break;

            case 'DELETE':
                if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requis']); break; }
                Itineraire::delete($id);
                echo json_encode(['message' => 'Itinéraire supprimé'], JSON_UNESCAPED_UNICODE);
                break;

            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
    }
}
