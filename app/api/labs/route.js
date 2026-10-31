import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { userFromRequest, publicUser, touchLab } from '../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function entropyBits(password) {
  const p = String(password || '');
  let pool = 0;
  if (/[a-z]/.test(p)) pool += 26;
  if (/[A-Z]/.test(p)) pool += 26;
  if (/[0-9]/.test(p)) pool += 10;
  if (/[^A-Za-z0-9]/.test(p)) pool += 33;
  if (!pool || !p.length) return 0;
  return Math.round(p.length * Math.log2(pool));
}

function passwordReport(password) {
  const p = String(password || '');
  const checks = [
    { id: 'len', ok: p.length >= 12, label: 'At least 12 characters' },
    { id: 'lower', ok: /[a-z]/.test(p), label: 'Lowercase letter' },
    { id: 'upper', ok: /[A-Z]/.test(p), label: 'Uppercase letter' },
    { id: 'num', ok: /[0-9]/.test(p), label: 'Number' },
    { id: 'sym', ok: /[^A-Za-z0-9]/.test(p), label: 'Symbol' },
    { id: 'space', ok: !/\s/.test(p), label: 'No spaces' },
    { id: 'common', ok: !/(password|123456|qwerty|admin|letmein|welcome|iloveyou)/i.test(p), label: 'Not a common word' }
  ];
  const bits = entropyBits(p);
  let score = checks.filter((c) => c.ok).length;
  if (bits >= 60) score += 1;
  if (bits >= 80) score += 1;
  let label = 'Very weak';
  if (score >= 4) label = 'Weak';
  if (score >= 6) label = 'Fair';
  if (score >= 8) label = 'Strong';
  if (score >= 9) label = 'Excellent';
  return { checks, bits, score, label, length: p.length };
}

