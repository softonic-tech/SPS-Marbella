import { NextResponse } from 'next/server';
import { listContactRequests, updateContactRequest } from '@/lib/admin/requests-store';
import type { ContactRequestStatus } from '@/lib/admin/types';
import { isAdminAuthenticated } from '@/lib/social/auth';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const requests = await listContactRequests(200);
  return NextResponse.json({ ok: true, requests });
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const id = String(body.id || '').trim();
  if (!id) return NextResponse.json({ ok: false, error: 'Missing request id.' }, { status: 400 });

  const statusRaw = String(body.status || '').trim();
  const status = (['new', 'reviewing', 'done', 'archived'] as const).includes(
    statusRaw as ContactRequestStatus,
  )
    ? (statusRaw as ContactRequestStatus)
    : undefined;
  const notes = body.notes === undefined ? undefined : String(body.notes || '');

  const updated = await updateContactRequest(id, {
    ...(status ? { status } : {}),
    ...(notes !== undefined ? { notes } : {}),
  });
  if (!updated) {
    return NextResponse.json({ ok: false, error: 'Request not found.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, request: updated });
}
