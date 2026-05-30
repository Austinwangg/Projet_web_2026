<?php
require_once __DIR__ . '/../models/Favori.php';

class FavoriController {

    public static function handle(): void {
        $method = $_SERVER['REQUEST_METHOD'];

        // GET /favoris?user_id=X  →  list favorites
        if ($method === 'GET') {
            $userId = isset($_GET['user_id']) ? (int) $_GET['user_id'] : 0;
            if (!$userId) { http_response_code(400); echo json_encode(['error' => 'user_id required']); return; }
            echo json_encode(Favori::getByUser($userId));
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $userId = isset($body['user_id']) ? (int) $body['user_id'] : 0;
        $destinationId = isset($body['destination_id']) ? (int) $body['destination_id'] : 0;

        if (!$userId || !$destinationId) {
            http_response_code(400);
            echo json_encode(['error' => 'user_id and destination_id required']);
            return;
        }

        // POST /favoris  →  toggle (add if absent, remove if present)
        if ($method === 'POST') {
            $added = Favori::toggle($userId, $destinationId);
            echo json_encode(['added' => $added, 'destination_id' => $destinationId]);
            return;
        }

        // DELETE /favoris  →  remove
        if ($method === 'DELETE') {
            Favori::remove($userId, $destinationId);
            echo json_encode(['removed' => true]);
            return;
        }

        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
}
