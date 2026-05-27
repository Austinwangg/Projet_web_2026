<?php
require_once __DIR__ . '/../models/Notification.php';

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
                $notifs = Notification::getByUser($userId);
                $unread = Notification::countUnread($userId);
                echo json_encode(['notifications' => $notifs, 'unread' => $unread], JSON_UNESCAPED_UNICODE);
                break;

            case 'POST':
                $data    = json_decode(file_get_contents('php://input'), true);
                $uId     = (int) ($data['utilisateur_id'] ?? 0);
                $type    = trim($data['type']    ?? 'info');
                $titre   = trim($data['titre']   ?? '');
                $message = trim($data['message'] ?? '');

                if (!$uId || !$titre) {
                    http_response_code(422);
                    echo json_encode(['error' => 'utilisateur_id et titre requis']);
                    return;
                }

                $newId = Notification::create($uId, $type, $titre, $message);
                http_response_code(201);
                echo json_encode(['id' => $newId, 'message' => 'Notification créée'], JSON_UNESCAPED_UNICODE);
                break;

            case 'PUT':
                $data = json_decode(file_get_contents('php://input'), true);

                if ($id) {
                    // Marquer une notification comme lue
                    Notification::markRead($id);
                    echo json_encode(['message' => 'Notification marquée comme lue'], JSON_UNESCAPED_UNICODE);
                } elseif (!empty($data['utilisateur_id']) && ($data['action'] ?? '') === 'mark_all_read') {
                    // Marquer toutes les notifications d'un utilisateur comme lues
                    Notification::markAllRead((int) $data['utilisateur_id']);
                    echo json_encode(['message' => 'Toutes les notifications marquées comme lues'], JSON_UNESCAPED_UNICODE);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'id (query param) ou {utilisateur_id, action:"mark_all_read"} requis']);
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
