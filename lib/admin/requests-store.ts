import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { MongoClient, type Db } from 'mongodb';
import { env } from '@/lib/social/env';
import type { ContactRequest, ContactRequestStatus } from './types';

type MongoGlobal = typeof globalThis & { __spsMongo?: Promise<MongoClient> };
type RequestDoc = Omit<ContactRequest, 'id'> & { _id: string };

function mongoUri() {
  return env('MONGODB_URI');
}

async function mongoClient() {
  const uri = mongoUri();
  if (!uri) throw new Error('MONGODB_URI is not set');
  const scope = globalThis as MongoGlobal;
  if (!scope.__spsMongo) {
    scope.__spsMongo = new MongoClient(uri, {
      maxPoolSize: 5,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
    })
      .connect()
      .catch((error: unknown) => {
        scope.__spsMongo = undefined;
        throw error;
      });
  }
  return scope.__spsMongo;
}

async function db(): Promise<Db> {
  return (await mongoClient()).db();
}

function dataDir() {
  return path.join(process.cwd(), 'data');
}

function requestsFile() {
  return path.join(dataDir(), 'contact-requests.json');
}

function readText(file: string) {
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8');
}

function writeText(file: string, text: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, text);
  fs.renameSync(temp, file);
}

function normalize(row: Partial<ContactRequest> & { id?: string; _id?: string }): ContactRequest | null {
  const id = String(row.id || row._id || '').trim();
  if (!id) return null;
  const status = (['new', 'reviewing', 'done', 'archived'] as const).includes(
    row.status as ContactRequestStatus,
  )
    ? (row.status as ContactRequestStatus)
    : 'new';
  return {
    id,
    name: String(row.name || '').trim().slice(0, 120),
    email: String(row.email || '').trim().slice(0, 160),
    phone: String(row.phone || '').trim().slice(0, 60),
    projectType: String(row.projectType || '').trim().slice(0, 80),
    message: String(row.message || '').trim().slice(0, 4000),
    status,
    createdAt: String(row.createdAt || '').trim(),
    updatedAt: String(row.updatedAt || '').trim(),
    notes: String(row.notes || '').trim().slice(0, 2000),
  };
}

export async function listContactRequests(limit = 100): Promise<ContactRequest[]> {
  if (mongoUri()) {
    const collection = (await db()).collection<RequestDoc>('contact_requests');
    const rows = await collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray();
    return rows
      .map((row) => normalize({ ...row, id: row._id }))
      .filter((row): row is ContactRequest => Boolean(row));
  }

  try {
    const text = readText(requestsFile());
    if (!text) return [];
    const value = JSON.parse(text) as ContactRequest[];
    if (!Array.isArray(value)) return [];
    return value
      .map((row) => normalize(row))
      .filter((row): row is ContactRequest => Boolean(row))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function createContactRequest(input: {
  name: string;
  email: string;
  phone?: string;
  projectType?: string;
  message: string;
}): Promise<ContactRequest> {
  const now = new Date().toISOString();
  const request: ContactRequest = {
    id: randomUUID().replace(/-/g, '').slice(0, 16),
    name: String(input.name || '').trim().slice(0, 120),
    email: String(input.email || '').trim().slice(0, 160),
    phone: String(input.phone || '').trim().slice(0, 60),
    projectType: String(input.projectType || '').trim().slice(0, 80),
    message: String(input.message || '').trim().slice(0, 4000),
    status: 'new',
    createdAt: now,
    updatedAt: now,
    notes: '',
  };

  if (!request.name || !request.email || !request.message) {
    throw new Error('Name, email and message are required.');
  }

  if (mongoUri()) {
    const collection = (await db()).collection<RequestDoc>('contact_requests');
    const { id, ...rest } = request;
    await collection.insertOne({ _id: id, ...rest });
    return request;
  }

  const current = await listContactRequests(500);
  writeText(requestsFile(), JSON.stringify([request, ...current].slice(0, 500), null, 2));
  return request;
}

export async function updateContactRequest(
  id: string,
  patch: Partial<Pick<ContactRequest, 'status' | 'notes'>>,
): Promise<ContactRequest | null> {
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safeId) return null;

  if (mongoUri()) {
    const collection = (await db()).collection<RequestDoc>('contact_requests');
    const current = await collection.findOne({ _id: safeId });
    if (!current) return null;
    const next = normalize({
      ...current,
      id: current._id,
      status: patch.status ?? current.status,
      notes: patch.notes ?? current.notes,
      updatedAt: new Date().toISOString(),
    });
    if (!next) return null;
    const { id: _ignored, ...rest } = next;
    await collection.updateOne({ _id: safeId }, { $set: rest });
    return next;
  }

  const current = await listContactRequests(500);
  const index = current.findIndex((item) => item.id === safeId);
  if (index < 0) return null;
  const next: ContactRequest = {
    ...current[index],
    status: patch.status ?? current[index].status,
    notes: patch.notes ?? current[index].notes,
    updatedAt: new Date().toISOString(),
  };
  const list = [...current];
  list[index] = next;
  writeText(requestsFile(), JSON.stringify(list, null, 2));
  return next;
}

export async function contactRequestStats() {
  const rows = await listContactRequests(500);
  const byStatus = {
    new: 0,
    reviewing: 0,
    done: 0,
    archived: 0,
  };
  for (const row of rows) byStatus[row.status] += 1;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const last7Days = rows.filter((row) => Date.parse(row.createdAt) >= weekAgo).length;
  return {
    total: rows.length,
    byStatus,
    last7Days,
    latest: rows.slice(0, 5),
  };
}
