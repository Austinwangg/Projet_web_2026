<?php
require_once __DIR__ . '/../models/Reservation.php';

class ReservationController {

    public static function handle(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $id     = isset($_GET['id']) ? (int) $_GET['id'] : null;

        switch ($method) {
            case 'GET':
                if ($id) {
                    $item = Reservation::getById($id);
                    echo json_encode($item ?: ['error' => 'Non trouvé'], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(Reservation::getAll(), JSON_UNESCAPED_UNICODE);
                }
                break;

            case 'POST':
                $data  = json_decode(file_get_contents('php://input'), true);
                $newId = Reservation::create($data);
                http_response_code(201);
                echo json_encode(['id' => $newId, 'message' => 'Réservation créée']);
                break;

            case 'PUT':
                $data = json_decode(file_get_contents('php://input'), true);
                Reservation::update($id, $data);
                echo json_encode(['message' => 'Réservation mise à jour']);
                break;

            case 'DELETE':
                Reservation::delete($id);
                echo json_encode(['message' => 'Réservation supprimée']);
                break;

            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
    }
}
