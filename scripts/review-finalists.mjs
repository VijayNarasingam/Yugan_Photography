import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const dirs = [
  path.join(process.env.TEMP || '.', 'ak-review'),
  path.join(process.env.TEMP || '.', 'ak-review-2'),
];
const picks = [
  'coast-02', 'coast-03', 'coast-04', 'coast-05', 'coast-12', 'coast-15',
  'arch-06', 'arch-07', 'arch-10', 'a-07', 'a-09', 'a-16', 'a-19', 'a-22', 'a-23',
  'port-03', 'port-05', 'port-09', 'p-03', 'p-15', 'p-16', 'p-17', 'p-18',
  'craft-04', 'craft-06', 'craft-07', 's-01', 'c-16', 'c-18',
];

const outDir = path.join(process.env.TEMP || '.', 'ak-finalists');
await fs.mkdir(outDir, { recursive: true });

const items = [];
for (const label of picks) {
  for (const dir of dirs) {
    const file = path.join(dir, `${label}.jpg`);
    try {
      await fs.access(file);
      const meta = await sharp(file).metadata();
      items.push({ label, file, width: meta.width, height: meta.height });
      break;
    } catch {}
  }
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
  const svg = `<svg width="${cellW}" height="${labelH}"><text x="8" y="18" font-family="Arial" font-size="14" fill="#1a1a1a">${item.label} · ${item.width}×${item.height}</text></svg>`;
  composites.push({ input: Buffer.from(svg), left: x, top: y + cellH });
}

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
  .toFile(path.join(outDir, 'finalists.jpg'));

console.log('Items:', items.length);
console.log('Sheet:', path.join(outDir, 'finalists.jpg'));
