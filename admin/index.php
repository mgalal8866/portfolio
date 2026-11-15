<?php
require __DIR__ . '/bootstrap.php';

// "/admin" → "/admin/" so relative assets (admin.css, admin.js, api.php) resolve inside this folder
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if (!str_ends_with($path, '/') && !str_ends_with($path, '.php')) {
    $qs = $_SERVER['QUERY_STRING'] ?? '';
    header('Location: ' . $path . '/' . ($qs !== '' ? '?' . $qs : ''), true, 301);
    exit;
}

$error = '';
if (isset($_GET['logout'])) { session_destroy(); header('Location: ./'); exit; }

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    $_SESSION['attempts'] = ($_SESSION['attempts'] ?? 0) + 1;
    if ($_SESSION['attempts'] > 5 && time() - ($_SESSION['last_attempt'] ?? 0) < 60) {
        $error = 'Too many attempts. Wait a minute and try again.';
    } elseif (hash_equals(csrf(), $_POST['_token'] ?? '')
        && hash_equals(creds()['username'], $_POST['username'] ?? '')
        && password_verify($_POST['password'], creds()['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['admin'] = true;
        $_SESSION['attempts'] = 0;
        header('Location: ./'); exit;
    } else {
        $error = 'Wrong username or password.';
    }
    $_SESSION['last_attempt'] = time();
}
$token = csrf();
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Portfolio Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=Cairo:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="admin.css">
</head>
<body>
<?php if (!is_logged_in()): ?>
  <div class="login">
    <form method="post" class="login__card">
      <div class="logo">MG<span>.</span></div>
      <h1>Dashboard</h1>
      <p class="muted">Sign in to manage your portfolio</p>
      <?php if ($error): ?><div class="alert"><?= htmlspecialchars($error) ?></div><?php endif; ?>
      <input type="hidden" name="_token" value="<?= $token ?>">
      <label>Username<input name="username" value="admin" autocomplete="username" required></label>
      <label>Password<input type="password" name="password" autocomplete="current-password" required autofocus></label>
      <button class="btn">Sign in</button>
      <a class="muted small" href="../">← Back to website</a>
    </form>
  </div>
<?php else: ?>
  <div class="app">
    <aside class="side">
      <div class="logo">MG<span>.</span> <small>Dashboard</small></div>
      <nav id="tabs">
        <button data-tab="profile" class="active">👤 Profile</button>
        <button data-tab="stats">📊 Stats</button>
        <button data-tab="skills">⚡ Skills</button>
        <button data-tab="experience">💼 Experience</button>
        <button data-tab="projects">🚀 Projects</button>
        <button data-tab="security">🔒 Security</button>
      </nav>
      <div class="side__foot">
        <a href="../" target="_blank" class="ghost">View website ↗</a>
        <a href="?logout=1" class="ghost">Log out</a>
      </div>
    </aside>
    <main class="main">
      <header class="top">
        <h1 id="tabTitle">Profile</h1>
        <div class="top__actions">
          <span id="dirty" class="dirty" hidden>Unsaved changes</span>
          <button class="btn" id="saveBtn">Save changes</button>
        </div>
      </header>
      <section id="panel"></section>
    </main>
  </div>
  <div id="toast" class="toast"></div>
  <script>window.CSRF = <?= json_encode($token) ?>;</script>
  <script src="admin.js"></script>
<?php endif; ?>
</body>
</html>
