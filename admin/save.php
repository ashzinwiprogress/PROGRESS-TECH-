<?php
require_once __DIR__ . '/_auth.php';

function pto_store_upload($field, $prefix) {
    if (!isset($_FILES[$field]) || $_FILES[$field]['error'] !== UPLOAD_ERR_OK) return '';
    $orig = $_FILES[$field]['name'];
    $ext = strtolower(pathinfo($orig, PATHINFO_EXTENSION));
    $allow = ['jpg','jpeg','png','gif','webp','pdf','zip','txt','mp4','webm','mkv','doc','docx','ppt','pptx'];
    if (!in_array($ext, $allow, true)) return '';
    $safe = $prefix . '-' . date('YmdHis') . '-' . substr(md5(uniqid('', true)), 0, 8) . '.' . $ext;
    $dest = UPLOAD_PATH . '/' . $safe;
    if (!move_uploaded_file($_FILES[$field]['tmp_name'], $dest)) return '';
    $public = pto_upload_public($dest, $safe);
    return $public !== '' ? $public : ('data/uploads/' . $safe);
}

$title = trim(isset($_POST['title']) ? $_POST['title'] : '');
if ($title === '') {
    header('Location: index.php?msg=' . rawurlencode('Title is required'));
    exit;
}

$cover = pto_store_upload('cover', 'cover');
if ($cover === '' && !empty($_POST['cover_url'])) $cover = trim($_POST['cover_url']);
$file = pto_store_upload('asset', 'file');
$video = pto_store_upload('video', 'video');
if ($video === '' && !empty($_POST['video_url'])) $video = trim($_POST['video_url']);

$item = [
    'id' => uniqid('pt_', true),
    'title' => $title,
    'type' => isset($_POST['type']) ? $_POST['type'] : 'link',
    'url' => trim(isset($_POST['url']) ? $_POST['url'] : ''),
    'note' => trim(isset($_POST['note']) ? $_POST['note'] : ''),
    'cover' => $cover,
    'file' => $file,
    'video' => $video,
    'created' => date('Y-m-d H:i:s'),
];

$items = pto_read_json(CONTENT_FILE);
$items[] = $item;
pto_write_json(CONTENT_FILE, $items);
header('Location: index.php?msg=' . rawurlencode('Added live to Explore'));
exit;
