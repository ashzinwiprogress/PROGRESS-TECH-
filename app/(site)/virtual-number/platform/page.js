import Platforms from './Platforms';

export const metadata = { title: 'Choose platform | PROGRESS TECH OFFICIAL' };
export const dynamic = 'force-dynamic';

export default function PlatformPage({ searchParams }) {
  const country = String((searchParams && searchParams.country) || '');
  const number = String((searchParams && searchParams.number) || '');
  const flag = String((searchParams && searchParams.flag) || '');
  return (
    <section className="section">
      <div className="wrap">
        <div className="kicker">Step 2</div>
        <h1>Choose the platform</h1>
        <p className="muted" style={{ margin: '12px 0 28px', maxWidth: '70ch' }}>
          You will sign this number into the app you pick. After that, open the inbox and the exact OTP for that platform is pulled live.
        </p>
        <Platforms country={country} number={number} flag={flag} />
      </div>
    </section>
  );
}
