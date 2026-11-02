import PrivateNumbers from './PrivateNumbers';

export const metadata = { title: 'Free private numbers | PROGRESS TECH OFFICIAL' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PrivateNumbersPage() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="kicker">Private lines</div>
        <h1>Free private numbers</h1>
        <p className="muted" style={{ margin: '12px 0 28px', maxWidth: '74ch' }}>
          Provision a private number you own, keep it for the package duration, and read the SMS and the bundled
          private email inbox that arrive on it. Free packages cost nothing; paid packages come straight out of your
          provider wallet.
        </p>
        <PrivateNumbers />
      </div>
    </section>
  );
}
