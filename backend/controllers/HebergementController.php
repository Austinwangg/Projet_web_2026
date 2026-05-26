<?php
require_once __DIR__ . '/../models/Hebergement.php';

class HebergementController {
    public static function handle(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $id     = isset($_GET['id']) ? (int) $_GET['id'] : null;

        switch ($method) {
            case 'GET':
                $data = $id ? Hebergement::getById($id) : Hebergement::getAll();
                echo json_encode($data, JSON_UNESCAPED_UNICODE);
                break;

            case 'POST':
                $data  = json_decode(file_get_contents('php://input'), true);
                $newId = Hebergement::create($data);
                http_response_code(201);
                echo json_encode(['id' => $newId, 'message' => 'Hébergement créé'], JSON_UNESCAPED_UNICODE);
                break;

            case 'DELETE':
                if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requis']); break; }
                Hebergement::delete($id);
                echo json_encode(['message' => 'Hébergement supprimé'], JSON_UNESCAPED_UNICODE);
                break;

            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
    }
}
