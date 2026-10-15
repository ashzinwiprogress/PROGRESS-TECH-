'use client';
import { useState, useRef, useEffect } from 'react';

const SUB = {
  deepai: [['deepseek-v3.2', 'DeepSeek V3.2'], ['gemini-2.5-flashlite', 'Gemini 2.5 Flash Lite'], ['gemma-4', 'Gemma 4'], ['llama-3.3-70b-instruct', 'Llama 3.3 70B'], ['gpt-oss-120b', 'GPT-OSS 120B'], ['gpt-5-nano', 'GPT-5 Nano'], ['GPT-5', 'GPT-5']],
  hotbot: [['gpt-5', 'GPT-5'], ['claude-3.5-sonnet-20241022', 'Claude 3.5 Sonnet'], ['gemini-2.5-pro', 'Gemini 2.5 Pro'], ['deepseek-r1', 'DeepSeek R1'], ['o3-mini', 'o3-mini'], ['grok-3', 'Grok 3']],
  aicli: [['gpt', 'GPT'], ['claude', 'Claude'], ['gemini', 'Gemini'], ['mistral', 'Mistral'], ['copilot', 'Copilot']]
};

const TABS = [
  ['chat', 'Chat'],
  ['image', 'Image'],
  ['edit', 'Image Edit'],
  ['video', 'Video'],
  ['code', 'Code / Files'],
  ['music', 'Music']
];

export default function Studio() {
  const [tab, setTab] = useState('chat');
  return (
    <section className="section">
      <div className="wrap">
        <div className="kicker">Multi-model AI laboratory</div>
        <h1>PROGRESS TECH AI Studio</h1>
        <p className="muted" style={{ margin: '12px 0 26px' }}>
          20+ live models. Chat, generate images, edit photos, generate videos, scan code and build apps, and compose music.
        </p>
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t[0]} className={'tab' + (tab === t[0] ? ' active' : '')} type="button" onClick={() => setTab(t[0])}>{t[1]}</button>
          ))}
        </div>
        {tab === 'chat' && <ChatTab />}
        {tab === 'image' && <ImageTab />}
        {tab === 'edit' && <EditTab />}
        {tab === 'video' && <VideoTab />}
        {tab === 'code' && <CodeTab />}
        {tab === 'music' && <MusicTab />}
      </div>
    </section>
  );
}

function ChatTab() {
  const [model, setModel] = useState('gemini');
  const [sub, setSub] = useState('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState([{ who: 'bot', text: 'Hello, I am PROGRESS TECH. Pick a model and ask anything about cyber, code, or tech.' }]);
  const boxRef = useRef(null);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [msgs]);
  useEffect(() => {
    const list = SUB[model];
    setSub(list ? list[0][0] : '');
  }, [model]);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setMsgs((m) => [...m, { who: 'user', text }]);
    setInput('');
    setBusy(true);
    try {
      const r = await fetch('/api/ai?action=chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, model, sub })
      });
      const d = await r.json();
      setMsgs((m) => [...m, { who: 'bot', text: d.reply || 'No response.', zip: d.zip }]);
    } catch (err) {
      setMsgs((m) => [...m, { who: 'bot', text: 'Connection issue. Try again.' }]);
    } finally {
      setBusy(false);
    }
  }

  const subList = SUB[model];

  return (
    <div className="glass studio-box">
      <div className="chat-head">
        <strong>Chat with any model</strong>
      </div>
      <div className="chat-msgs" ref={boxRef}>
        {msgs.map((m, i) => (
          <div key={i}>
            <div className={'bubble ' + m.who}>{m.text}</div>
            {m.zip && <a className="btn btn-cyan" style={{ marginTop: 8 }} download="progress-tech-app.zip" href={m.zip}>Download ZIP</a>}
          </div>
        ))}
        {busy && <div className="bubble bot">PROGRESS TECH is thinking...</div>}
      </div>
      <div className="model-row">
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          <option value="gemini">Gemini (3.1 Flash Lite)</option>
          <option value="gpt4mini">GPT-4o mini</option>
          <option value="chatgpt">ChatGPT v2</option>
          <option value="claude">Claude</option>
          <option value="deepai">Deep AI (multi)</option>
          <option value="hotbot">HotBot (GPT-5 class)</option>
          <option value="asyntai">Asyntai</option>
          <option value="chatbot">Claude Code bot</option>
          <option value="unlimited">Unlimited AI</option>
          <option value="perplexity">Perplexity</option>
          <option value="aicli">AICLI (multi)</option>
          <option value="llama">Llama app builder (ZIP)</option>
        </select>
        {subList && (
          <select value={sub} onChange={(e) => setSub(e.target.value)}>
            {subList.map((o) => <option key={o[0]} value={o[0]}>{o[1]}</option>)}
          </select>
        )}
      </div>
      <form className="chat-form" onSubmit={send}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask PROGRESS TECH..." autoComplete="off" />
        <button className="btn btn-cyan" type="submit" disabled={busy}>Send</button>
      </form>
    </div>
  );
}

