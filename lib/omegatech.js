import { OMEGA_BASE } from './config';

export async function omgFetch(url, timeoutMs = 60000, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: '*/*', 'User-Agent': 'Mozilla/5.0 ProgressTech', ...(options.headers || {}) },
      ...options
    });
    const ab = await res.arrayBuffer();
    return { status: res.status, buffer: Buffer.from(ab), ok: res.ok };
  } catch (e) {
    return { status: 0, buffer: Buffer.alloc(0), ok: false, error: e.message };
  } finally {
    clearTimeout(timer);
  }
}

export async function omgJson(url, timeoutMs = 60000) {
  const r = await omgFetch(url, timeoutMs);
  try {
    return { status: r.status, json: JSON.parse(r.buffer.toString('utf8')), raw: r.buffer.toString('utf8') };
  } catch (e) {
    return { status: r.status, json: null, raw: r.buffer.toString('utf8') };
  }
}

export function extractReply(obj) {
  if (!obj || typeof obj !== 'object') return '';
  const paths = [
    ['data', 'reply'], ['data', 'response'], ['data', 'answer'], ['data', 'result'],
    ['data', 'message'], ['data', 'text'], ['reply'], ['response'], ['result'],
    ['answer'], ['message'], ['text'], ['content']
  ];
  for (const p of paths) {
    let cur = obj;
    let ok = true;
    for (const k of p) {
      if (cur && typeof cur === 'object' && k in cur) cur = cur[k];
      else { ok = false; break; }
    }
    if (ok && typeof cur === 'string' && cur.trim() !== '') return cur;
  }
  return '';
}

export const CHAT_ROUTES = {
  gemini: (m) => `Gemini2?action=chat&message=${encodeURIComponent(m)}`,
  gpt4mini: (m) => `Gpt-4-mini?message=${encodeURIComponent(m)}`,
  chatgpt: (m) => `Chatgpt-v2?action=chat&message=${encodeURIComponent(m)}`,
  claude: (m) => `Claude?text=${encodeURIComponent(m)}`,
  deepai: (m, s) => `Deep-ai?action=chat&message=${encodeURIComponent(m)}&model=${encodeURIComponent(s || 'deepseek-v3.2')}`,
  hotbot: (m, s) => `hotbot?action=chat&message=${encodeURIComponent(m)}&model=${encodeURIComponent(s || 'gpt-5')}`,
  asyntai: (m) => `Asyntai?action=chat&message=${encodeURIComponent(m)}`,
  chatbot: (m) => `Chatbot?action=chat&message=${encodeURIComponent(m)}`,
  unlimited: (m) => `Unlimitedai?action=chat&message=${encodeURIComponent(m)}`,
  perplexity: (m) => `perplexity-ai?prompt=${encodeURIComponent(m)}`,
  aicli: (m, s) => `Aicli?action=chat&query=${encodeURIComponent(m)}&model=${encodeURIComponent(s || 'gpt')}`
};

export async function chatModel(model, message, sub = '') {
  const build = CHAT_ROUTES[model] || CHAT_ROUTES.gemini;
  const url = OMEGA_BASE + build(message, sub);
  const { json, status, raw } = await omgJson(url, 90000);
  let reply = extractReply(json);
  if (!reply) {
    if (!json) reply = status === 0 ? 'The model timed out. Please try again.' : `Model error (${status}).`;
    else if (json.error) reply = 'Model error: ' + (typeof json.error === 'string' ? json.error : JSON.stringify(json.error));
    else reply = raw && raw.length < 300 ? raw : 'No response from model. Try again.';
  }
  return reply;
}

export function detectImageExt(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8) return { ext: 'jpg', mime: 'image/jpeg' };
  if (buf.length > 8 && buf.toString('ascii', 1, 4) === 'PNG') return { ext: 'png', mime: 'image/png' };
  if (buf.length > 6 && buf.toString('ascii', 0, 3) === 'GIF') return { ext: 'gif', mime: 'image/gif' };
  if (buf.length > 12 && buf.toString('ascii', 8, 12) === 'WEBP') return { ext: 'webp', mime: 'image/webp' };
  return { ext: 'png', mime: 'image/png' };
}

export function toDataUri(buf) {
  const { mime } = detectImageExt(buf);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

export async function uploadToPublicHost(buf, filename) {
  const hosts = [
    async () => {
      const fd = new FormData();
      fd.append('reqtype', 'fileupload');
      fd.append('time', '1h');
      fd.append('fileToUpload', new Blob([buf]), filename || 'upload.jpg');
      const r = await omgFetch('https://litterbox.catbox.moe/resources/internals/api.php', 45000, { method: 'POST', body: fd });
      const t = r.buffer.toString('utf8').trim();
      return t.startsWith('http') ? t : '';
    },
    async () => {
      const fd = new FormData();
      fd.append('files[]', new Blob([buf]), filename || 'upload.jpg');
      const r = await omgFetch('https://uguu.se/upload.php', 45000, { method: 'POST', body: fd });
      const j = JSON.parse(r.buffer.toString('utf8'));
      return j && j.success && j.files && j.files[0] ? j.files[0].url : '';
    },
    async () => {
      const fd = new FormData();
      fd.append('file', new Blob([buf]), filename || 'upload.jpg');
      const r = await omgFetch('https://tmpfiles.org/api/v1/upload', 45000, { method: 'POST', body: fd });
      const j = JSON.parse(r.buffer.toString('utf8'));
      if (j && j.data && j.data.url) return j.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
      return '';
    }
  ];
  for (const host of hosts) {
    try {
      const url = await host();
      if (url && url.startsWith('http')) return url;
    } catch (e) { /* try next */ }
  }
  return '';
}

export async function codeFilesToZipBase64(files) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  for (const f of files) {
    const p = (f.path || 'file.txt').replace(/^\/+/, '');
    zip.file(p, f.content || '');
  }
  const b64 = await zip.generateAsync({ type: 'base64' });
  return 'data:application/zip;base64,' + b64;
}

export function extractCodeBlocks(text) {
  const files = [];
  const re = /```([a-zA-Z0-9_+\-.]*)\n([\s\S]*?)```/g;
  const extmap = { python: 'py', javascript: 'js', typescript: 'ts', php: 'php', bash: 'sh', sh: 'sh', html: 'html', css: 'css', json: 'json', jsx: 'jsx', tsx: 'tsx', js: 'js', ts: 'ts' };
  let m;
  let i = 1;
  while ((m = re.exec(text)) !== null) {
    const lang = (m[1] || 'txt').toLowerCase();
    const ext = extmap[lang] || 'txt';
    files.push({ path: `snippet-${i}.${ext}`, content: m[2] });
    i++;
  }
  return files;
}
