import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = path.join(ROOT, 'source-images');
const MEDIA_DIR = path.join(ROOT, 'public', 'images', 'media');
const DATA_DIR = path.join(ROOT, 'data');
const PUBLIC_DIR = path.join(ROOT, 'public');
const FORCE = process.argv.includes('--force');

const IMAGES = [
  { key: 'hero-coast', id: '1518837695005-2083093ee35b', grade: 'warm', alt: 'A dark ocean swell rolling toward a pale horizon at dusk.' },
  { key: 'portrait-alina', id: '1524504388940-b1c1722653e1', grade: 'warm', alt: 'A portrait of the photographer in a dark top, turned toward soft window light.' },
  { key: 'contact-studio', id: '1516035069371-29a1b244cc32', grade: 'neutral', alt: 'A vintage film camera and lens resting on a dark surface.' },
  { key: 'casa-01', id: '1600210491369-e753d80a41f3', grade: 'warm', alt: 'A pale living room with framed black-and-white photographs and soft afternoon light.' },
  { key: 'casa-02', id: '1600566753051-f0b89df2dd90', grade: 'warm', alt: 'A bedroom with warm wood panelling and linen bedding beside a large window.' },
  { key: 'casa-03', id: '1615529182904-14819c35db37', grade: 'warm', alt: 'A warm living room with pendant lights, a linen sofa, and plants.' },
  { key: 'casa-04', id: '1600210492493-0946911123ea', grade: 'warm', alt: 'A mid-century living room with a wall of windows opening onto trees.' },
  { key: 'faces-01', id: '1542206395-9feb3edaa68d', grade: 'mono', alt: 'Black-and-white portrait of a woman with long dark hair, looking directly at the camera.' },
  { key: 'faces-02', id: '1506863530036-1efeddceb993', grade: 'mono', alt: 'Black-and-white portrait of a woman with short hair against a dark background.' },
  { key: 'faces-03', id: '1504257432389-52343af06ae3', grade: 'mono', alt: 'Black-and-white portrait of an older man with glasses and a beard.' },
  { key: 'faces-04', id: '1522075469751-3a6694fb2f61', grade: 'mono', alt: 'Black-and-white profile portrait of a man with curly hair and a beard.' },
  { key: 'salt-01', id: '1500375592092-40eb2168fd21', grade: 'cool', alt: 'A wave breaking over dark rocks under a pale sky.' },
  { key: 'salt-03', id: '1505765050516-f72dcac9c60e', grade: 'cool', alt: 'A mountain peak rising above a bank of cloud.' },
  { key: 'salt-04', id: '1476673160081-cf065607f449', grade: 'warm', alt: 'A wide beach at sunset with soft light on the water.' },
  { key: 'still-01', id: '1493106641515-6b5631de4bb9', grade: 'warm', alt: 'Hands shaping a clay vessel on a potter’s wheel.' },
  { key: 'still-02', id: '1610701596007-11502861dcfa', grade: 'warm', alt: 'Three pale ceramic vessels arranged on a warm surface.' },
  { key: 'still-03', id: '1565193566173-7a0ee3dbe261', grade: 'neutral', alt: 'Three white vases and a dried stem against a dark wall.' },
  { key: 'still-04', id: '1495474472287-4d71bcdd2085', grade: 'warm', alt: 'Two hands holding ceramic cups of coffee above a wooden table.' },
  { key: 'field-01', id: '1500534314209-a25ddb2bd429', grade: 'cool', alt: 'Layered mountain ridges fading into mist at dusk.' },
  { key: 'field-02', id: '1464278533981-50106e6176b1', grade: 'cool', alt: 'Mountains reflected in a still lake at dusk.' },
  { key: 'field-03', id: '1441974231531-c6227db76b6e', grade: 'warm', alt: 'A path through a tall forest of pine trees.' },
  { key: 'field-04', id: '1476514525535-07fb3b4ae5f1', grade: 'cool', alt: 'The bow of a wooden boat on a turquoise alpine lake.' },
];

const PRESET_WIDTHS = [320, 480, 960, 1600, 2400];

function applyGrade(pipeline, grade) {
  if (grade === 'warm') {
    return pipeline
      .modulate({ saturation: 0.9, brightness: 1.01 })
      .recomb([
        [1.025, 0.012, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.006, 0.968],
      ])
      .linear(1.02, 2);
  }
  if (grade === 'cool') {
    return pipeline
      .modulate({ saturation: 0.84, brightness: 0.99 })
      .recomb([
        [0.985, 0.008, 0.0],
        [0.0, 1.0, 0.008],
        [0.0, 0.012, 1.04],
      ])
      .linear(1.02, 1);
  }
  if (grade === 'mono') {
    return pipeline
      .grayscale()
      .modulate({ brightness: 1.01 })
      .linear(1.055, -3);
  }
  return pipeline.modulate({ saturation: 0.94, brightness: 1.005 });
}

