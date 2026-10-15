import { NextResponse } from 'next/server';
import { OMEGA_BASE } from '../../../lib/config';
import {
  omgFetch, omgJson, chatModel, toDataUri, uploadToPublicHost, codeFilesToZipBase64, extractCodeBlocks
} from '../../../lib/omegatech';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const json = (obj) => NextResponse.json(obj);

async function parseBody(req) {
  const ct = req.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await req.json(); } catch (e) { return {}; }
  }
  if (ct.includes('multipart/form-data')) {
    const fd = await req.formData();
    const obj = {};
    for (const [k, v] of fd.entries()) obj[k] = v;
    return obj;
  }
  try {
    const fd = await req.formData();
    const obj = {};
    for (const [k, v] of fd.entries()) obj[k] = v;
    return obj;
  } catch (e) {
    return {};
  }
}

export async function POST(req) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action') || 'chat';
  try {
    const body = await parseBody(req);
    const query = Object.fromEntries(url.searchParams.entries());

    if (action === 'chat') {
      const message = String(body.message || '').trim();
      const model = String(body.model || 'gemini');
      const sub = String(body.sub || '');
      if (!message) return json({ ok: false, reply: 'Please type a message.' });

      if (model === 'llama') {
        const r = await omgJson(OMEGA_BASE + 'llamacoder?action=create&prompt=' + encodeURIComponent(message) + '&quality=low', 120000);
        const files = (r.json && r.json.files) || [];
        const zip = files.length ? await codeFilesToZipBase64(files) : '';
        return json({
          ok: true,
          reply: files.length ? `Built ${files.length} files. Download the ZIP to get the full app.` : 'Builder returned no files. Try a clearer prompt.',
          zip,
          files
        });
      }
      const reply = await chatModel(model, message, sub);
      return json({ ok: true, reply });
    }

    if (action === 'image') {
      const prompt = String(body.prompt || '').trim();
      const engine = String(body.engine || 'flux');
      if (!prompt) return json({ ok: false, reply: 'Write a prompt first.' });

      if (engine === 'argen') {
        const r = await omgJson(OMEGA_BASE + 'Argen?action=image&prompt=' + encodeURIComponent(prompt), 90000);
        const imgUrl = r.json && r.json.data && r.json.data.imageUrl;
        if (!imgUrl) return json({ ok: false, reply: 'Argen: ' + ((r.json && r.json.error) || 'no image returned') });
        const img = await omgFetch(imgUrl, 60000);
        if (!img.buffer.length) return json({ ok: false, reply: 'Could not download the generated image.' });
        return json({ ok: true, image: toDataUri(img.buffer), reply: 'Image ready. View and download below.' });
      }

      let img = null;
      for (let attempt = 0; attempt < 2 && !img; attempt++) {
        const r = await omgFetch(OMEGA_BASE + 'flux?action=generate&prompt=' + encodeURIComponent(prompt), 110000);
        const sig = r.buffer.slice(0, 4).toString('hex');
        if (r.buffer.length && (sig === '89504e47' || sig === 'ffd8ffe0' || sig === 'ffd8ffe1' || sig.startsWith('ffd8'))) {
          img = toDataUri(r.buffer);
        }
      }
      if (!img) return json({ ok: false, reply: 'Image engine did not return an image. Please try again.' });
      return json({ ok: true, image: img, reply: 'Image ready. View and download below.' });
    }

    if (action === 'edit') {
      const prompt = String(body.prompt || '').trim();
      const engine = String(body.engine || 'nanobana');
      if (!prompt) return json({ ok: false, reply: 'Describe the change first.' });
      const file = body.image;
      const imageUrlParam = String(body.image_url || '').trim();
      let publicUrl = imageUrlParam;
      if (!publicUrl) {
        if (!file || typeof file === 'string' || !file.arrayBuffer) {
          return json({ ok: false, reply: 'Upload an image to edit.' });
        }
        const buf = Buffer.from(await file.arrayBuffer());
        if (!buf.length) return json({ ok: false, reply: 'The uploaded file is empty.' });
        publicUrl = await uploadToPublicHost(buf, file.name || 'upload.jpg');
        if (!publicUrl) return json({ ok: false, reply: 'Could not host the uploaded image. Try again or use a smaller image.' });
      }

      if (engine === 'flux') {
        let out = null;
        for (let attempt = 0; attempt < 2 && !out; attempt++) {
          const r = await omgFetch(OMEGA_BASE + 'flux?action=edit&prompt=' + encodeURIComponent(prompt) + '&imageUrl=' + encodeURIComponent(publicUrl), 110000);
          if (r.buffer.length) out = toDataUri(r.buffer);
        }
        if (!out) return json({ ok: false, reply: 'Flux edit did not return an image. Please try again.' });
        return json({ ok: true, image: out, reply: 'Edited image ready below.' });
      }

      let outUrl = '';
      let lastErr = '';
      for (let attempt = 0; attempt < 3 && !outUrl; attempt++) {
        const r = await omgJson(OMEGA_BASE + 'Nanobana-extra?action=edit&image=' + encodeURIComponent(publicUrl) + '&prompt=' + encodeURIComponent(prompt), 100000);
        outUrl = (r.json && r.json.data && r.json.data.image) || '';
        if (!outUrl) lastErr = (r.json && (typeof r.json.error === 'string' ? r.json.error : JSON.stringify(r.json.error))) || 'no image returned';
        if (!outUrl && attempt < 2) await new Promise((res) => setTimeout(res, 1500));
      }
      if (!outUrl) return json({ ok: false, reply: 'Nano Banana is busy right now (' + lastErr + '). Please try again.' });
      const img = await omgFetch(outUrl, 60000);
      if (!img.buffer.length) return json({ ok: false, reply: 'Could not download the edited image. Try again.' });
      return json({ ok: true, image: toDataUri(img.buffer), reply: 'Edited image ready below.' });
    }

    if (action === 'code') {
      const mode = String(body.mode || 'generate');
      const prompt = String(body.prompt || '').trim();
      const file = body.file;
      let context = '';

      if (file && typeof file !== 'string' && file.arrayBuffer) {
        const buf = Buffer.from(await file.arrayBuffer());
        const name = (file.name || '').toLowerCase();
        if (name.endsWith('.zip')) {
          try {
            const { default: JSZip } = await import('jszip');
            const zip = await JSZip.loadAsync(buf);
            const parts = [];
            const entries = Object.keys(zip.files);
            for (const entry of entries) {
              if (parts.join('\n').length > 60000) break;
              if (/\.(php|js|ts|jsx|tsx|py|html|css|json|txt|md|sh|java|c|cpp|cs|rb|go|sql|xml|yml|yaml|rs)$/i.test(entry) && !zip.files[entry].dir) {
                const content = await zip.files[entry].async('string');
                parts.push(`=== ${entry} ===\n` + content.slice(0, 8000));
              }
            }
            context = parts.join('\n\n');
          } catch (e) {
            return json({ ok: false, reply: 'Could not read the ZIP file.' });
          }
        } else if (/\.(txt|md|php|js|ts|jsx|tsx|py|html|css|json|sh|java|c|cpp|cs|rb|go|sql|xml|yml|yaml|rs|kt|swift)$/i.test(name)) {
          context = buf.toString('utf8').slice(0, 60000);
        } else {
          return json({ ok: false, reply: 'Supported: source/text files or ZIP.' });
        }
      }

      if (!prompt && !context) return json({ ok: false, reply: 'Write a request or upload a file.' });

      if (mode === 'analyze') {
        const full = `You are PROGRESS TECH, a principal software engineer. Analyze and improve the following code. Explain issues, then give the corrected full code in fenced code blocks.\n\nUSER REQUEST: ${prompt}\n\nCODE:\n${context}`;
        const reply = await chatModel('chatbot', full, '');
        const files = extractCodeBlocks(reply);
        const zip = files.length ? await codeFilesToZipBase64(files) : '';
        return json({ ok: true, reply, zip, files });
      }

      let full = prompt;
      if (context) full += `\n\nUse this existing code as context:\n${context.slice(0, 20000)}`;
      const r = await omgJson(OMEGA_BASE + 'llamacoder?action=create&prompt=' + encodeURIComponent(full) + '&quality=low', 150000);
      const files = (r.json && r.json.files) || [];
      const zip = files.length ? await codeFilesToZipBase64(files) : '';
      return json({
        ok: true,
        reply: files.length ? `Generated ${files.length} files. Download the ZIP for the full project.` : 'No files were generated. Try a clearer request.',
        zip,
        files
      });
    }

    if (action === 'video') {
      const mode = String(body.mode || 'text');
      const prompt = String(body.prompt || '').trim();
      const ratio = String(body.ratio || '16:9');
      const sound = body.sound === 'true' || body.sound === true;
      const file = body.image;
      if (!prompt && !(file && typeof file !== 'string')) {
        return json({ ok: false, reply: 'Write a prompt (and optionally upload an image).' });
      }

      if (mode === 'image' || (file && typeof file !== 'string' && file.arrayBuffer)) {
        if (!file || typeof file === 'string' || !file.arrayBuffer) {
          return json({ ok: false, reply: 'Upload an image to animate, or switch to Text to video.' });
        }
        const buf = Buffer.from(await file.arrayBuffer());
        if (!buf.length) return json({ ok: false, reply: 'The uploaded image is empty.' });
        const publicUrl = await uploadToPublicHost(buf, file.name || 'frame.jpg');
        if (!publicUrl) return json({ ok: false, reply: 'Could not host the image. Try a smaller image.' });
        const r = await omgJson(
          OMEGA_BASE + 'Wan-fast?action=submit&image=' + encodeURIComponent(publicUrl) +
          '&prompt=' + encodeURIComponent(prompt || 'subtle cinematic motion') +
          '&aspectRatio=' + encodeURIComponent(ratio),
          90000
        );
        const taskId = r.json && r.json.data && r.json.data.taskId;
        if (!taskId) {
          return json({ ok: false, reply: 'Video engine: ' + ((r.json && r.json.error) || 'no task returned') });
        }
        return json({ ok: true, taskId, poll: 'wan', reply: 'Animating your image. This can take a few minutes.' });
      }

      const r = await omgJson(
        OMEGA_BASE + 'Txt2video?action=generate&prompt=' + encodeURIComponent(prompt) +
        '&ratio=' + encodeURIComponent(ratio) + '&sound=' + (sound ? 'true' : 'false'),
        110000
      );
      const videoUrl = r.json && r.json.data && r.json.data.videoUrl;
      if (videoUrl) {
        return json({ ok: true, video: videoUrl, reply: 'Video ready. Play and download below.' });
      }
      const taskKey = r.json && r.json.data && (r.json.data.taskKey || r.json.data.task_key);
      if (taskKey) {
        return json({ ok: true, taskId: taskKey, poll: 'txt2video', reply: 'Generating your video. This can take a minute.' });
      }
      return json({ ok: false, reply: 'Video engine: ' + ((r.json && r.json.error) || 'no video returned. Try again.') });
    }

    if (action === 'video_status') {
      const taskId = String(body.taskId || query.taskId || '');
      const poll = String(body.poll || query.poll || 'wan');
      if (!taskId) return json({ ok: false, reply: 'Missing task.' });
      if (poll === 'txt2video') {
        const r = await omgJson(OMEGA_BASE + 'txt2video-status?task_key=' + encodeURIComponent(taskId), 60000);
        const d = (r.json && r.json.data) || {};
        const url = d.videoUrl || d.video_url || d.url || '';
        return json({ ok: true, status: url ? 'done' : (d.status || 'pending'), video: url });
      }
      const r = await omgJson(
        OMEGA_BASE + 'Wan-fast?action=status&taskId=' + encodeURIComponent(taskId) + '&aspectRatio=16%3A9',
        60000
      );
      const d = (r.json && r.json.data) || {};
      const status = d.status || 'pending';
      const done = status === 'success' || status === 'succeeded' || status === 'done';
      return json({ ok: true, status: done ? 'done' : status, video: d.videoUrl || '' });
    }

    if (action === 'music') {
      const prompt = String(body.prompt || query.prompt || '').trim();
      if (!prompt) return json({ ok: false, reply: 'Describe the music first.' });
      const r = await omgJson(OMEGA_BASE + 'sonu3?action=generate&prompt=' + encodeURIComponent(prompt), 60000);
      const taskId = r.json && r.json.taskId;
      if (!taskId) return json({ ok: false, reply: 'Music engine: ' + ((r.json && r.json.error) || 'no task returned') });
      return json({ ok: true, taskId, reply: 'Generating music. This takes about 60-120 seconds.' });
    }

    if (action === 'music_status') {
      const taskId = String(body.taskId || query.taskId || '');
      if (!taskId) return json({ ok: false, reply: 'Missing task.' });
      const r = await omgJson(OMEGA_BASE + 'sonu3?action=result&taskId=' + encodeURIComponent(taskId), 60000);
      const j = r.json || {};
      return json({
        ok: true,
        status: j.status || 'pending',
        url: j.url || '',
        title: j.title || '',
        thumbnail: j.thumbnail || '',
        lyrics: j.lyrics || '',
        duration: j.duration || 0
      });
    }

    if (action === 'lyrics') {
      const prompt = String(body.prompt || query.prompt || 'Progress Tech');
      const r = await omgJson(OMEGA_BASE + 'Sonu-ultra?action=generate&prompt=' + encodeURIComponent(prompt), 60000);
      const lyrics = r.json && r.json.data && r.json.data.result && r.json.data.result.data && r.json.data.result.data.lyrics;
      return json({ ok: !!lyrics, reply: lyrics || 'No lyrics returned.' });
    }

    return json({ ok: false, reply: 'Unknown action.' });
  } catch (e) {
    return json({ ok: false, reply: 'Server error: ' + (e && e.message ? e.message : 'unknown') });
  }
}

export async function GET(req) {
  return POST(req);
}
