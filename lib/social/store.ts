import { Binary, MongoClient, type Db } from 'mongodb';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { env, publicOrigin } from './env';
import type { ProjectDraft, SocialConfig, UploadedAsset } from './types';
import { emptySocialConfig, parseSocialConfig } from './types';

type MongoGlobal = typeof globalThis & { __spsMongo?: Promise<MongoClient> };

type SocialDoc = SocialConfig & { _id: string };
type UploadDoc = {
  _id: string;
  filename: string;
  contentType: string;
  size: number;
  data: Binary;
  createdAt: string;
};
type DraftDoc = Omit<ProjectDraft, 'id'> & { _id: string };

const SOCIAL_ID = 'current';

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

function socialFile() {
  return path.join(dataDir(), 'social.json');
}

function draftsFile() {
  return path.join(dataDir(), 'project-drafts.json');
}

function uploadsDir() {
  return path.join(process.cwd(), 'public', 'uploads');
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

export function storageMode(): 'mongodb' | 'file' {
  return mongoUri() ? 'mongodb' : 'file';
}

export async function readSocial(): Promise<SocialConfig> {
  if (mongoUri()) {
    const collection = (await db()).collection<SocialDoc>('social');
    const doc = await collection.findOne({ _id: SOCIAL_ID });
    if (!doc) return emptySocialConfig();
    const { _id: _ignored, ...rest } = doc;
    return parseSocialConfig(JSON.stringify(rest));
  }
  return parseSocialConfig(readText(socialFile()));
}

export async function writeSocial(config: SocialConfig): Promise<void> {
  if (mongoUri()) {
    const collection = (await db()).collection<SocialDoc>('social');
    await collection.updateOne({ _id: SOCIAL_ID }, { $set: config }, { upsert: true });
    return;
  }
  writeText(socialFile(), JSON.stringify(config, null, 2));
}

export async function saveUpload(input: {
  filename: string;
  contentType: string;
  buffer: Buffer;
}): Promise<UploadedAsset> {
  const id = randomUUID().replace(/-/g, '').slice(0, 24);
  const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) || 'image.jpg';
  const contentType = input.contentType || 'image/jpeg';
  const createdAt = new Date().toISOString();

  if (mongoUri()) {
    const collection = (await db()).collection<UploadDoc>('uploads');
    await collection.insertOne({
      _id: id,
      filename: safeName,
      contentType,
      size: input.buffer.length,
      data: new Binary(input.buffer),
      createdAt,
    });
    return {
      id,
      filename: safeName,
      contentType,
      size: input.buffer.length,
      createdAt,
      url: `${publicOrigin()}/api/uploads/${id}`,
    };
  }

  fs.mkdirSync(uploadsDir(), { recursive: true });
  const diskName = `${id}-${safeName}`;
  fs.writeFileSync(path.join(uploadsDir(), diskName), input.buffer);
  return {
    id,
    filename: diskName,
    contentType,
    size: input.buffer.length,
    createdAt,
    url: `${publicOrigin()}/uploads/${diskName}`,
  };
}

export async function getUploadBytes(id: string): Promise<{
  buffer: Buffer;
  contentType: string;
  filename: string;
} | null> {
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safeId) return null;

  if (mongoUri()) {
    const collection = (await db()).collection<UploadDoc>('uploads');
    const doc = await collection.findOne({ _id: safeId });
    if (!doc) return null;
    return {
      buffer: Buffer.from(doc.data.buffer),
      contentType: doc.contentType || 'application/octet-stream',
      filename: doc.filename || 'image',
    };
  }

  const dir = uploadsDir();
  if (!fs.existsSync(dir)) return null;
  const match = fs.readdirSync(dir).find((name) => name.startsWith(`${safeId}-`) || name === safeId);
  if (!match) return null;
  const buffer = fs.readFileSync(path.join(dir, match));
  const ext = path.extname(match).toLowerCase();
  const contentType =
    ext === '.png'
      ? 'image/png'
      : ext === '.webp'
        ? 'image/webp'
        : ext === '.gif'
          ? 'image/gif'
          : 'image/jpeg';
  return { buffer, contentType, filename: match };
}

export async function listDrafts(): Promise<ProjectDraft[]> {
  if (mongoUri()) {
    const collection = (await db()).collection<DraftDoc>('project_drafts');
    const rows = await collection.find({}).sort({ createdAt: -1 }).limit(40).toArray();
    return rows.map((row) => ({
      id: row._id,
      title: row.title || '',
      description: row.description || '',
      imageId: row.imageId || '',
      imageUrl: row.imageUrl || '',
      createdAt: row.createdAt || '',
      lastPostedAt: row.lastPostedAt || '',
      lastFacebookId: row.lastFacebookId || '',
      lastInstagramId: row.lastInstagramId || '',
    }));
  }

  try {
    const text = readText(draftsFile());
    if (!text) return [];
    const value = JSON.parse(text) as ProjectDraft[];
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export async function saveDraft(draft: ProjectDraft): Promise<void> {
  if (mongoUri()) {
    const collection = (await db()).collection<DraftDoc>('project_drafts');
    const { id, ...rest } = draft;
    await collection.updateOne({ _id: id }, { $set: rest }, { upsert: true });
    return;
  }
  const current = await listDrafts();
  const next = [draft, ...current.filter((item) => item.id !== draft.id)].slice(0, 40);
  writeText(draftsFile(), JSON.stringify(next, null, 2));
}

export async function updateDraft(id: string, patch: Partial<ProjectDraft>): Promise<ProjectDraft | null> {
  const drafts = await listDrafts();
  const current = drafts.find((item) => item.id === id);
  if (!current) return null;
  const next = { ...current, ...patch, id };
  await saveDraft(next);
  return next;
}
