import Countries from './Countries';

export const metadata = { title: 'Free Virtual Numbers | PROGRESS TECH OFFICIAL' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function VirtualNumberPage() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="kicker">Live SMS inbox</div>
        <h1>Free virtual numbers</h1>
        <p className="muted" style={{ margin: '12px 0 28px', maxWidth: '72ch' }}>
          Pick a live country. The system keeps pulling the newest numbers as they appear.
          Choose a number, pick the platform you are signing in to, copy the number, then come back for the exact OTP.
        </p>
        <Countries />
      </div>
    </section>
  );
}
