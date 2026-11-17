import fs from 'node:fs/promises';
import path from 'node:path';
import { DATA_DIR } from './config.js';
import { buildSeedContent } from './seed.js';

const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function readJson(file, fallback = null) {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

export async function writeJsonAtomic(file, data) {
  await ensureDataDir();
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  const json = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(tmp, json, 'utf8');
  await fs.rename(tmp, file);
}

async function backupCorrupt(file, err) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backup = `${file}.corrupt-${stamp}`;
  try {
    await fs.rename(file, backup);
    console.error(`[store] ${path.basename(file)} was unreadable (${err.message}). Backup saved to ${backup}.`);
  } catch (backupErr) {
    console.error('[store] Could not back up unreadable file:', backupErr.message);
  }
}

class JsonStore {
  constructor(file, seedFactory, { recover = true } = {}) {
    this.file = file;
    this.seedFactory = seedFactory;
    this.recover = recover;
    this.cache = null;
    this.queue = Promise.resolve();
  }

  async init() {
    await ensureDataDir();
    try {
      const data = await readJson(this.file, null);
      if (data) {
        this.cache = data;
        return;
      }
    } catch (err) {
      if (!this.recover) throw new Error(`Cannot read ${this.file}: ${err.message}`);
      await backupCorrupt(this.file, err);
    }

    this.cache = await this.seedFactory();
    await writeJsonAtomic(this.file, this.cache);
  }

  get() {
    if (!this.cache) throw new Error(`${path.basename(this.file)} has not been initialised`);
    return this.cache;
  }

  async update(mutator) {
    const run = this.queue.then(async () => {
      const draft = structuredClone(this.get());
      const result = await mutator(draft);
      draft.updatedAt = new Date().toISOString();
      await writeJsonAtomic(this.file, draft);
      this.cache = draft;
      return result;
    });
    this.queue = run.catch(() => {});
    return run;
  }

  async replace(next) {
    return this.update((draft) => {
      for (const key of Object.keys(draft)) delete draft[key];
      Object.assign(draft, structuredClone(next));
    });
  }
}

export const contentStore = new JsonStore(CONTENT_FILE, async () => buildSeedContent(), { recover: true });
export const inquiryStore = new JsonStore(
  INQUIRIES_FILE,
  async () => ({ version: 1, updatedAt: new Date().toISOString(), inquiries: [] }),
  { recover: true },
);

export async function initStores() {
  await contentStore.init();
  await inquiryStore.init();
}
