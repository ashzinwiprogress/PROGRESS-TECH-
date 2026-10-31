'use client';
import { useEffect, useMemo, useState } from 'react';

const TABS = [
  ['hub', 'Playground'],
  ['password', 'Password'],
  ['hash', 'Hash lab'],
  ['encode', 'Encoder'],
  ['headers', 'Headers'],
  ['xss', 'XSS demo'],
  ['phish', 'Phish spotter'],
  ['wifi', 'Wi-Fi hygiene'],
  ['code', 'Secure code'],
  ['ir', 'IR playbook'],
  ['cookies', 'Cookies'],
  ['career', 'Career'],
  ['quiz', 'Quizzes']
];

const PHISH = [
  {
    id: 1,
    from: 'security@faceb00k-help.com',
    subject: 'Your account will be deleted in 1 hour',
    body: 'Click http://faceb00k-help.com/login to keep your account. Enter password now.',
    bad: true,
    why: 'Typosquat domain, panic timer, asks for a password off-site.'
  },
  {
    id: 2,
    from: 'noreply@github.com',
    subject: 'New SSH key added to your account',
    body: 'If this was you, no action needed. Review sessions at github.com/settings/security (type the URL yourself).',
    bad: false,
    why: 'No link bait, no password ask, points you to type the real domain.'
  },
  {
    id: 3,
    from: 'payroll@your-company.support',
    subject: 'Update direct deposit',
    body: 'HR needs your bank login and OTP to process salary. Submit the form today.',
    bad: true,
    why: 'Payroll never needs your bank password or OTP. Fake HR pressure.'
  },
  {
    id: 4,
    from: 'amazon@marketplace.amazon.com',
    subject: 'Your order has shipped',
    body: 'Order 112-8841. Track it by opening Amazon in your app or typing amazon.com. We will never ask for your password by email.',
    bad: false,
    why: 'No credential request, suggests typing the real site or using the app.'
  },
  {
    id: 5,
    from: 'it-helpdesk@secure-mail.net',
    subject: 'VPN expired — WhatsApp this code',
    body: 'Send your VPN password and 2FA codes to this WhatsApp number to restore access.',
    bad: true,
    why: 'Helpdesk will not harvest passwords or 2FA on WhatsApp.'
  }
];

const XSS_SAMPLES = [
  { id: 'safe', label: 'Escaped output (correct)', mode: 'escape' },
  { id: 'bad', label: 'Raw HTML insert (vulnerable demo)', mode: 'raw' }
];

const CODE_SNIPS = [
  {
    id: 'sql',
    title: 'Stop SQL injection',
    bad: 'query("SELECT * FROM users WHERE id = " + userId)',
    good: 'query("SELECT * FROM users WHERE id = ?", [userId])',
    why: 'Keep data out of the SQL string. Use bound parameters.'
  },
  {
    id: 'xss',
    title: 'Stop stored XSS',
    bad: 'el.innerHTML = comment.text',
    good: 'el.textContent = comment.text',
    why: 'Treat user text as text. Encode when you must use HTML.'
  },
  {
    id: 'pass',
    title: 'Store passwords',
    bad: 'db.save({ hash: md5(password) })',
    good: 'db.save({ hash: await scrypt(password, salt) })',
    why: 'Use a slow KDF (scrypt, argon2id, bcrypt). Never MD5/SHA1 for passwords.'
  },
  {
    id: 'idor',
    title: 'Stop IDOR',
    bad: 'return invoiceById(req.query.id)',
    good: 'return invoiceByIdForUser(req.query.id, req.user.id)',
    why: 'Check the caller owns the object. IDs in URLs are not auth.'
  }
];

