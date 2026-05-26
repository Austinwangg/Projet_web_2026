<?php
require_once __DIR__ . '/../models/Destination.php';

class DestinationController {

    public static function handle(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $id     = isset($_GET['id'])   ? (int)    $_GET['id']   : null;
        $slug   = isset($_GET['slug']) ? (string) $_GET['slug'] : null;

        header('Content-Type: application/json; charset=utf-8');

        switch ($method) {
            case 'GET':
                if ($id) {
                    $item = Destination::getById($id);
                    echo json_encode($item ?: ['error' => 'Non trouvé'], JSON_UNESCAPED_UNICODE);
                } elseif ($slug) {
                    $item = Destination::getBySlug($slug);
                    echo json_encode($item ?: ['error' => 'Non trouvé'], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(Destination::getAll(), JSON_UNESCAPED_UNICODE);
                }
                break;

            case 'POST':
                $data  = json_decode(file_get_contents('php://input'), true);
                $newId = Destination::create($data);
                http_response_code(201);
                echo json_encode(['id' => $newId, 'message' => 'Destination créée'], JSON_UNESCAPED_UNICODE);
                break;

            case 'PUT':
                if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requis']); break; }
                $data = json_decode(file_get_contents('php://input'), true);
                Destination::update($id, $data);
                echo json_encode(['message' => 'Destination mise à jour'], JSON_UNESCAPED_UNICODE);
                break;

            case 'DELETE':
                if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requis']); break; }
                Destination::delete($id);
                echo json_encode(['message' => 'Destination supprimée'], JSON_UNESCAPED_UNICODE);
                break;

            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
    }
}
