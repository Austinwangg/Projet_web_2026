<?php
require_once __DIR__ . '/../models/Destination.php';

/**
 * Contrôleur Destinations – gère les requêtes HTTP et délègue au modèle.
 * Retourne toujours du JSON.
 */
class DestinationController {

    public static function handle(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $id     = isset($_GET['id']) ? (int) $_GET['id'] : null;

        switch ($method) {
            case 'GET':
                if ($id) {
                    $item = Destination::getById($id);
                    echo json_encode($item ?: ['error' => 'Non trouvé'], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(Destination::getAll(), JSON_UNESCAPED_UNICODE);
                }
                break;

            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);
                $newId = Destination::create($data);
                http_response_code(201);
                echo json_encode(['id' => $newId, 'message' => 'Destination créée']);
                break;

            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
    }
}
