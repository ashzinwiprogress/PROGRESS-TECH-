import { getSubscribers } from './store';
import { OWNER_EMAIL, SITE_NAME } from './config';

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function buildPostEmail(item) {
  const type = String((item && item.type) || 'item').toUpperCase();
  const title = (item && item.title) || 'New update';
  const note = (item && item.note) || '';
  const link = (item && (item.url || item.file)) || '';
  const cover = (item && item.cover) || '';
  const subject = `New on ${SITE_NAME}: ${title}`;
  const html = `
    <div style="font-family:Outfit,Arial,sans-serif;background:#021018;color:#e8f7ff;padding:24px">
      <div style="max-width:560px;margin:0 auto;background:#081626;border:1px solid #0b3a52;border-radius:18px;padding:24px">
        <p style="color:#d4af37;letter-spacing:.2em;font-size:12px;margin:0 0 8px">${escapeHtml(SITE_NAME)}</p>
        <p style="color:#9ec4d6;font-size:12px;margin:0 0 16px">New ${escapeHtml(type)} published</p>
        ${cover ? `<img src="${escapeHtml(cover)}" alt="" style="width:100%;border-radius:12px;margin-bottom:16px">` : ''}
        <h2 style="margin:0 0 8px;color:#fff">${escapeHtml(title)}</h2>
        ${note ? `<p style="color:#9ec4d6;margin:0 0 16px">${escapeHtml(note)}</p>` : ''}
        ${link ? `<a href="${escapeHtml(link)}" style="display:inline-block;background:linear-gradient(135deg,#00e5ff,#0077ff);color:#021018;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700">Open it now</a>` : ''}
        <p style="color:#5b7f92;font-size:11px;margin-top:24px">You are receiving this because you enabled notifications on ${escapeHtml(SITE_NAME)}.</p>
      </div>
    </div>`;
  const text = `${title}\n\n${note}\n\n${link}`;
  return { subject, html, text };
}

export async function notifyNewPost(item) {
  let subscribers = [];
  try {
    subscribers = await getSubscribers();
  } catch (e) {
    return { sent: 0, skipped: true };
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || subscribers.length === 0) {
    return { sent: 0, skipped: !apiKey, recipients: subscribers.length };
  }

  const { subject, html, text } = buildPostEmail(item);
  const from = process.env.EMAIL_FROM || 'Progress Tech <onboarding@resend.dev>';
  let sent = 0;

  for (const sub of subscribers.slice(0, 100)) {
    if (!sub || !sub.email) continue;
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [sub.email], reply_to: OWNER_EMAIL, subject, html, text })
      });
      if (res.ok) sent++;
    } catch (e) { /* keep trying the rest */ }
  }

  return { sent, recipients: subscribers.length };
}
