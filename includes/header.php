<?php
require_once __DIR__ . '/config.php';
$pageTitle = isset($pageTitle) ? $pageTitle : SITE_NAME;
$pageId = isset($pageId) ? $pageId : 'home';
pto_log_visitor($pageId);
$nav = [
  'index.php' => 'Home',
  'courses.php' => '4 in 1',
  'academy.php' => 'Academy',
  'explore.php' => 'Explore',
  'studio.php' => 'AI Studio',
  'virtual-number.php' => 'Free Numbers',
  'chatbot.php' => 'Chatbot',
  'contact.php' => 'Contact',
  'about.php' => 'Owner',
];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo pto_h($pageTitle); ?> | PROGRESS TECH OFFICIAL</title>
  <meta name="description" content="Progress Tech Official - Ethical hacking, cybersecurity, web development, Python, Linux and penetration testing training.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
<div class="bg-video">
  <video autoplay muted loop playsinline poster="<?php echo PROFILE_IMAGE; ?>">
    <source src="<?php echo BG_VIDEO; ?>" type="video/mp4">
  </video>
</div>
<div class="bg-overlay"></div>
<div class="water-layer"></div>
<nav class="nav">
  <a class="brand" href="index.php">
    <img src="<?php echo PROFILE_IMAGE; ?>" alt="Progress Tech">
    <span>PROGRESS TECH OFFICIAL</span>
  </a>
  <button class="nav-toggle" type="button" aria-label="Menu">≡</button>
  <div class="nav-links">
    <?php foreach ($nav as $href => $label): ?>
      <a class="<?php echo (basename($_SERVER['PHP_SELF']) === $href || ($href === 'virtual-number.php' && strpos(basename($_SERVER['PHP_SELF']), 'virtual-number') === 0)) ? 'active' : ''; ?>" href="<?php echo $href; ?>"><?php echo $label; ?></a>
    <?php endforeach; ?>
    <a href="admin/login.php">Admin</a>
  </div>
</nav>
