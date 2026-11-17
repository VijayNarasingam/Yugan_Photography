import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = path.join(ROOT, 'source-images');
const MEDIA_DIR = path.join(ROOT, 'public', 'images', 'media');
const DATA_DIR = path.join(ROOT, 'data');
const PUBLIC_DIR = path.join(ROOT, 'public');
const PRESET_WIDTHS = [320, 480, 960, 1600, 2400];

// key -> { source file, grade, alt }
const IMAGES = [
  { key: 'hero-mandap', file: 'hero-mandap.jpg', grade: 'warm', alt: 'A bride and groom under a flower mandap at an Indian wedding ceremony.' },
  { key: 'portrait-ajit', file: 'photographer-01.jpg', grade: 'neutral', alt: 'Portrait of the photographer Ajit Kumar holding a camera outdoors.' },
  { key: 'contact-image', file: 'photographer-02.jpg', grade: 'neutral', alt: 'Photographer with camera, ready to capture a celebration.' },
  { key: 'ceremony-01', file: 'ceremony-01.jpg', grade: 'warm', alt: 'Bride and groom seated during the wedding ceremony with a sacred fire.' },
  { key: 'ritual-hands', file: 'ritual-hands.jpg', grade: 'warm', alt: 'Close-up of wedding ritual hands and offerings during the ceremony.' },
  { key: 'bride-veil', file: 'bride-veil.jpg', grade: 'warm', alt: 'Bride portrait with traditional jewellery and a red veil.' },
  { key: 'reception-01', file: 'reception-01.jpg', grade: 'warm', alt: 'Bride and groom on stage at the wedding reception.' },
  { key: 'dance-01', file: 'dance-01.jpg', grade: 'warm', alt: 'Couple dancing at the wedding reception celebration.' },
  { key: 'detail-bouquet', file: 'detail-bouquet.jpg', grade: 'neutral', alt: 'Wedding rings resting beside a bridal bouquet of white roses.' },
  { key: 'bride-portrait', file: 'bride-portrait.jpg', grade: 'warm', alt: 'Bride in a red lehenga and heavy jewellery, eyes closed in a tender moment.' },
  { key: 'groom-01', file: 'groom-01.jpg', grade: 'warm', alt: 'Groom in a cream sherwani and red turban standing outdoors.' },
  { key: 'groom-02', file: 'groom-02.jpg', grade: 'warm', alt: 'Groom portrait in traditional wedding attire with a red turban.' },
  { key: 'couple-01', file: 'couple-01.jpg', grade: 'warm', alt: 'Bride and groom embracing at night with warm bokeh lights behind them.' },
  { key: 'sangeet-01', file: 'sangeet-01.jpg', grade: 'warm', alt: 'Bride and groom dancing at the sangeet ceremony with family.' },
  { key: 'sangeet-a', file: 'sangeet-a.jpg', grade: 'warm', alt: 'Bride dancing during the sangeet ceremony in a yellow outfit.' },
  { key: 'couple-veil', file: 'couple-veil.jpg', grade: 'warm', alt: 'Bride and groom close together under a golden veil at night.' },
  { key: 'couple-bokeh', file: 'couple-bokeh.jpg', grade: 'warm', alt: 'Bride and groom posing with glowing bokeh lights in the background.' },
  { key: 'rings-01', file: 'rings-01.jpg', grade: 'warm', alt: 'Wedding rings on a white surface beside a floral bouquet.' },
  { key: 'groom-bw', file: 'groom-bw.jpg', grade: 'mono', alt: 'Black-and-white portrait of the groom in traditional wedding attire.' },
  { key: 'bride-sindoor', file: 'bride-sindoor.jpg', grade: 'warm', alt: 'Bride with sindoor and red bridal jewellery during the ceremony.' },
];

function applyGrade(pipeline, grade) {
  if (grade === 'warm') {
    return pipeline
      .modulate({ saturation: 0.92, brightness: 1.01 })
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

async function processImage(image) {
  const sourceFile = path.join(SOURCE_DIR, 'wedding-full', image.file);
  let buf;
  try {
    buf = await fs.readFile(sourceFile);
  } catch (err) {
    // try wedding-extra
    const extraFile = path.join(SOURCE_DIR, 'wedding-extra', image.file);
    buf = await fs.readFile(extraFile);
  }

  const id = `m_${image.key.replace(/-/g, '_')}`;
  const dir = path.join(MEDIA_DIR, id);
  await fs.mkdir(dir, { recursive: true });

  const master = await applyGrade(sharp(buf, { failOn: 'error' }).rotate(), image.grade)
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
    credit: { provider: 'Pexels', photoId: image.key, url: `https://pexels.com/photo/${image.key}` },
    createdAt: new Date().toISOString(),
    grade: image.grade,
  };

  console.log(`  ${image.key.padEnd(16)} ${width}x${height}  ${variants.length} variants`);
  return record;
}

await fs.mkdir(SOURCE_DIR, { recursive: true });
await fs.mkdir(MEDIA_DIR, { recursive: true });
await fs.mkdir(DATA_DIR, { recursive: true });

const records = {};
for (const image of IMAGES) {
  try {
    records[image.key] = await processImage(image);
  } catch (err) {
    console.error(`  FAILED ${image.key}: ${err.message}`);
  }
}

const mediaMap = {};
for (const [key, record] of Object.entries(records)) {
  mediaMap[key] = record;
}
await fs.writeFile(path.join(DATA_DIR, 'media.seed.json'), `${JSON.stringify(mediaMap, null, 2)}\n`, 'utf8');

// Default OG image from hero
if (records['hero-mandap']) {
  const heroDir = path.join(MEDIA_DIR, records['hero-mandap'].id);
  const largest = records['hero-mandap'].variants[records['hero-mandap'].variants.length - 1];
  await sharp(path.join(heroDir, path.basename(largest.url)))
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82 })
    .toFile(path.join(PUBLIC_DIR, 'images', 'og-default.jpg'));
}

console.log(`\nWrote ${Object.keys(mediaMap).length} media records to data/media.seed.json`);
console.log('Done. Start the site with `npm start`.');
