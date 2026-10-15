<?php
require_once __DIR__ . '/_auth.php';
$id = isset($_POST['id']) ? $_POST['id'] : '';
$items = pto_read_json(CONTENT_FILE);
$items = array_values(array_filter($items, function ($it) use ($id) {
    return (isset($it['id']) ? $it['id'] : '') !== $id;
}));
pto_write_json(CONTENT_FILE, $items);
header('Location: index.php?msg=' . rawurlencode('Item removed'));
exit;
