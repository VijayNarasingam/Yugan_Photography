import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, '..');

export const PORT = Number(process.env.PORT || 3000);
export const HOST = process.env.HOST || '127.0.0.1';
export const IS_PROD = process.env.NODE_ENV === 'production';
export const SITE_URL = (process.env.SITE_URL || `http://localhost:${PORT}`).replace(/\/$/, '');

export const DATA_DIR = path.join(ROOT, 'data');
export const PUBLIC_DIR = path.join(ROOT, 'public');
export const UPLOAD_DIR = path.join(PUBLIC_DIR, 'uploads');
export const MEDIA_DIR = path.join(PUBLIC_DIR, 'images', 'media');
export const OG_CACHE_DIR = path.join(DATA_DIR, 'og-cache');
export const VIEWS_DIR = path.join(ROOT, 'views');

export const SESSION_COOKIE = 'ak_session';
export const CSRF_COOKIE = 'ak_csrf';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const MAX_UPLOAD_BYTES = 30 * 1024 * 1024;
export const MAX_UPLOAD_FILES = 20;
export const APP_VERSION = '1.0.0';

export const ALLOWED_IMAGE_FORMATS = new Set(['jpeg', 'png', 'webp', 'avif']);
export const RATIOS = {
  natural: null,
  '1/1': '1 / 1',
  '4/5': '4 / 5',
  '5/4': '5 / 4',
  '3/2': '3 / 2',
  '2/3': '2 / 3',
  '16/9': '16 / 9',
  '9/16': '9 / 16',
};
