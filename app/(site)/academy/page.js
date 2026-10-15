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
  tools: 'Tools beginner to pro'
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
