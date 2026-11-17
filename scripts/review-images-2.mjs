import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const outDir = path.join(process.env.TEMP || '.', 'ak-review-2');
await fs.mkdir(outDir, { recursive: true });

const candidates = [
  ['p-01', '1502823403499-6ccfcf4fb453'],
  ['p-02', '1521119989659-a83eee488004'],
  ['p-03', '1531123897727-8f129e1688ce'],
  ['p-04', '1512310604669-443f26c35f52'],
  ['p-05', '1516726817505-f5ed825624d8'],
  ['p-06', '1524250502761-1ac6f2e30d43'],
  ['p-07', '1492562080023-ab3db95bfbce'],
  ['p-08', '1487412720507-e7ab37603c6f'],
  ['p-09', '1529626455594-4ff0802cfb7e'],
  ['p-10', '1531746020798-e6953c6e8e04'],
  ['p-11', '1502378735452-bc7d86632805'],
  ['p-12', '1515886657613-9f3515b0c78f'],
  ['p-13', '1529139574466-a303027c1d8b'],
  ['p-14', '1539109136881-3be0616acf4b'],
  ['p-15', '1506863530036-1efeddceb993'],
  ['p-16', '1542206395-9feb3edaa68d'],
  ['p-17', '1504257432389-52343af06ae3'],
  ['p-18', '1522075469751-3a6694fb2f61'],
  ['p-19', '1507003211169-0a1dd7228f2d'],
  ['p-20', '1527980965255-d3b416303d12'],
  ['p-21', '1547425260-76bcadfb4f2c'],
  ['p-22', '1544723795-3fb6469f5b39'],
  ['p-23', '1535713875002-d1d0cf377fde'],
  ['c-01', '1505118380757-91f5f5632de0'],
  ['c-02', '1471922694854-ff1b63b20054'],
  ['c-03', '1468413253725-0d5181091126'],
  ['c-04', '1515238152791-8216bfdf89a7'],
  ['c-05', '1498623116890-37e912163d5d'],
  ['c-06', '1502082553048-f009c37129b9'],
  ['c-07', '1447752875215-b2761acb3c5d'],
  ['c-08', '1501854140801-50d01698950b'],
  ['c-09', '1518173946687-a4c8892bbd9f'],
  ['c-10', '1486870591958-9b9d0d1dda99'],
  ['c-11', '1464822759023-fed622ff2c3b'],
  ['c-12', '1454496522488-7a8e488e8606'],
  ['c-13', '1483347756197-71ef80e95f73'],
  ['c-14', '1470252649378-9c29740c9fa8'],
  ['c-15', '1497436072909-60f360e1d4b1'],
  ['c-16', '1464278533981-50106e6176b1'],
  ['c-17', '1433086966358-54859d0ed716'],
  ['c-18', '1476514525535-07fb3b4ae5f1'],
  ['c-19', '1508739773434-c26b3d09e071'],
  ['c-20', '1510414842594-a61c69b5ae57'],
  ['c-21', '1509233725247-49e657c54213'],
  ['c-22', '1473116763249-2faaef81ccda'],
  ['a-01', '1600607688969-a5bfcd646154'],
  ['a-02', '1600607688960-e095ff83135c'],
  ['a-03', '1600566752355-35792bedcfea'],
  ['a-04', '1600585154526-990dced4db0d'],
  ['a-05', '1600607687644-c7171b42498b'],
  ['a-06', '1600607688066-890987f18a86'],
  ['a-07', '1600210491369-e753d80a41f3'],
  ['a-08', '1600121848594-d8644e57abab'],
  ['a-09', '1600566753051-f0b89df2dd90'],
  ['a-10', '1512917774080-9991f1c4c750'],
  ['a-11', '1564013799919-ab600027ffc6'],
  ['a-12', '1600047509807-ba8f99d2cdde'],
  ['a-13', '1518780664697-55e3ad937233'],
  ['a-14', '1523217582562-09d0def993a6'],
  ['a-15', '1449844908441-8829872d2607'],
  ['a-16', '1615529182904-14819c35db37'],
  ['a-17', '1618221195710-dd6b41faaea6'],
  ['a-18', '1615874959474-d609969a20ed'],
  ['a-19', '1616594039964-ae9021a400a0'],
  ['a-20', '1617806118233-18e1de247200'],
  ['a-21', '1616137466211-f939a420be84'],
  ['a-22', '1616046229478-9901c5536a45'],
  ['a-23', '1600210492493-0946911123ea'],
  ['s-01', '1610701596007-11502861dcfa'],
  ['s-02', '1565193298357-c5a79412c2a8'],
  ['s-03', '1516981879613-9f5da904015f'],
  ['s-04', '1612196808214-b7e239e5f6c3'],
  ['s-05', '1590736969955-71cc94901144'],
];

async function download(label, id) {
  const url = `https://images.unsplash.com/photo-${id}?w=560&q=70&fm=jpg&fit=max`;
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
for (let i = 0; i < candidates.length; i += 10) {
  const batch = candidates.slice(i, i + 10);
  results.push(...(await Promise.all(batch.map(([label, id]) => download(label, id)))));
}

const ok = results.filter((r) => r.ok);
const failed = results.filter((r) => !r.ok);
console.log(`Downloaded ${ok.length}/${results.length}`);
if (failed.length) console.log('Failed:', failed.map((f) => `${f.label} (${f.error})`).join(', '));

const cols = 5;
const cellW = 300;
const cellH = 250;
const labelH = 24;
const perSheet = 35;

for (let sheetIndex = 0; sheetIndex < Math.ceil(ok.length / perSheet); sheetIndex++) {
  const items = ok.slice(sheetIndex * perSheet, (sheetIndex + 1) * perSheet);
  const rows = Math.ceil(items.length / cols);
  const composites = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const x = (i % cols) * cellW;
    const y = Math.floor(i / cols) * (cellH + labelH);
    const img = await sharp(item.file)
      .resize(cellW - 12, cellH - 12, { fit: 'cover' })
      .toBuffer();
    composites.push({ input: img, left: x + 6, top: y + 6 });
    const svg = `<svg width="${cellW}" height="${labelH}"><text x="8" y="17" font-family="Arial" font-size="13" fill="#1a1a1a">${item.label} · ${item.width}×${item.height}</text></svg>`;
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
    .jpeg({ quality: 82 })
    .toFile(path.join(outDir, `sheet-${sheetIndex + 1}.jpg`));
  console.log('Sheet:', path.join(outDir, `sheet-${sheetIndex + 1}.jpg`));
}
