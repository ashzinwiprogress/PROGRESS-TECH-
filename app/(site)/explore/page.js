import { getContent } from '../../../lib/store';
import { PROFILE_IMAGE } from '../../../lib/config';

export const metadata = { title: 'Explore PROGRESS TECH HOME' };
export const dynamic = 'force-dynamic';

export default async function Explore({ searchParams }) {
  let items = [];
  try { items = await getContent(); } catch (e) { items = []; }
  items = [...items].sort((a, b) => String(b.created || '').localeCompare(String(a.created || '')));
  const q = (searchParams && searchParams.q ? String(searchParams.q) : '').toLowerCase();
  if (q) {
    items = items.filter((it) =>
      ((it.title || '') + ' ' + (it.type || '') + ' ' + (it.url || '')).toLowerCase().includes(q)
    );
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className="kicker">Live arsenal</div>
        <h1>Explore PROGRESS TECH HOME</h1>
        <p className="muted">Tools, videos, files and links published from the admin dashboard appear here in real time.</p>
        <form className="searchbar" method="get" action="/explore">
          <input name="q" defaultValue={q} placeholder="Search tools, videos, files..." />
          <button className="btn btn-cyan" type="submit">Search</button>
        </form>
        {items.length === 0 ? (
          <div className="glass" style={{ padding: 28 }}>
            <h3>Nothing published yet</h3>
            <p className="muted">When the admin adds a tool, video, PDF or link with a cover, it will show here instantly.</p>
          </div>
        ) : (
          <div className="tools">
            {items.map((it) => {
              const href = it.url || it.file || '';
              return (
                <article className="card glass" key={it.id}>
                  <img className="tool-cover" src={it.cover || PROFILE_IMAGE} alt="" />
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
      </div>
    </section>
  );
}
