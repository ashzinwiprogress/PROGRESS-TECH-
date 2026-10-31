import { PROFILE_IMAGE } from '../../../lib/config';

export const metadata = { title: 'Academy | PROGRESS TECH OFFICIAL' };

const TRACKS = {
  cybersecurity: 'Cybersecurity',
  ethical: 'Ethical hacking',
  pentest: 'Penetration testing',
  web: 'Web development',
  python: 'Python script',
  termux: 'Termux bash',
  bug: 'Bug hunting',
  hats: 'Hats & hunter',
  vuln: 'Vulnerabilities',
  tools: 'Tools beginner to pro',
  ir: 'Incident response'
};

const NOTES = [
  {
    track: 'cybersecurity', title: 'Cybersecurity foundations',
    body: 'Cybersecurity is the practice of protecting people, systems and data from unauthorized access, disruption and theft. Think of it as locks, cameras, alarms and trained guards - but for networks, phones, clouds and code.',
    list: [
      ['Confidentiality', 'only the right people can read the data (encryption, access control).'],
      ['Integrity', 'data is not secretly changed (hashes, signed updates).'],
      ['Availability', 'systems stay online when needed (backups, DDoS defense).'],
      ['Common threats', 'phishing, malware, weak passwords, unpatched software, social engineering.'],
      ['Start path', 'digital hygiene, then networking, then Linux, then web security.']
    ]
  },
  {
    track: 'ethical', title: 'Ethical hacking (White Hat)',
    body: 'Ethical hackers think like attackers to find weaknesses before criminals do. They work with permission, written scope, and a report. This is a career, not a hobby of breaking into random sites.',
    list: [
      ['Authorization', 'Get it in writing. No permission = crime.'],
      ['Methodology', 'recon, mapping, testing, proof, report, retest.'],
      ['Cert mindset', 'eJPT, PNPT, OSCP-style labs on your own machines or legal platforms.'],
      ['Deliverables', 'findings, severity, proof-of-concept on authorized targets, fix advice.']
    ]
  },
  {
    track: 'hats', title: 'White, Gray and Black Hat - explained',
    body: 'Hats describe intent and legality, not skill. Progress Tech teaches defense and authorized testing only.',
    list: [
      ['White Hat', 'legal, contracted, defensive. This is the professional path.'],
      ['Gray Hat', 'testing without a clear contract. Risky, often illegal, not a career plan.'],
      ['Black Hat', 'crime: theft, ransomware, fraud. We study it only to defend against it.'],
      ['Hunter culture', 'bug bounty hunters who follow program rules.']
    ]
  },
  {
    track: 'pentest', title: 'Penetration testing course map',
    body: 'A pentest is a controlled security exam of an application or network. You simulate real attacks inside a legal box, then write a report executives can act on.',
    list: [
      ['Phase 1', 'scoping, rules of engagement, emergency contacts.'],
      ['Phase 2', 'passive recon (public info) then active mapping on in-scope assets.'],
      ['Phase 3', 'vulnerability analysis - misconfig, auth flaws, injection classes.'],
      ['Phase 4', 'controlled exploitation in scope to prove impact.'],
      ['Phase 5', 'post-test cleanup, evidence, CVSS-style severity, remediation.']
    ]
  },
  {
    track: 'vuln', title: 'Vulnerability classes you must know',
    body: 'Learn these as a defender. Practice only on DVWA, Juice Shop, HackTheBox, TryHackMe, or your own VMs.',
    list: [
      ['Broken access control / IDOR', 'users seeing other users data.'],
      ['Injection (SQL, command, template)', 'untrusted input reaching interpreters.'],
      ['XSS', 'attacker script running in a victim browser.'],
      ['CSRF', 'tricking a logged-in user into an action.'],
      ['Auth issues', 'weak sessions, default creds, missing MFA.'],
      ['Misconfiguration', 'open buckets, debug pages, leftover admin panels.'],
      ['Insecure design', 'logic bugs no scanner will fully catch.']
    ]
  },
  {
    track: 'tools', title: 'Tools - beginner to pro (authorized labs)',
    body: 'Tools are instruments. Skill is methodology. Install on your lab machine, not on targets you do not own.',
    list: [
      ['Beginner', 'Linux, Bash, Python, Git, Firefox DevTools, Wireshark intro, VirtualBox/VMware.'],
      ['Web', 'Burp Suite Community, OWASP ZAP, browser extensions for cookies/headers.'],
      ['Network lab', 'Nmap on your own subnet, tcpdump, Netcat for learning sockets.'],
      ['Pro lab', 'Burp workflows, custom Python, BloodHound in AD labs, reporting templates.'],
      ['Never', 'random scanners against live companies, credential stuffing, or malware kits.']
    ]
  },
  {
    track: 'web', title: 'Web development training',
    body: 'Builders who understand security write safer apps. Progress Tech trains both sides.',
    list: [
      ['Frontend', 'HTML, CSS, JS for interfaces.'],
      ['Backend', 'PHP, Python or Node.'],
      ['Always', 'validate input, hash passwords, use HTTPS.'],
      ['SQL', 'prepared statements. Escape output to stop XSS.'],
      ['Ship', 'landing pages, dashboards, APIs, then harden them.']
    ]
  },
  {
    track: 'python', title: 'Python from zero to scripts',
    body: 'Python is the language of automation, labs and many security tools. Learn clean code first.',
    list: [
      ['Basics', 'syntax, types, functions, files, JSON, virtualenv.'],
      ['Web/APIs', 'Requests for APIs you own, BeautifulSoup for parsing your own HTML.'],
      ['Small tools', 'log parsers, hash checkers, port scanners on 127.0.0.1 only.'],
      ['Safety', 'never paste unknown scripts onto production systems.']
    ]
  },
  {
    track: 'termux', title: 'Termux and Bash',
    body: 'Termux brings a Linux-like environment to Android. Bash is the glue of professional ops.',
    list: [
      ['Setup', 'pkg update && pkg install python git curl'],
      ['Learn', 'ls, cd, grep, chmod, ssh to your own servers, tmux.'],
      ['Scripts', 'write .sh scripts for backups and study notes - not attacks.'],
      ['Safety', 'keep storage permission clean. Do not install shady hacker APKs.']
    ]
  },
  {
    track: 'bug', title: 'Bug hunting / hunter programs',
    body: 'Bug bounty is legal only on programs that invite you. Read the policy. Out-of-scope is off-limits.',
    list: [
      ['Platforms', 'HackerOne, Bugcrowd, YesWeHack, public VDP pages.'],
      ['Reports', 'title, steps, impact, screenshot, fix idea.'],
      ['Rules', 'no data exfiltration, no DoS, no social engineering unless allowed.'],
      ['Mindset', 'patience, notes, duplicates happen - stay professional.']
    ]
  },
  {
    track: 'ethical', title: 'Hacking course path at Progress Tech',
    body: 'A practical 12-week mental model you can follow with free labs.',
    list: [
      ['Weeks 1-2', 'Linux, networking, HTTP, how websites work.'],
      ['Weeks 3-4', 'Python + Bash automation on your machine.'],
      ['Weeks 5-7', 'OWASP Top 10 on Juice Shop / DVWA.'],
      ['Weeks 8-10', 'structured pentest reports and retest loops.'],
      ['Weeks 11-12', 'portfolio, ethics, career, bug bounty policy reading.']
    ]
  },
  {
    track: 'cybersecurity', title: 'Digital hygiene checklist',
    body: 'Most breaches start with weak habits, not movie-style hacking. Lock the human layer first.',
    list: [
      ['Passwords', 'unique passphrase plus a manager. Never reuse across banks and social.'],
      ['MFA', 'app or hardware keys beat SMS when the site supports it.'],
      ['Updates', 'OS, browser, and phone patches close the easy holes.'],
      ['Links', 'type important domains yourself. Hover before you tap.'],
      ['Backups', 'offline or versioned copies beat ransomware speeches.']
    ]
  },
  {
    track: 'ethical', title: 'Rules of engagement (classroom)',
    body: 'Progress Tech labs stay inside the browser or your own VMs. That is how professionals stay employable.',
    list: [
      ['In scope', 'this website playground, machines you own, invited platforms.'],
      ['Out of scope', 'cloning real login pages, stealing sessions, attacking Wi-Fi you do not own.'],
      ['Evidence', 'screenshots and notes — never exfiltrate real user data.'],
      ['Report', 'impact, steps, fix. Tone like a consultant, not a threat.']
    ]
  },
  {
    track: 'pentest', title: 'Writing a pentest report',
    body: 'The report is the product. Executives fund fixes from clear writing, not tool dumps.',
    list: [
      ['Executive summary', 'what broke, business impact, top three actions.'],
      ['Finding', 'title, severity, affected asset, steps, evidence, fix.'],
      ['CVSS is a hint', 'add context: data type, exploitability, compensating controls.'],
      ['Retest', 'schedule after the patch. Close the loop.']
    ]
  },
  {
    track: 'vuln', title: 'How defenders think about XSS',
    body: 'XSS is untrusted data turning into browser code. Learn the sink, not a payload pack.',
    list: [
      ['Source', 'URL, form, comment, header reflected into HTML/JS/CSS.'],
      ['Sink', 'innerHTML, document.write, unsafe href/javascript URLs.'],
      ['Fix', 'encode for context, CSP, sanitizer for rich text, HttpOnly cookies.'],
      ['Practice', 'use the XSS demo in Labs — payloads are displayed as text only.']
    ]
  },
  {
    track: 'tools', title: 'Lab playground map',
    body: 'Open /labs for in-browser drills that never scan other people.',
    list: [
      ['Password gym', 'entropy and common-word checks on sample strings.'],
      ['Hash / encode', 'see fingerprints and why Base64 is not encryption.'],
      ['Headers', 'audit CSP, HSTS, clickjacking defenses on pasted headers.'],
      ['Awareness', 'phish spotter, Wi-Fi hygiene, IR playbook, quizzes.']
    ]
  },
  {
    track: 'ir', title: 'Incident response in six moves',
    body: 'When something breaks, panic is optional. A written loop is not.',
    list: [
      ['Prepare', 'contacts, backups, logging, roles.'],
      ['Identify', 'confirm with logs. Do not wipe evidence.'],
      ['Contain', 'isolate, rotate credentials, keep snapshots.'],
      ['Eradicate / recover', 'patch root cause, restore known-good, watch for re-entry.'],
      ['Lessons', 'timeline, gaps, control upgrades in plain language.']
    ]
  }
];

