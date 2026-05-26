<?php
/**
 * Configuration de la connexion MySQL.
 * Utilise PDO pour la sécurité (requêtes préparées) et la portabilité.
 *
 * ⚠ En production : stocker les credentials dans des variables d'environnement.
 */

// MAMP : host = 127.0.0.1 (évite le conflit de socket Unix avec 'localhost')
// MAMP : mot de passe par défaut = 'root'
define('DB_HOST',    '127.0.0.1');
define('DB_NAME',    'voyagevista');
define('DB_USER',    'root');
define('DB_PASS',    'root');
define('DB_CHARSET', 'utf8mb4');

function getDB(): PDO {
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;dbname=%s;charset=%s',
            DB_HOST, DB_NAME, DB_CHARSET
        );
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    }

    return $pdo;
}
