import { NextResponse } from 'next/server';
import { OWNER_EMAIL } from '../../../lib/config';
import { uploadToPublicHost } from '../../../lib/omegatech';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req) {
  try {
    const fd = await req.formData();
    const email = String(fd.get('email') || '');
    const phone = String(fd.get('phone') || '');
    const message = String(fd.get('message') || '');
    const attach = fd.get('attach');

    let attachmentUrl = '';
    if (attach && typeof attach !== 'string' && attach.arrayBuffer && attach.size > 0) {
      const buf = Buffer.from(await attach.arrayBuffer());
      attachmentUrl = await uploadToPublicHost(buf, attach.name || 'attachment');
    }

    const subject = 'PROGRESS TECH OFFICIAL - new message';
    let text = `From: ${email}\nPhone: ${phone}\n\n${message}\n`;
    if (attachmentUrl) text += `\nAttachment: ${attachmentUrl}\n`;

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Progress Tech <onboarding@resend.dev>',
          to: [OWNER_EMAIL],
          reply_to: email,
          subject,
          text
        })
      });
      if (res.ok) {
        return NextResponse.json({ ok: true, message: 'Message sent to ' + OWNER_EMAIL });
      }
    }

    const mailto = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    return NextResponse.json({
      ok: true,
      mailto,
      message: 'Opening your email app with the message ready. Tap send to deliver it to ' + OWNER_EMAIL
    });
  } catch (e) {
    return NextResponse.json({ ok: false, message: 'Could not submit. Email the owner directly at ' + OWNER_EMAIL });
  }
}
