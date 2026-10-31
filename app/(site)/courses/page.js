export const metadata = { title: 'Courses | PROGRESS TECH OFFICIAL' };

export default function Courses() {
  const items = [
    ['/academy?track=cybersecurity', '01 - Cyber Defense', 'CIA triad, threats, SOC thinking, protection strategy.'],
    ['/academy?track=ethical', '02 - Ethical Ops', 'White hat labs, hats explained, hunter programs.'],
    ['/academy?track=web', '03 - Web Studio', 'Build sites, then harden them. PHP, JS, UX.'],
    ['/academy?track=python', '04 - Script Lab', 'Python, Termux, Bash - beginner to principal.'],
    ['/labs', '05 - Playground', 'Password, hashes, headers, XSS demo, phish spotter, IR.'],
    ['/labs', '06 - Quizzes', 'Foundations, web defense and incident-response checks.']
  ];
  return (
    <section className="section">
      <div className="wrap">
        <div className="kicker">Four academies in one</div>
        <h1>PROGRESS TECH campuses</h1>
        <p className="muted" style={{ margin: '12px 0 28px' }}>One luxury portal. Four professional tracks. Ocean glass motion throughout.</p>
        <div className="cards">
          {items.map((i) => (
            <a className="card glass tilt liquid" key={i[1]} href={i[0]}>
              <h3>{i[1]}</h3>
              <p>{i[2]}</p>
            </a>
          ))}
        </div>
        <div className="btns" style={{ marginTop: 28 }}>
          <a className="btn btn-cyan" href="/academy">Open all notes</a>
          <a className="btn btn-gold" href="/labs">Open labs</a>
          <a className="btn btn-ghost" href="/explore">Live tools</a>
        </div>
      </div>
    </section>
  );
}
