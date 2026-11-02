<?php
require_once dirname(__DIR__) . '/includes/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');

$BASE = getenv('TEMP_NUMBER_API_BASE') ?: 'https://api.temp-number.com/v1';
$TOKEN = getenv('TEMP_NUMBER_API_TOKEN') ?: '';
$action = isset($_GET['action']) ? (string)$_GET['action'] : 'catalog';

function pn_fail($error, $status = 502, $extra = []) {
    http_response_code($status);
    echo json_encode(array_merge(['ok' => false, 'error' => $error], $extra));
    exit;
}

if ($TOKEN === '') {
    pn_fail('Private numbers are not connected yet. Add TEMP_NUMBER_API_TOKEN to your environment (get a token from the provider dashboard under API Access), then reload.', 503, ['code' => 'not_configured']);
}

function pn_call($base, $token, $path, $method = 'GET', $body = null) {
    $url = rtrim($base, '/') . $path;
    $headers = ['Accept: application/json', 'Authorization: Bearer ' . $token];
    if ($body !== null) $headers[] = 'Content-Type: application/json';
    $payload = $body === null ? null : json_encode($body);
    $result = pto_http($url, [
        'method' => $method,
        'headers' => $headers,
        'body' => $payload,
        'timeout' => 25,
    ]);
    $json = json_decode($result['body'], true);
    return ['code' => $result['code'], 'json' => $json];
}

function pn_first_list($value) {
    if (is_array($value) && array_is_list($value)) return $value;
    if (!is_array($value)) return [];
    foreach (['data', 'items', 'results', 'countries', 'inventory', 'numbers', 'packages', 'messages', 'list'] as $key) {
        if (isset($value[$key]) && is_array($value[$key])) return $value[$key];
    }
    foreach ($value as $item) {
        if (is_array($item) && array_is_list($item)) return $item;
    }
    return [];
}

function pn_pick($obj, $keys, $fallback = null) {
    if (!is_array($obj)) return $fallback;
    foreach ($keys as $key) {
        if (isset($obj[$key]) && $obj[$key] !== '' && $obj[$key] !== null) return $obj[$key];
    }
    return $fallback;
}

function pn_money($value) {
    if ($value === null || $value === '') return null;
    if (is_array($value)) return pn_money(pn_pick($value, ['amount', 'price', 'value', 'usd']));
    $clean = preg_replace('/[^0-9.\-]/', '', (string)$value);
    return $clean === '' ? null : (float)$clean;
}

function pn_clean_code($value) {
    return substr(preg_replace('/[^A-Za-z]/', '', strtoupper((string)$value)), 0, 2);
}

function pn_clean_duration($value) {
    return substr(preg_replace('/[^A-Za-z0-9_-]/', '', (string)$value), 0, 40);
}

function pn_clean_id($value) {
    $raw = (string)$value;
    return preg_match('/^[A-Za-z0-9_-]{1,64}$/', $raw) ? $raw : '';
}

