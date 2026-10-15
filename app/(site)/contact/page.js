export const metadata = { title: 'Contact | PROGRESS TECH OFFICIAL' };

export default function Contact() {
  const items = [
    ['/contact-whatsapp', 'WhatsApp contract', 'Enter number, name and message. Opens owner chat.'],
    ['/contact-email', 'Send via email', 'Email, phone, message and file upload to the owner inbox.'],
    ['/about', 'Owner profile', 'Brand story, channels and academy identity.']
  ];
  return (
    <section className="section">
      <div className="wrap">
        <div className="kicker">Reach the owner</div>
        <h1>Contact PROGRESS TECH</h1>
        <p className="muted" style={{ margin: '16px 0 28px' }}>Choose a luxury channel. WhatsApp for fast contracts. Email for files, images and longer briefs.</p>
        <div className="cards">
          {items.map((i) => (
            <a className="card glass" key={i[1]} href={i[0]}>
              <h3>{i[1]}</h3>
              <p>{i[2]}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