async function download(url, retries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'AlinaKovaPortfolio/1.0 (image preparation)' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      lastError = err;
      if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
    }
  }
  throw new Error(`Download failed after ${retries} attempts: ${lastError?.message}`);
}

async function ensureSource(image) {
  const sourceFile = path.join(SOURCE_DIR, `${image.key}.jpg`);
  try {
    if (!FORCE) {
      const buf = await fs.readFile(sourceFile);
      if (buf.length > 10000) return { buffer: buf, downloaded: false };
    }
  } catch {}
  const url = `https://images.unsplash.com/photo-${image.id}?w=2400&q=90&fm=jpg&fit=max`;
  const buffer = await download(url);
  await fs.writeFile(sourceFile, buffer);
  return { buffer, downloaded: true };
}

async function processImage(image) {
  const { buffer, downloaded } = await ensureSource(image);
  const id = `m_${image.key.replace(/-/g, '_')}`;
  const dir = path.join(MEDIA_DIR, id);
  await fs.mkdir(dir, { recursive: true });

  const master = await applyGrade(sharp(buffer, { failOn: 'error' }).rotate(), image.grade)
    .toFormat('png')
    .toBuffer({ resolveWithObject: true });

  const width = master.info.width;
  const height = master.info.height;
  const maxWidth = Math.min(width, 2400);
  const widths = [...new Set([...PRESET_WIDTHS.filter((w) => w < maxWidth), maxWidth])]
    .filter((w) => w > 0)
    .sort((a, b) => a - b);

  const variants = [];
  for (const w of widths) {
    const file = path.join(dir, `${w}.webp`);
    const info = await sharp(master.data)
      .resize({ width: w, withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: 85, effort: 4, smartSubsample: true })
      .toFile(file);
    variants.push({ w: info.width, h: info.height, url: `/images/media/${id}/${w}.webp` });
  }

  const record = {
    id,
    filename: `${image.key}.jpg`,
    alt: image.alt,
    width,
    height,
    variants,
    thumb: variants[0]?.url || '',
    source: 'seed',
    credit: {
      provider: 'Unsplash',
      photoId: image.id,
      url: `https://unsplash.com/photos/${image.id}`,
    },
    createdAt: new Date().toISOString(),
  };

  console.log(`  ${image.key.padEnd(16)} ${width}×${height}  ${downloaded ? 'downloaded' : 'cached'}  ${variants.length} variants`);
  return record;
}

await fs.mkdir(SOURCE_DIR, { recursive: true });
await fs.mkdir(MEDIA_DIR, { recursive: true });
await fs.mkdir(DATA_DIR, { recursive: true });

const records = {};
const queue = [...IMAGES];
const workers = Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const image = queue.shift();
    if (!image) return;
    try {
      records[image.key] = await processImage(image);
    } catch (err) {
      console.error(`  FAILED ${image.key}: ${err.message}`);
      throw err;
    }
  }
});

console.log(`Preparing ${IMAGES.length} photographs…`);
await Promise.all(workers);

// salt-02 intentionally reuses the hero photograph.
if (records['hero-coast']) {
  records['salt-02'] = {
    ...records['hero-coast'],
    alt: 'A dark ocean swell rolling toward the shore.',
  };
}

// De-duplicate media records that share an id.
const mediaMap = {};
for (const [key, record] of Object.entries(records)) {
  mediaMap[key] = record;
}
await fs.writeFile(path.join(DATA_DIR, 'media.seed.json'), `${JSON.stringify(mediaMap, null, 2)}\n`, 'utf8');

// A default social-sharing image.
if (records['hero-coast']) {
  const heroDir = path.join(MEDIA_DIR, records['hero-coast'].id);
  const largest = records['hero-coast'].variants[records['hero-coast'].variants.length - 1];
  await sharp(path.join(heroDir, path.basename(largest.url)))
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82 })
    .toFile(path.join(PUBLIC_DIR, 'images', 'og-default.jpg'));
}

const credits = [
  '# Photography credits',
  '',
  'The sample photographs in this project are sourced from [Unsplash](https://unsplash.com) under the Unsplash License.',
  'They are placeholders for the portfolio and are intended to be replaced through the Admin → Media library.',
  '',
  ...IMAGES.map((image) => `- **${image.key}** — [Unsplash photo ${image.id}](https://unsplash.com/photos/${image.id})`),
  '',
];
await fs.writeFile(path.join(SOURCE_DIR, 'CREDITS.md'), credits.join('\n'), 'utf8');

console.log(`\nWrote ${Object.keys(mediaMap).length} media records to data/media.seed.json`);
console.log('Done. Start the site with `npm start`.');
