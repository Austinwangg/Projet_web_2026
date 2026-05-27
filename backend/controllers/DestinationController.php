<?php
require_once __DIR__ . '/../models/Destination.php';

class DestinationController {

    /** Vérifie qu'un header X-User-Role: admin est présent. */
    private static function requireAdmin(): bool {
        $role = $_SERVER['HTTP_X_USER_ROLE'] ?? '';
        if ($role !== 'admin') {
            http_response_code(403);
            echo json_encode(['error' => 'Accès réservé aux administrateurs'], JSON_UNESCAPED_UNICODE);
            return false;
        }
        return true;
    }

    public static function handle(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $id     = isset($_GET['id'])   ? (int)    $_GET['id']   : null;
        $slug   = isset($_GET['slug']) ? (string) $_GET['slug'] : null;

        header('Content-Type: application/json; charset=utf-8');

        switch ($method) {
            case 'GET':
                if ($id) {
                    $item = Destination::getById($id);
                    echo json_encode($item ?: ['error' => 'Non trouvé'], JSON_UNESCAPED_UNICODE);
                } elseif ($slug) {
                    $item = Destination::getBySlug($slug);
                    echo json_encode($item ?: ['error' => 'Non trouvé'], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(Destination::getAll(), JSON_UNESCAPED_UNICODE);
                }
                break;

            case 'POST':
                if (!self::requireAdmin()) return;
                $data  = json_decode(file_get_contents('php://input'), true);
                if (!$data || empty($data['ville']) || empty($data['pays_fr'])) {
                    http_response_code(422);
                    echo json_encode(['error' => 'Champs obligatoires manquants (ville, pays_fr)'], JSON_UNESCAPED_UNICODE);
                    return;
                }
                // Générer le slug à partir de la ville si absent
                if (empty($data['slug'])) {
                    $data['slug'] = strtolower(preg_replace('/[^a-z0-9]+/i', '-', iconv('UTF-8', 'ASCII//TRANSLIT', $data['ville'] ?? '')));
                }
                $newId = Destination::create($data);
                http_response_code(201);
                echo json_encode(['id' => $newId, 'message' => 'Destination créée'], JSON_UNESCAPED_UNICODE);
                break;

            case 'PUT':
                if (!self::requireAdmin()) return;
                if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requis']); break; }
                $data = json_decode(file_get_contents('php://input'), true);
                Destination::update($id, $data);
                echo json_encode(['message' => 'Destination mise à jour'], JSON_UNESCAPED_UNICODE);
                break;

            case 'DELETE':
                if (!self::requireAdmin()) return;
                if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requis']); break; }
                Destination::delete($id);
                echo json_encode(['message' => 'Destination supprimée'], JSON_UNESCAPED_UNICODE);
                break;

            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
    }
}
