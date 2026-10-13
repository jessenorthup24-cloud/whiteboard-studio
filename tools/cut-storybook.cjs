// Cuts the storybook illustration sheets (artwork/storybook/*.webp, made with the prompts in
// artwork/storybook-prompts.md) into separate transparent drawings for the library.
//
//   npm install --no-save sharp@0.33.5 && node tools/cut-storybook.cjs
//
// Each sheet is a 4 x 3 grid on a transparent background. Each drawing belongs to the grid cell its centre falls in, so
// drawings that reach a little past their cell stay whole and nothing from a neighbour is copied in. The drawings go to dist/assets/illustrations/storybook/ and replace their
// entries in the library index (illustrations/index.json); tools/pack-art.cjs includes them too.
const fs = require('fs'), path = require('path'), sharp = require('sharp');
const root = path.join(__dirname, '..'), src = path.join(root, 'artwork', 'storybook'), out = path.join(root, 'dist', 'assets', 'illustrations', 'storybook');
const ALPHA = 12, CORE = 240, MIN_CORE = 1500, PAD = 10, MAX_SIDE = 640;

const sheets = JSON.parse(fs.readFileSync(path.join(src, 'storybook.json'), 'utf8'));
const slug = s => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

(async () => {
  fs.mkdirSync(out, { recursive: true });
  for (const f of fs.readdirSync(out)) fs.unlinkSync(path.join(out, f));
  const entries = [];
  for (const sheet of sheets) {
    const { data, info } = await sharp(path.join(src, sheet.file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const W = info.width, H = info.height, N = W * H, cols = sheet.cols || 4, rows = sheet.rows || 3;
    // Neighbouring drawings can touch through faint edge or glow pixels, so cells are decided by each drawing's solid
    // core (nearly opaque pieces of a fair size, owned by the cell their centre falls in). The faint pixels then go to the
    // nearest core they connect to, which splits any bridge between two drawings where they meet. Pieces that connect
    // to no core (sparkles, crumbs) go to the cell their centre falls in.
    const owner = new Int16Array(N).fill(-1), queue = new Int32Array(N), seen = new Uint8Array(N);
    const blobs = (test, visit) => { for (let s = 0; s < N; s++) { if (seen[s] || !test(s)) continue; let head = 0, tail = 0; queue[tail++] = s; seen[s] = 1; let n = 0, sx = 0, sy = 0;
      while (head < tail) { const i = queue[head++], x = i % W, y = (i / W) | 0; n++; sx += x; sy += y;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; if (!seen[j] && test(j)) { seen[j] = 1; queue[tail++] = j; } } }
      visit(queue.subarray(0, tail), n, sx / n, sy / n); } };
    const cellAt = (cx, cy) => Math.min(rows - 1, Math.floor(cy / (H / rows))) * cols + Math.min(cols - 1, Math.floor(cx / (W / cols)));
    const seeds = []; let pieces = 0;
    blobs(i => data[i * 4 + 3] >= CORE, (px, n, cx, cy) => { if (n < MIN_CORE) return; const cell = cellAt(cx, cy); for (const i of px) { owner[i] = cell; seeds.push(i); } });
    // Grow every core outward through the remaining artwork at the same pace.
    let head = 0; const grow = Int32Array.from(seeds), grown = new Int32Array(N); grown.set(grow); let tail = grow.length;
    while (head < tail) { const i = grown[head++], x = i % W, y = (i / W) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; if (owner[j] < 0 && data[j * 4 + 3] >= ALPHA) { owner[j] = owner[i]; grown[tail++] = j; } } }
    seen.fill(0);
    blobs(i => owner[i] < 0 && data[i * 4 + 3] >= ALPHA, (px, n, cx, cy) => { const cell = cellAt(cx, cy); for (const i of px) owner[i] = cell; });
    seen.fill(0);
    blobs(i => data[i * 4 + 3] >= ALPHA, () => pieces++);
    for (let c = 0; c < sheet.items.length; c++) {
      const [name, words = ''] = [].concat(sheet.items[c]);
      let bx0 = W, by0 = H, bx1 = -1, by1 = -1;
      for (let i = 0; i < N; i++) if (owner[i] === c) { const x = i % W, y = (i / W) | 0; if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y; }
      if (bx1 < 0) { console.warn(`  ${sheet.file}: nothing in cell ${c + 1} (${name})`); continue; }
      const x0 = Math.max(0, bx0 - PAD), y0 = Math.max(0, by0 - PAD), x1 = Math.min(W - 1, bx1 + PAD), y1 = Math.min(H - 1, by1 + PAD), w = x1 - x0 + 1, h = y1 - y0 + 1, px = Buffer.alloc(w * h * 4);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = (y0 + y) * W + x0 + x; if (owner[i] !== c) continue;
        data.copy(px, (y * w + x) * 4, i * 4, i * 4 + 4);
      }
      const file = `${slug(name)}.webp`, k = Math.min(1, MAX_SIDE / Math.max(w, h));
      let img = sharp(px, { raw: { width: w, height: h, channels: 4 } });
      if (k < 1) img = img.resize(Math.round(w * k), Math.round(h * k));
      await img.webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(path.join(out, file));
      entries.push([`storybook/${file}`, name, sheet.group, `${sheet.words} ${words}`.trim(), 0]);
    }
    console.log(`${sheet.file}: ${sheet.items.length} drawings from ${pieces} pieces`);
  }
  const indexFile = path.join(root, 'dist', 'assets', 'illustrations', 'index.json'), index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
  const groups = [...new Set(sheets.map(s => s.group))];
  index.items = index.items.filter(i => !i[0].startsWith('storybook/')).concat(entries);
  index.groups = ['Backdrops', ...groups, ...index.groups.filter(g => g !== 'Backdrops' && !groups.includes(g))].filter(g => index.items.some(i => i[2] === g));
  index.items.sort((a, b) => index.groups.indexOf(a[2]) - index.groups.indexOf(b[2]));
  fs.writeFileSync(indexFile, JSON.stringify(index));
  console.log(`${entries.length} storybook drawings; library has ${index.items.length} illustrations`);
})().catch(e => { console.error(e); process.exit(1); });
