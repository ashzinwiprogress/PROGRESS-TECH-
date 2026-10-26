<?php
require_once dirname(__DIR__) . '/includes/config.php';
header('Content-Type: application/json; charset=utf-8');

$BASE = 'https://api.omegatech.app/api/ai/';
$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : 'chat';

function omg_get($url, $timeout = 90) {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_CONNECTTIMEOUT => 20,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_USERAGENT => 'Mozilla/5.0 ProgressTech',
            CURLOPT_HTTPHEADER => ['Accept: */*'],
        ]);
        $body = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        curl_close($ch);
        return ['code' => $code, 'body' => $body, 'type' => $type];
    }
    $ctx = stream_context_create(['http' => ['timeout' => $timeout, 'ignore_errors' => true], 'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]]);
    $body = @file_get_contents($url, false, $ctx);
    return ['code' => $body === false ? 0 : 200, 'body' => $body, 'type' => ''];
}

function omg_extract($json) {
    if (!is_array($json)) return '';
    $paths = [
        ['data', 'reply'], ['data', 'response'], ['data', 'answer'], ['data', 'result'],
        ['data', 'message'], ['reply'], ['response'], ['result'], ['answer'], ['message'],
        ['answer'], ['text'], ['content'], ['data', 'text'],
    ];
    foreach ($paths as $p) {
        $cur = $json;
        foreach ($p as $k) {
            if (is_array($cur) && isset($cur[$k])) { $cur = $cur[$k]; } else { $cur = null; break; }
        }
        if (is_string($cur) && trim($cur) !== '') return $cur;
    }
    return '';
}

function omg_save_image($bin) {
    if (!$bin) return '';
    $sig = substr($bin, 0, 8);
    $ext = 'png';
    if (strpos($sig, "\xFF\xD8") === 0) $ext = 'jpg';
    elseif (strpos($bin, 'GIF8') === 0) $ext = 'gif';
    $name = 'img-' . date('YmdHis') . '-' . substr(md5(uniqid('', true)), 0, 8) . '.' . $ext;
    if (@file_put_contents(UPLOAD_PATH . '/' . $name, $bin)) {
        return 'data/uploads/' . $name;
    }
    return '';
}

function omg_zip_files($files) {
    if (!class_exists('ZipArchive') || !$files) return '';
    $name = 'code-' . date('YmdHis') . '-' . substr(md5(uniqid('', true)), 0, 6) . '.zip';
    $path = UPLOAD_PATH . '/' . $name;
    $zip = new ZipArchive();
    if ($zip->open($path, ZipArchive::CREATE) !== true) return '';
    foreach ($files as $f) {
        $p = isset($f['path']) ? ltrim($f['path'], '/') : 'file.txt';
        $c = isset($f['content']) ? $f['content'] : '';
        $zip->addFromString($p, $c);
    }
    $zip->close();
    return 'data/uploads/' . $name;
}

function omg_extract_code_blocks($text) {
    $files = [];
    if (preg_match_all('/```([a-zA-Z0-9_+\-.]*)\n(.*?)```/s', $text, $m, PREG_SET_ORDER)) {
        $i = 1;
        foreach ($m as $block) {
            $lang = $block[1] ?: 'txt';
            $extmap = ['python' => 'py', 'javascript' => 'js', 'typescript' => 'ts', 'php' => 'php', 'bash' => 'sh', 'sh' => 'sh', 'html' => 'html', 'css' => 'css', 'json' => 'json', 'jsx' => 'jsx', 'tsx' => 'tsx'];
            $ext = isset($extmap[strtolower($lang)]) ? $extmap[strtolower($lang)] : 'txt';
            $files[] = ['path' => 'snippet-' . $i . '.' . $ext, 'content' => $block[2]];
            $i++;
        }
    }
    return $files;
}

function omg_chat($BASE, $model, $message, $sub) {
    $enc = rawurlencode($message);
    switch ($model) {
        case 'gemini': $url = $BASE . 'Gemini2?action=chat&message=' . $enc; break;
        case 'gpt4mini': $url = $BASE . 'Gpt-4-mini?message=' . $enc; break;
        case 'chatgpt': $url = $BASE . 'Chatgpt-v2?action=chat&message=' . $enc; break;
        case 'claude': $url = $BASE . 'Claude?text=' . $enc; break;
        case 'deepai': $url = $BASE . 'Deep-ai?action=chat&message=' . $enc . '&model=' . rawurlencode($sub ?: 'deepseek-v3.2'); break;
        case 'hotbot': $url = $BASE . 'hotbot?action=chat&message=' . $enc . '&model=' . rawurlencode($sub ?: 'gpt-5'); break;
        case 'asyntai': $url = $BASE . 'Asyntai?action=chat&message=' . $enc; break;
        case 'chatbot': $url = $BASE . 'Chatbot?action=chat&message=' . $enc; break;
        case 'unlimited': $url = $BASE . 'Unlimitedai?action=chat&message=' . $enc; break;
        case 'perplexity': $url = $BASE . 'perplexity-ai?prompt=' . $enc; break;
        case 'aicli': $url = $BASE . 'Aicli?action=chat&query=' . $enc . '&model=' . rawurlencode($sub ?: 'gpt'); break;
        case 'wormgpt': $url = $BASE . 'wrmgpt?action=chat&prompt=' . $enc . '&mode=tool-explainer'; break;
        default: $url = $BASE . 'Gemini2?action=chat&message=' . $enc;
    }
    $r = omg_get($url, 90);
    $json = json_decode($r['body'], true);
    $reply = omg_extract($json);
    if ($reply === '') {
        if ($r['body'] === false || $r['body'] === null || $r['body'] === '') $reply = 'The model timed out. Please try again.';
        elseif (isset($json['error'])) $reply = 'Model error: ' . (is_string($json['error']) ? $json['error'] : json_encode($json['error']));
        else $reply = 'No response from model. Try again.';
    }
    return $reply;
}

try {
    if ($action === 'chat') {
        $in = json_decode(file_get_contents('php://input'), true);
        if (!is_array($in)) $in = $_POST;
        $message = trim(isset($in['message']) ? $in['message'] : '');
        $model = isset($in['model']) ? $in['model'] : 'gemini';
        $sub = isset($in['sub']) ? $in['sub'] : '';
        if ($message === '') { echo json_encode(['ok' => false, 'reply' => 'Please type a message.']); exit; }

        if ($model === 'llama') {
            $url = $BASE . 'llamacoder?action=create&prompt=' . rawurlencode($message) . '&quality=low';
            $r = omg_get($url, 120);
            $json = json_decode($r['body'], true);
            $files = isset($json['files']) ? $json['files'] : [];
            $zip = omg_zip_files($files);
            echo json_encode([
                'ok' => true,
                'reply' => $files ? ('Built ' . count($files) . ' files. Download the ZIP to get the full app.') : 'Builder returned no files. Try a clearer prompt.',
                'zip' => $zip,
                'files' => $files,
            ]);
            exit;
        }
        $reply = omg_chat($BASE, $model, $message, $sub);
        echo json_encode(['ok' => true, 'reply' => $reply]);
        exit;
    }

    if ($action === 'image') {
        $prompt = trim(isset($_REQUEST['prompt']) ? $_REQUEST['prompt'] : '');
        $engine = isset($_REQUEST['engine']) ? $_REQUEST['engine'] : 'flux';
        if ($prompt === '') { echo json_encode(['ok' => false, 'reply' => 'Write a prompt first.']); exit; }

        if ($engine === 'argen') {
            $r = omg_get($BASE . 'Argen?action=image&prompt=' . rawurlencode($prompt), 90);
            $json = json_decode($r['body'], true);
            $imgUrl = $json['data']['imageUrl'] ?? '';
            if ($imgUrl) {
                $img = omg_get($imgUrl, 60);
                $saved = omg_save_image($img['body']);
                echo json_encode(['ok' => (bool)$saved, 'url' => $saved, 'reply' => $saved ? 'Image ready below.' : 'Could not download image.']);
            } else {
                echo json_encode(['ok' => false, 'reply' => 'Argen error: ' . ($json['error'] ?? 'no image')]);
            }
            exit;
        }

        $r = omg_get($BASE . 'flux?action=generate&prompt=' . rawurlencode($prompt), 120);
        $saved = omg_save_image($r['body']);
        if ($saved) {
            echo json_encode(['ok' => true, 'url' => $saved, 'reply' => 'Image ready. View and download below.']);
        } else {
            echo json_encode(['ok' => false, 'reply' => 'Image engine did not return an image. Try again.']);
        }
        exit;
    }

    if ($action === 'edit') {
        $prompt = trim(isset($_POST['prompt']) ? $_POST['prompt'] : '');
        if ($prompt === '') { echo json_encode(['ok' => false, 'reply' => 'Write what to change first.']); exit; }
        $imageRef = '';
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $mime = function_exists('mime_content_type') ? (mime_content_type($_FILES['image']['tmp_name']) ?: 'image/jpeg') : 'image/jpeg';
            if (strpos($mime, 'image/') !== 0) { echo json_encode(['ok' => false, 'reply' => 'Upload an image file.']); exit; }
            $saved = omg_save_image(file_get_contents($_FILES['image']['tmp_name']));
            if (!$saved) { echo json_encode(['ok' => false, 'reply' => 'Could not store the upload.']); exit; }
            $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
                $scheme = explode(',', $_SERVER['HTTP_X_FORWARDED_PROTO'])[0];
            }
            $host = isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost';
            $imageRef = $scheme . '://' . $host . '/' . $saved;
        } elseif (!empty($_POST['image_url'])) {
            $imageRef = trim($_POST['image_url']);
        } else {
            echo json_encode(['ok' => false, 'reply' => 'Upload an image to edit.']); exit;
        }
        $url = $BASE . 'flux?action=edit&prompt=' . rawurlencode($prompt) . '&imageUrl=' . rawurlencode($imageRef);
        $r = omg_get($url, 120);
        $saved = omg_save_image($r['body']);
        if ($saved) {
            echo json_encode(['ok' => true, 'url' => $saved, 'reply' => 'Edited image ready below.']);
        } else {
            echo json_encode(['ok' => false, 'reply' => 'Edit engine did not return an image. Try again.']);
        }
        exit;
    }

    if ($action === 'code') {
        $mode = isset($_POST['mode']) ? $_POST['mode'] : 'generate';
        $prompt = trim(isset($_POST['prompt']) ? $_POST['prompt'] : '');
        $context = '';
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $tmp = $_FILES['file']['tmp_name'];
            $name = $_FILES['file']['name'] ?? '';
            $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            if ($ext === 'zip' && class_exists('ZipArchive')) {
                $zip = new ZipArchive();
                if ($zip->open($tmp) === true) {
                    $buf = [];
                    for ($i = 0; $i < $zip->numFiles && strlen(implode("\n", $buf)) < 60000; $i++) {
                        $st = $zip->statIndex($i);
                        $entry = $st['name'];
                        $low = strtolower($entry);
                        if (preg_match('/\.(php|js|ts|jsx|tsx|py|html|css|json|txt|md|sh|java|c|cpp|cs|rb|go|sql|xml|yml|yaml)$/', $low)) {
                            $content = $zip->getFromIndex($i);
                            $buf[] = "=== $entry ===\n" . substr($content, 0, 8000);
                        }
                    }
                    $zip->close();
                    $context = implode("\n\n", $buf);
                }
            } elseif (in_array($ext, ['txt','md','php','js','ts','jsx','tsx','py','html','css','json','sh','java','c','cpp','cs','rb','go','sql','xml','yml','yaml','rs','kt','swift'], true)) {
                $context = substr(file_get_contents($tmp), 0, 60000);
            } else {
                echo json_encode(['ok' => false, 'reply' => 'Supported: source/text files or ZIP.']); exit;
            }
        }
        if ($prompt === '' && $context === '') { echo json_encode(['ok' => false, 'reply' => 'Write a request or upload a file.']); exit; }

        if ($mode === 'analyze') {
            $full = "You are PROGRESS TECH, a principal software engineer. Analyze and improve the following code. Explain issues, then give the corrected full code in fenced code blocks.\n\nUSER REQUEST: $prompt\n\nCODE:\n$context";
            $reply = omg_chat($BASE, 'chatbot', $full, '');
            $files = omg_extract_code_blocks($reply);
            $zip = $files ? omg_zip_files($files) : '';
            echo json_encode(['ok' => true, 'reply' => $reply, 'zip' => $zip, 'files' => $files]);
            exit;
        }

        $full = $prompt;
        if ($context !== '') $full .= "\n\nUse this existing code as context:\n" . substr($context, 0, 20000);
        $url = $BASE . 'llamacoder?action=create&prompt=' . rawurlencode($full) . '&quality=low';
        $r = omg_get($url, 150);
        $json = json_decode($r['body'], true);
        $files = isset($json['files']) ? $json['files'] : [];
        $zip = omg_zip_files($files);
        echo json_encode([
            'ok' => true,
            'reply' => $files ? ('Generated ' . count($files) . ' files. Download the ZIP for the full project.') : 'No files were generated. Try a clearer request.',
            'zip' => $zip,
            'files' => $files,
        ]);
        exit;
    }

    if ($action === 'music') {
        $prompt = trim(isset($_REQUEST['prompt']) ? $_REQUEST['prompt'] : '');
        if ($prompt === '') { echo json_encode(['ok' => false, 'reply' => 'Describe the music first.']); exit; }
        $r = omg_get($BASE . 'sonu3?action=generate&prompt=' . rawurlencode($prompt), 60);
        $json = json_decode($r['body'], true);
        $taskId = $json['taskId'] ?? '';
        if ($taskId) {
            echo json_encode(['ok' => true, 'taskId' => $taskId, 'reply' => 'Generating music. This takes about 60-120 seconds.']);
        } else {
            echo json_encode(['ok' => false, 'reply' => 'Music engine error: ' . ($json['error'] ?? 'no task')]);
        }
        exit;
    }

    if ($action === 'music_status') {
        $taskId = isset($_REQUEST['taskId']) ? $_REQUEST['taskId'] : '';
        if ($taskId === '') { echo json_encode(['ok' => false, 'reply' => 'Missing task.']); exit; }
        $r = omg_get($BASE . 'sonu3?action=result&taskId=' . rawurlencode($taskId), 60);
        $json = json_decode($r['body'], true);
        $status = $json['status'] ?? 'pending';
        echo json_encode([
            'ok' => true,
            'status' => $status,
            'url' => $json['url'] ?? '',
            'title' => $json['title'] ?? '',
            'thumbnail' => $json['thumbnail'] ?? '',
            'lyrics' => $json['lyrics'] ?? '',
            'duration' => $json['duration'] ?? 0,
        ]);
        exit;
    }

    if ($action === 'lyrics') {
        $prompt = trim(isset($_REQUEST['prompt']) ? $_REQUEST['prompt'] : 'Progress Tech');
        $r = omg_get($BASE . 'Sonu-ultra?action=generate&prompt=' . rawurlencode($prompt), 60);
        $json = json_decode($r['body'], true);
        $lyrics = $json['data']['result']['data']['lyrics'] ?? '';
        echo json_encode(['ok' => (bool)$lyrics, 'reply' => $lyrics ?: 'No lyrics returned.']);
        exit;
    }

    echo json_encode(['ok' => false, 'reply' => 'Unknown action.']);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'reply' => 'Server error: ' . $e->getMessage()]);
}
