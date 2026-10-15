import { PROFILE_IMAGE } from '../../lib/config';

export const metadata = { title: 'Home | PROGRESS TECH OFFICIAL' };

const TRACKS = [
  ['cybersecurity', 'Cybersecurity', 'Defense, threats, CIA triad, SOC mindset.'],
  ['ethical', 'Ethical hacking', 'White hat methodology and labs.'],
  ['pentest', 'Penetration testing', 'Recon to report, legally and cleanly.'],
  ['web', 'Web development', 'HTML to full-stack professional builds.'],
  ['python', 'Python scripts', 'Automation, tooling and beginner to pro.'],
  ['termux', 'Termux & Bash', 'Mobile Linux, shells and workflows.'],
  ['bug', 'Bug hunting', 'Hunter programs, reports, responsible disclosure.'],
  ['hats', 'Hats & ethics', 'Black, white, gray - law, ethics, careers.']
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="kicker">Luxury Cyber Academy</div>
            <h1>PROGRESS TECH OFFICIAL</h1>
            <p className="lead">
              Explore the world of ethical hacking and cybersecurity. We train beginners to professionals in
              penetration testing, web development, Python, Linux, Termux, bug hunting and digital defense.
              Luxury glassy ocean motion. Principal-level craft.
            </p>
            <div className="btns">
              <a className="btn btn-cyan" href="/academy">I don&apos;t know about cybersecurity - click me</a>
              <a className="btn btn-gold" href="/about">Contact owner</a>
              <a className="btn btn-ghost" href="/explore">Explore PROGRESS TECH HOME</a>
              <a className="btn btn-ghost" href="/studio">AI Studio</a>
            </div>
          </div>
          <div className="avatar-wrap tilt">
            <div className="orb orb-a"></div>
            <div className="orb orb-b"></div>
            <div className="avatar-ring"></div>
            <img src={PROFILE_IMAGE} alt="Progress Tech Official" />
          </div>
        </div>
      </section>

      <div className="wave">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" height="80">
          <path fill="rgba(0,229,255,0.18)" d="M0,40 C150,90 350,0 600,40 C850,80 1050,10 1200,40 L1200,120 L0,120 Z"></path>
          <path fill="rgba(212,175,55,0.12)" d="M1200,40 C1050,90 850,0 600,40 C350,80 150,10 0,40 L0,120 L1200,120 Z"></path>
        </svg>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="kicker">The brand</div>
          <h2>About Progress Tech</h2>
          <p className="muted" style={{ maxWidth: '78ch', marginBottom: 28 }}>
            Explore the world of hacking and cyber security with Progress Tech. We dive into ethical hacking,
            penetration testing, and the latest in cyber security. Learn about Black Hat, White Hat, and Gray Hat
            hacking. Stay informed on threats and protection strategies. Join us for insights and updates on the
            digital security landscape. Website building and training for beginners to pro. Python training. Linux mastery.
          </p>
          <div className="cards">
            {TRACKS.map((t) => (
              <a className="card glass" key={t[0]} href={'/academy?track=' + t[0]}>
                <h3>{t[1]}</h3>
                <p>{t[2]}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap glass" style={{ padding: 36 }}>
          <div className="kicker">Training path</div>
          <h2>Beginner to principal</h2>
          <p className="muted">
            Linux fundamentals, networking, Python, web apps, vulnerability classes, pentest methodology, reporting
            and professional ethics. Tools are taught as defensive and authorized lab skills only.
          </p>
          <div className="btns" style={{ marginTop: 20 }}>
            <a className="btn btn-cyan" href="/contact-whatsapp">WhatsApp the owner</a>
            <a className="btn btn-gold" href="/contact-email">Send via email</a>
          </div>
        </div>
      </section>
    </>
  );
}
