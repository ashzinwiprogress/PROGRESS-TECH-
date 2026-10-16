import { NextResponse } from 'next/server';
import { readUpload } from '../../../../lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const name = String((params && params.name) || '');
  const file = await readUpload(name);
  if (!file) return new NextResponse('Not found', { status: 404 });
  return new NextResponse(file.buffer, {
    status: 200,
    headers: {
      'Content-Type': file.contentType,
      'Content-Length': String(file.buffer.length),
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