const WIFI = [
  { q: 'Home Wi-Fi password should be', a: ['The router model name', 'WPA3/WPA2 with a long unique passphrase', 'Blank so guests join', 'Posted on the fridge photo online'], c: 1 },
  { q: 'Public cafe Wi-Fi is safest when you', a: ['Do banking without VPN/HTTPS', 'Avoid sensitive logins or use trusted VPN + HTTPS', 'Turn off the firewall', 'Accept every captive-portal cert'], c: 1 },
  { q: 'A twin SSID named "Airport_Free" next to the real one is often', a: ['Faster 5G', 'An evil-twin / rogue AP social trick', 'Required by WPA3', 'Your ISP mesh'], c: 1 },
  { q: 'WPS PIN on old routers is risky because', a: ['It is encrypted with AES-GCM', 'The PIN space is small and was brute-forced on many devices', 'It disables 2.4 GHz', 'It is only for printers'], c: 1 }
];

const IR_STEPS = [
  { t: 'Prepare', d: 'Contacts, backups, logging, roles, and a written plan before anything breaks.' },
  { t: 'Identify', d: 'Confirm the incident with logs and alerts. Do not panic-wipe evidence.' },
  { t: 'Contain', d: 'Limit blast radius: isolate hosts, rotate creds, block tokens, preserve snapshots.' },
  { t: 'Eradicate', d: 'Remove malware/persistence, patch the root cause, rotate secrets.' },
  { t: 'Recover', d: 'Restore from known-good backups, watch for re-entry, return to service.' },
  { t: 'Lessons', d: 'Write the timeline, gaps, and control upgrades. Brief leadership in plain language.' }
];

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default function Labs() {
  const [tab, setTab] = useState('hub');
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/auth', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null));
  }, []);

  return (
    <section className="section">
      <div className="wrap">
        <div className="kicker">Defensive playground</div>
        <h1>Cyber labs</h1>
        <p className="muted" style={{ margin: '12px 0 18px' }}>
          In-browser training only. No phishing kits, no credential capture, no Wi-Fi attacks, no exploits.
          Practice spotting threats, measuring password strength, hashing, headers, and secure coding.
        </p>
        <p className="tiny" style={{ marginBottom: 18 }}>
          {user ? 'Signed in as ' + user.name + ' — lab runs are saved to your dossier.' : (
            <>Guest mode works. <a href="/register">Register</a> to save scores. <a href="/terms">Terms of Service</a></>
          )}
        </p>
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t[0]} className={'tab' + (tab === t[0] ? ' active' : '')} type="button" onClick={() => setTab(t[0])}>{t[1]}</button>
          ))}
        </div>
        {tab === 'hub' && <Hub setTab={setTab} />}
        {tab === 'password' && <PasswordLab />}
        {tab === 'hash' && <HashLab />}
        {tab === 'encode' && <EncodeLab />}
        {tab === 'headers' && <HeaderLab />}
        {tab === 'xss' && <XssLab />}
        {tab === 'phish' && <PhishLab />}
        {tab === 'wifi' && <WifiLab />}
        {tab === 'code' && <CodeLab />}
        {tab === 'ir' && <IrLab />}
        {tab === 'cookies' && <CookieLab />}
        {tab === 'career' && <CareerLab />}
        {tab === 'quiz' && <QuizLab />}
      </div>
    </section>
  );
}

