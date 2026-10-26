<?php
require_once dirname(__DIR__) . '/includes/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');

$URL = 'https://api.omegatech.app/api/tools/Temp-number?action=otps';
$action = isset($_GET['action']) ? $_GET['action'] : 'overview';
$cacheFile = DATA_PATH . '/temp-number-cache.json';

function tn_fetch($url) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 45,
            CURLOPT_CONNECTTIMEOUT => 15,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_USERAGENT => 'Mozilla/5.0 ProgressTech',
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
        ]);
        $body = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return ['code' => $code, 'body' => $body];
    }
    $ctx = stream_context_create(['http' => ['timeout' => 45, 'ignore_errors' => true], 'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
    $body = @file_get_contents($url, false, $ctx);
    return ['code' => $body === false ? 0 : 200, 'body' => $body];
}

function tn_norm($n) {
    return preg_replace('/[^\d+]/', '', (string)$n);
}

function tn_stamp($t) {
    $ts = strtotime(str_replace(' ', 'T', (string)$t) . ' UTC');
    if ($ts) return $ts * 1000;
    $ts = strtotime((string)$t);
    return $ts ? $ts * 1000 : 0;
}

function tn_code($item) {
    $raw = trim((string)($item['otp'] ?? ''));
    if ($raw !== '' && stripos($raw, 'no otp') === false) {
        $digits = preg_replace('/\D/', '', $raw);
        if (strlen($digits) >= 3 && strlen($digits) <= 8) return $digits;
        if (preg_match('/\d/', $raw)) return $raw;
    }
    $msg = (string)($item['message'] ?? '');
    if (preg_match('/G-(\d{4,8})/i', $msg, $m)) return $m[1];
    if (preg_match('/(?:code|kode|kod|codigo|otp|verification)[^\d]{0,16}(\d{3})[- ]?(\d{3})/i', $msg, $m)) return $m[1] . $m[2];
    if (preg_match('/(?:code|kode|kod|codigo|otp|verification)[^\d]{0,16}(\d{4,8})/i', $msg, $m)) return $m[1];
    if (preg_match('/(\d{3})-(\d{3})/', $msg, $m)) return $m[1] . $m[2];
    if (preg_match('/\b(\d{4,8})\b/', $msg, $m)) return $m[1];
    return '';
}

function tn_aliases() {
    return [
        'whatsapp' => ['whatsapp'],
        'facebook' => ['facebook'],
        'instagram' => ['instagram'],
        'google' => ['google'],
        'telegram' => ['telegram'],
        'microsoft' => ['microsoft'],
        'apple' => ['apple'],
        'huawei' => ['huawei', 'meetime'],
        'paypal' => ['paypal'],
        'viber' => ['viber'],
        'bigo' => ['bigo'],
        'twitter' => ['twitter', 'x app'],
        'alipay' => ['alipay', 'alisms', 'taobao'],
        'tiktok' => ['tiktok'],
        'amazon' => ['amazon'],
        'discord' => ['discord'],
        'snapchat' => ['snapchat'],
        'linkedin' => ['linkedin'],
        'uber' => ['uber'],
        'netflix' => ['netflix'],
        'mexc' => ['mexc'],
        'other' => [],
    ];
}

function tn_match($item, $platform) {
    if (!$platform || $platform === 'other') return true;
    $aliases = tn_aliases();
    $need = isset($aliases[$platform]) ? $aliases[$platform] : [];
    if (!$need) return true;
    $hay = strtolower(($item['sender'] ?? '') . ' ' . ($item['message'] ?? ''));
    foreach ($need as $a) {
        if (strpos($hay, $a) !== false) return true;
    }
    return false;
}

function tn_load($url, $cacheFile) {
    $now = round(microtime(true) * 1000);
    if (file_exists($cacheFile)) {
        $cached = json_decode(file_get_contents($cacheFile), true);
        if (is_array($cached) && isset($cached['at']) && ($now - $cached['at'] < 8000) && !empty($cached['otps'])) {
            return $cached;
        }
    }
    $r = tn_fetch($url);
    $json = json_decode($r['body'], true);
    $otps = (isset($json['data']['otps']) && is_array($json['data']['otps'])) ? $json['data']['otps'] : [];
    $bundle = [
        'at' => $now,
        'otps' => $otps,
        'rawTotal' => isset($json['data']['total']) ? $json['data']['total'] : count($otps),
    ];
    if ($otps) @file_put_contents($cacheFile, json_encode($bundle));
    return $bundle;
}

function tn_process($otps) {
    $countries = [];
    $numbers = [];
    foreach ($otps as $item) {
        $number = tn_norm($item['number'] ?? '');
        if ($number === '') continue;
        $country = (string)($item['country'] ?? 'Unknown');
        $flag = (string)($item['flag'] ?? '');
        $ts = tn_stamp($item['time'] ?? '');
        $sender = (string)($item['sender'] ?? '');
        if (!isset($countries[$country])) {
            $countries[$country] = ['name' => $country, 'flag' => $flag, 'latest' => 0, 'set' => []];
        }
        $countries[$country]['set'][$number] = 1;
        if ($ts >= $countries[$country]['latest']) {
            $countries[$country]['latest'] = $ts;
            $countries[$country]['flag'] = $flag ?: $countries[$country]['flag'];
        }
        if (!isset($numbers[$number])) {
            $numbers[$number] = [
                'number' => $number,
                'masked' => $item['maskedNumber'] ?? $number,
                'country' => $country,
                'flag' => $flag,
                'latest' => 0,
                'senders' => [],
                'messageCount' => 0,
            ];
        }
        $numbers[$number]['messageCount']++;
        if ($ts >= $numbers[$number]['latest']) {
            $numbers[$number]['latest'] = $ts;
            $numbers[$number]['flag'] = $flag ?: $numbers[$number]['flag'];
            $numbers[$number]['country'] = $country;
        }
        if ($sender && !in_array($sender, $numbers[$number]['senders'], true)) {
            $numbers[$number]['senders'][] = $sender;
        }
    }
    $now = round(microtime(true) * 1000);
    $countryList = [];
    foreach ($countries as $c) {
        $count = count($c['set']);
        $countryList[] = [
            'name' => $c['name'],
            'flag' => $c['flag'],
            'count' => $count,
            'latest' => $c['latest'],
            'hot' => ($now - $c['latest'] < 6 * 3600 * 1000) && $count >= 2,
        ];
    }
    usort($countryList, function ($a, $b) {
        if ($a['latest'] === $b['latest']) return $b['count'] - $a['count'];
        return $b['latest'] <=> $a['latest'];
    });
    $byCountry = [];
    foreach ($numbers as $n) {
        $byCountry[$n['country']][] = $n;
    }
    foreach ($byCountry as $k => $list) {
        usort($list, function ($a, $b) { return $b['latest'] <=> $a['latest']; });
        $byCountry[$k] = $list;
    }
    return ['countries' => $countryList, 'numbersByCountry' => $byCountry, 'total' => count($numbers)];
}

try {
    $bundle = tn_load($URL, $cacheFile);
    $processed = tn_process($bundle['otps']);

    if ($action === 'numbers') {
        $country = isset($_GET['country']) ? (string)$_GET['country'] : '';
        $list = ($country && isset($processed['numbersByCountry'][$country])) ? $processed['numbersByCountry'][$country] : [];
        echo json_encode(['ok' => true, 'country' => $country, 'numbers' => $list, 'updated' => $bundle['at'], 'total' => $processed['total']]);
        exit;
    }

    if ($action === 'inbox') {
        $number = isset($_GET['number']) ? tn_norm($_GET['number']) : '';
        $platform = isset($_GET['platform']) ? (string)$_GET['platform'] : 'other';
        if ($number === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Number is required']);
            exit;
        }
        $rows = [];
        foreach ($bundle['otps'] as $item) {
            if (tn_norm($item['number'] ?? '') !== $number) continue;
            if (!tn_match($item, $platform)) continue;
            $ts = tn_stamp($item['time'] ?? '');
            $rows[] = [
                'time' => $item['time'] ?? '',
                'ts' => $ts,
                'sender' => $item['sender'] ?? '',
                'otp' => tn_code($item),
                'message' => $item['message'] ?? '',
                'country' => $item['country'] ?? '',
                'flag' => $item['flag'] ?? '',
                'number' => $item['number'] ?? $number,
            ];
        }
        usort($rows, function ($a, $b) { return $b['ts'] <=> $a['ts']; });
        $fresh = 30 * 60 * 1000;
        $now = round(microtime(true) * 1000);
        $latest = null;
        foreach ($rows as $r) {
            if ($r['otp'] && ($now - $r['ts'] < $fresh)) { $latest = $r; break; }
        }
        if (!$latest) {
            foreach ($rows as $r) {
                if ($r['otp']) { $latest = $r; break; }
            }
        }
        echo json_encode(['ok' => true, 'number' => $number, 'platform' => $platform, 'messages' => $rows, 'latest' => $latest, 'updated' => $bundle['at']]);
        exit;
    }

    echo json_encode([
        'ok' => true,
        'countries' => $processed['countries'],
        'numbersByCountry' => $processed['numbersByCountry'],
        'total' => $processed['total'],
        'feedTotal' => $bundle['rawTotal'],
        'updated' => $bundle['at'],
    ]);
} catch (Exception $e) {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'Could not load live numbers']);
}
