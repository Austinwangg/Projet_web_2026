<?php
require_once __DIR__ . '/../config/database.php';

class NotificationController {

    public static function handle(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $id     = isset($_GET['id'])      ? (int) $_GET['id']      : null;
        $userId = isset($_GET['user_id']) ? (int) $_GET['user_id'] : null;

        header('Content-Type: application/json; charset=utf-8');

        switch ($method) {
            case 'GET':
                if (!$userId) {
                    http_response_code(400);
                    echo json_encode(['error' => 'user_id requis']);
                    return;
                }
                $stmt = getDB()->prepare(
                    'SELECT * FROM notifications WHERE utilisateur_id = ? ORDER BY created_at DESC'
                );
                $stmt->execute([$userId]);
                echo json_encode($stmt->fetchAll(), JSON_UNESCAPED_UNICODE);
                break;

            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);
                $uid  = (int) ($data['utilisateur_id'] ?? 0);
                $msgFr = trim($data['message_fr'] ?? '');
                $msgEn = trim($data['message_en'] ?? $msgFr);
                $icone = trim($data['icone']      ?? '✦');

                if (!$uid || !$msgFr) {
                    http_response_code(422);
                    echo json_encode(['error' => 'utilisateur_id et message_fr requis']);
                    return;
                }

                $stmt = getDB()->prepare(
                    'INSERT INTO notifications (utilisateur_id, icone, message_fr, message_en) VALUES (?,?,?,?)'
                );
                $stmt->execute([$uid, $icone, $msgFr, $msgEn]);
                $newId = (int) getDB()->lastInsertId();
                http_response_code(201);
                echo json_encode(['id' => $newId, 'message' => 'Notification créée'], JSON_UNESCAPED_UNICODE);
                break;

            case 'PUT':
                // Marquer lu (une ou toutes)
                $data  = json_decode(file_get_contents('php://input'), true);
                $allUid = isset($data['mark_all_read']) ? (int) $data['mark_all_read'] : null;

                if ($allUid) {
                    getDB()->prepare('UPDATE notifications SET lu=1 WHERE utilisateur_id=?')->execute([$allUid]);
                    echo json_encode(['message' => 'Toutes les notifications marquées lues'], JSON_UNESCAPED_UNICODE);
                } elseif ($id) {
                    getDB()->prepare('UPDATE notifications SET lu=1 WHERE id=?')->execute([$id]);
                    echo json_encode(['message' => 'Notification marquée lue'], JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'id ou mark_all_read requis']);
                }
                break;

            case 'DELETE':
                if (!$id) { http_response_code(400); echo json_encode(['error' => 'id requis']); return; }
                getDB()->prepare('DELETE FROM notifications WHERE id=?')->execute([$id]);
                echo json_encode(['message' => 'Notification supprimée'], JSON_UNESCAPED_UNICODE);
                break;

            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
    }
}
