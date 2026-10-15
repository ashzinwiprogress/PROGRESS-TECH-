# PROGRESS TECH OFFICIAL

Professional cybersecurity academy + multi-model AI studio.
Luxury ocean-glass UI with animated water motion, built on Next.js for Vercel.

## Pages

- `/` Home
- `/courses` 4 academies in one
- `/academy` Cyber notes (beginner to pro), filterable by track
- `/explore` Live arsenal published from the admin dashboard
- `/studio` AI Studio: chat, image, image edit, video, code/files, music
- `/chatbot` PROGRESS TECH assistant (12 model routes)
- `/contact`, `/contact-whatsapp`, `/contact-email`, `/about`
- `/admin` Admin dashboard (username `Progresstech`, password `progresstech12`)

## AI tools (all live via api.omegatech.app)

- **Chat**: Gemini, GPT-4o mini, ChatGPT v2, Claude, Deep AI, HotBot (GPT-5),
  Asyntai, Claude Code bot, Unlimited AI, Perplexity, AICLI, Llama app builder.
- **Image**: Flux and Argen return a raw PNG you can view and download.
- **Image edit**: upload a photo + prompt. Nano Banana (`Nanobana-extra`) and Flux edit
  return an edited raw PNG. The uploaded image is relayed to a temporary public host so
  the model can read it.
- **Video**: text-to-video (Txt2video, raw MP4) and image-to-video (Wan-fast, animate a
  photo into a short clip). Both return a raw MP4 you can play and download.
- **Code**: upload source files or a ZIP (or describe an app). It scans/fixes code, and
  large projects are combined into a downloadable ZIP.
- **Music**: prompt returns a playable MP3 plus lyrics, with a download button.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel: New Project -> Import the repo. Framework is auto-detected as Next.js.
3. (Recommended) Add a Blob store: Project -> Storage -> Create -> Blob. This injects
   `BLOB_READ_WRITE_TOKEN` automatically and makes admin content, the visitor log and
   uploaded images persist across serverless invocations.
4. (Optional) Add `RESEND_API_KEY` (and optional `EMAIL_FROM`) to send the contact
   email directly. Without it, the email form opens the visitor's mail app with the
   message pre-filled to `progresstech237@gmail.com`.
5. Deploy. No build settings needed (`next build`).

### Environment variables

See `.env.example`. All are optional; the site runs without them, but persistence
(admin/explore/visitors) needs `BLOB_READ_WRITE_TOKEN` on Vercel because the
serverless filesystem is read-only.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Notes

- Long AI calls (image, edit, code, music start) are capped at 60s per request using
  `maxDuration`. Music uses a poll endpoint (`music_status`) so each request stays short.
- Uploaded-image editing relays through a temporary host (litterbox, then uguu, then
  tmpfiles). If all fail, try again; these are free public relays.
