<?php
require_once __DIR__ . '/../config/database.php';

class AdminController {

    public static function handle(): void {
        $method   = $_SERVER['REQUEST_METHOD'];
        $resource = $_GET['resource'] ?? '';

        header('Content-Type: application/json; charset=utf-8');

        switch ($resource) {
            case 'users':
                self::handleUsers($method);
                break;
            default:
                http_response_code(400);
                echo json_encode(['error' => 'resource invalide (users)']);
        }
    }

    private static function handleUsers(string $method): void {
        $id = isset($_GET['id']) ? (int) $_GET['id'] : null;

        switch ($method) {
            case 'GET':
                $stmt = getDB()->query(
                    'SELECT id, nom, prenom, email, role, created_at FROM utilisateurs ORDER BY created_at DESC'
                );
                echo json_encode($stmt->fetchAll(), JSON_UNESCAPED_UNICODE);
                break;

            case 'PUT':
                // Modifier le rôle d'un utilisateur (admin <-> user)
                if (!$id) { http_response_code(400); echo json_encode(['error' => 'id requis']); return; }
                $data = json_decode(file_get_contents('php://input'), true);
                $role = $data['role'] ?? '';

                if (!in_array($role, ['user', 'admin'], true)) {
                    http_response_code(422);
                    echo json_encode(['error' => 'role invalide (user|admin)']);
                    return;
                }

                getDB()->prepare('UPDATE utilisateurs SET role=? WHERE id=?')->execute([$role, $id]);
                echo json_encode(['message' => 'Rôle mis à jour', 'id' => $id, 'role' => $role], JSON_UNESCAPED_UNICODE);
                break;

            case 'DELETE':
                if (!$id) { http_response_code(400); echo json_encode(['error' => 'id requis']); return; }
                getDB()->prepare('DELETE FROM utilisateurs WHERE id=?')->execute([$id]);
                echo json_encode(['message' => 'Utilisateur supprimé'], JSON_UNESCAPED_UNICODE);
                break;

            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
    }
}