export default function Academy({ searchParams }) {
  const track = (searchParams && searchParams.track) || 'all';
  const visible = track === 'all' ? NOTES : NOTES.filter((n) => n.track === track);

  return (
    <section className="section">
      <div className="wrap">
        <div className="kicker">Cyber notes</div>
        <h1>I don&apos;t know cybersecurity - start here</h1>
        <p className="muted" style={{ margin: '12px 0 24px' }}>
          Illustrated notes for every track. Authorized labs only. Never attack systems you do not own or have written permission to test.
          After reading, open the <a href="/labs">defensive playground</a> and accept the <a href="/terms">Terms of Service</a>.
        </p>
        <div className="btns" style={{ marginBottom: 28 }}>
          <a className={'btn btn-ghost' + (track === 'all' ? ' btn-cyan' : '')} href="/academy">All notes</a>
          {Object.entries(TRACKS).map(([id, label]) => (
            <a key={id} className={'btn btn-ghost' + (track === id ? ' btn-cyan' : '')} href={'/academy?track=' + id}>{label}</a>
          ))}
        </div>
        <div className="notes">
          {visible.map((n) => (
            <article className="note glass" key={n.title}>
              <img src={PROFILE_IMAGE} alt="" />
              <div>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
                <ul>
                  {n.list.map((li) => (
                    <li key={li[0]}><strong>{li[0]}</strong> - {li[1]}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
