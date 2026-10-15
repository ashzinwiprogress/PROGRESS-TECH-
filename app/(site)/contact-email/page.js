'use client';
import { useState, useRef } from 'react';

export default function ContactEmail() {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [fname, setFname] = useState('');
  const formRef = useRef(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setStatus('');
    try {
      const fd = new FormData(formRef.current);
      const r = await fetch('/api/email', { method: 'POST', body: fd });
      const d = await r.json();
      if (d.mailto) {
        window.location.href = d.mailto;
        setStatus(d.message || 'Opening your email app with the message ready to send.');
      } else {
        setStatus(d.message || 'Message sent to progresstech237@gmail.com');
      }
    } catch (err) {
      setStatus('Could not submit. Email the owner directly at progresstech237@gmail.com');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className="kicker">3D liquid mail</div>
        <h1>Send via email</h1>
        <p className="muted" style={{ margin: '12px 0 24px' }}>
          Ocean glass form. Add email, phone with country code, message, and upload an image or file from the corner control.
          Send goes to progresstech237@gmail.com.
        </p>
        {status && <p className="ok">{status}</p>}
        <form className="form glass" style={{ padding: 28, position: 'relative' }} ref={formRef} onSubmit={submit}>
          <input type="hidden" name="action" value="email" />
          <label>Your email address</label>
          <input type="email" name="email" required placeholder="you@example.com" />
          <label>Phone number with country code</label>
          <input name="phone" required placeholder="+2376XXXXXXXX" />
          <label>Message</label>
          <textarea name="message" required placeholder="Write your message to the owner"></textarea>
          <div style={{ position: 'absolute', top: 18, right: 18 }}>
            <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
              {fname || 'Upload'}
              <input
                type="file"
                name="attach"
                style={{ display: 'none' }}
                onChange={(e) => setFname(e.target.files[0] ? e.target.files[0].name : '')}
              />
            </label>
          </div>
          <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? 'Sending...' : 'Send now'}</button>
        </form>
      </div>
    </section>
  );
}
