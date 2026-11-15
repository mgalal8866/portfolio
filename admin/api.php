<?php
require __DIR__ . '/bootstrap.php';

if (!is_logged_in()) json_out(['error' => 'Unauthorized'], 401);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['error' => 'Method not allowed'], 405);
if (!hash_equals(csrf(), $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) json_out(['error' => 'Invalid CSRF token'], 419);

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'save':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!is_array($data) || !isset($data['profile'], $data['skills'], $data['projects'], $data['experience'])) {
            json_out(['error' => 'Invalid data structure'], 422);
        }
        if (file_exists(DATA_FILE)) {
            @mkdir(ROOT . '/data/backups', 0755, true);
            copy(DATA_FILE, ROOT . '/data/backups/portfolio-' . date('Ymd-His') . '.json');
            $backups = glob(ROOT . '/data/backups/*.json');
            rsort($backups);
            foreach (array_slice($backups, 20) as $old) @unlink($old); // keep last 20
        }
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if (file_put_contents(DATA_FILE, $json, LOCK_EX) === false) json_out(['error' => 'Could not write data file'], 500);
        json_out(['ok' => true]);

    case 'upload':
        $f = $_FILES['file'] ?? null;
        if (!$f || $f['error'] !== UPLOAD_ERR_OK) json_out(['error' => 'Upload failed'], 422);
        if ($f['size'] > 8 * 1024 * 1024) json_out(['error' => 'Max file size is 8MB'], 422);
        $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif', 'application/pdf' => 'pdf'];
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
        if (!isset($allowed[$mime])) json_out(['error' => 'Only JPG, PNG, WEBP, GIF or PDF allowed'], 422);
        $base = preg_replace('/[^a-z0-9-]+/', '-', strtolower(pathinfo($f['name'], PATHINFO_FILENAME))) ?: 'file';
        $name = trim($base, '-') . '-' . bin2hex(random_bytes(3)) . '.' . $allowed[$mime];
        @mkdir(UPLOADS, 0755, true);
        if (!move_uploaded_file($f['tmp_name'], UPLOADS . '/' . $name)) json_out(['error' => 'Could not store file'], 500);
        json_out(['ok' => true, 'path' => 'uploads/' . $name]);

    case 'password':
        $in = json_decode(file_get_contents('php://input'), true) ?: [];
        $c = creds();
        if (!password_verify($in['current'] ?? '', $c['password_hash'])) json_out(['error' => 'Current password is wrong'], 422);
        if (strlen($in['new'] ?? '') < 8) json_out(['error' => 'New password must be at least 8 characters'], 422);
        $c['password_hash'] = password_hash($in['new'], PASSWORD_DEFAULT);
        if (!empty($in['username'])) $c['username'] = $in['username'];
        file_put_contents(CRED_FILE, "<?php return " . var_export($c, true) . ";\n", LOCK_EX);
        json_out(['ok' => true]);

    default:
        json_out(['error' => 'Unknown action'], 404);
}
