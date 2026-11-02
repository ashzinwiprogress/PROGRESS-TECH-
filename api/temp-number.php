<?php
require_once dirname(__DIR__) . '/includes/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');

$OTP_URL = 'https://api.omegatech.app/api/tools/Temp-number?action=otps';
$CATALOG_URL = 'https://api.omegatech.app/api/tools/Temp-number?action=numbers';
$action = isset($_GET['action']) ? $_GET['action'] : 'overview';
$otpCacheFile = DATA_PATH . '/temp-number-cache.json';
$catalogCacheFile = DATA_PATH . '/temp-number-catalog.json';
$historyFile = DATA_PATH . '/temp-number-history.json';

function tn_fetch($url, $timeout = 25) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_CONNECTTIMEOUT => 10,
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
    $ctx = stream_context_create(['http' => ['timeout' => $timeout, 'ignore_errors' => true], 'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
    $body = @file_get_contents($url, false, $ctx);
    return ['code' => $body === false ? 0 : 200, 'body' => $body];
}

function tn_digits($n) {
    return preg_replace('/\D/', '', (string)$n);
}

function tn_display($n) {
    $raw = preg_replace('/[^\d+]/', '', (string)$n);
    if ($raw === '') return '';
    return $raw[0] === '+' ? $raw : '+' . $raw;
}

function tn_ok_number($n) {
    $d = tn_digits($n);
    $len = strlen($d);
    if ($len < 8 || $len > 15) return false;
    if (preg_match('/^(\d)\1+$/', $d)) return false;
    return true;
}

function tn_country($name) {
    $s = trim((string)$name);
    return $s === '' ? 'Unknown' : $s;
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
        if (preg_match('/\d/', $raw) && strlen($raw) <= 12) return preg_replace('/\s+/', '', $raw);
    }
    $msg = (string)($item['message'] ?? '');
    if (preg_match('/G-(\d{4,8})/i', $msg, $m)) return $m[1];
    if (preg_match('/(?:code|kode|kod|codigo|otp|pin|verification|verify)[^\d]{0,20}(\d{3})[- ]?(\d{3})/i', $msg, $m)) return $m[1] . $m[2];
    if (preg_match('/(?:code|kode|kod|codigo|otp|pin|verification|verify)[^\d]{0,20}(\d{4,8})/i', $msg, $m)) return $m[1];
    if (preg_match('/(\d{3})-(\d{3})/', $msg, $m)) return $m[1] . $m[2];
    if (preg_match('/\b(\d{4,8})\b/', $msg, $m)) return $m[1];
    return '';
}

