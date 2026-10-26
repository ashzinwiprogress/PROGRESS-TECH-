'use client';
import { useState, useRef, useEffect } from 'react';

const SUB = {
  deepai: [['deepseek-v3.2', 'DeepSeek V3.2'], ['gemini-2.5-flashlite', 'Gemini 2.5 Flash Lite'], ['gemma-4', 'Gemma 4'], ['llama-3.3-70b-instruct', 'Llama 3.3 70B'], ['gpt-oss-120b', 'GPT-OSS 120B'], ['gpt-5-nano', 'GPT-5 Nano'], ['GPT-5', 'GPT-5']],
  hotbot: [['gpt-5', 'GPT-5'], ['claude-3.5-sonnet-20241022', 'Claude 3.5 Sonnet'], ['gemini-2.5-pro', 'Gemini 2.5 Pro'], ['deepseek-r1', 'DeepSeek R1'], ['o3-mini', 'o3-mini'], ['grok-3', 'Grok 3']],
  aicli: [['gpt', 'GPT'], ['claude', 'Claude'], ['gemini', 'Gemini'], ['mistral', 'Mistral'], ['copilot', 'Copilot']]
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [model, setModel] = useState('gemini');
  const [sub, setSub] = useState('');
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState([{ who: 'bot', text: 'I am PROGRESS TECH. Ask about cybersecurity, ethical hacking, Termux, Python, web development, or pentesting. Switch models below.' }]);
  const [busy, setBusy] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [msgs, open]);

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
    } catch (e) {
      setMsgs((m) => [...m, { who: 'bot', text: 'Connection issue. Try again.' }]);
    } finally {
      setBusy(false);
    }
  }

  const subList = SUB[model];

  return (
    <>
      <button className="chat-fab" type="button" title="PROGRESS TECH Chat" onClick={() => setOpen(!open)}>PT</button>
      {open && (
        <div className="chat-panel glass">
          <div className="chat-head">
            <div>
              <strong>PROGRESS TECH</strong>
              <div className="tiny">Owner: PROGRESS TECH - Cyber &amp; code assistant</div>
            </div>
            <button className="btn btn-ghost" type="button" onClick={() => setOpen(false)}>Close</button>
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
            <a className="btn btn-ghost" href="/studio" style={{ width: '100%' }}>Open full AI Studio</a>
          </div>
          <form className="chat-form" onSubmit={send}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask PROGRESS TECH..." autoComplete="off" />
            <button className="btn btn-cyan" type="submit" disabled={busy}>Send</button>
          </form>
        </div>
      )}
    </>
  );
}