function Hub({ setTab }) {
  const cards = [
    ['password', 'Password gym', 'Score length, classes, and common-word traps. Nothing is stored as your real password.'],
    ['hash', 'Hash lab', 'See MD5 vs SHA-256 fingerprints. Learn why hashes are not encryption.'],
    ['encode', 'Encoder', 'Base64, URL and hex — encoding is not secrecy.'],
    ['headers', 'Header audit', 'Paste response headers and check CSP, HSTS, clickjacking defenses.'],
    ['xss', 'XSS sandbox', 'Compare escaped vs raw HTML. Scripts in the demo are inert text.'],
    ['phish', 'Phish spotter', 'Classify sample emails. Learn the tells. We never generate lure pages.'],
    ['wifi', 'Wi-Fi hygiene', 'Defend home and cafe networks. No cracking, no packet injection.'],
    ['code', 'Secure snippets', 'Side-by-side unsafe vs safe patterns for SQLi, XSS, IDOR, passwords.'],
    ['ir', 'IR playbook', 'Six-step incident response you can brief to a manager.'],
    ['cookies', 'Cookie flags', 'HttpOnly, Secure, SameSite — what each flag actually blocks.'],
    ['career', 'Career path', 'eJPT, PNPT, OSCP-style roadmap without illegal shortcuts.'],
    ['quiz', 'Academy quizzes', 'Foundations, web defense, and incident response checks.']
  ];
  return (
    <div className="cards">
      {cards.map((c) => (
        <button key={c[0]} className="card glass tilt lab-card" type="button" onClick={() => setTab(c[0])}>
          <h3>{c[1]}</h3>
          <p>{c[2]}</p>
        </button>
      ))}
    </div>
  );
}

