'use client';
import { useState, useEffect, useRef } from 'react';
import { PROFILE_IMAGE, BG_VIDEO } from '../../lib/config';

export default function Admin() {
  const [authed, setAuthed] = useState(null);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin', { method: 'GET' }).then((r) => r.json()).then((d) => setAuthed(!!d.ok)).catch(() => setAuthed(false));
  }, []);

  async function login(e) {
    e.preventDefault();
    setError('');
    const r = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', username: user, password: pass })
    });
    const d = await r.json();
    if (d.ok) setAuthed(true);
    else setError(d.error || 'Invalid credentials');
  }

  if (authed === null) {
    return <Shell><p className="muted">Loading...</p></Shell>;
  }

  if (!authed) {
    return (
      <Shell>
        <div className="glass" style={{ padding: 32, maxWidth: 460 }}>
          <div className="kicker">Control room</div>
          <h2>Admin dashboard</h2>
          {error && <p className="err">{error}</p>}
          <form className="form" onSubmit={login}>
            <label>Username</label>
            <input value={user} onChange={(e) => setUser(e.target.value)} required placeholder="Progresstech" />
            <label>Password</label>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} required />
            <button className="btn btn-cyan" type="submit">Enter</button>
          </form>
          <p className="tiny" style={{ marginTop: 14 }}><a href="/">Back to site</a></p>
        </div>
      </Shell>
    );
  }

  return <Dashboard onLogout={() => setAuthed(false)} />;
}

function Shell({ children }) {
  return (
    <>
      <div className="bg-video"><video autoPlay muted loop playsInline><source src={BG_VIDEO} type="video/mp4" /></video></div>
      <div className="bg-overlay"></div>
      <section className="hero"><div className="wrap" style={{ display: 'grid', placeItems: 'center' }}>{children}</div></section>
    </>
  );
}

