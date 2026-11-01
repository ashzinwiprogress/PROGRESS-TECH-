import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ok: false, user: null });
}

export async function POST() {
  return NextResponse.json({ ok: false, error: 'Student login is disabled. Use the follow gate.' }, { status: 410 });
}
