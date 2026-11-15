<?php
declare(strict_types=1);

session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict', 'secure' => !empty($_SERVER['HTTPS'])]);
session_start();

const ROOT      = __DIR__ . '/..';
const DATA_FILE = ROOT . '/data/portfolio.json';
const CRED_FILE = __DIR__ . '/credentials.php';
const UPLOADS   = ROOT . '/uploads';

if (!file_exists(CRED_FILE)) {
    // Default password: admin123  — change it from the dashboard (Security tab).
    file_put_contents(CRED_FILE, "<?php return " . var_export([
        'username' => 'admin',
        'password_hash' => '$2y$12$MI2yrDE44yxmSOmcXsVtRO6H3yUr72PiOZ3dBjw8XmN6DYxIC/Vxa',
    ], true) . ";\n");
}

function creds(): array { return require CRED_FILE; }
function is_logged_in(): bool { return !empty($_SESSION['admin']); }
function csrf(): string {
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}
function json_out(array $data, int $code = 200): never {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
