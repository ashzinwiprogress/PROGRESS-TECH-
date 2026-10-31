export const metadata = { title: 'Terms of Service | PROGRESS TECH OFFICIAL' };

export default function Terms() {
  return (
    <section className="section">
      <div className="wrap legal">
        <div className="kicker">Legal</div>
        <h1>Terms of Service</h1>
        <p className="muted" style={{ margin: '12px 0 28px' }}>Last updated: 31 October 2026. By creating an account or using Progress Tech Official you agree to these terms.</p>

        <article className="glass" style={{ padding: 24, marginBottom: 16 }}>
          <h3>1. Educational purpose only</h3>
          <p>This website is a cybersecurity academy. Notes, quizzes and playgrounds exist so students can learn defense, detection, secure coding and professional ethics. Nothing here is a license to attack systems, people, networks or accounts you do not own.</p>
        </article>
        <article className="glass" style={{ padding: 24, marginBottom: 16 }}>
          <h3>2. Authorized testing only</h3>
          <p>You may practice only on machines you own, classroom labs we provide in-browser, or platforms that explicitly invite testing (for example TryHackMe, HackTheBox, OWASP Juice Shop, bug bounty programs inside their written policy). Unauthorized access, phishing, credential harvesting, malware, Wi-Fi attacks against others, tracking people, or cloning login pages of real brands is prohibited and may be a crime.</p>
        </article>
        <article className="glass" style={{ padding: 24, marginBottom: 16 }}>
          <h3>3. Account rules</h3>
          <p>Provide accurate registration details. Keep your password private. You are responsible for activity on your account. Progress Tech may suspend or restore accounts for policy violations, abuse, harassment, or suspected illegal use. Suspended students lose lab access until an admin reopens the account.</p>
        </article>
        <article className="glass" style={{ padding: 24, marginBottom: 16 }}>
          <h3>4. What we monitor</h3>
          <p>Admins may review registration data, lab usage counts, quiz scores, and site visit logs to protect students and enforce these terms. We do not ask you to submit real passwords from other platforms. Do not paste production secrets into labs.</p>
        </article>
        <article className="glass" style={{ padding: 24, marginBottom: 16 }}>
          <h3>5. No offensive tooling</h3>
          <p>The academy will not provide phishing kits, credential capture dashboards, exploit payloads, ransomware, or attack services. Playground tools are local/defensive: password strength, hashing, encoding, header review, awareness quizzes, and sanitized XSS demos that never leave your browser as an attack.</p>
        </article>
        <article className="glass" style={{ padding: 24, marginBottom: 16 }}>
          <h3>6. Intellectual property</h3>
          <p>Course notes, UI and branding belong to Progress Tech Official. You may not scrape, resell or rebrand academy content without written permission.</p>
        </article>
        <article className="glass" style={{ padding: 24, marginBottom: 16 }}>
          <h3>7. Disclaimer</h3>
          <p>Labs are provided as-is for learning. We are not liable for misuse, exam outcomes, or third-party sites we link to. Cybersecurity work can have legal consequences; you must follow the law in your country.</p>
        </article>
        <article className="glass" style={{ padding: 24, marginBottom: 16 }}>
          <h3>8. Contact</h3>
          <p>Questions: progresstech237@gmail.com or WhatsApp +237 698 830 792. Continuing to use the site after updates means you accept the new terms.</p>
        </article>
        <div className="btns">
          <a className="btn btn-cyan" href="/register">I agree — register</a>
          <a className="btn btn-ghost" href="/contact">Contact</a>
        </div>
      </div>
    </section>
  );
}
