<?php
require_once __DIR__ . '/../models/Reservation.php';

class ReservationController {

    public static function handle(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        $id     = isset($_GET['id'])      ? (int) $_GET['id']      : null;
        $userId = isset($_GET['user_id']) ? (int) $_GET['user_id'] : null;

        header('Content-Type: application/json; charset=utf-8');

        switch ($method) {
            case 'GET':
                if ($id) {
                    $item = Reservation::getById($id);
                    echo json_encode($item ?: ['error' => 'Non trouvé'], JSON_UNESCAPED_UNICODE);
                } elseif ($userId) {
                    echo json_encode(Reservation::getByUser($userId), JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode(Reservation::getAll(), JSON_UNESCAPED_UNICODE);
                }
                break;

            case 'POST':
                $data = json_decode(file_get_contents('php://input'), true);
                try {
                    $newId = Reservation::create($data);

                    if (!empty($data['activite_ids']) && is_array($data['activite_ids'])) {
                        Reservation::addActivites(
                            $newId,
                            $data['activite_ids'],
                            (int) ($data['nb_voyageurs'] ?? 1)
                        );
                    }

                    http_response_code(201);
                    $created = Reservation::getById($newId);
                    echo json_encode([
                        'id'        => $newId,
                        'reference' => $created['reference'] ?? '',
                        'message'   => 'Réservation créée',
                    ], JSON_UNESCAPED_UNICODE);
                } catch (\InvalidArgumentException $e) {
                    http_response_code(422);
                    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
                } catch (\Exception $e) {
                    http_response_code(409);
                    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
                }
                break;

            case 'PUT':
                if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requis']); break; }
                $data = json_decode(file_get_contents('php://input'), true);

                try {
                    if (isset($data['statut']) && $data['statut'] === 'annulee') {
                        Reservation::cancel($id);
                    } else {
                        Reservation::update($id, $data);
                    }
                    echo json_encode(['message' => 'Réservation mise à jour'], JSON_UNESCAPED_UNICODE);
                } catch (\InvalidArgumentException $e) {
                    http_response_code(422);
                    echo json_encode(['error' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
                }
                break;

            case 'DELETE':
                if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID requis']); break; }
                Reservation::delete($id);
                echo json_encode(['message' => 'Réservation supprimée'], JSON_UNESCAPED_UNICODE);
                break;

            default:
                http_response_code(405);
                echo json_encode(['error' => 'Méthode non autorisée']);
        }
    }
}
