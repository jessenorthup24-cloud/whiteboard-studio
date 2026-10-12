// Copies the Open Peeps character pieces into dist/vendor/open-peeps so the character builder works without a CDN.
//
//   node tools/fetch-open-peeps.cjs
//
// Source: @dicebear/open-peeps on npm. The artwork is Open Peeps by Pablo Stanley (CC0: no credit needed in videos);
// the small amount of code is MIT. Only the drawing parts are kept: the body template and the face, head, facial hair,
// mask and accessory pieces, with the one import from @dicebear/core replaced by a local XML-escape helper.
const fs = require('fs'), path = require('path');
const VERSION = '9.4.2', base = `https://cdn.jsdelivr.net/npm/@dicebear/open-peeps@${VERSION}/`;
const out = path.join(__dirname, '..', 'dist', 'vendor', 'open-peeps');
const files = ['LICENSE', 'lib/index.js', 'lib/schema.js', 'lib/components/index.js', 'lib/components/head.js', 'lib/components/face.js', 'lib/components/facialHair.js', 'lib/components/mask.js', 'lib/components/accessories.js', 'lib/utils/getComponents.js', 'lib/utils/pickComponent.js', 'lib/utils/getColors.js', 'lib/utils/convertColor.js'];
(async () => {
  for (const file of files) {
    const response = await fetch(base + file);
    if (!response.ok) throw new Error(`${file}: ${response.status}`);
    let text = await response.text();
    const up = file.replace(/^lib\//, '').split('/').length - 1;
    text = text.replace("import { escape } from '@dicebear/core';", `import { escape } from '${up ? '../'.repeat(up) : './'}escape.js';`);
    if (/@dicebear\/core/.test(text)) throw new Error(`${file} still imports @dicebear/core`);
    const target = path.join(out, file.replace(/^lib\//, ''));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, text);
  }
  fs.writeFileSync(path.join(out, 'escape.js'), "// Stands in for @dicebear/core's escape helper.\nexport const escape = { xml: value => String(value).replace(/[&<>\"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&apos;' })[c]) };\n");
  console.log(`Open Peeps ${VERSION}: ${files.length} files in ${path.relative(process.cwd(), out)}`);
})();
