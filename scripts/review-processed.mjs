import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const map = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'media.seed.json'), 'utf8'));
const seen = new Set();
const items = [];
for (const [key, media] of Object.entries(map)) {
  if (seen.has(media.id)) continue;
  seen.add(media.id);
  const variant = media.variants.find((v) => v.w === 960) || media.variants[media.variants.length - 1];
  items.push({ key, file: path.join(ROOT, 'public', variant.url), ...media });
}

const cols = 5;
const cellW = 340;
const cellH = 300;
const labelH = 26;
const rows = Math.ceil(items.length / cols);
const composites = [];
for (let i = 0; i < items.length; i++) {
  const item = items[i];
  const x = (i % cols) * cellW;
  const y = Math.floor(i / cols) * (cellH + labelH);
  const img = await sharp(item.file)
    .resize(cellW - 12, cellH - 12, { fit: 'contain', background: '#e7e2d9' })
    .toBuffer();
  composites.push({ input: img, left: x + 6, top: y + 6 });
  const svg = `<svg width="${cellW}" height="${labelH}"><text x="8" y="18" font-family="Arial" font-size="13" fill="#1a1a1a">${item.key} · ${item.width}×${item.height}</text></svg>`;
  composites.push({ input: Buffer.from(svg), left: x, top: y + cellH });
}

const out = path.join(process.env.TEMP || '.', 'ak-processed.jpg');
await sharp({
  create: {
    width: cols * cellW,
    height: rows * (cellH + labelH),
    channels: 3,
    background: '#f2efe9',
  },
})
  .composite(composites)
  .jpeg({ quality: 84 })
  .toFile(out);
console.log(out);
