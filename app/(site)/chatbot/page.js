'use client';
import { useState, useRef, useEffect } from 'react';

const SUB = {
  deepai: [['deepseek-v3.2', 'DeepSeek V3.2'], ['gemini-2.5-flashlite', 'Gemini 2.5 Flash Lite'], ['gemma-4', 'Gemma 4'], ['llama-3.3-70b-instruct', 'Llama 3.3 70B'], ['gpt-oss-120b', 'GPT-OSS 120B'], ['gpt-5-nano', 'GPT-5 Nano'], ['GPT-5', 'GPT-5']],
  hotbot: [['gpt-5', 'GPT-5'], ['claude-3.5-sonnet-20241022', 'Claude 3.5 Sonnet'], ['gemini-2.5-pro', 'Gemini 2.5 Pro'], ['deepseek-r1', 'DeepSeek R1'], ['o3-mini', 'o3-mini'], ['grok-3', 'Grok 3']],
  aicli: [['gpt', 'GPT'], ['claude', 'Claude'], ['gemini', 'Gemini'], ['mistral', 'Mistral'], ['copilot', 'Copilot']]
};

export default function Chatbot() {
  const [model, setModel] = useState('gemini');
  const [sub, setSub] = useState('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState([{ who: 'bot', text: 'Welcome. I am PROGRESS TECH. Ask for notes, Termux commands, Python snippets, or switch to Llama to generate a starter app ZIP.' }]);
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
    <section className="section">
      <div className="wrap" style={{ width: 'min(1280px, 96%)' }}>
        <div className="kicker">Assistant</div>
        <h1>PROGRESS TECH chatbot</h1>
        <p className="muted" style={{ marginBottom: 20 }}>
          Owner: PROGRESS TECH. Helps with cybersecurity, ethical hacking, pentesting, Termux, Python, web and lab-safe tips.
          Pick any model. Llama builds app files as a ZIP download.
        </p>
        <div className="glass chat-big" style={{ height: 'min(85vh, 940px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="chat-head">
            <div>
              <strong>PROGRESS TECH</strong>
              <div className="tiny">13 model routes - Gemini, GPT, Claude, DeepSeek, WormGPT education, Llama</div>
            </div>
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
              <option value="gemini">Gemini</option>
              <option value="gpt4mini">GPT-4o mini</option>
              <option value="chatgpt">ChatGPT v2</option>
              <option value="claude">Claude</option>
              <option value="deepai">Deep AI</option>
              <option value="hotbot">HotBot (GPT-5)</option>
              <option value="asyntai">Asyntai</option>
              <option value="chatbot">Claude Code bot</option>
              <option value="unlimited">Unlimited AI</option>
              <option value="perplexity">Perplexity</option>
              <option value="aicli">AICLI</option>
              <option value="wormgpt">WormGPT (education)</option>
              <option value="llama">Llama app builder (ZIP)</option>
            </select>
            {subList && (
              <select value={sub} onChange={(e) => setSub(e.target.value)}>
                {subList.map((o) => <option key={o[0]} value={o[0]}>{o[1]}</option>)}
              </select>
            )}
          </div>
          <div className="model-row">
            <a className="btn btn-ghost" href="/studio" style={{ width: '100%' }}>Image, image edit, code and music tools</a>
          </div>
          <form className="chat-form" onSubmit={send}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message PROGRESS TECH..." autoComplete="off" />
            <button className="btn btn-cyan" type="submit" disabled={busy}>Send</button>
          </form>
        </div>
      </div>
    </section>
  );
}