function Dashboard({ onLogout }) {
  const [items, setItems] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [students, setStudents] = useState([]);
  const [activity, setActivity] = useState([]);
  const [subs, setSubs] = useState(0);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const formRef = useRef(null);
  const [fnames, setFnames] = useState({});

  async function load() {
    const r = await fetch('/api/content', { cache: 'no-store' });
    const d = await r.json();
    setItems((d.items || []).slice().reverse());
  }
  async function loadSubs() {
    try {
      const r = await fetch('/api/notify', { cache: 'no-store' });
      const d = await r.json();
      setSubs(d.subscribers || 0);
    } catch (e) {}
  }
  async function loadVisitors() {
    const r = await fetch('/api/visit', { method: 'GET' }).catch(() => null);
    if (r && r.ok) {
      const d = await r.json().catch(() => ({}));
      if (d.visitors) setVisitors(d.visitors.slice().reverse());
    }
  }
  async function loadStudents() {
    const r = await fetch('/api/users', { cache: 'no-store' }).catch(() => null);
    if (r && r.ok) {
      const d = await r.json().catch(() => ({}));
      setStudents(d.users || []);
      setActivity(d.activity || []);
    }
  }
  useEffect(() => { load(); loadVisitors(); loadSubs(); loadStudents(); }, []);

  async function studentAction(id, action) {
    const reason = action === 'suspend' ? window.prompt('Suspend reason', 'Terms of Service violation') : '';
    if (action === 'suspend' && reason === null) return;
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id, reason })
    });
    setMsg(action === 'suspend' ? 'Account suspended' : 'Account restored');
    loadStudents();
  }

  async function add(e) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const fd = new FormData(formRef.current);
      const r = await fetch('/api/content', { method: 'POST', body: fd });
      const d = await r.json();
      if (d.ok) {
        const sent = d.notified && d.notified.sent ? d.notified.sent : 0;
        setMsg('Added live to Explore' + (sent ? ' - notified ' + sent + ' subscriber' + (sent === 1 ? '' : 's') : ''));
        formRef.current.reset();
        setFnames({});
        load();
        loadSubs();
      } else {
        setMsg('Error: ' + (d.error || 'could not add'));
      }
    } catch (err) {
      setMsg('Error adding item');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    await fetch('/api/content', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    setMsg('Item removed');
    load();
  }

  async function logout() {
    await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
    onLogout();
  }

  return (
    <div className="admin-layout" style={{ position: 'relative', zIndex: 1 }}>
      <aside className="side">
        <div className="brand" style={{ marginBottom: 24 }}>
          <img src={PROFILE_IMAGE} alt="" />
          <span>ADMIN</span>
        </div>
        <a className="active" href="#publish">Publish item</a>
        <a href="#library">Library</a>
        <a href="#students">Students</a>
        <a href="#activity">Activity</a>
        <a href="#visitors">Visitors</a>
        <a href="/explore" target="_blank" rel="noopener">View explore</a>
        <a href="/">Public site</a>
        <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Logout</a>
      </aside>
      <main className="admin-main">
        <div className="kicker">PROGRESS TECH OFFICIAL</div>
        <h1>Control room</h1>
        <p className="muted">Upload images, videos, files and links. Everything you add appears live on Explore PROGRESS TECH HOME.</p>
        {msg && <p className="ok" style={{ marginTop: 10 }}>{msg}</p>}
        <div className="stats">
          <div className="glass" style={{ padding: 18 }}><div className="tiny">Published items</div><h2>{items.length}</h2></div>
          <div className="glass" style={{ padding: 18 }}><div className="tiny">Notif. subscribers</div><h2>{subs}</h2></div>
          <div className="glass" style={{ padding: 18 }}><div className="tiny">Visitor events</div><h2>{visitors.length}</h2></div>
          <div className="glass" style={{ padding: 18 }}><div className="tiny">Students</div><h2>{students.length}</h2></div>
          <div className="glass" style={{ padding: 18 }}><div className="tiny">Operator</div><h2 style={{ fontSize: 22 }}>Progresstech</h2></div>
        </div>

        <section id="publish" className="glass" style={{ padding: 24, marginBottom: 28 }}>
          <h3>Add tool / video / file / link</h3>
          <p className="tiny" style={{ margin: '8px 0 16px' }}>Paste a URL, attach a cover image, optional video cover, and a title. Hit Add - it shows on Explore immediately.</p>
          <form className="form wide" ref={formRef} onSubmit={add}>
            <label>Name / title of the tool or file</label>
            <input name="title" required placeholder="Nmap lab notes / TryHackMe path / PDF pack" />
            <label>Type</label>
            <select name="type" defaultValue="link">
              <option value="link">Link</option>
              <option value="tool">Tool</option>
              <option value="video">Video</option>
              <option value="file">File (PDF or other)</option>
              <option value="image">Image</option>
            </select>
            <label>Destination link (optional if uploading a file)</label>
            <input name="url" placeholder="https://example.com" />
            <label>Short note</label>
            <input name="note" placeholder="What users should know" />
            <div className="file-row">
              <div>
                <label>Cover image for the card</label>
                <input type="file" name="cover" accept="image/*" onChange={(e) => setFnames((f) => ({ ...f, cover: e.target.files[0] ? e.target.files[0].name : '' }))} />
              </div>
              <div>
                <label>Or cover image URL</label>
                <input name="cover_url" placeholder="https://...jpg" />
              </div>
            </div>
            <div className="file-row">
              <div>
                <label>Upload file (pdf, zip, image...)</label>
                <input type="file" name="asset" onChange={(e) => setFnames((f) => ({ ...f, asset: e.target.files[0] ? e.target.files[0].name : '' }))} />
              </div>
              <div>
                <label>Upload video</label>
                <input type="file" name="video" accept="video/*" onChange={(e) => setFnames((f) => ({ ...f, video: e.target.files[0] ? e.target.files[0].name : '' }))} />
              </div>
            </div>
            <label>Or video URL</label>
            <input name="video_url" placeholder="https://...mp4" />
            <button className="btn btn-cyan" type="submit" disabled={busy}>{busy ? 'Uploading...' : 'Add'}</button>
          </form>
        </section>

        <section id="library" style={{ marginBottom: 28 }}>
          <h3>Live library</h3>
          <div className="tools" style={{ marginTop: 16 }}>
            {items.length === 0 && <p className="muted">No items yet. Publish the first tool above.</p>}
            {items.map((it) => (
              <article className="card glass" key={it.id}>
                <img className="tool-cover" src={it.cover || PROFILE_IMAGE} alt="" />
                <div className="tiny">{String(it.type || 'item').toUpperCase()} - {it.created}</div>
                <h3>{it.title}</h3>
                <p className="tiny">{it.url || it.file || ''}</p>
                <button className="btn btn-ghost" style={{ marginTop: 10 }} type="button" onClick={() => remove(it.id)}>Delete / remove</button>
              </article>
            ))}
          </div>
        </section>

        <section id="students" className="glass" style={{ padding: 20, overflow: 'auto', marginBottom: 28 }}>
          <h3>Registered students</h3>
          <p className="tiny">Suspend for Terms violations. Restore later so they can continue learning. Labs are educational only.</p>
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Provider</th><th>Labs</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {students.length === 0 && <tr><td colSpan={6} className="tiny">No students yet.</td></tr>}
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.provider}</td>
                  <td>{s.labs || 0}</td>
                  <td>{s.suspended ? 'Suspended' : 'Active'}</td>
                  <td>
                    {s.suspended ? (
                      <button className="btn btn-cyan" type="button" style={{ padding: '8px 12px' }} onClick={() => studentAction(s.id, 'restore')}>Restore</button>
                    ) : (
                      <button className="btn btn-ghost" type="button" style={{ padding: '8px 12px' }} onClick={() => studentAction(s.id, 'suspend')}>Suspend</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="activity" className="glass" style={{ padding: 20, overflow: 'auto', marginBottom: 28 }}>
          <h3>Student activity</h3>
          <p className="tiny">Register, login, labs, quiz scores, suspend and restore events.</p>
          <table className="table">
            <thead><tr><th>Time</th><th>Email</th><th>Action</th><th>Detail</th></tr></thead>
            <tbody>
              {activity.slice(0, 80).map((a) => (
                <tr key={a.id}>
                  <td>{a.time}</td>
                  <td>{a.email}</td>
                  <td>{a.action}</td>
                  <td className="tiny">{a.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="visitors" className="glass" style={{ padding: 20, overflow: 'auto' }}>
          <h3>Users who visited</h3>
          <p className="tiny">Live visitor log. Explore posts are saved to the public catalog so they survive deploys without Blob.</p>
          <table className="table">
            <thead><tr><th>Time</th><th>Page</th><th>IP</th><th>Agent</th></tr></thead>
            <tbody>
              {visitors.slice(0, 80).map((v, i) => (
                <tr key={i}>
                  <td>{v.time}</td>
                  <td>{v.page}</td>
                  <td>{v.ip}</td>
                  <td className="tiny">{v.ua}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
