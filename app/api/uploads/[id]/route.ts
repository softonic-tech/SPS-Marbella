import { NextResponse } from 'next/server';
import { getUploadBytes } from '@/lib/social/store';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const file = await getUploadBytes(id);
  if (!file) {
    return NextResponse.json({ ok: false, error: 'Upload not found.' }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(file.buffer), {
    status: 200,
    headers: {
      'Content-Type': file.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Disposition': `inline; filename="${file.filename}"`,
    },
  });
}