function DownloadableImage({ src, label }) {
  return (
    <div>
      <img className="result-img" src={src} alt="result" />
      <div className="res-actions">
        <a className="btn btn-cyan" href={src} download={label}>Download PNG</a>
        <a className="btn btn-ghost" href={src} target="_blank" rel="noopener">Open full size</a>
      </div>
    </div>
  );
}

function ImageTab() {
  const [prompt, setPrompt] = useState('');
  const [engine, setEngine] = useState('flux');
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setOut(null);
    try {
      const fd = new FormData();
      fd.append('prompt', prompt);
      fd.append('engine', engine);
      const r = await fetch('/api/ai?action=image', { method: 'POST', body: fd });
      const d = await r.json();
      setOut(d);
    } catch (err) {
      setOut({ ok: false, reply: 'Connection issue. Try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form glass p-tool active-pane" onSubmit={submit}>
      <h3>Text to image</h3>
      <p className="tiny">Returns a raw PNG you can view and download.</p>
      <label>Prompt</label>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} required placeholder="A neon cyber ocean with a Progress Tech shield, cinematic"></textarea>
      <label>Engine</label>
      <select value={engine} onChange={(e) => setEngine(e.target.value)}>
        <option value="flux">Flux (raw PNG)</option>
        <option value="argen">Argen (flux2)</option>
      </select>
      <button className="btn btn-cyan" type="submit" disabled={busy}>{busy ? 'Generating...' : 'Generate image'}</button>
      <div className="tool-out">
        {busy && <div className="loader"></div>}
        {out && out.ok && out.image && <DownloadableImage src={out.image} label="progress-tech-image.png" />}
        {out && !out.ok && <p className="err">{out.reply}</p>}
        {out && out.ok && !out.image && <p className="muted">{out.reply}</p>}
      </div>
    </form>
  );
}

function EditTab() {
  const [prompt, setPrompt] = useState('');
  const [engine, setEngine] = useState('nanobana');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState(null);
  const inputRef = useRef(null);

  function choose(f) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : '');
  }

  async function submit(e) {
    e.preventDefault();
    if (!file) { setOut({ ok: false, reply: 'Upload an image first.' }); return; }
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setOut(null);
    try {
      const fd = new FormData();
      fd.append('prompt', prompt);
      fd.append('engine', engine);
      fd.append('image', file);
      const r = await fetch('/api/ai?action=edit', { method: 'POST', body: fd });
      const d = await r.json();
      setOut(d);
    } catch (err) {
      setOut({ ok: false, reply: 'Connection issue. Try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form glass p-tool" onSubmit={submit}>
      <h3>AI image editor</h3>
      <p className="tiny">Upload a photo, describe the change, and get an edited raw PNG back. Nano Banana gives the best edits.</p>
      <label>Upload image</label>
      <input ref={inputRef} type="file" accept="image/*" required onChange={(e) => choose(e.target.files[0])} />
      {preview && <img className="result-img" src={preview} alt="preview" style={{ maxWidth: 260 }} />}
      <label>What should change?</label>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} required placeholder="Make the sky ocean blue and add neon reflections"></textarea>
      <label>Engine</label>
      <select value={engine} onChange={(e) => setEngine(e.target.value)}>
        <option value="nanobana">Nano Banana (best edit)</option>
        <option value="flux">Flux edit</option>
      </select>
      <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? 'Editing...' : 'Edit image'}</button>
      <div className="tool-out">
        {busy && <div className="loader"></div>}
        {out && out.ok && out.image && <DownloadableImage src={out.image} label="progress-tech-edited.png" />}
        {out && !out.ok && <p className="err">{out.reply}</p>}
      </div>
    </form>
  );
}

