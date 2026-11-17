import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const outDir = path.join(process.env.TEMP || '.', 'ak-review');
await fs.mkdir(outDir, { recursive: true });

const candidates = [
  ['coast-01', '1507525428034-b723cf961d3e'],
  ['coast-02', '1518837695005-2083093ee35b'],
  ['coast-03', '1500375592092-40eb2168fd21'],
  ['coast-04', '1476673160081-cf065607f449'],
  ['coast-05', '1501785888041-af3ef285b470'],
  ['coast-06', '1470071459604-3b5ec3a7fe05'],
  ['coast-07', '1441974231531-c6227db76b6e'],
  ['coast-08', '1493246507139-91e8fad9978e'],
  ['coast-09', '1519681393784-d120267933ba'],
  ['coast-10', '1469474968028-56623f02e42e'],
  ['coast-11', '1439066615861-d1af74d74000'],
  ['coast-12', '1500534314209-a25ddb2bd429'],
  ['coast-13', '1511497584788-876760111969'],
  ['coast-14', '1500534623283-312aade485b7'],
  ['coast-15', '1505765050516-f72dcac9c60e'],
  ['arch-01', '1487958449943-2429e8be8625'],
  ['arch-02', '1511818966892-d7d671e672a2'],
  ['arch-03', '1518005020951-eccb494ad742'],
  ['arch-04', '1449157291145-7efd050a4d0e'],
  ['arch-05', '1616486338812-3dadae4b4ace'],
  ['arch-06', '1600210492486-724fe5c67fb0'],
  ['arch-07', '1600607687939-ce8a6c25118c'],
  ['arch-08', '1600566753086-00f18fb6b3ea'],
  ['arch-09', '1600585154340-be6161a56a0c'],
  ['arch-10', '1600607687920-4e2a09cf159d'],
  ['port-01', '1494790108377-be9c29b29330'],
  ['port-02', '1534528741775-53994a69daeb'],
  ['port-03', '1524504388940-b1c1722653e1'],
  ['port-04', '1517841905240-472988babdf9'],
  ['port-05', '1506794778202-cad84cf45f1d'],
  ['port-06', '1500648767791-00dcc994a43e'],
  ['port-07', '1508214751196-bcfd4ca60f91'],
  ['port-08', '1488426862026-3ee34a7d66df'],
  ['port-09', '1544005313-94ddf0286df2'],
  ['port-10', '1552374196-c4e7ffc6e126'],
  ['craft-01', '1452860606245-08befc0ff44b'],
  ['craft-02', '1522202176988-66273c2fd55f'],
  ['craft-03', '1454165804606-c3d57bc86b40'],
  ['craft-04', '1516035069371-29a1b244cc32'],
  ['craft-05', '1495474472287-4d71bcdd2085'],
  ['craft-06', '1565193566173-7a0ee3dbe261'],
  ['craft-07', '1493106641515-6b5631de4bb9'],
  ['craft-08', '1519710164239-da123dc03ef4'],
  ['craft-09', '1503602642458-232111445657'],
  ['travel-01', '1523906834658-6e24ef2386f9'],
  ['travel-02', '1499856871958-5b9627545d1a'],
  ['travel-03', '1513635269975-59663e0ac1ad'],
  ['travel-04', '1502602898657-3e91760cbb34'],
];

async function download(label, id) {
  const url = `https://images.unsplash.com/photo-${id}?w=620&q=72&fm=jpg&fit=max`;
  const file = path.join(outDir, `${label}.jpg`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(file, buf);
    const meta = await sharp(buf).metadata();
    return { label, id, file, ok: true, width: meta.width, height: meta.height };
  } catch (err) {
    return { label, id, ok: false, error: err.message };
  }
}

const results = [];
for (let i = 0; i < candidates.length; i += 8) {
  const batch = candidates.slice(i, i + 8);
  results.push(...(await Promise.all(batch.map(([label, id]) => download(label, id)))));
}

const ok = results.filter((r) => r.ok);
const failed = results.filter((r) => !r.ok);
console.log(`Downloaded ${ok.length}/${results.length}`);
if (failed.length) console.log('Failed:', failed.map((f) => `${f.label} (${f.error})`).join(', '));

const cols = 4;
const cellW = 380;
const cellH = 300;
const labelH = 26;
const rows = Math.ceil(ok.length / cols);
const sheet = sharp({
  create: {
    width: cols * cellW,
    height: rows * (cellH + labelH),
    channels: 3,
    background: '#f2efe9',
  },
});

const composites = [];
for (let i = 0; i < ok.length; i++) {
  const item = ok[i];
  const x = (i % cols) * cellW;
  const y = Math.floor(i / cols) * (cellH + labelH);
  const img = await sharp(item.file)
    .resize(cellW - 16, cellH - 16, { fit: 'cover' })
    .toBuffer();
  composites.push({ input: img, left: x + 8, top: y + 8 });
  const svg = `<svg width="${cellW}" height="${labelH}"><text x="10" y="18" font-family="Arial" font-size="14" fill="#1a1a1a">${item.label} · ${item.width}×${item.height}</text></svg>`;
  composites.push({ input: Buffer.from(svg), left: x, top: y + cellH });
}

await sheet.composite(composites).jpeg({ quality: 80 }).toFile(path.join(outDir, 'contact-sheet.jpg'));
console.log('Sheet:', path.join(outDir, 'contact-sheet.jpg'));