function pn_provider_error($res, $fallback) {
    $message = $fallback;
    if (is_array($res['json'])) {
        $message = (string)pn_pick($res['json'], ['message', 'error'], $fallback);
        if ($res['code'] === 401 || $res['code'] === 403) {
            $message = 'The provider rejected the configured API token. Update TEMP_NUMBER_API_TOKEN with a valid token.';
        }
    }
    $status = in_array($res['code'], [422, 429], true) ? $res['code'] : 502;
    pn_fail($message, $status);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true);
        if (!is_array($body)) $body = $_POST;
        $postAction = isset($body['action']) ? (string)$body['action'] : 'buy';
        if ($postAction !== 'buy') pn_fail('Unknown action.', 400);

        $country = pn_clean_code($body['country'] ?? '');
        $duration = pn_clean_duration($body['duration'] ?? '');
        $type = (string)($body['type'] ?? '');
        if (strlen($country) !== 2) pn_fail('Country code must be two letters.', 400);
        if ($duration === '') pn_fail('Choose a package duration.', 400);
        if ($type !== '' && $type !== 'voip' && $type !== 'non_voip') pn_fail('Number type must be voip or non_voip.', 400);

        $payload = ['country_code' => $country, 'duration' => $duration];
        if ($type !== '') $payload['number_type'] = $type;

        $res = pn_call($BASE, $TOKEN, '/numbers/buy', 'POST', $payload);
        if ($res['code'] === 404 || $res['code'] === 405) {
            $res = pn_call($BASE, $TOKEN, '/numbers/free', 'POST', $payload);
        }
        if ($res['code'] < 200 || $res['code'] >= 300) {
            pn_provider_error($res, 'This number could not be provisioned. Try another country or package.');
        }

        $data = isset($res['json']['data']) && is_array($res['json']['data']) ? $res['json']['data'] : [];
        echo json_encode([
            'ok' => true,
            'number' => [
                'id' => $data['id'] ?? null,
                'number' => $data['phone_number'] ?? '',
                'code' => $data['country_code'] ?? $country,
                'country' => $data['country_name'] ?? '',
                'type' => $data['number_type'] ?? $type,
                'status' => $data['status'] ?? 'active',
                'purchased' => $data['purchase_date'] ?? '',
                'expires' => $data['expire_date'] ?? '',
                'email' => $data['email'] ?? '',
            ],
            'meta' => $res['json']['meta'] ?? null,
        ]);
        exit;
    }

    if ($action === 'account') {
        $res = pn_call($BASE, $TOKEN, '/account');
        if ($res['code'] !== 200) pn_provider_error($res, 'Could not load your account balance.');
        $data = isset($res['json']['data']) && is_array($res['json']['data']) ? $res['json']['data'] : (is_array($res['json']) ? $res['json'] : []);
        echo json_encode([
            'ok' => true,
            'account' => [
                'balance' => pn_money(pn_pick($data, ['balance', 'wallet_balance', 'credit', 'funds'])),
                'currency' => strtoupper((string)pn_pick($data, ['currency', 'settlement_currency'], 'USD')),
                'email' => (string)pn_pick($data, ['email'], ''),
            ],
        ]);
        exit;
    }

    if ($action === 'numbers') {
        $res = pn_call($BASE, $TOKEN, '/numbers');
        if ($res['code'] !== 200) pn_provider_error($res, 'Could not load your private numbers.');
        $rows = pn_first_list(isset($res['json']['data']) ? $res['json']['data'] : $res['json']);
        $items = [];
        foreach ($rows as $row) {
            if (!is_array($row)) continue;
            $items[] = [
                'id' => $row['id'] ?? ($row['number_id'] ?? null),
                'number' => (string)pn_pick($row, ['phone_number', 'number', 'msisdn', 'phone'], ''),
                'code' => strtoupper((string)pn_pick($row, ['country_code', 'country'], '')),
                'country' => (string)pn_pick($row, ['country_name', 'country'], ''),
                'type' => (string)pn_pick($row, ['number_type', 'type'], ''),
                'status' => (string)pn_pick($row, ['status', 'state'], ''),
                'expires' => (string)pn_pick($row, ['expire_date', 'expires_at', 'expiry'], ''),
                'email' => (string)pn_pick($row, ['email', 'email_address', 'privnum_email'], ''),
            ];
        }
        echo json_encode(['ok' => true, 'items' => $items]);
        exit;
    }

    if ($action === 'messages') {
        $id = pn_clean_id($_GET['id'] ?? '');
        if ($id === '') pn_fail('Choose a private number first.', 400);
        $res = pn_call($BASE, $TOKEN, '/numbers/' . $id . '/sms');
        if ($res['code'] !== 200) pn_provider_error($res, 'Could not load messages for this number.');
        $rows = pn_first_list(isset($res['json']['data']) ? $res['json']['data'] : $res['json']);
        $items = [];
        foreach ($rows as $row) {
            if (!is_array($row)) continue;
            $message = (string)pn_pick($row, ['message', 'body', 'text', 'content', 'sms'], '');
            $code = (string)pn_pick($row, ['otp', 'code', 'verification_code', 'pin'], '');
            if ($message === '' && $code === '') continue;
            $items[] = [
                'sender' => (string)pn_pick($row, ['sender', 'from', 'originator'], ''),
                'message' => $message,
                'code' => $code,
                'time' => (string)pn_pick($row, ['time', 'received_at', 'created_at', 'date'], ''),
            ];
        }
        echo json_encode(['ok' => true, 'items' => $items]);
        exit;
    }

    $res = pn_call($BASE, $TOKEN, '/pricing');
    if ($res['code'] !== 200) pn_provider_error($res, 'Could not load the country catalog.');
    $payload = isset($res['json']['data']) ? $res['json']['data'] : $res['json'];
    $currency = strtoupper((string)pn_pick(is_array($payload) ? $payload : [], ['currency', 'settlement_currency'], 'USD'));
    $rows = pn_first_list($payload ?: []);
    $countries = [];
    foreach ($rows as $row) {
        if (!is_array($row)) continue;
        $code = strtoupper((string)pn_pick($row, ['country_code', 'code', 'iso', 'iso2', 'countryCode'], ''));
        $name = (string)pn_pick($row, ['country_name', 'name', 'label', 'country'], $code);
        if ($code === '' && $name === '') continue;
        $rawPackages = pn_pick($row, ['packages', 'durations', 'prices', 'plans'], []);
        $packages = [];
        $freeCount = 0;
        $cheapest = null;
        foreach ((is_array($rawPackages) ? $rawPackages : []) as $package) {
            if (is_string($package)) {
                $packages[] = ['key' => $package, 'label' => $package, 'price' => null, 'currency' => $currency, 'free' => false];
                continue;
            }
            if (!is_array($package)) continue;
            $key = (string)pn_pick($package, ['duration', 'key', 'id', 'code', 'slug'], '');
            if ($key === '') continue;
            $price = pn_money(pn_pick($package, ['price', 'amount', 'cost', 'total', 'unit_price']));
            if ($price === 0.0) $freeCount++;
            if ($price !== null && ($cheapest === null || $price < $cheapest)) $cheapest = $price;
            $packages[] = [
                'key' => $key,
                'label' => (string)pn_pick($package, ['label', 'name', 'title', 'duration_label'], $key),
                'price' => $price,
                'currency' => strtoupper((string)pn_pick($package, ['currency', 'ccy'], $currency)),
                'free' => $price === 0.0,
            ];
        }
        $countries[] = [
            'code' => $code,
            'name' => $name,
            'flag' => (string)pn_pick($row, ['flag', 'emoji'], ''),
            'packages' => $packages,
            'freeCount' => $freeCount,
            'cheapest' => $cheapest,
            'currency' => $currency,
        ];
    }
    usort($countries, function ($a, $b) { return strcmp($a['name'], $b['name']); });
    echo json_encode(['ok' => true, 'countries' => $countries, 'currency' => $currency]);
} catch (Exception $e) {
    pn_fail('Could not complete the request. Try again.', 502);
}