function PasswordLab() {
  const [password, setPassword] = useState('');
  const [report, setReport] = useState(null);

  async function run(e) {
    e.preventDefault();
    const r = await fetch('/api/labs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'password', password })
    });
    const d = await r.json();
    setReport(d.report || null);
  }

  return (
    <div className="glass p-tool">
      <h3>Password strength gym</h3>
      <p className="tiny">Use a fake password. We score locally on the server and do not treat this as a login secret for other sites.</p>
      <form className="form" onSubmit={run} style={{ marginTop: 14 }}>
        <label>Sample password</label>
        <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Try a passphrase: correct-horse-battery-staple-!9" />
        <button className="btn btn-cyan" type="submit">Score it</button>
      </form>
      {report && (
        <div className="tool-out">
          <p><strong>{report.label}</strong> · {report.bits} bits · length {report.length}</p>
          <div className="meter"><span style={{ width: Math.min(100, report.score * 11) + '%' }}></span></div>
          <ul className="muted" style={{ paddingLeft: 18, marginTop: 10 }}>
            {report.checks.map((c) => (
              <li key={c.id}>{c.ok ? 'Pass' : 'Missing'} — {c.label}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function HashLab() {
  const [text, setText] = useState('hello academy');
  const [hashes, setHashes] = useState(null);
  const [note, setNote] = useState('');

  async function run(e) {
    e.preventDefault();
    const r = await fetch('/api/labs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'hash', text })
    });
    const d = await r.json();
    setHashes(d.hashes || null);
    setNote(d.note || '');
  }

  return (
    <div className="glass p-tool">
      <h3>Hash fingerprint lab</h3>
      <p className="tiny">Change one character and watch the digest flip. That avalanche effect is integrity, not hiding.</p>
      <form className="form" onSubmit={run}>
        <label>Text</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn btn-cyan" type="submit">Hash</button>
      </form>
      {hashes && (
        <div className="code-out">
          {Object.entries(hashes).map(([k, v]) => (
            <div key={k}><strong>{k}</strong>: {v}</div>
          ))}
          <p style={{ marginTop: 12 }}>{note}</p>
        </div>
      )}
    </div>
  );
}

function EncodeLab() {
  const [text, setText] = useState('Progress Tech');
  const [mode, setMode] = useState('base64');
  const [output, setOutput] = useState('');
  const [err, setErr] = useState('');

  async function run(e) {
    e.preventDefault();
    setErr('');
    const r = await fetch('/api/labs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'encode', text, mode })
    });
    const d = await r.json();
    if (!d.ok) setErr(d.error || 'Failed');
    else setOutput(d.output || '');
  }

  return (
    <div className="glass p-tool">
      <h3>Encode / decode</h3>
      <p className="tiny">Base64 is packaging, not encryption. Anyone can reverse it.</p>
      <form className="form" onSubmit={run}>
        <label>Input</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
        <label>Mode</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="base64">UTF-8 to Base64</option>
          <option value="base64-decode">Base64 to UTF-8</option>
          <option value="url">URL encode</option>
          <option value="url-decode">URL decode</option>
          <option value="hex">UTF-8 to hex</option>
          <option value="hex-decode">Hex to UTF-8</option>
        </select>
        <button className="btn btn-cyan" type="submit">Run</button>
      </form>
      {err && <p className="err">{err}</p>}
      {output && <pre className="code-out">{output}</pre>}
    </div>
  );
}

function HeaderLab() {
  const sample = 'content-security-policy: default-src \'self\'\nx-frame-options: DENY\nx-content-type-options: nosniff\nreferrer-policy: strict-origin-when-cross-origin';
  const [headers, setHeaders] = useState(sample);
  const [out, setOut] = useState(null);

  async function run(e) {
    e.preventDefault();
    const r = await fetch('/api/labs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'headers', headers })
    });
    setOut(await r.json());
  }

  return (
    <div className="glass p-tool">
      <h3>Security header review</h3>
      <p className="tiny">Paste headers from your own app (browser DevTools → Network). This checker never scans other hosts.</p>
      <form className="form" onSubmit={run}>
        <label>Headers</label>
        <textarea value={headers} onChange={(e) => setHeaders(e.target.value)} />
        <button className="btn btn-cyan" type="submit">Audit</button>
      </form>
      {out && out.recs && (
        <div className="tool-out">
          <p>Score {out.score}/{out.total}</p>
          <ul className="muted" style={{ paddingLeft: 18 }}>
            {out.recs.map((r) => (
              <li key={r.id}><strong>{r.ok ? 'Present' : 'Missing'}</strong> {r.name} — {r.fix}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function XssLab() {
  const [input, setInput] = useState('<b>hello</b> <script>alert(1)</script>');
  const [mode, setMode] = useState('escape');

  const shown = mode === 'escape' ? escapeHtml(input) : escapeHtml(input);

  async function mark() {
    await fetch('/api/labs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'xss-lab' })
    });
  }

  return (
    <div className="glass p-tool">
      <h3>XSS output demo</h3>
      <p className="tiny">
        Both views show escaped text so this page cannot run attacker script. The lesson is visual:
        defenders encode output; vulnerable apps would inject HTML. We never execute your payload.
      </p>
      <div className="form">
        <label>Untrusted comment</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} />
        <div className="btns">
          {XSS_SAMPLES.map((s) => (
            <button key={s.id} className={'btn ' + (mode === s.mode ? 'btn-cyan' : 'btn-ghost')} type="button" onClick={() => { setMode(s.mode); mark(); }}>{s.label}</button>
          ))}
        </div>
      </div>
      <div className="xss-frame">
        <div className="tiny">{mode === 'escape' ? 'Safe render (textContent / encode)' : 'What a bug would try to do — still encoded here'}</div>
        <pre className="code-out">{shown}</pre>
        <p className="tiny">If this were innerHTML without encoding, tags could become DOM. Fix: encode, CSP, HttpOnly cookies, sanitizers for rich text.</p>
      </div>
    </div>
  );
}

function PhishLab() {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState('');
  const mail = PHISH[i];

  async function choose(isBad) {
    const ok = isBad === mail.bad;
    const nextScore = score + (ok ? 1 : 0);
    setMsg((ok ? 'Correct. ' : 'Not quite. ') + mail.why);
    setScore(nextScore);
    await fetch('/api/labs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'awareness', scoreKey: 'phish', score: nextScore })
    });
  }

  function next() {
    setMsg('');
    setI((x) => (x + 1) % PHISH.length);
  }

  return (
    <div className="glass p-tool">
      <h3>Phishing awareness — spot the fake</h3>
      <p className="tiny">These are static classroom samples. The academy does not generate lure links or collect passwords from cloned brands.</p>
      <div className="mail glass" style={{ padding: 18, marginTop: 14 }}>
        <div className="tiny">From: {mail.from}</div>
        <h3 style={{ margin: '8px 0' }}>{mail.subject}</h3>
        <p className="muted">{mail.body}</p>
      </div>
      <div className="btns" style={{ marginTop: 16 }}>
        <button className="btn btn-gold" type="button" onClick={() => choose(true)}>This is phishing</button>
        <button className="btn btn-cyan" type="button" onClick={() => choose(false)}>Looks legitimate</button>
        <button className="btn btn-ghost" type="button" onClick={next}>Next sample</button>
      </div>
      {msg && <p className="ok" style={{ marginTop: 12 }}>{msg}</p>}
      <p className="tiny" style={{ marginTop: 8 }}>Session score {score} / {PHISH.length}</p>
    </div>
  );
}

function WifiLab() {
  const [picks, setPicks] = useState([]);
  const [result, setResult] = useState(null);

  function pick(qi, ai) {
    const next = picks.slice();
    next[qi] = ai;
    setPicks(next);
  }

  async function grade(e) {
    e.preventDefault();
    let s = 0;
    WIFI.forEach((q, i) => { if (picks[i] === q.c) s += 1; });
    setResult({ s, t: WIFI.length });
    await fetch('/api/labs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'wifi-hygiene', scoreKey: 'wifi', score: s })
    });
  }

  return (
    <div className="glass p-tool">
      <h3>Wi-Fi defender quiz</h3>
      <p className="tiny">Hardening only: passphrases, evil-twin awareness, public-network caution. No cracking labs.</p>
      <form onSubmit={grade}>
        {WIFI.map((q, qi) => (
          <fieldset key={q.q} className="quiz-q">
            <legend>{q.q}</legend>
            {q.a.map((opt, ai) => (
              <label key={opt} className="check-row">
                <input type="radio" name={'w' + qi} checked={picks[qi] === ai} onChange={() => pick(qi, ai)} />
                <span>{opt}</span>
              </label>
            ))}
          </fieldset>
        ))}
        <button className="btn btn-cyan" type="submit">Grade</button>
      </form>
      {result && <p className="ok" style={{ marginTop: 12 }}>{result.s}/{result.t} — review wrong answers and lock down your own AP.</p>}
    </div>
  );
}

function CodeLab() {
  const [id, setId] = useState('sql');
  const snip = useMemo(() => CODE_SNIPS.find((s) => s.id === id), [id]);

  async function seen(next) {
    setId(next);
    await fetch('/api/labs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'code', scoreKey: 'secure-code' })
    });
  }

  return (
    <div className="glass p-tool">
      <h3>Secure coding side-by-side</h3>
      <div className="tabs" style={{ marginTop: 12 }}>
        {CODE_SNIPS.map((s) => (
          <button key={s.id} className={'tab' + (id === s.id ? ' active' : '')} type="button" onClick={() => seen(s.id)}>{s.title}</button>
        ))}
      </div>
      <div className="code-grid">
        <pre className="code-out bad-code"><strong>Unsafe</strong>{'\n'}{snip.bad}</pre>
        <pre className="code-out good-code"><strong>Safer</strong>{'\n'}{snip.good}</pre>
      </div>
      <p className="muted">{snip.why}</p>
    </div>
  );
}

function IrLab() {
  const [open, setOpen] = useState(0);

  async function pick(i) {
    setOpen(i);
    await fetch('/api/labs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'ir', scoreKey: 'ir', score: i + 1 })
    });
  }

  return (
    <div className="glass p-tool">
      <h3>Incident response playbook</h3>
      <p className="tiny">Walk the NIST-style loop. Use this language in reports. No offensive steps.</p>
      <div className="cards" style={{ marginTop: 16 }}>
        {IR_STEPS.map((s, i) => (
          <button key={s.t} className={'card glass' + (open === i ? ' active-card' : '')} type="button" onClick={() => pick(i)}>
            <div className="tiny">0{i + 1}</div>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function CookieLab() {
  const rows = [
    ['HttpOnly', 'JavaScript on the page cannot read the cookie. Cuts a lot of XSS session theft.'],
    ['Secure', 'Cookie only travels on HTTPS. Stops cleartext Wi-Fi sniffing of the value.'],
    ['SameSite=Lax/Strict', 'Limits cross-site sending. Makes classic CSRF harder.'],
    ['Path / Domain', 'Shrink where the cookie is sent. Do not set Domain too wide.'],
    ['__Host- prefix', 'Browser enforces Secure, no Domain, Path=/. Strong default for session cookies.']
  ];
  return (
    <div className="glass p-tool">
      <h3>Cookie defense flags</h3>
      <p className="tiny">Session cookies are keys. Flags are locks. This is configuration literacy, not cookie stealing.</p>
      <ul className="muted" style={{ paddingLeft: 18, marginTop: 14 }}>
        {rows.map((r) => (
          <li key={r[0]} style={{ marginBottom: 8 }}><strong>{r[0]}</strong> — {r[1]}</li>
        ))}
      </ul>
    </div>
  );
}

function CareerLab() {
  const steps = [
    ['Now', 'Linux, HTTP, Python basics, academy notes, password/MFA hygiene.'],
    ['3 months', 'OWASP Top 10 on Juice Shop / DVWA. Write 5 lab reports.'],
    ['6 months', 'eJPT or equivalent. Bug bounty policy reading. Portfolio GitHub of notes — not exploits.'],
    ['12 months', 'PNPT/OSCP-style lab time on machines you own or pay for. Apply to junior SOC / appsec intern.']
  ];
  return (
    <div className="glass p-tool">
      <h3>White-hat career path</h3>
      <p className="tiny">Certs prove labs. Employers hire people who can write, scope, and stay legal.</p>
      <div className="cards" style={{ marginTop: 16 }}>
        {steps.map((s) => (
          <article className="card glass" key={s[0]}>
            <div className="tiny">{s[0]}</div>
            <p>{s[1]}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function QuizLab() {
  const [bank, setBank] = useState(null);
  const [track, setTrack] = useState('foundations');
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch('/api/labs')
      .then((r) => r.json())
      .then((d) => setBank(d.quizzes || null))
      .catch(() => setBank(null));
  }, []);

  function pick(qi, ai) {
    const next = answers.slice();
    next[qi] = ai;
    setAnswers(next);
  }

  async function grade(e) {
    e.preventDefault();
    const r = await fetch('/api/labs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool: 'quiz', track, answers })
    });
    setResult(await r.json());
  }

  const qs = (bank && bank[track]) || [];

  return (
    <div className="glass p-tool">
      <h3>Academy quizzes</h3>
      <div className="tabs" style={{ marginTop: 12 }}>
        {['foundations', 'web', 'ir'].map((t) => (
          <button key={t} className={'tab' + (track === t ? ' active' : '')} type="button" onClick={() => { setTrack(t); setAnswers([]); setResult(null); }}>{t}</button>
        ))}
      </div>
      <form onSubmit={grade}>
        {qs.map((q, qi) => (
          <fieldset key={q.q} className="quiz-q">
            <legend>{q.q}</legend>
            {q.a.map((opt, ai) => (
              <label key={opt} className="check-row">
                <input type="radio" name={'q' + qi} checked={answers[qi] === ai} onChange={() => pick(qi, ai)} />
                <span>{opt}</span>
              </label>
            ))}
          </fieldset>
        ))}
        <button className="btn btn-gold" type="submit">Submit quiz</button>
      </form>
      {result && result.ok && (
        <div className="tool-out">
          <p className="ok">Score {result.score}/{result.total}</p>
          <ul className="muted" style={{ paddingLeft: 18 }}>
            {(result.detail || []).map((d) => (
              <li key={d.q}>{d.ok ? 'Correct' : 'Review'} — {d.q}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
