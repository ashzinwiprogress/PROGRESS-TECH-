import { NextResponse } from 'next/server';
import { streamUpload, mimeForName } from '../../../../lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const name = String((params && params.name) || '');
  if (!name) return NextResponse.json({ error: 'Missing pathname' }, { status: 400 });

  const file = await streamUpload(name);
  if (!file) return new NextResponse('Not found', { status: 404 });

  return new NextResponse(file.stream, {
    status: 200,
    headers: {
      'Content-Type': file.contentType || mimeForName(name),
      'Cache-Control': 'private, no-cache',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
