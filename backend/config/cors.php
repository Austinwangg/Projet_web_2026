<?php
/**
 * Middleware CORS – autorise les requêtes depuis le frontend React (Vite dev server).
 * À inclure en tête de chaque fichier d'entrée d'API.
 *
 * En production, remplacer '*' par l'URL exacte du frontend déployé.
 */
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Les requêtes OPTIONS sont des preflight CORS – répondre immédiatement
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
