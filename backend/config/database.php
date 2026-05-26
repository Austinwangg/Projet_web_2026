<?php
/**
 * Configuration de la connexion MySQL.
 * Utilise PDO pour la sécurité (requêtes préparées) et la portabilité.
 *
 * ⚠ En production : stocker les credentials dans des variables d'environnement.
 */

define('DB_HOST',    '127.0.0.1');  // 127.0.0.1 plutôt que 'localhost' pour forcer TCP/IP
define('DB_PORT',    '3306');
define('DB_NAME',    'voyagevista');
define('DB_USER',    'root');
define('DB_PASS',    '');           // MAMP sans mot de passe
define('DB_CHARSET', 'utf8mb4');

function getDB(): PDO {
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            DB_HOST, DB_PORT, DB_NAME, DB_CHARSET
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
