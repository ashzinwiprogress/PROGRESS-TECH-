<?php
require_once dirname(__DIR__) . '/includes/config.php';
if (!pto_is_admin()) {
    header('Location: login.php');
    exit;
}
