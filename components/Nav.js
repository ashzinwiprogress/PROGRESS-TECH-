'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV, PROFILE_IMAGE } from '../lib/config';
import NotifyBell from './NotifyBell';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const path = usePathname() || '/';
  return (
    <nav className="nav">
      <a className="brand" href="/">
        <img src={PROFILE_IMAGE} alt="Progress Tech" />
        <span>PROGRESS TECH OFFICIAL</span>
      </a>
      <div className={'nav-links' + (open ? ' open' : '')}>
        {NAV.map((n) => (
          <a key={n.href} className={path === n.href ? 'active' : ''} href={n.href}>
            {n.label}
          </a>
        ))}
        <a href="/admin">Admin</a>
      </div>
      <div className="nav-right">
        <NotifyBell />
        <button className="nav-toggle" type="button" aria-label="Menu" onClick={() => setOpen(!open)}>
          =
        </button>
      </div>
    </nav>
  );
}
