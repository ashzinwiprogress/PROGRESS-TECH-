'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { PROFILE_IMAGE, WA_CHANNEL, YT_CHANNEL } from '../lib/config';
import { useAuth } from './AuthProvider';

const SKIP = ['/login', '/register', '/terms', '/account'];

export default function Gate() {
  const [visible, setVisible] = useState(false);
  const [notice, setNotice] = useState('');
  const stateRef = useRef({ wa: false, yt: false });
  const path = usePathname() || '/';
  const { user, ready } = useAuth();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!ready) return;
    if (user) {
      document.cookie = 'pto_followed=1;path=/;max-age=' + 60 * 60 * 24 * 365;
      setVisible(false);
      document.documentElement.style.overflow = '';
      return;
    }
    if (SKIP.some((p) => path === p || path.startsWith(p + '/'))) {
      setVisible(false);
      document.documentElement.style.overflow = '';
      return;
    }
    if (document.cookie.includes('pto_followed=1')) return;
    let s = { wa: false, yt: false };
    try { s = JSON.parse(localStorage.getItem('pto_gate') || '{}'); } catch (e) {}
    stateRef.current = { wa: !!s.wa, yt: !!s.yt };
    setVisible(true);
    document.documentElement.style.overflow = 'hidden';
    verify();
  }, [ready, user, path]);

  function verify() {
    const s = stateRef.current;
    if (s.wa && s.yt) {
      document.cookie = 'pto_followed=1;path=/;max-age=' + 60 * 60 * 24 * 365;
      setNotice('Verified. Welcome to PROGRESS TECH.');
      setTimeout(() => {
        setVisible(false);
        document.documentElement.style.overflow = '';
      }, 700);
      return;
    }
    if (s.wa && !s.yt) setNotice('You are almost there. Now tap the YouTube channel to subscribe.');
    else if (s.yt && !s.wa) setNotice('You are almost there. Now tap the WhatsApp channel to follow.');
  }

  function step(ch) {
    stateRef.current[ch] = true;
    try { localStorage.setItem('pto_gate', JSON.stringify(stateRef.current)); } catch (e) {}
    verify();
    setTimeout(verify, 1500);
  }

  if (!visible) return null;

  return (
    <div className="gate" id="followGate">
      <div className="gate-box glass">
        <img src={PROFILE_IMAGE} alt="Progress Tech" />
        <div className="kicker">Verified access</div>
        <h2>Follow PROGRESS TECH to enter</h2>
        <p className="muted" style={{ margin: '12px 0 18px' }}>
          Tap both buttons. The system verifies automatically and unlocks the site.
        </p>
        <a className="btn btn-cyan gate-step" href={WA_CHANNEL} target="_blank" rel="noopener" onClick={() => step('wa')}>
          Follow WhatsApp Channel
        </a>
        <a className="btn btn-gold gate-step" href={YT_CHANNEL} target="_blank" rel="noopener" onClick={() => step('yt')}>
          Subscribe YouTube Channel
        </a>
        <p className="tiny" style={{ marginTop: 16 }}><a href="/login">Already a student? Sign in</a> · <a href="/register">Register</a></p>
        <p className="tiny" style={{ marginTop: 8, color: '#ffd166' }}>{notice}</p>
      </div>
    </div>
  );
}
