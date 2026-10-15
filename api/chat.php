<?php
require_once dirname(__DIR__) . '/includes/config.php';
header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents('php://input');
$in = json_decode($raw, true);
if (!is_array($in)) $in = $_POST;
$message = trim(isset($in['message']) ? $in['message'] : '');
$model = isset($in['model']) ? $in['model'] : 'gemini';
if ($message === '') {
    echo json_encode(['reply' => 'Please type a message.']);
    exit;
}

function pto_http_get($url, $timeout = 45) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
        ]);
        $out = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return [$code, $out];
    }
    $ctx = stream_context_create(['http' => ['timeout' => $timeout, 'header' => "Accept: application/json\r\n"], 'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
    $out = @file_get_contents($url, false, $ctx);
    return [200, $out === false ? '' : $out];
}

function pto_zip_files($files) {
    if (!class_exists('ZipArchive')) return null;
    $name = 'llama-' . date('YmdHis') . '-' . substr(md5(uniqid()), 0, 6) . '.zip';
    $path = UPLOAD_PATH . '/' . $name;
    $zip = new ZipArchive();
    if ($zip->open($path, ZipArchive::CREATE) !== true) return null;
    foreach ($files as $f) {
        $p = isset($f['path']) ? $f['path'] : 'file.txt';
        $c = isset($f['content']) ? $f['content'] : '';
        $zip->addFromString($p, $c);
    }
    $zip->close();
    return 'data/uploads/' . $name;
}

if ($model === 'llama') {
    $url = 'https://api.omegatech.app/api/ai/llamacoder?action=create&prompt=' . rawurlencode($message) . '&quality=low';
    list($code, $out) = pto_http_get($url, 90);
    $json = json_decode($out, true);
    if (!$json || empty($json['success'])) {
        echo json_encode(['reply' => 'Llama builder is busy. Try a shorter prompt.']);
        exit;
    }
    $files = isset($json['files']) ? $json['files'] : [];
    $zip = $files ? pto_zip_files($files) : null;
    $reply = 'Llama built ' . (isset($json['filesCount']) ? $json['filesCount'] : count($files)) . ' files.';
    echo json_encode(['reply' => $reply, 'zip' => $zip, 'files' => $files]);
    exit;
}

$url = 'https://api.omegatech.app/api/ai/Gemini2?action=chat&message=' . rawurlencode($message);
list($code, $out) = pto_http_get($url, 45);
$json = json_decode($out, true);
$reply = '';
if (isset($json['data']['response'])) $reply = $json['data']['response'];
elseif (isset($json['response'])) $reply = $json['response'];
elseif (isset($json['message'])) $reply = $json['message'];
if ($reply === '') $reply = 'Gemini did not return text. Try again.';
echo json_encode(['reply' => $reply]);
