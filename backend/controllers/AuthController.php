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
            case 'update_profile':
                self::updateProfile($data);
                break;
            case 'change_password':
                self::changePassword($data);
                break;
            default:
                http_response_code(400);
                echo json_encode(['error' => 'action invalide (register|login|update_profile|change_password)']);
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
            'id'             => $user['id'],
            'nom'            => $user['nom'],
            'prenom'         => $user['prenom']         ?? '',
            'email'          => $user['email'],
            'telephone'      => $user['telephone']      ?? '',
            'date_naissance' => $user['date_naissance'] ?? '',
            'role'           => $user['role'],
        ], JSON_UNESCAPED_UNICODE);
    }

    public static function updateProfile(array $data): void {
        $id    = (int) ($data['id'] ?? 0);
        $nom   = trim($data['nom']   ?? '');
        $prenom = trim($data['prenom'] ?? '');
        $email = trim($data['email'] ?? '');
        $tel   = trim($data['telephone']      ?? '');
        $dob   = trim($data['date_naissance'] ?? '');

        if (!$id || !$nom || !$email) {
            http_response_code(422);
            echo json_encode(['error' => 'Champs nom et email requis']);
            return;
        }

        // Vérifier unicité email (sauf pour l'utilisateur lui-même)
        $check = getDB()->prepare('SELECT id FROM utilisateurs WHERE email = ? AND id != ?');
        $check->execute([$email, $id]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'Email déjà utilisé par un autre compte']);
            return;
        }

        $stmt = getDB()->prepare(
            'UPDATE utilisateurs SET nom=?, prenom=?, email=?, telephone=?, date_naissance=? WHERE id=?'
        );
        $stmt->execute([$nom, $prenom ?: null, $email, $tel ?: null, $dob ?: null, $id]);

        $row = getDB()->prepare('SELECT id, nom, prenom, email, telephone, date_naissance, role FROM utilisateurs WHERE id=?');
        $row->execute([$id]);
        echo json_encode($row->fetch(), JSON_UNESCAPED_UNICODE);
    }

    public static function changePassword(array $data): void {
        $id       = (int) ($data['id']           ?? 0);
        $current  = $data['current_password']    ?? '';
        $newPass  = $data['new_password']        ?? '';

        if (!$id || !$current || !$newPass || strlen($newPass) < 6) {
            http_response_code(422);
            echo json_encode(['error' => 'Données invalides (minimum 6 caractères)']);
            return;
        }

        $stmt = getDB()->prepare('SELECT mot_de_passe FROM utilisateurs WHERE id=?');
        $stmt->execute([$id]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($current, $user['mot_de_passe'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Mot de passe actuel incorrect']);
            return;
        }

        $hash = password_hash($newPass, PASSWORD_BCRYPT);
        getDB()->prepare('UPDATE utilisateurs SET mot_de_passe=? WHERE id=?')->execute([$hash, $id]);
        echo json_encode(['message' => 'Mot de passe mis à jour'], JSON_UNESCAPED_UNICODE);
    }
}
