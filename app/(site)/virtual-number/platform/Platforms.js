'use client';

import { PLATFORMS } from '../../../../lib/tempnumber';

export default function Platforms({ country, number, flag }) {
  if (!number) {
    return (
      <div className="glass p-tool">
        <p className="err">No number selected.</p>
        <a className="btn btn-cyan" href="/virtual-number">Back to countries</a>
      </div>
    );
  }

  const qs = 'country=' + encodeURIComponent(country) + '&number=' + encodeURIComponent(number) + '&flag=' + encodeURIComponent(flag || '');

  return (
    <div>
      <div className="vn-selected glass">
        <span className="vn-flag">{flag}</span>
        <div>
          <div className="tiny">{country || 'Live number'}</div>
          <strong className="vn-phone">{number}</strong>
        </div>
        <a className="btn btn-ghost" href="/virtual-number">Change number</a>
      </div>
      <div className="vn-platforms">
        {PLATFORMS.map((p) => (
          <a
            key={p.id}
            className="card glass vn-plat"
            href={'/virtual-number/inbox?' + qs + '&platform=' + encodeURIComponent(p.id)}
          >
            <div className="vn-plat-mark">{p.name.slice(0, 2).toUpperCase()}</div>
            <h3>{p.name}</h3>
            <p>{p.hint}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
