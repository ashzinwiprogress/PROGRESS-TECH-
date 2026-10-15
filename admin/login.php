<?php
require_once dirname(__DIR__) . '/includes/config.php';
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $u = isset($_POST['username']) ? $_POST['username'] : '';
    $p = isset($_POST['password']) ? $_POST['password'] : '';
    if ($u === ADMIN_USER && hash('sha256', $p) === ADMIN_PASS_HASH) {
        $_SESSION['admin'] = true;
        header('Location: index.php');
        exit;
    }
    $error = 'Invalid credentials';
}
$skipGate = true;
$pageTitle = 'Admin login';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin | PROGRESS TECH OFFICIAL</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>
<div class="bg-video"><video autoplay muted loop playsinline><source src="<?php echo BG_VIDEO; ?>" type="video/mp4"></video></div>
<div class="bg-overlay"></div>
<section class="hero">
  <div class="wrap" style="max-width:460px">
    <div class="glass" style="padding:32px">
      <div class="kicker">Control room</div>
      <h2>Admin dashboard</h2>
      <?php if ($error): ?><p class="err"><?php echo pto_h($error); ?></p><?php endif; ?>
      <form class="form" method="post">
        <label>Username</label>
        <input name="username" required placeholder="Progresstech">
        <label>Password</label>
        <input type="password" name="password" required>
        <button class="btn btn-cyan" type="submit">Enter</button>
      </form>
      <p class="tiny" style="margin-top:14px"><a href="../index.php">Back to site</a></p>
    </div>
  </div>
</section>
</body>
</html>