function VideoTab() {
  const [mode, setMode] = useState('text');
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState('16:9');
  const [sound, setSound] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [video, setVideo] = useState('');
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function choose(f) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : '');
  }

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    if (!prompt.trim() && !file) { setStatus('Write a prompt or upload an image.'); return; }
    setBusy(true);
    setVideo('');
    setStatus('Starting your video...');
    try {
      const fd = new FormData();
      fd.append('mode', mode);
      fd.append('prompt', prompt);
      fd.append('ratio', ratio);
      fd.append('sound', sound ? 'true' : 'false');
      if (mode === 'image' && file) fd.append('image', file);
      const r = await fetch('/api/ai?action=video', { method: 'POST', body: fd });
      const d = await r.json();
      if (d.video) {
        setVideo(d.video);
        setStatus('Video ready.');
        setBusy(false);
        return;
      }
      if (d.ok && d.taskId) {
        let tries = 0;
        timerRef.current = setInterval(async () => {
          tries++;
          setStatus('Rendering video... ' + tries * 8 + 's (can take a few minutes)');
          try {
            const sr = await fetch('/api/ai?action=video_status&taskId=' + encodeURIComponent(d.taskId) + '&poll=' + (d.poll || 'wan'));
            const s = await sr.json();
            if (s.status === 'done' && s.video) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              setVideo(s.video);
              setStatus('Video ready.');
              setBusy(false);
            } else if (s.status === 'failed' || s.status === 'error') {
              clearInterval(timerRef.current);
              timerRef.current = null;
              setStatus('Video generation failed. Try again.');
              setBusy(false);
            } else if (tries > 45) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              setStatus('Timed out. Try again.');
              setBusy(false);
            }
          } catch (err) { /* keep polling */ }
        }, 8000);
        return;
      }
      setStatus(d.reply || 'Could not start video generation.');
      setBusy(false);
    } catch (err) {
      setStatus('Connection issue. Try again.');
      setBusy(false);
    }
  }

  return (
    <form className="form glass p-tool" onSubmit={submit}>
      <h3>AI video generator</h3>
      <p className="tiny">Turn a prompt into a video, or upload an image to animate it. Returns a raw MP4 you can play and download.</p>
      <label>Mode</label>
      <select value={mode} onChange={(e) => setMode(e.target.value)}>
        <option value="text">Text to video</option>
        <option value="image">Image to video (animate a photo)</option>
      </select>
      {mode === 'image' && (
        <>
          <label>Upload image to animate</label>
          <input type="file" accept="image/*" onChange={(e) => choose(e.target.files[0])} />
          {preview && <img className="result-img" src={preview} alt="preview" style={{ maxWidth: 260 }} />}
        </>
      )}
      <label>Prompt / motion description</label>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A cyber ocean with neon waves, cinematic, slow camera push"></textarea>
      <label>Aspect ratio</label>
      <select value={ratio} onChange={(e) => setRatio(e.target.value)}>
        <option value="16:9">16:9 Landscape</option>
        <option value="9:16">9:16 Portrait</option>
        <option value="1:1">1:1 Square</option>
      </select>
      {mode === 'text' && (
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
          <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} style={{ width: 'auto' }} /> Add AI voiceover / sound
        </label>
      )}
      <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? 'Generating...' : 'Generate video'}</button>
      <div className="tool-out">
        {busy && <div className="loader"></div>}
        {status && <p className="muted">{status}</p>}
        {video && (
          <div>
            <video className="result-img" src={video} controls style={{ maxWidth: 620 }}></video>
            <div className="res-actions">
              <a className="btn btn-cyan" href={video} download="progress-tech-video.mp4" target="_blank" rel="noopener">Download MP4</a>
              <a className="btn btn-ghost" href={video} target="_blank" rel="noopener">Open full size</a>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

function CodeTab() {
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState(null);
  const [fname, setFname] = useState('');
  const formRef = useRef(null);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setOut(null);
    try {
      const fd = new FormData(formRef.current);
      const r = await fetch('/api/ai?action=code', { method: 'POST', body: fd });
      const d = await r.json();
      setOut(d);
    } catch (err) {
      setOut({ ok: false, reply: 'Connection issue. Try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form glass p-tool" ref={formRef} onSubmit={submit}>
      <h3>Coding AI - build, scan and fix code</h3>
      <p className="tiny">Upload source files or a ZIP, or just describe an app. Small results return as code, big projects return as a ZIP download.</p>
      <label>Mode</label>
      <select name="mode" defaultValue="generate">
        <option value="generate">Generate / build an app, website or system</option>
        <option value="analyze">Scan uploaded code and fix or improve it</option>
      </select>
      <label>Upload file or ZIP (optional)</label>
      <input
        type="file"
        name="file"
        accept=".zip,.txt,.md,.php,.js,.ts,.jsx,.tsx,.py,.html,.css,.json,.sh,.java,.c,.cpp,.cs,.rb,.go,.sql,.xml,.yml,.yaml,.rs"
        onChange={(e) => setFname(e.target.files[0] ? e.target.files[0].name : '')}
      />
      {fname && <p className="tiny">Selected: {fname}</p>}
      <label>Your request</label>
      <textarea name="prompt" placeholder="Build a movie streaming site with stream and download, or: find bugs in this code"></textarea>
      <button className="btn btn-cyan" type="submit" disabled={busy}>{busy ? 'Working...' : 'Run AI coder'}</button>
      <div className="tool-out">
        {busy && <div className="loader"></div>}
        {out && out.zip && <a className="btn btn-cyan" download="progress-tech-code.zip" href={out.zip}>Download ZIP</a>}
        {out && out.reply && <pre className="code-out">{out.reply}</pre>}
        {out && !out.ok && <p className="err">{out.reply}</p>}
      </div>
    </form>
  );
}

function MusicTab() {
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [song, setSong] = useState(null);
  const [lyrics, setLyrics] = useState('');
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  async function submit(e) {
    e.preventDefault();
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setSong(null);
    setLyrics('');
    setStatus('Composing your track...');
    try {
      const r = await fetch('/api/ai?action=music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'prompt=' + encodeURIComponent(prompt)
      });
      const d = await r.json();
      if (!d.ok || !d.taskId) {
        setStatus(d.reply || 'Failed to start generation.');
        setBusy(false);
        return;
      }
      setStatus('Generating music... 0s (usually 60-120s)');
      let tries = 0;
      timerRef.current = setInterval(async () => {
        tries++;
        setStatus('Generating music... ' + tries * 6 + 's (usually 60-120s)');
        try {
          const sr = await fetch('/api/ai?action=music_status&taskId=' + encodeURIComponent(d.taskId));
          const s = await sr.json();
          if (s.status === 'done' && s.url) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setSong(s);
            setLyrics(s.lyrics || '');
            setStatus('');
            setBusy(false);
          } else if (s.status === 'failed' || s.status === 'error') {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setStatus('Music generation failed. Try again.');
            setBusy(false);
          } else if (tries > 40) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setStatus('Timed out. Try again.');
            setBusy(false);
          }
        } catch (err) { /* keep polling */ }
      }, 6000);
    } catch (err) {
      setStatus('Connection issue. Try again.');
      setBusy(false);
    }
  }

  return (
    <form className="form glass p-tool" onSubmit={submit}>
      <h3>Music generator</h3>
      <p className="tiny">Describe a track. You get raw MP3 audio to play and download, plus lyrics.</p>
      <label>Describe your music</label>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} required placeholder="An epic motivational cyber anthem for Progress Tech, electronic, uplifting"></textarea>
      <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? 'Generating...' : 'Generate music'}</button>
      <div className="tool-out">
        {busy && <div className="loader"></div>}
        {status && <p className="muted">{status}</p>}
        {song && (
          <div>
            <p className="ok">{song.title || 'Your track'}{song.duration ? ' - ' + song.duration + 's' : ''}</p>
            <audio controls src={song.url} style={{ width: '100%' }}></audio>
            <div className="res-actions">
              <a className="btn btn-cyan" download target="_blank" rel="noopener" href={song.url}>Download MP3</a>
            </div>
          </div>
        )}
        {lyrics && (
          <div>
            <h3>Lyrics</h3>
            <pre className="code-out">{lyrics}</pre>
          </div>
        )}
      </div>
    </form>
  );
}
