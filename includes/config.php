<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

define('SITE_NAME', 'PROGRESS TECH OFFICIAL');
define('SITE_OWNER', 'PROGRESS TECH');
define('OWNER_WHATSAPP', '237698830792');
define('OWNER_EMAIL', 'progresstech237@gmail.com');
define('PROFILE_IMAGE', 'https://files.catbox.moe/5hjbss.jpg');
define('BG_VIDEO', 'https://files.catbox.moe/rmdadp.mp4');
define('WA_CHANNEL', 'https://whatsapp.com/channel/0029Vb8rLzOCRs1j79bllH05');
define('YT_CHANNEL', 'https://youtube.com/@progresstech12?si=FxXSOluDXTGbxe-E');
define('ADMIN_USER', 'Progresstech');
define('ADMIN_PASS_HASH', hash('sha256', 'progresstech12'));
define('ROOT_PATH', dirname(__DIR__));
define('DATA_PATH', ROOT_PATH . '/data');
define('UPLOAD_PATH', DATA_PATH . '/uploads');
define('CONTENT_FILE', DATA_PATH . '/content.json');
define('VISITORS_FILE', DATA_PATH . '/visitors.json');

if (!is_dir(UPLOAD_PATH)) {
    @mkdir(UPLOAD_PATH, 0755, true);
}
if (!file_exists(CONTENT_FILE)) {
    file_put_contents(CONTENT_FILE, '[]');
}
if (!file_exists(VISITORS_FILE)) {
    file_put_contents(VISITORS_FILE, '[]');
}

function pto_read_json($file) {
    if (!file_exists($file)) return [];
    $fp = fopen($file, 'r');
    if (!$fp) return [];
    flock($fp, LOCK_SH);
    $raw = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function pto_write_json($file, $data) {
    $fp = fopen($file, 'c+');
    if (!$fp) return false;
    flock($fp, LOCK_EX);
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
    return true;
}

function pto_log_visitor($page) {
    if (isset($_SESSION['admin'])) return;
    $visitors = pto_read_json(VISITORS_FILE);
    $ip = isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0] : (isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : 'unknown');
    $visitors[] = [
        'id' => uniqid('v_', true),
        'ip' => trim($ip),
        'page' => $page,
        'ua' => isset($_SERVER['HTTP_USER_AGENT']) ? substr($_SERVER['HTTP_USER_AGENT'], 0, 240) : '',
        'time' => date('Y-m-d H:i:s'),
    ];
    if (count($visitors) > 800) {
        $visitors = array_slice($visitors, -800);
    }
    pto_write_json(VISITORS_FILE, $visitors);
}

function pto_h($s) {
    return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
}

function pto_followed() {
    return !empty($_COOKIE['pto_followed']);
}

function pto_is_admin() {
    return !empty($_SESSION['admin']);
}
