import Nav from '../../components/Nav';
import Gate from '../../components/Gate';
import ChatWidget from '../../components/ChatWidget';
import VisitLogger from '../../components/VisitLogger';
import { BG_VIDEO, PROFILE_IMAGE } from '../../lib/config';

export default function SiteLayout({ children }) {
  return (
    <>
      <div className="bg-video">
        <video autoPlay muted loop playsInline poster={PROFILE_IMAGE}>
          <source src={BG_VIDEO} type="video/mp4" />
        </video>
      </div>
      <div className="bg-overlay"></div>
      <div className="water-layer"></div>
      <Nav />
      {children}
      <footer className="footer">
        <div>
          <strong>PROGRESS TECH OFFICIAL</strong>
          <p className="tiny">Ethical hacking - Cybersecurity - Web - Python - Linux</p>
          <p className="tiny"><a href="/labs">Labs</a> · <a href="/terms">Terms of Service</a> · <a href="/register">Register</a></p>
        </div>
        <div className="tiny">(c) {new Date().getFullYear()} Progress Tech - Cameroon</div>
      </footer>
      <ChatWidget />
      <Gate />
      <VisitLogger />
    </>
  );
}
