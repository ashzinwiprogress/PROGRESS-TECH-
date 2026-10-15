<?php
$pageTitle = 'Academy';
$pageId = 'academy';
include __DIR__ . '/includes/header.php';
$track = isset($_GET['track']) ? $_GET['track'] : 'all';
$tracks = [
  'cybersecurity' => 'Cybersecurity',
  'ethical' => 'Ethical hacking',
  'pentest' => 'Penetration testing',
  'web' => 'Web development',
  'python' => 'Python script',
  'termux' => 'Termux bash',
  'bug' => 'Bug hunting',
  'hats' => 'Hats & hunter',
  'vuln' => 'Vulnerabilities',
  'tools' => 'Tools beginner to pro',
];
?>
<section class="section">
  <div class="wrap">
    <div class="kicker">Cyber notes</div>
    <h1>I don't know cybersecurity — start here</h1>
    <p class="muted" style="margin:12px 0 24px">Illustrated notes for every track. Authorized labs only. Never attack systems you do not own or have written permission to test.</p>
    <div class="btns" style="margin-bottom:28px">
      <a class="btn btn-ghost" href="academy.php">All notes</a>
      <?php foreach ($tracks as $id => $label): ?>
        <a class="btn btn-ghost <?php echo $track===$id?'btn-cyan':''; ?>" href="academy.php?track=<?php echo $id; ?>"><?php echo pto_h($label); ?></a>
      <?php endforeach; ?>
    </div>
    <div class="notes">

      <article class="note glass" data-track="cybersecurity">
        <img src="<?php echo PROFILE_IMAGE; ?>" alt="CIA triad">
        <div>
          <h3>Cybersecurity foundations</h3>
          <p>Cybersecurity is the practice of protecting people, systems and data from unauthorized access, disruption and theft. Think of it as locks, cameras, alarms and trained guards — but for networks, phones, clouds and code.</p>
          <ul>
            <li><strong>Confidentiality</strong> — only the right people can read the data (encryption, access control).</li>
            <li><strong>Integrity</strong> — data is not secretly changed (hashes, signed updates).</li>
            <li><strong>Availability</strong> — systems stay online when needed (backups, DDoS defense).</li>
            <li>Common threats: phishing, malware, weak passwords, unpatched software, social engineering.</li>
            <li>Start path: digital hygiene, then networking, then Linux, then web security.</li>
          </ul>
        </div>
      </article>

      <article class="note glass" data-track="ethical">
        <img src="<?php echo PROFILE_IMAGE; ?>" alt="Ethical hacking">
        <div>
          <h3>Ethical hacking (White Hat)</h3>
          <p>Ethical hackers think like attackers to find weaknesses before criminals do. They work with permission, written scope, and a report. This is a career, not a hobby of breaking into random sites.</p>
          <ul>
            <li>Get authorization in writing. No permission = crime.</li>
            <li>Follow a methodology: recon, mapping, testing, proof, report, retest.</li>
            <li>Cert mindset: eJPT, PNPT, OSCP-style labs on your own machines or legal platforms.</li>
            <li>Deliverables: findings, severity, proof-of-concept on authorized targets, fix advice.</li>
          </ul>
        </div>
      </article>

      <article class="note glass" data-track="hats">
        <img src="<?php echo PROFILE_IMAGE; ?>" alt="Hats">
        <div>
          <h3>White, Gray and Black Hat — explained</h3>
          <p>Hats describe intent and legality, not skill. Progress Tech teaches defense and authorized testing only.</p>
          <ul>
            <li><strong>White Hat</strong> — legal, contracted, defensive. This is the professional path.</li>
            <li><strong>Gray Hat</strong> — testing without a clear contract. Risky, often illegal, not a career plan.</li>
            <li><strong>Black Hat</strong> — crime: theft, ransomware, fraud. We study it only to defend against it.</li>
            <li>Hunter culture at Progress Tech means bug bounty hunters who follow program rules.</li>
          </ul>
        </div>
      </article>

      <article class="note glass" data-track="pentest">
        <img src="<?php echo PROFILE_IMAGE; ?>" alt="Pentest">
        <div>
          <h3>Penetration testing course map</h3>
          <p>A pentest is a controlled security exam of an application or network. You simulate real attacks inside a legal box, then write a report executives can act on.</p>
          <ul>
            <li>Phase 1: scoping, rules of engagement, emergency contacts.</li>
            <li>Phase 2: passive recon (public info) then active mapping on in-scope assets.</li>
            <li>Phase 3: vulnerability analysis — misconfig, auth flaws, injection classes.</li>
            <li>Phase 4: controlled exploitation in scope to prove impact.</li>
            <li>Phase 5: post-test cleanup, evidence, CVSS-style severity, remediation.</li>
          </ul>
        </div>
      </article>

      <article class="note glass" data-track="vuln">
        <img src="<?php echo PROFILE_IMAGE; ?>" alt="Vulnerabilities">
        <div>
          <h3>Vulnerability classes you must know</h3>
          <p>Learn these as a defender. Practice only on DVWA, Juice Shop, HackTheBox, TryHackMe, or your own VMs.</p>
          <ul>
            <li>Broken access control and IDOR — users seeing other users' data.</li>
            <li>Injection (SQL, command, template) — untrusted input reaching interpreters.</li>
            <li>XSS — attacker script running in a victim browser.</li>
            <li>CSRF — tricking a logged-in user into an action.</li>
            <li>Auth issues — weak sessions, default creds, missing MFA.</li>
            <li>Misconfiguration — open buckets, debug pages, leftover admin panels.</li>
            <li>Insecure design — logic bugs no scanner will fully catch.</li>
          </ul>
        </div>
      </article>

      <article class="note glass" data-track="tools">
        <img src="<?php echo PROFILE_IMAGE; ?>" alt="Tools">
        <div>
          <h3>Tools — beginner to pro (authorized labs)</h3>
          <p>Tools are instruments. Skill is methodology. Install on your lab machine, not on targets you do not own.</p>
          <ul>
            <li><strong>Beginner:</strong> Linux, Bash, Python, Git, Firefox DevTools, Wireshark intro, VirtualBox/VMware.</li>
            <li><strong>Web:</strong> Burp Suite Community, OWASP ZAP, browser extensions for cookies/headers.</li>
            <li><strong>Network lab:</strong> Nmap on your own subnet, tcpdump, Netcat for learning sockets.</li>
            <li><strong>Pro lab:</strong> Burp Pro/Community workflows, custom Python, BloodHound in AD labs, reporting templates.</li>
            <li><strong>Never:</strong> random scanners against live companies, credential stuffing, or malware kits.</li>
          </ul>
        </div>
      </article>

      <article class="note glass" data-track="web">
        <img src="<?php echo PROFILE_IMAGE; ?>" alt="Web">
        <div>
          <h3>Web development training</h3>
          <p>Builders who understand security write safer apps. Progress Tech trains both sides.</p>
          <ul>
            <li>HTML, CSS, JS for interfaces. PHP/Python/Node for backends.</li>
            <li>Always validate input, hash passwords (password_hash / bcrypt), use HTTPS.</li>
            <li>SQL with prepared statements. Escape output to stop XSS.</li>
            <li>Sessions, CSRF tokens, least-privilege database users.</li>
            <li>Ship: landing pages, dashboards, APIs, then harden them.</li>
          </ul>
        </div>
      </article>

      <article class="note glass" data-track="python">
        <img src="<?php echo PROFILE_IMAGE; ?>" alt="Python">
        <div>
          <h3>Python from zero to scripts</h3>
          <p>Python is the language of automation, labs and many security tools. Learn clean code first.</p>
          <ul>
            <li>Syntax, types, functions, files, JSON, virtualenv.</li>
            <li>Requests for APIs you own. BeautifulSoup for parsing your own HTML.</li>
            <li>Small tools: log parsers, hash checkers, port scanners on 127.0.0.1 only.</li>
            <li>Never paste unknown scripts from the internet onto production systems.</li>
          </ul>
        </div>
      </article>

      <article class="note glass" data-track="termux">
        <img src="<?php echo PROFILE_IMAGE; ?>" alt="Termux">
        <div>
          <h3>Termux and Bash</h3>
          <p>Termux brings a Linux-like environment to Android. Bash is the glue of professional ops.</p>
          <ul>
            <li>pkg update && pkg install python git curl</li>
            <li>Learn ls, cd, grep, chmod, ssh to your own servers, tmux.</li>
            <li>Write .sh scripts for backups and study notes — not attacks.</li>
            <li>Keep storage permission clean. Do not install shady "hacker" APKs.</li>
          </ul>
        </div>
      </article>

      <article class="note glass" data-track="bug">
        <img src="<?php echo PROFILE_IMAGE; ?>" alt="Bug hunting">
        <div>
          <h3>Bug hunting / hunter programs</h3>
          <p>Bug bounty is legal only on programs that invite you. Read the policy. Out-of-scope is off-limits.</p>
          <ul>
            <li>Platforms: HackerOne, Bugcrowd, YesWeHack, public VDP pages.</li>
            <li>Write clear reports: title, steps, impact, screenshot, fix idea.</li>
            <li>No data exfiltration, no DoS, no social engineering unless allowed.</li>
            <li>Hunter mindset: patience, notes, duplicates happen — stay professional.</li>
          </ul>
        </div>
      </article>

      <article class="note glass" data-track="ethical">
        <img src="<?php echo PROFILE_IMAGE; ?>" alt="Course">
        <div>
          <h3>Hacking course path at Progress Tech</h3>
          <p>A practical 12-week mental model you can follow with free labs.</p>
          <ul>
            <li>Weeks 1-2: Linux, networking, HTTP, how websites work.</li>
            <li>Weeks 3-4: Python + Bash automation on your machine.</li>
            <li>Weeks 5-7: OWASP Top 10 on Juice Shop / DVWA.</li>
            <li>Weeks 8-10: structured pentest reports and retest loops.</li>
            <li>Weeks 11-12: portfolio, ethics, career, bug bounty policy reading.</li>
          </ul>
        </div>
      </article>

    </div>
  </div>
</section>
<script>
(function(){
  var t = <?php echo json_encode($track); ?>;
  if (t && t !== 'all') {
    document.querySelectorAll('.note').forEach(function(n){
      if (n.getAttribute('data-track') !== t) n.style.display = 'none';
    });
  }
})();
</script>
<?php include __DIR__ . '/includes/footer.php'; ?>
