<?php
require_once __DIR__ . '/../config/database.php';

class AuthController {

    public static function handle(): void {
        $method = $_SERVER['REQUEST_METHOD'];
        header('Content-Type: application/json; charset=utf-8');

        if ($method !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'POST requis']);
            return;
        }

        $data   = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'] ?? '';

        switch ($action) {
            case 'register':
                self::register($data);
                break;
            case 'login':
                self::login($data);
                break;
            default:
                http_response_code(400);
                echo json_encode(['error' => 'action invalide (register|login)']);
        }
    }

    private static function register(array $data): void {
        $nom   = trim($data['nom']   ?? '');
        $email = trim($data['email'] ?? '');
        $pass  = $data['password']   ?? '';

        if (!$nom || !$email || !$pass) {
            http_response_code(422);
            echo json_encode(['error' => 'Champs manquants']);
            return;
        }

        // Vérifier unicité email
        $check = getDB()->prepare('SELECT id FROM utilisateurs WHERE email = ?');
        $check->execute([$email]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Email déjà utilisé']);
            return;
        }

        $hash = password_hash($pass, PASSWORD_BCRYPT);
        $stmt = getDB()->prepare(
            'INSERT INTO utilisateurs (nom, email, mot_de_passe) VALUES (?,?,?)'
        );
        $stmt->execute([$nom, $email, $hash]);
        $id = (int) getDB()->lastInsertId();

        http_response_code(201);
        echo json_encode(['id' => $id, 'nom' => $nom, 'email' => $email, 'role' => 'user'], JSON_UNESCAPED_UNICODE);
    }

    private static function login(array $data): void {
        $email = trim($data['email'] ?? '');
        $pass  = $data['password']   ?? '';

        $stmt = getDB()->prepare('SELECT * FROM utilisateurs WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($pass, $user['mot_de_passe'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Email ou mot de passe incorrect']);
            return;
        }

        echo json_encode([
            'id'    => $user['id'],
            'nom'   => $user['nom'],
            'email' => $user['email'],
            'role'  => $user['role'],
        ], JSON_UNESCAPED_UNICODE);
    }
}
