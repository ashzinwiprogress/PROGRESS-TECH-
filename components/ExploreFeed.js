'use client';
import { useEffect, useRef, useState } from 'react';
import { PROFILE_IMAGE } from '../lib/config';

function sortItems(list) {
  return [...list].sort((a, b) => String(b.created || '').localeCompare(String(a.created || '')));
}

export default function ExploreFeed({ initialItems, query }) {
  const [items, setItems] = useState(sortItems(initialItems || []));
  const [pulse, setPulse] = useState(false);
  const countRef = useRef((initialItems || []).length);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const r = await fetch('/api/content', { cache: 'no-store' });
        const d = await r.json();
        if (cancelled) return;
        const next = sortItems(d.items || []);
        if (next.length !== countRef.current) {
          countRef.current = next.length;
          setPulse(true);
          setTimeout(() => setPulse(false), 1200);
        }
        setItems(next);
      } catch (e) { /* keep current items */ }
    }
    const t = setInterval(tick, 8000);
    const onFocus = () => tick();
    const onVisible = () => { if (document.visibilityState === 'visible') tick(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      clearInterval(t);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const q = String(query || '').toLowerCase();
  const shown = q
    ? items.filter((it) => ((it.title || '') + ' ' + (it.type || '') + ' ' + (it.url || '')).toLowerCase().includes(q))
    : items;

  if (items.length === 0) {
    return (
      <div className="glass" style={{ padding: 28 }}>
        <h3>Nothing published yet</h3>
        <p className="muted">When the admin adds a tool, video, PDF or link with a cover, it will show here instantly.</p>
      </div>
    );
  }

  return (
    <>
      {pulse && <p className="tiny" style={{ color: 'var(--ok)', marginBottom: 12 }}>New items just arrived.</p>}
      {shown.length === 0 ? (
        <div className="glass" style={{ padding: 28 }}>
          <h3>No matches</h3>
          <p className="muted">Nothing matches your search. Try another word.</p>
        </div>
      ) : (
        <div className="tools">
          {shown.map((it) => {
            const href = it.url || it.file || '';
            return (
              <article className="card glass" key={it.id}>
                <img className="tool-cover" src={it.cover || PROFILE_IMAGE} alt="" onError={(e) => { if (e.currentTarget.src !== PROFILE_IMAGE) e.currentTarget.src = PROFILE_IMAGE; }} />
                <div className="tiny">{String(it.type || 'item').toUpperCase()}</div>
                <h3>{it.title}</h3>
                {it.note && <p>{it.note}</p>}
                {href && (
                  <a className="btn btn-cyan" style={{ marginTop: 12 }} href={href} target="_blank" rel="noopener">Try right now</a>
                )}
                {it.video && <video style={{ width: '100%', marginTop: 12, borderRadius: 12 }} controls src={it.video}></video>}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