function headerFlags(raw) {
  const text = String(raw || '');
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const map = {};
  for (const line of lines) {
    const i = line.indexOf(':');
    if (i < 1) continue;
    map[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  }
  const recs = [
    { id: 'csp', name: 'Content-Security-Policy', ok: !!map['content-security-policy'], fix: 'Restrict script sources. Avoid unsafe-inline when you can.' },
    { id: 'xfo', name: 'X-Frame-Options', ok: !!map['x-frame-options'] || /frame-ancestors/.test(map['content-security-policy'] || ''), fix: 'DENY or SAMEORIGIN to block clickjacking.' },
    { id: 'xcto', name: 'X-Content-Type-Options', ok: /nosniff/i.test(map['x-content-type-options'] || ''), fix: 'Set nosniff so browsers do not guess MIME types.' },
    { id: 'ref', name: 'Referrer-Policy', ok: !!map['referrer-policy'], fix: 'Use strict-origin-when-cross-origin or stricter.' },
    { id: 'perm', name: 'Permissions-Policy', ok: !!map['permissions-policy'], fix: 'Disable unused browser features (camera, mic, geolocation).' },
    { id: 'hsts', name: 'Strict-Transport-Security', ok: !!map['strict-transport-security'], fix: 'Force HTTPS with a long max-age after TLS is live.' }
  ];
  const score = recs.filter((r) => r.ok).length;
  return { recs, score, total: recs.length };
}

const QUIZ_BANK = {
  foundations: [
    { q: 'What does the A in CIA triad stand for?', a: ['Authorization', 'Availability', 'Authentication', 'Audit'], c: 1 },
    { q: 'Which action is always required before a pentest?', a: ['Public disclosure', 'Written authorization', 'Dark-web recon', 'Default credentials'], c: 1 },
    { q: 'Hashing is mainly used to protect:', a: ['Confidentiality of files at rest only', 'Integrity of data / stored passwords', 'Network speed', 'DNS records'], c: 1 },
    { q: 'MFA primarily reduces risk from:', a: ['Stolen or guessed passwords', 'SQL injection', 'Broken CSS', 'Expired TLS'], c: 0 },
    { q: 'The safest place to practice web vulns is:', a: ['Any live company site', 'Your own lab / Juice Shop / THM', 'Random IPs from Shodan', 'A friend\'s Wi-Fi'], c: 1 }
  ],
  web: [
    { q: 'Prepared statements mainly stop:', a: ['XSS', 'SQL injection', 'CSRF', 'Clickjacking'], c: 1 },
    { q: 'Output encoding in HTML context mainly stops:', a: ['SQLi', 'IDOR', 'XSS', 'SSRF'], c: 2 },
    { q: 'A CSRF token should be:', a: ['The user password', 'Unpredictable and tied to the session', 'The same for all users', 'Stored in localStorage forever'], c: 1 },
    { q: 'IDOR is a form of:', a: ['Broken access control', 'Crypto failure', 'SSR poisoning', 'Open redirect'], c: 0 },
    { q: 'HttpOnly cookies help because:', a: ['They encrypt the cookie', 'JavaScript cannot read them', 'They disable CORS', 'They force MFA'], c: 1 }
  ],
  ir: [
    { q: 'First priority in incident response is usually:', a: ['Blame the intern', 'Contain and protect people/data', 'Wipe all logs', 'Post on social media'], c: 1 },
    { q: 'Which log is most useful after a web breach?', a: ['Wallpaper settings', 'Auth, app, and reverse-proxy logs', 'Printer queue', 'CSS build map'], c: 1 },
    { q: 'After containment you should:', a: ['Skip evidence', 'Eradicate, recover, then lessons-learned', 'Pay any ransom immediately', 'Disable backups'], c: 1 },
    { q: 'A good severity rating includes:', a: ['Only CVSS with no context', 'Impact, exploitability, and business context', 'How angry the CEO is', 'Number of CSS files'], c: 1 },
    { q: 'Responsible disclosure means:', a: ['Dumping data publicly first', 'Reporting privately and giving time to fix', 'Selling the bug', 'Ignoring the vendor'], c: 1 }
  ],
  pentest: [
    { q: 'A pentest starts with:', a: ['Firing every exploit', 'Scope, rules of engagement, written auth', 'Scanning the whole internet', 'Guessing CEO passwords'], c: 1 },
    { q: 'Passive recon means:', a: ['Port-scanning production', 'Using only public information', 'Dropping malware', 'Brute forcing SSH'], c: 1 },
    { q: 'A finding without impact is:', a: ['Still a critical CVE', 'Incomplete — explain business harm', 'Enough for ransom', 'A reason to DoS'], c: 1 },
    { q: 'Out-of-scope assets should be:', a: ['Tested quietly', 'Left alone and noted', 'Sold on forums', 'Used as pivots'], c: 1 },
    { q: 'The pentest deliverable executives read first is:', a: ['Raw nmap XML', 'The executive summary', 'Your .bashrc', 'Packet captures'], c: 1 }
  ],
  owasp: [
    { q: 'A01 Broken Access Control is often:', a: ['Pretty CSS', 'IDOR / missing object checks', 'Gzip', 'Favicon theft'], c: 1 },
    { q: 'A02 Cryptographic Failures include:', a: ['Using HTTPS everywhere', 'Plaintext passwords or weak hashes', 'HSTS preload', 'Argon2id'], c: 1 },
    { q: 'A03 Injection is stopped by:', a: ['String concat of SQL', 'Parameterized queries / encoding', 'Disabling logs', 'MD5'], c: 1 },
    { q: 'Security misconfiguration example:', a: ['Default admin/admin left on', 'Unique passwords', 'Least privilege', 'Patched software'], c: 0 },
    { q: 'SSRF is dangerous because:', a: ['It styles buttons', 'The server fetches attacker-chosen URLs', 'It speeds DNS', 'It encrypts cookies'], c: 1 }
  ]
};

function gradeQuiz(track, answers) {
  const bank = QUIZ_BANK[track];
  if (!bank) return { error: 'Unknown quiz' };
  const picks = Array.isArray(answers) ? answers : [];
  let correct = 0;
  const detail = bank.map((item, i) => {
    const chosen = Number(picks[i]);
    const ok = chosen === item.c;
    if (ok) correct += 1;
    return { q: item.q, chosen, correct: item.c, ok };
  });
  return { score: correct, total: bank.length, detail };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    quizzes: Object.fromEntries(Object.entries(QUIZ_BANK).map(([k, v]) => [k, v.map(({ q, a }) => ({ q, a }))]))
  });
}

