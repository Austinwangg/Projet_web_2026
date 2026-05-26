<?php
require_once __DIR__ . '/../models/Hebergement.php';

class HebergementController {
    public static function handle(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $id     = isset($_GET['id']) ? (int) $_GET['id'] : null;

        if ($method === 'GET') {
            $data = $id ? Hebergement::getById($id) : Hebergement::getAll();
            echo json_encode($data, JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Méthode non autorisée']);
        }
    }
}
