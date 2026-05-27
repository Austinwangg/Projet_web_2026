<?php
require_once __DIR__ . '/../models/Activite.php';

class ActiviteController {
    public static function handle(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $id     = isset($_GET['id'])             ? (int) $_GET['id']             : null;
        $destId = isset($_GET['destination_id']) ? (int) $_GET['destination_id'] : null;
        header('Content-Type: application/json; charset=utf-8');

        switch ($method) {
            case 'GET':
                $checkDispo = isset($_GET['check_dispo']) ? (int) $_GET['check_dispo'] : null;
                if ($checkDispo) {
                    echo json_encode(['available' => Activite::isAvailable($checkDispo)], JSON_UNESCAPED_UNICODE);
                } elseif ($id) {
                    echo json_encode(Activite::getById($id) ?: ['error'=>'Non trouvé'], JSON_UNESCAPED_UNICODE);
                } elseif ($destId) {
                    echo json_encode(Activite::getByDest($destId), JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(Activite::getAll(), JSON_UNESCAPED_UNICODE);
                }
                break;
            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);
                $newId = Activite::create($data);
                http_response_code(201);
                echo json_encode(['id'=>$newId, 'message'=>'Activité créée'], JSON_UNESCAPED_UNICODE);
                break;
            case 'DELETE':
                if (!$id) { http_response_code(400); echo json_encode(['error'=>'ID requis']); break; }
                Activite::delete($id);
                echo json_encode(['message'=>'Activité supprimée'], JSON_UNESCAPED_UNICODE);
                break;
            default:
                http_response_code(405);
                echo json_encode(['error'=>'Méthode non autorisée']);
        }
    }
}
