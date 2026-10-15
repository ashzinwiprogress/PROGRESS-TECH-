import { PROFILE_IMAGE } from '../../../lib/config';

export const metadata = { title: 'Contact Owner | PROGRESS TECH OFFICIAL' };

export default function About() {
  return (
    <section className="section">
      <div className="wrap hero-grid">
        <div>
          <div className="kicker">Owner dossier</div>
          <h1>PROGRESS TECH</h1>
          <p className="lead">
            Progress Tech Official is a cybersecurity and software training brand. We teach ethical hacking,
            penetration testing, web development, Python and Linux from beginner to professional. The mission is
            simple: make digital defense beautiful, practical and legal.
          </p>
          <ul className="muted" style={{ paddingLeft: 18, margin: '18px 0' }}>
            <li>Brand: PROGRESS TECH OFFICIAL</li>
            <li>Owner: PROGRESS TECH</li>
            <li>Focus: Ethical hacking, cyber defense, web, Python, Linux, Termux</li>
            <li>WhatsApp: +237 698 830 792</li>
            <li>Email: progresstech237@gmail.com</li>
            <li>YouTube: @progresstech12</li>
          </ul>
          <div className="btns">
            <a className="btn btn-cyan" href="/contact-whatsapp">Contract via WhatsApp</a>
            <a className="btn btn-gold" href="/contact-email">Send via email</a>
            <a className="btn btn-ghost" href="/explore">Explore tools</a>
          </div>
        </div>
        <div className="avatar-wrap">
          <div className="avatar-ring"></div>
          <img src={PROFILE_IMAGE} alt="Owner" />
        </div>
      </div>
    </section>
  );
}
