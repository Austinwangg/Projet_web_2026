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
                    echo json_encode(['available' => Transport::isAvailable($checkDispo)], JSON_UNESCAPED_UNICODE);
                } elseif ($id) {
                    echo json_encode(Transport::getById($id) ?: ['error'=>'Non trouvé'], JSON_UNESCAPED_UNICODE);
                } elseif ($destId) {
                    echo json_encode(Transport::getByDest($destId), JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(Transport::getAll(), JSON_UNESCAPED_UNICODE);
                }
                break;
            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);
                $newId = Transport::create($data);
                http_response_code(201);
                echo json_encode(['id'=>$newId, 'message'=>'Transport créé'], JSON_UNESCAPED_UNICODE);
                break;
            case 'DELETE':
                if (!$id) { http_response_code(400); echo json_encode(['error'=>'ID requis']); break; }
                Transport::delete($id);
                echo json_encode(['message'=>'Transport supprimé'], JSON_UNESCAPED_UNICODE);
                break;
            default:
                http_response_code(405);
                echo json_encode(['error'=>'Méthode non autorisée']);
        }
    }
}
