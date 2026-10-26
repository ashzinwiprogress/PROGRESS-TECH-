import Inbox from './Inbox';
import { PLATFORMS } from '../../../../lib/tempnumber';

export const metadata = { title: 'OTP inbox | PROGRESS TECH OFFICIAL' };
export const dynamic = 'force-dynamic';

export default function InboxPage({ searchParams }) {
  const country = String((searchParams && searchParams.country) || '');
  const number = String((searchParams && searchParams.number) || '');
  const flag = String((searchParams && searchParams.flag) || '');
  const platform = String((searchParams && searchParams.platform) || 'other');
  const plat = PLATFORMS.find((p) => p.id === platform);
  return (
    <section className="section">
      <div className="wrap">
        <div className="kicker">Step 3 · Live OTP</div>
        <h1>{plat ? plat.name : 'Any platform'} inbox</h1>
        <p className="muted" style={{ margin: '12px 0 28px', maxWidth: '72ch' }}>
          Copy the number, sign in on {plat ? plat.name : 'your platform'}, then come back. This page keeps pulling the newest SMS for this exact number.
        </p>
        <Inbox country={country} number={number} flag={flag} platform={platform} platformName={plat ? plat.name : 'Any platform'} />
      </div>
    </section>
  );
}
