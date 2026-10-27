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
define('CATALOG_PASTE_ID', getenv('CATALOG_PASTE_ID') ?: 'mqyznxtf');
define('CATALOG_PASTE_EDIT', getenv('CATALOG_PASTE_EDIT') ?: '73echFfE');

if (!is_dir(UPLOAD_PATH)) {
    @mkdir(UPLOAD_PATH, 0755, true);
}
if (!file_exists(CONTENT_FILE)) {
    file_put_contents(CONTENT_FILE, '[]');
}
if (!file_exists(VISITORS_FILE)) {
    file_put_contents(VISITORS_FILE, '[]');
}

function pto_http($url, $opts = []) {
    $timeout = isset($opts['timeout']) ? $opts['timeout'] : 15;
    $method = isset($opts['method']) ? $opts['method'] : 'GET';
    $headers = isset($opts['headers']) ? $opts['headers'] : [];
    $body = isset($opts['body']) ? $opts['body'] : null;
    $headers[] = 'User-Agent: Mozilla/5.0 ProgressTech';
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        $curlHeaders = $headers;
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $curlHeaders,
            CURLOPT_HEADER => true,
        ]);
        if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        $raw = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $hs = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        curl_close($ch);
        if ($raw === false) return ['code' => 0, 'body' => '', 'headers' => ''];
        return ['code' => $code, 'headers' => substr($raw, 0, $hs), 'body' => substr($raw, $hs)];
    }
    $http = ['method' => $method, 'timeout' => $timeout, 'ignore_errors' => true, 'header' => implode("\r\n", $headers)];
    if ($body !== null) $http['content'] = $body;
    $ctx = stream_context_create(['http' => $http, 'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
    $resp = @file_get_contents($url, false, $ctx);
    return ['code' => $resp === false ? 0 : 200, 'headers' => '', 'body' => $resp === false ? '' : $resp];
}

function pto_catalog_extract($html) {
    if (!preg_match('/<article[\s\S]*?<\/article>/i', $html, $m)) $m = [0 => $html];
    $text = html_entity_decode(strip_tags($m[0]), ENT_QUOTES, 'UTF-8');
    $start = strpos($text, '[');
    $end = strrpos($text, ']');
    if ($start === false || $end === false || $end <= $start) return null;
    $data = json_decode(substr($text, $start, $end - $start + 1), true);
    return is_array($data) ? $data : null;
}

function pto_catalog_csrf() {
    $r = pto_http('https://rentry.co');
    if (preg_match('/csrftoken=([^;]+)/', $r['headers'], $m)) return $m[1];
    if (preg_match('/name=["\']csrfmiddlewaretoken["\']\s+value=["\']([^"\']+)/i', $r['body'], $m)) return $m[1];
    return '';
}

function pto_read_catalog() {
    $r = pto_http('https://rentry.co/' . CATALOG_PASTE_ID);
    $items = pto_catalog_extract($r['body']);
    if (is_array($items)) {
        pto_write_json_file(CONTENT_FILE, $items);
        return $items;
    }
    return pto_read_json_file(CONTENT_FILE);
}

function pto_write_catalog($items) {
    $csrf = pto_catalog_csrf();
    if ($csrf === '') return pto_write_json_file(CONTENT_FILE, $items);
    $body = http_build_query([
        'csrfmiddlewaretoken' => $csrf,
        'edit_code' => CATALOG_PASTE_EDIT,
        'text' => json_encode(array_values($items)),
    ]);
    $r = pto_http('https://rentry.co/api/edit/' . CATALOG_PASTE_ID, [
        'method' => 'POST',
        'body' => $body,
        'headers' => [
            'Content-Type: application/x-www-form-urlencoded',
            'Referer: https://rentry.co/' . CATALOG_PASTE_ID,
            'Origin: https://rentry.co',
            'Cookie: csrftoken=' . $csrf,
        ],
    ]);
    $ok = false;
    $j = json_decode($r['body'], true);
    if (is_array($j) && (isset($j['status']) && (string)$j['status'] === '200' || (isset($j['content']) && $j['content'] === 'OK'))) $ok = true;
    pto_write_json_file(CONTENT_FILE, $items);
    return $ok || $r['code'] === 200;
}

function pto_upload_public($path, $filename) {
    if (!is_file($path)) return '';
    $bin = file_get_contents($path);
    if ($bin === false || $bin === '') return '';
    $hosts = [
        function () use ($path, $filename) {
            if (!function_exists('curl_init')) return '';
            $ch = curl_init('https://uguu.se/upload.php');
            $cf = function_exists('curl_file_create') ? curl_file_create($path, mime_content_type($path) ?: 'application/octet-stream', $filename) : '@' . $path;
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_TIMEOUT => 45,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_POSTFIELDS => ['files[]' => $cf],
                CURLOPT_USERAGENT => 'Mozilla/5.0 ProgressTech',
            ]);
            $out = curl_exec($ch);
            curl_close($ch);
            $j = json_decode($out, true);
            return (!empty($j['success']) && !empty($j['files'][0]['url'])) ? $j['files'][0]['url'] : '';
        },
        function () use ($path, $filename) {
            if (!function_exists('curl_init')) return '';
            $ch = curl_init('https://tmpfiles.org/api/v1/upload');
            $cf = function_exists('curl_file_create') ? curl_file_create($path, mime_content_type($path) ?: 'application/octet-stream', $filename) : '@' . $path;
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_TIMEOUT => 45,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_POSTFIELDS => ['file' => $cf],
                CURLOPT_USERAGENT => 'Mozilla/5.0 ProgressTech',
            ]);
            $out = curl_exec($ch);
            curl_close($ch);
            $j = json_decode($out, true);
            if (!empty($j['data']['url'])) return str_replace('tmpfiles.org/', 'tmpfiles.org/dl/', $j['data']['url']);
            return '';
        },
    ];
    foreach ($hosts as $host) {
        try {
            $url = $host();
            if (is_string($url) && strpos($url, 'http') === 0) return $url;
        } catch (Exception $e) {}
    }
    return '';
}

function pto_read_json_file($file) {
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

function pto_write_json_file($file, $data) {
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

function pto_read_json($file) {
    if ($file === CONTENT_FILE) return pto_read_catalog();
    return pto_read_json_file($file);
}

function pto_write_json($file, $data) {
    if ($file === CONTENT_FILE) return pto_write_catalog($data);
    return pto_write_json_file($file, $data);
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
