import Platforms from './Platforms';

export const metadata = { title: 'Choose platform | PROGRESS TECH OFFICIAL' };
export const dynamic = 'force-dynamic';

export default function PlatformPage({ searchParams }) {
  const country = String((searchParams && searchParams.country) || '');
  const number = String((searchParams && searchParams.number) || '');
  const flag = String((searchParams && searchParams.flag) || '');
  const unused = String((searchParams && searchParams.unused) || '') === '1';
  return (
    <section className="section">
      <div className="wrap">
        <div className="kicker">Step 2</div>
        <h1>Choose the platform</h1>
        <p className="muted" style={{ margin: '12px 0 28px', maxWidth: '70ch' }}>
          Sign this unused number into the app you pick. Then open the inbox — the OTP for that platform is pulled every 1.5 seconds.
        </p>
        <Platforms country={country} number={number} flag={flag} unused={unused} />
      </div>
    </section>
  );
}