export async function POST(req) {
  const user = await userFromRequest(req);
  const body = await req.json().catch(() => ({}));
  const tool = String(body.tool || '');

  if (tool === 'password') {
    const report = passwordReport(body.password);
    if (user) await touchLab(user.id, 'password-checker');
    return NextResponse.json({ ok: true, report });
  }

  if (tool === 'hash') {
    const text = String(body.text || '');
    if (text.length > 8000) return NextResponse.json({ ok: false, error: 'Keep input under 8 KB.' }, { status: 400 });
    const hashes = {
      md5: crypto.createHash('md5').update(text).digest('hex'),
      sha1: crypto.createHash('sha1').update(text).digest('hex'),
      sha256: crypto.createHash('sha256').update(text).digest('hex'),
      sha512: crypto.createHash('sha512').update(text).digest('hex')
    };
    if (user) await touchLab(user.id, 'hash-lab');
    return NextResponse.json({ ok: true, hashes, note: 'Hashes are one-way fingerprints. They are not encryption. Use a slow KDF (scrypt/argon2) for passwords.' });
  }

  if (tool === 'encode') {
    const text = String(body.text || '');
    if (text.length > 8000) return NextResponse.json({ ok: false, error: 'Keep input under 8 KB.' }, { status: 400 });
    const mode = String(body.mode || 'base64');
    let output = '';
    try {
      if (mode === 'base64') output = Buffer.from(text, 'utf8').toString('base64');
      else if (mode === 'base64-decode') output = Buffer.from(text, 'base64').toString('utf8');
      else if (mode === 'url') output = encodeURIComponent(text);
      else if (mode === 'url-decode') output = decodeURIComponent(text);
      else if (mode === 'hex') output = Buffer.from(text, 'utf8').toString('hex');
      else if (mode === 'hex-decode') output = Buffer.from(text.replace(/[^0-9a-f]/gi, ''), 'hex').toString('utf8');
      else return NextResponse.json({ ok: false, error: 'Unknown mode' }, { status: 400 });
    } catch (e) {
      return NextResponse.json({ ok: false, error: 'Could not decode that input.' }, { status: 400 });
    }
    if (user) await touchLab(user.id, 'encoder');
    return NextResponse.json({ ok: true, output });
  }

  if (tool === 'headers') {
    const result = headerFlags(body.headers);
    if (user) await touchLab(user.id, 'header-audit', 'headers', result.score);
    return NextResponse.json({ ok: true, ...result });
  }

  if (tool === 'quiz') {
    const result = gradeQuiz(body.track, body.answers);
    if (result.error) return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    if (user) await touchLab(user.id, 'quiz-' + body.track, 'quiz-' + body.track, result.score);
    return NextResponse.json({ ok: true, ...result });
  }

  if (tool === 'cvss') {
    const av = Number(body.av || 0);
    const ac = Number(body.ac || 0);
    const pr = Number(body.pr || 0);
    const ui = Number(body.ui || 0);
    const impact = Number(body.impact || 0);
    const score = Math.min(10, Math.round((av + ac + pr + ui + impact) * 10) / 10);
    let sev = 'None';
    if (score >= 0.1) sev = 'Low';
    if (score >= 4) sev = 'Medium';
    if (score >= 7) sev = 'High';
    if (score >= 9) sev = 'Critical';
    if (user) await touchLab(user.id, 'cvss', 'cvss', score);
    return NextResponse.json({ ok: true, score, sev });
  }

  if (tool === 'report') {
    const title = String(body.title || '').slice(0, 120);
    const asset = String(body.asset || '').slice(0, 120);
    const steps = String(body.steps || '').slice(0, 2000);
    const impact = String(body.impact || '').slice(0, 800);
    const fix = String(body.fix || '').slice(0, 800);
    if (!title || !steps) return NextResponse.json({ ok: false, error: 'Title and steps are required.' }, { status: 400 });
    const markdown = [
      '# Finding: ' + title,
      '',
      '**Asset:** ' + (asset || 'lab target'),
      '**Severity:** ' + (body.severity || 'Medium'),
      '',
      '## Impact',
      impact || 'Describe who is harmed and what data or uptime is at risk.',
      '',
      '## Steps to reproduce (authorized lab only)',
      steps,
      '',
      '## Recommendation',
      fix || 'Patch, add access checks, encode output, and retest.',
      '',
      '_Progress Tech academy — educational report template. Do not attach real victim data._'
    ].join('\n');
    if (user) await touchLab(user.id, 'report-writer');
    return NextResponse.json({ ok: true, markdown });
  }

  if (tool === 'awareness' || tool === 'xss-lab' || tool === 'wifi-hygiene' || tool === 'ir' || tool === 'code' || tool === 'recon' || tool === 'owasp') {
    if (user) await touchLab(user.id, tool, body.scoreKey, Number(body.score || 0));
    return NextResponse.json({ ok: true, user: user ? publicUser(user) : null });
  }

  return NextResponse.json({ ok: false, error: 'Unknown lab tool' }, { status: 400 });
}
