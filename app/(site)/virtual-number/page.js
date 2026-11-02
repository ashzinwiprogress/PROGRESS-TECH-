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
          Countries and unused numbers refresh by themselves. Pick an unused line that has not been signed into a
          platform yet, copy it, register, then stay on the inbox — the OTP is pulled every 1.5 seconds.
        </p>
        <Countries />
      </div>
    </section>
  );
}
