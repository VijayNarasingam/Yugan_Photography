import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import multer from 'multer';
import sharp from 'sharp';
import {
  ALLOWED_IMAGE_FORMATS,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_FILES,
  PUBLIC_DIR,
  UPLOAD_DIR,
} from './config.js';
import { humanizeFilename } from './util.js';

const storage = multer.memoryStorage();

export const photoUpload = multer({
  storage,
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: MAX_UPLOAD_FILES,
    fields: 40,
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      const error = new Error(`“${file.originalname}” is not an image file. Use a JPEG, PNG, WebP, or AVIF.`);
      error.status = 400;
      return cb(error);
    }
    return cb(null, true);
  },
});

const PRESET_WIDTHS = [320, 480, 960, 1600, 2400];

function variantUrls(media) {
  return (media.variants || []).map((v) => v.url).filter(Boolean);
}

export async function processImageBuffer(buffer, originalName = 'photograph') {
  let meta;
  try {
    meta = await sharp(buffer, { limitInputPixels: 90_000_000, failOn: 'error' }).metadata();
  } catch {
    throw new Error('That file could not be read as an image. Try a JPEG, PNG, WebP, or AVIF.');
  }

  if (!ALLOWED_IMAGE_FORMATS.has(meta.format)) {
    throw new Error('Use a JPEG, PNG, WebP, or AVIF file. HEIC and SVG are not supported.');
  }
  if (!meta.width || !meta.height) {
    throw new Error('The image dimensions could not be read.');
  }

  let width = meta.width;
  let height = meta.height;
  if ([5, 6, 7, 8].includes(meta.orientation)) {
    [width, height] = [height, width];
  }

  const id = `m_${crypto.randomBytes(8).toString('hex')}`;
  const dir = path.join(UPLOAD_DIR, id);
  await fs.mkdir(dir, { recursive: true });

  const maxWidth = Math.min(width, 2400);
  const widths = [...new Set([...PRESET_WIDTHS.filter((w) => w < maxWidth), maxWidth])]
    .filter((w) => w > 0)
    .sort((a, b) => a - b);

  const variants = [];
  try {
    for (const w of widths) {
      const file = path.join(dir, `${w}.webp`);
      const info = await sharp(buffer, { limitInputPixels: 90_000_000, failOn: 'error' })
        .rotate()
        .resize({ width: w, withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: 84, effort: 4, smartSubsample: true })
        .toFile(file);
      variants.push({
        w: info.width,
        h: info.height,
        url: `/uploads/${id}/${w}.webp`,
      });
    }
  } catch (err) {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
    throw new Error(`Image processing failed: ${err.message}`);
  }

  const filename = path.basename(String(originalName || 'photograph')).slice(0, 180);
  const createdAt = new Date().toISOString();
  return {
    id,
    filename,
    alt: humanizeFilename(filename),
    width,
    height,
    variants,
    thumb: variants[0]?.url || '',
    source: 'upload',
    createdAt,
  };
}

export async function processUploads(files = []) {
  const media = [];
  const errors = [];
  for (const file of files) {
    try {
      const item = await processImageBuffer(file.buffer, file.originalname);
      media.push(item);
    } catch (err) {
      errors.push({ filename: file.originalname, error: err.message });
    }
  }
  return { media, errors };
}

export async function deleteMediaFiles(media) {
  const urls = variantUrls(media);
  if (!urls.length) return;
  const first = path.resolve(PUBLIC_DIR, urls[0].replace(/^\//, ''));
  if (!first.startsWith(PUBLIC_DIR)) throw new Error('Refusing to delete a file outside the public folder.');
  const dir = path.dirname(first);
  if (!dir.startsWith(path.join(PUBLIC_DIR, 'uploads')) && !dir.startsWith(path.join(PUBLIC_DIR, 'images', 'media'))) {
    throw new Error('Refusing to delete an unexpected media path.');
  }
  await fs.rm(dir, { recursive: true, force: true });
}
