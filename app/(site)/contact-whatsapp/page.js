'use client';
import { useState } from 'react';
import { OWNER_WHATSAPP } from '../../../lib/config';

export default function ContactWhatsApp() {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [msg, setMsg] = useState('');

  function submit(e) {
    e.preventDefault();
    const body = `PROGRESS TECH OFFICIAL\nFrom: ${name}\nNumber: ${number}\n\n${msg}`;
    window.location.href = `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(body)}`;
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className="kicker">Liquid glass comms</div>
        <h1>WhatsApp the owner</h1>
        <p className="muted" style={{ margin: '12px 0 24px' }}>
          Luxury tech systems style. Enter your WhatsApp with country code, your WhatsApp name, then the message.
          Send opens the owner number +237698830792.
        </p>
        <form className="form glass" style={{ padding: 28 }} onSubmit={submit}>
          <label>WhatsApp name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your WhatsApp name" />
          <label>WhatsApp number with country code</label>
          <input value={number} onChange={(e) => setNumber(e.target.value)} required placeholder="+2376XXXXXXXX" />
          <label>Message to owner</label>
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} required placeholder="Write the message you want to send to the owner"></textarea>
          <button className="btn btn-cyan" type="submit">Send</button>
        </form>
        <p className="tiny" style={{ marginTop: 16 }}>Also available: <a href="/contact-email">send via email</a></p>
      </div>
    </section>
  );
}