function tn_aliases() {
    return [
        'whatsapp' => ['whatsapp'],
        'facebook' => ['facebook'],
        'instagram' => ['instagram'],
        'google' => ['google', 'gmail'],
        'telegram' => ['telegram'],
        'microsoft' => ['microsoft', 'outlook'],
        'apple' => ['apple'],
        'huawei' => ['huawei', 'meetime'],
        'paypal' => ['paypal'],
        'viber' => ['viber'],
        'bigo' => ['bigo'],
        'twitter' => ['twitter', 'x app'],
        'alipay' => ['alipay', 'alisms', 'taobao'],
        'tiktok' => ['tiktok', 'douyin'],
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
    $hay = strtolower(($item['sender'] ?? '') . ' ' . ($item['message'] ?? '') . ' ' . ($item['otp'] ?? ''));
    foreach ($need as $a) {
        if (strpos($hay, $a) !== false) return true;
    }
    return false;
}

function tn_mask($number) {
    $d = (string)$number;
    if (strlen($d) < 6) return $d;
    return substr($d, 0, 4) . '••' . substr($d, -4);
}

function tn_read_json($file, $fallback) {
    if (!file_exists($file)) return $fallback;
    $data = json_decode((string)file_get_contents($file), true);
    return is_array($data) ? $data : $fallback;
}

function tn_write_json($file, $data) {
    @file_put_contents($file, json_encode($data));
}

function tn_load_otps($url, $cacheFile, $force = false) {
    $now = round(microtime(true) * 1000);
    $cached = tn_read_json($cacheFile, null);
    if (!$force && is_array($cached) && isset($cached['at']) && ($now - $cached['at'] < 1800) && !empty($cached['otps'])) {
        return $cached;
    }
    $r = tn_fetch($url, 20);
    $json = json_decode($r['body'], true);
    $otps = (isset($json['data']['otps']) && is_array($json['data']['otps'])) ? $json['data']['otps'] : [];
    if (!$otps && is_array($cached) && !empty($cached['otps'])) return $cached;
    $bundle = [
        'at' => $now,
        'otps' => $otps,
        'rawTotal' => isset($json['data']['total']) ? $json['data']['total'] : count($otps),
    ];
    if ($otps) tn_write_json($cacheFile, $bundle);
    return $bundle;
}

function tn_load_catalog($url, $cacheFile) {
    $now = round(microtime(true) * 1000);
    $cached = tn_read_json($cacheFile, null);
    if (is_array($cached) && isset($cached['at']) && ($now - $cached['at'] < 90000) && !empty($cached['numbers'])) {
        return $cached;
    }
    $r = tn_fetch($url, 25);
    $json = json_decode($r['body'], true);
    $numbers = (isset($json['data']['numbers']) && is_array($json['data']['numbers'])) ? $json['data']['numbers'] : [];
    if (!$numbers && is_array($cached) && !empty($cached['numbers'])) return $cached;
    $bundle = ['at' => $now, 'numbers' => $numbers];
    if ($numbers) tn_write_json($cacheFile, $bundle);
    return $bundle;
}

function tn_remember($otps, $historyFile) {
    $history = tn_read_json($historyFile, []);
    if (!is_array($history)) $history = [];
    foreach ($otps as $item) {
        $key = tn_digits($item['number'] ?? '');
        if ($key === '') continue;
        if (!isset($history[$key]) || !is_array($history[$key])) $history[$key] = [];
        $exists = false;
        foreach ($history[$key] as $row) {
            if (($row['time'] ?? '') === ($item['time'] ?? '') && ($row['message'] ?? '') === ($item['message'] ?? '') && ($row['otp'] ?? '') === ($item['otp'] ?? '')) {
                $exists = true;
                break;
            }
        }
        if ($exists) continue;
        array_unshift($history[$key], $item);
        if (count($history[$key]) > 50) $history[$key] = array_slice($history[$key], 0, 50);
    }
    if (count($history) > 400) $history = array_slice($history, -400, 400, true);
    tn_write_json($historyFile, $history);
    return $history;
}

function tn_hash($s) {
    $h = 2166136261;
    $str = (string)$s;
    $len = strlen($str);
    for ($i = 0; $i < $len; $i++) {
        $h ^= ord($str[$i]);
        $h = ($h * 16777619) & 0xFFFFFFFF;
    }
    return $h;
}

function tn_rotate($list, $limit, $salt) {
    if (count($list) <= $limit) return $list;
    $ranked = [];
    foreach ($list as $i => $item) {
        $ranked[] = ['item' => $item, 'score' => tn_hash(($item['number'] ?? '') . ':' . $salt) + $i];
    }
    usort($ranked, function ($a, $b) { return $a['score'] <=> $b['score']; });
    $out = [];
    for ($i = 0; $i < $limit; $i++) $out[] = $ranked[$i]['item'];
    return $out;
}

function tn_process($otps, $catalog) {
    $countries = [];
    $numbers = [];
    $now = round(microtime(true) * 1000);
    $liveMs = 2 * 3600 * 1000;

    foreach ($otps as $item) {
        $number = tn_display($item['number'] ?? '');
        if (!tn_ok_number($number)) continue;
        $country = tn_country($item['country'] ?? 'Unknown');
        $flag = (string)($item['flag'] ?? '');
        $ts = tn_stamp($item['time'] ?? '');
        $sender = trim((string)($item['sender'] ?? ''));
        if (!isset($countries[$country])) {
            $countries[$country] = ['name' => $country, 'flag' => $flag, 'latest' => 0, 'set' => [], 'unused' => 0, 'live' => 0];
        }
        $countries[$country]['set'][$number] = 1;
        if ($ts >= $countries[$country]['latest']) {
            $countries[$country]['latest'] = $ts;
            $countries[$country]['flag'] = $flag ?: $countries[$country]['flag'];
        }
        if (!isset($numbers[$number])) {
            $numbers[$number] = [
                'number' => $number,
                'masked' => $item['maskedNumber'] ?? tn_mask($number),
                'country' => $country,
                'flag' => $flag,
                'latest' => $ts,
                'senders' => [],
                'messageCount' => 0,
                'unused' => false,
                'live' => ($now - $ts) < $liveMs,
            ];
        }
        $numbers[$number]['messageCount']++;
        $numbers[$number]['unused'] = false;
        $numbers[$number]['live'] = ($now - max($numbers[$number]['latest'], $ts)) < $liveMs;
        if ($ts >= $numbers[$number]['latest']) {
            $numbers[$number]['latest'] = $ts;
            $numbers[$number]['flag'] = $flag ?: $numbers[$number]['flag'];
            $numbers[$number]['country'] = $country;
        }
        if ($sender && !in_array($sender, $numbers[$number]['senders'], true)) {
            $numbers[$number]['senders'][] = $sender;
        }
    }

    foreach ($catalog as $item) {
        $number = tn_display($item['number'] ?? '');
        if (!tn_ok_number($number) || isset($numbers[$number])) continue;
        $country = tn_country($item['country'] ?? 'Unknown');
        $flag = (string)($item['flag'] ?? '');
        if (!preg_match('/[\x{1F1E6}-\x{1F1FF}]/u', $flag)) $flag = '';
        $numbers[$number] = [
            'number' => $number,
            'masked' => tn_mask($number),
            'country' => $country,
            'flag' => $flag,
            'latest' => 0,
            'senders' => [],
            'messageCount' => 0,
            'unused' => true,
            'live' => false,
        ];
        if (!isset($countries[$country])) {
            $countries[$country] = ['name' => $country, 'flag' => $flag, 'latest' => 0, 'set' => [], 'unused' => 0, 'live' => 0];
        }
        $countries[$country]['set'][$number] = 1;
        $countries[$country]['unused']++;
        if ($flag && !$countries[$country]['flag']) $countries[$country]['flag'] = $flag;
    }

    foreach ($numbers as $n) {
        if (!empty($n['live']) && isset($countries[$n['country']])) $countries[$n['country']]['live']++;
    }

    $salt = (string)floor($now / 180000);
    $byCountry = [];
    foreach ($numbers as $n) {
        $byCountry[$n['country']][] = $n;
    }
    $shownTotal = 0;
    foreach ($byCountry as $k => $list) {
        $live = [];
        $unused = [];
        foreach ($list as $n) {
            if (!empty($n['unused'])) $unused[] = $n;
            else $live[] = $n;
        }
        usort($live, function ($a, $b) { return $b['latest'] <=> $a['latest']; });
        $unused = tn_rotate($unused, 36, $salt . ':' . $k);
        $merged = array_merge($unused, $live);
        $byCountry[$k] = $merged;
        $shownTotal += count($merged);
        if (isset($countries[$k])) $countries[$k]['shown'] = count($merged);
    }

    $countryList = [];
    foreach ($countries as $c) {
        $countryList[] = [
            'name' => $c['name'],
            'flag' => $c['flag'],
            'count' => $c['shown'] ?? count($c['set']),
            'unusedCount' => $c['unused'],
            'liveCount' => $c['live'],
            'latest' => $c['latest'],
            'hot' => $c['unused'] > 0 || (($now - $c['latest'] < $liveMs) && $c['live'] >= 1),
        ];
    }
    usort($countryList, function ($a, $b) {
        if ($a['hot'] !== $b['hot']) return $a['hot'] ? -1 : 1;
        if ($a['latest'] === $b['latest']) {
            if ($a['unusedCount'] === $b['unusedCount']) return $b['count'] - $a['count'];
            return $b['unusedCount'] - $a['unusedCount'];
        }
        return $b['latest'] <=> $a['latest'];
    });

    $unusedTotal = 0;
    $liveTotal = 0;
    foreach ($countryList as $c) {
        $unusedTotal += $c['unusedCount'];
        $liveTotal += $c['liveCount'];
    }
    return [
        'countries' => $countryList,
        'numbersByCountry' => $byCountry,
        'total' => $shownTotal,
        'unusedTotal' => $unusedTotal,
        'liveTotal' => $liveTotal,
    ];
}

try {
    if ($action === 'inbox') {
        $number = isset($_GET['number']) ? tn_digits($_GET['number']) : '';
        $platform = isset($_GET['platform']) ? (string)$_GET['platform'] : 'other';
        $since = isset($_GET['since']) ? (int)$_GET['since'] : 0;
        if ($number === '') {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Number is required']);
            exit;
        }
        $bundle = tn_load_otps($OTP_URL, $otpCacheFile, true);
        $history = tn_remember($bundle['otps'], $historyFile);
        $rowsSrc = array_merge(isset($history[$number]) ? $history[$number] : [], $bundle['otps']);
        $seen = [];
        $rows = [];
        $sinceTs = $since > 0 ? $since - 8000 : 0;
        foreach ($rowsSrc as $item) {
            if (tn_digits($item['number'] ?? '') !== $number) continue;
            if (!tn_match($item, $platform)) continue;
            $stamp = ($item['time'] ?? '') . '|' . ($item['message'] ?? '') . '|' . ($item['otp'] ?? '');
            if (isset($seen[$stamp])) continue;
            $seen[$stamp] = 1;
            $ts = tn_stamp($item['time'] ?? '');
            if ($sinceTs && $ts && $ts < $sinceTs) continue;
            $rows[] = [
                'time' => $item['time'] ?? '',
                'ts' => $ts,
                'sender' => $item['sender'] ?? '',
                'otp' => tn_code($item),
                'message' => $item['message'] ?? '',
                'country' => $item['country'] ?? '',
                'flag' => $item['flag'] ?? '',
                'number' => tn_display($item['number'] ?? $number),
            ];
        }
        usort($rows, function ($a, $b) { return $b['ts'] <=> $a['ts']; });
        $fresh = 20 * 60 * 1000;
        $now = round(microtime(true) * 1000);
        $latest = null;
        foreach ($rows as $r) {
            if ($r['otp'] && (!$r['ts'] || ($now - $r['ts'] < $fresh))) { $latest = $r; break; }
        }
        if (!$latest) {
            foreach ($rows as $r) {
                if ($r['otp']) { $latest = $r; break; }
            }
        }
        echo json_encode(['ok' => true, 'number' => $number, 'platform' => $platform, 'messages' => $rows, 'latest' => $latest, 'updated' => $now]);
        exit;
    }

    $bundle = tn_load_otps($OTP_URL, $otpCacheFile, false);
    tn_remember($bundle['otps'], $historyFile);
    $catalog = tn_load_catalog($CATALOG_URL, $catalogCacheFile);
    $processed = tn_process($bundle['otps'], $catalog['numbers']);

    if ($action === 'numbers') {
        $country = isset($_GET['country']) ? (string)$_GET['country'] : '';
        $list = ($country && isset($processed['numbersByCountry'][$country])) ? $processed['numbersByCountry'][$country] : [];
        echo json_encode(['ok' => true, 'country' => $country, 'numbers' => $list, 'updated' => $bundle['at'], 'total' => $processed['total']]);
        exit;
    }

    echo json_encode([
        'ok' => true,
        'countries' => $processed['countries'],
        'numbersByCountry' => $processed['numbersByCountry'],
        'total' => $processed['total'],
        'unusedTotal' => $processed['unusedTotal'],
        'liveTotal' => $processed['liveTotal'],
        'feedTotal' => $bundle['rawTotal'],
        'catalogTotal' => count($catalog['numbers']),
        'updated' => round(microtime(true) * 1000),
    ]);
} catch (Exception $e) {
    http_response_code(502);
    echo json_encode(['ok' => false, 'error' => 'Could not load live numbers']);
}
