'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV, PROFILE_IMAGE } from '../lib/config';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const path = usePathname() || '/';
  return (
    <nav className="nav">
      <a className="brand" href="/">
        <img src={PROFILE_IMAGE} alt="Progress Tech" />
        <span>PROGRESS TECH OFFICIAL</span>
      </a>
      <button className="nav-toggle" type="button" aria-label="Menu" onClick={() => setOpen(!open)}>
        =
      </button>
      <div className={'nav-links' + (open ? ' open' : '')}>
        {NAV.map((n) => (
          <a key={n.href} className={path === n.href ? 'active' : ''} href={n.href}>
            {n.label}
          </a>
        ))}
        <a href="/admin">Admin</a>
      </div>
    </nav>
  );
}
