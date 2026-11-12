import { NextResponse } from 'next/server';
import { createContactRequest } from '@/lib/admin/requests-store';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const projectType = String(body.projectType || body.type || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !email || !message) {
    return NextResponse.json(
      { ok: false, error: 'Please complete your name, email and project details.' },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email address.' }, { status: 400 });
  }

  try {
    const saved = await createContactRequest({ name, email, phone, projectType, message });
    return NextResponse.json({
      ok: true,
      id: saved.id,
      message: 'Thank you. Your enquiry was received.',
    });
  } catch (caught) {
    console.error('[contact] save failed', caught);
    return NextResponse.json(
      { ok: false, error: caught instanceof Error ? caught.message : 'Could not save your enquiry.' },
      { status: 500 },
    );
  }
}
