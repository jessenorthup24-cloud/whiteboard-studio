// Packs downloaded open-source art into the app's library files.
//
//   node tools/pack-art.cjs <source folder>
//
// The source folder holds the downloads described in HANDOFF.md ("Library sources"):
//   tabler-nodes-outline.json, tabler-icons.json, tabler-LICENSE   (@tabler/icons on npm, MIT)
//   fluent-meta/*.json, fluent-svg/*.svg, fluent-LICENSE           (microsoft/fluentui-emoji, MIT)
// Both sets are MIT licensed: videos made with them need no credit; the license files stay beside the art.
const fs = require('fs'), path = require('path');
const src = process.argv[2];
if (!src) { console.error('Usage: node tools/pack-art.cjs <source folder>'); process.exit(1); }
const out = path.join(__dirname, '..', 'dist', 'assets');
const round = (s, places) => s.replace(/-?\d*\.\d+/g, n => String(+(+n).toFixed(places)));

// Icons: every outline icon except brand logos, as [name, category index, search words, [path data...]].
{
  const nodes = JSON.parse(fs.readFileSync(path.join(src, 'tabler-nodes-outline.json'), 'utf8'));
  const meta = JSON.parse(fs.readFileSync(path.join(src, 'tabler-icons.json'), 'utf8'));
  const categories = [], icons = [];
  for (const [name, list] of Object.entries(nodes)) {
    const info = meta[name] || {}, category = info.category || 'Other';
    if (category === 'Brand' || name.startsWith('brand-')) continue;
    if (!categories.includes(category)) categories.push(category);
    const paths = list.filter(([tag, attrs]) => tag === 'path' && attrs.d && attrs.stroke !== 'none').map(([, attrs]) => round(attrs.d, 2));
    if (!paths.length) continue;
    const words = [...new Set((info.tags || []).map(String).map(t => t.toLowerCase()))].slice(0, 8).join(' ');
    icons.push([name, categories.indexOf(category), words, paths]);
  }
  icons.sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
  fs.mkdirSync(path.join(out, 'icons'), { recursive: true });
  fs.writeFileSync(path.join(out, 'icons', 'tabler-icons.json'), JSON.stringify({ source: '@tabler/icons', viewBox: [0, 0, 24, 24], categories, icons }));
  fs.copyFileSync(path.join(src, 'tabler-LICENSE'), path.join(out, 'icons', 'LICENSE'));
  console.log(`icons: ${icons.length} in ${categories.length} categories`);
}

// Illustrations: one small SVG per emoji plus an index of [file, name, group, search words].
{
  const dir = path.join(out, 'illustrations', 'fluent');
  fs.mkdirSync(dir, { recursive: true });
  const groupOrder = ['People & Body', 'Smileys & Emotion', 'Animals & Nature', 'Food & Drink', 'Travel & Places', 'Activities', 'Objects', 'Symbols', 'Flags'];
  const index = [];
  for (const file of fs.readdirSync(path.join(src, 'fluent-meta'))) {
    const meta = JSON.parse(fs.readFileSync(path.join(src, 'fluent-meta', file), 'utf8'));
    const slug = String(meta.cldr).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const svgFile = path.join(src, 'fluent-svg', slug + '.svg');
    if (!fs.existsSync(svgFile)) continue;
    const svg = round(fs.readFileSync(svgFile, 'utf8'), 2).replace(/>\s+</g, '><').trim();
    fs.writeFileSync(path.join(dir, slug + '.svg'), svg);
    const name = meta.cldr.charAt(0).toUpperCase() + meta.cldr.slice(1);
    const words = [...new Set((meta.keywords || []).map(k => String(k).toLowerCase()))].filter(k => k !== meta.cldr.toLowerCase()).slice(0, 8).join(' ');
    index.push([slug, name, meta.group, words]);
  }
  index.sort((a, b) => groupOrder.indexOf(a[2]) - groupOrder.indexOf(b[2]) || a[1].localeCompare(b[1]));
  fs.writeFileSync(path.join(out, 'illustrations', 'fluent-index.json'), JSON.stringify({ source: 'microsoft/fluentui-emoji (Flat)', groups: groupOrder.filter(g => index.some(i => i[2] === g)), items: index }));
  fs.copyFileSync(path.join(src, 'fluent-LICENSE'), path.join(dir, 'LICENSE'));
  console.log(`illustrations: ${index.length}`);
}
