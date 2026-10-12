// Packs downloaded open-source art into the app's library files.
//
//   node tools/pack-art.cjs <source folder>
//
// The source folder holds the downloads described in HANDOFF.md ("Library sources"):
//   tabler-nodes-outline.json, tabler-icons.json, tabler-LICENSE   (@tabler/icons on npm, MIT)
//   fluent-meta/*.json, fluent-svg/*.svg, fluent-tones/*.svg, fluent-LICENSE   (microsoft/fluentui-emoji, MIT)
//   doodles/*.svg                                                   (Open Doodles, CC0)
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

// Illustrations: an index of [file, name, group, search words, has skin tones] over these sets:
//   fluent/<name>.svg (and <name>--<tone>.svg for people in five more skin tones), Fluent Emoji Flat, MIT;
//   doodles/<name>.svg, Open Doodles by Pablo Stanley, CC0;
//   backdrops/<name>.svg, this project's own set pieces from artwork/backdrops (drawn by tools/draw-backdrops.cjs).
{
  const base = path.join(out, 'illustrations'), dir = path.join(base, 'fluent'), doodles = path.join(base, 'doodles');
  fs.mkdirSync(dir, { recursive: true }); fs.mkdirSync(doodles, { recursive: true });
  const groupOrder = ['Backdrops', 'Sketch people', 'People & Body', 'Smileys & Emotion', 'Animals & Nature', 'Food & Drink', 'Travel & Places', 'Activities', 'Objects', 'Symbols', 'Flags'];
  const tones = ['light', 'medium-light', 'medium', 'medium-dark', 'dark'], clean = svg => round(svg, 2).replace(/<!--[\s\S]*?-->|<title>[\s\S]*?<\/title>|<desc>[\s\S]*?<\/desc>/g, '').replace(/>\s+</g, '><').trim();
  const index = [];
  for (const file of fs.readdirSync(path.join(src, 'fluent-meta'))) {
    const meta = JSON.parse(fs.readFileSync(path.join(src, 'fluent-meta', file), 'utf8'));
    const slug = String(meta.cldr).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const svgFile = path.join(src, 'fluent-svg', slug + '.svg');
    if (!fs.existsSync(svgFile)) continue;
    fs.writeFileSync(path.join(dir, slug + '.svg'), clean(fs.readFileSync(svgFile, 'utf8')));
    const toned = tones.every(t => fs.existsSync(path.join(src, 'fluent-tones', `${slug}--${t}.svg`)));
    if (toned) for (const t of tones) fs.writeFileSync(path.join(dir, `${slug}--${t}.svg`), clean(fs.readFileSync(path.join(src, 'fluent-tones', `${slug}--${t}.svg`), 'utf8')));
    const name = meta.cldr.charAt(0).toUpperCase() + meta.cldr.slice(1);
    const words = [...new Set((meta.keywords || []).map(k => String(k).toLowerCase()))].filter(k => k !== meta.cldr.toLowerCase()).slice(0, 8).join(' ');
    index.push([`fluent/${slug}.svg`, name, meta.group, words, toned ? 1 : 0]);
  }
  for (const file of fs.readdirSync(path.join(src, 'doodles'))) {
    fs.writeFileSync(path.join(doodles, file), clean(fs.readFileSync(path.join(src, 'doodles', file), 'utf8')).replace(/^<\?xml[^>]*>/, ''));
    const name = file.replace(/\.svg$/, '').replace(/-/g, ' ').replace(/^./, c => c.toUpperCase());
    index.push([`doodles/${file}`, name, 'Sketch people', 'person character doodle sketch', 0]);
  }
  const backdrops = path.join(base, 'backdrops'), drawn = path.join(__dirname, '..', 'artwork', 'backdrops');
  fs.mkdirSync(backdrops, { recursive: true });
  for (const [file, name, words] of JSON.parse(fs.readFileSync(path.join(drawn, 'backdrops.json'), 'utf8'))) {
    fs.copyFileSync(path.join(drawn, file), path.join(backdrops, file));
    index.push([`backdrops/${file}`, name, 'Backdrops', `backdrop background scene set ${words}`, 0]);
  }
  index.sort((a, b) => groupOrder.indexOf(a[2]) - groupOrder.indexOf(b[2]) || a[1].localeCompare(b[1]));
  fs.writeFileSync(path.join(base, 'index.json'), JSON.stringify({ sources: ['microsoft/fluentui-emoji (Flat, MIT)', 'Open Doodles by Pablo Stanley (CC0)'], tones, groups: groupOrder.filter(g => index.some(i => i[2] === g)), items: index }));
  fs.copyFileSync(path.join(src, 'fluent-LICENSE'), path.join(dir, 'LICENSE'));
  fs.writeFileSync(path.join(doodles, 'LICENSE'), 'Open Doodles by Pablo Stanley (https://www.opendoodles.com/)\nCC0 1.0 Universal Public Domain Dedication: https://creativecommons.org/publicdomain/zero/1.0/\nFree for commercial and personal use; no credit needed.\n');
  console.log(`illustrations: ${index.length} (${index.filter(i => i[4]).length} with skin tones)`);
}
