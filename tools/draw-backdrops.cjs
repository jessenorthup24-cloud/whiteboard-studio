// Draws the whiteboard backdrops (set pieces) into artwork/backdrops/*.svg. They are original line art made for this
// project, built from the shared pieces below so they share one style: dark marker outlines and soft flat colors on a
// 1600 x 900 canvas, with open sky left transparent so the whiteboard shows through.
//
//   node tools/draw-backdrops.cjs && node tools/pack-art.cjs <sources>
const fs = require('fs'), path = require('path');
const out = path.join(__dirname, '..', 'artwork', 'backdrops');
const INK = '#1f2a36', SW = 5;
const C = { wall: '#f4ead8', wall2: '#e6eef2', floor: '#d9b48a', floor2: '#c99f73', wood: '#b9824f', wood2: '#9a6b43', grass: '#a8d58a', green: '#6fb35a', green2: '#4f9a4a', sky: '#d6ecf7', water: '#8ecae6', sand: '#f2d49b', red: '#e07a5f', blue: '#7aa7d9', yellow: '#f6d55c', gray: '#c9d1d6', gray2: '#9aa6ae', white: '#ffffff', board: '#3e6b5c', cream: '#fbf3e1', stone: '#e3cfa8', stone2: '#cdb084', purple: '#b39ddb', pink: '#f2a7a7', snow: '#f7fbff', night: '#ffffff' };
const s = (fill = 'none', w = SW) => `fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const rect = (x, y, w, h, fill = 'none', rx = 0, sw) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ${s(fill, sw)}/>`;
const circle = (cx, cy, r, fill = 'none', sw) => `<circle cx="${cx}" cy="${cy}" r="${r}" ${s(fill, sw)}/>`;
const ellipse = (cx, cy, rx, ry, fill = 'none') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${s(fill)}/>`;
const line = (x1, y1, x2, y2, sw) => `<path d="M${x1} ${y1}L${x2} ${y2}" ${s('none', sw)}/>`;
const shape = (d, fill = 'none', sw) => `<path d="${d}" ${s(fill, sw)}/>`;
const many = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');

// Pieces.
const sun = (x, y, r = 60) => circle(x, y, r, C.yellow) + many(10, i => { const a = i * Math.PI / 5; return line(x + Math.cos(a) * (r + 18), y + Math.sin(a) * (r + 18), x + Math.cos(a) * (r + 44), y + Math.sin(a) * (r + 44), 4); });
const cloud = (x, y, k = 1) => shape(`M${x} ${y}c${-40 * k} 0 ${-40 * k} ${-50 * k} 0 ${-50 * k}c${10 * k} ${-40 * k} ${70 * k} ${-40 * k} ${80 * k} 0c${30 * k} ${-20 * k} ${80 * k} 0 ${70 * k} ${30 * k}c${40 * k} 0 ${40 * k} ${20 * k} ${10 * k} ${20 * k}z`, C.white);
const tree = (x, base, k = 1) => rect(x - 16 * k, base - 120 * k, 32 * k, 120 * k, C.wood2) + shape(`M${x - 90 * k} ${base - 130 * k}c${-40 * k} ${-60 * k} ${10 * k} ${-130 * k} ${60 * k} ${-110 * k}c${10 * k} ${-70 * k} ${110 * k} ${-70 * k} ${120 * k} 0c${60 * k} ${-10 * k} ${80 * k} ${80 * k} ${30 * k} ${110 * k}c${10 * k} ${50 * k} ${-60 * k} ${60 * k} ${-80 * k} ${30 * k}c${-30 * k} ${30 * k} ${-110 * k} ${20 * k} ${-130 * k} ${-30 * k}z`, C.green);
const pine = (x, base, k = 1) => rect(x - 12 * k, base - 40 * k, 24 * k, 40 * k, C.wood2) + shape(`M${x} ${base - 260 * k}L${x + 70 * k} ${base - 150 * k}H${x + 40 * k}L${x + 95 * k} ${base - 40 * k}H${x - 95 * k}L${x - 40 * k} ${base - 150 * k}H${x - 70 * k}Z`, C.green2);
const bush = (x, base, k = 1) => shape(`M${x - 80 * k} ${base}c${-20 * k} ${-50 * k} ${30 * k} ${-80 * k} ${60 * k} ${-50 * k}c${20 * k} ${-40 * k} ${80 * k} ${-30 * k} ${80 * k} ${10 * k}c${40 * k} ${-10 * k} ${60 * k} ${30 * k} ${30 * k} ${40 * k}z`, C.green);
const windowPane = (x, y, w, h, opts = {}) => rect(x, y, w, h, C.sky) + line(x + w / 2, y, x + w / 2, y + h) + line(x, y + h / 2, x + w, y + h / 2) + rect(x - 14, y + h, w + 28, 18, C.white) +
  (opts.curtains ? shape(`M${x - 40} ${y - 20}H${x + w * .32}C${x + w * .2} ${y + h * .5} ${x + w * .3} ${y + h * .8} ${x + w * .12} ${y + h + 40}H${x - 40}Z`, C.red) + shape(`M${x + w + 40} ${y - 20}H${x + w * .68}C${x + w * .8} ${y + h * .5} ${x + w * .7} ${y + h * .8} ${x + w * .88} ${y + h + 40}H${x + w + 40}Z`, C.red) + line(x - 60, y - 20, x + w + 60, y - 20, 7) : '') +
  (opts.blinds ? many(Math.floor(h / 26), i => line(x + 6, y + 14 + i * 26, x + w - 6, y + 14 + i * 26, 3)) : '');
const plant = (x, base, k = 1) => shape(`M${x - 40 * k} ${base - 70 * k}H${x + 40 * k}L${x + 30 * k} ${base}H${x - 30 * k}Z`, C.red) + shape(`M${x} ${base - 70 * k}C${x - 10 * k} ${base - 150 * k} ${x - 80 * k} ${base - 170 * k} ${x - 90 * k} ${base - 130 * k}C${x - 60 * k} ${base - 120 * k} ${x - 30 * k} ${base - 100 * k} ${x} ${base - 70 * k}ZM${x} ${base - 70 * k}C${x + 10 * k} ${base - 160 * k} ${x + 70 * k} ${base - 190 * k} ${x + 90 * k} ${base - 150 * k}C${x + 60 * k} ${base - 130 * k} ${x + 30 * k} ${base - 100 * k} ${x} ${base - 70 * k}ZM${x} ${base - 70 * k}C${x - 10 * k} ${base - 200 * k} ${x + 20 * k} ${base - 230 * k} ${x + 10 * k} ${base - 240 * k}C${x - 20 * k} ${base - 200 * k} ${x - 20 * k} ${base - 120 * k} ${x} ${base - 70 * k}Z`, C.green);
const clock = (x, y, r = 46) => circle(x, y, r, C.white) + line(x, y, x, y - r * .65, 5) + line(x, y, x + r * .45, y + r * .15, 5) + circle(x, y, 4, INK, 2);
const frame = (x, y, w, h) => rect(x, y, w, h, C.cream) + shape(`M${x + 14} ${y + h - 14}L${x + w * .4} ${y + h * .4}L${x + w * .6} ${y + h * .65}L${x + w * .75} ${y + h * .5}L${x + w - 14} ${y + h - 14}Z`, C.green) + circle(x + w * .75, y + h * .28, Math.min(w, h) * .1, C.yellow, 3);
const books = (x, y, w, h, n) => many(n, i => rect(x + i * (w / n), y + (i % 3) * 8, w / n - 4, h - (i % 3) * 8, [C.red, C.blue, C.yellow, C.green, C.purple][i % 5], 3, 4));
const shelf = (x, y, w, h, rows = 3) => rect(x, y, w, h, C.wood) + many(rows, r => line(x, y + (r + 1) * h / (rows + 1) + 10, x + w, y + (r + 1) * h / (rows + 1) + 10) + books(x + 14, y + r * h / (rows + 1) + 24, w - 28, h / (rows + 1) - 16, 6));
const chair = (x, base, k = 1, color = C.blue) => rect(x - 40 * k, base - 160 * k, 80 * k, 90 * k, color, 14) + rect(x - 50 * k, base - 80 * k, 100 * k, 22 * k, color, 8) + line(x - 40 * k, base - 58 * k, x - 44 * k, base) + line(x + 40 * k, base - 58 * k, x + 44 * k, base);
const desk = (x, y, w, h, color = C.wood) => rect(x, y, w, 26, color, 6) + line(x + 20, y + 26, x + 20, y + h) + line(x + w - 20, y + 26, x + w - 20, y + h);
const lamp = (x, base, k = 1) => shape(`M${x - 50 * k} ${base - 240 * k}H${x + 50 * k}L${x + 70 * k} ${base - 170 * k}H${x - 70 * k}Z`, C.yellow) + line(x, base - 170 * k, x, base - 14 * k) + ellipse(x, base - 8 * k, 46 * k, 12 * k, C.gray2);
const building = (x, base, w, h, color, rows, cols) => rect(x, base - h, w, h, color) + many(rows * cols, i => rect(x + 24 + (i % cols) * ((w - 48) / cols), base - h + 30 + Math.floor(i / cols) * ((h - 80) / rows), (w - 48) / cols - 18, (h - 80) / rows - 22, C.sky, 3, 4));
const streetLamp = (x, base) => line(x, base, x, base - 330, 8) + shape(`M${x} ${base - 330}C${x + 10} ${base - 370} ${x + 70} ${base - 370} ${x + 80} ${base - 330}`, 'none', 7) + shape(`M${x + 58} ${base - 330}H${x + 102}L${x + 92} ${base - 300}H${x + 68}Z`, C.yellow);
const bench = (x, base) => rect(x, base - 110, 260, 22, C.wood, 6) + rect(x, base - 70, 260, 20, C.wood, 6) + line(x + 30, base - 50, x + 26, base) + line(x + 230, base - 50, x + 234, base);
const flatHouse = (x, base, w, h, color = C.stone) => rect(x, base - h, w, h, color) + rect(x - 12, base - h - 18, w + 24, 22, C.stone2) + shape(`M${x + w / 2 - 34} ${base}V${base - 80}A34 34 0 0 1 ${x + w / 2 + 34} ${base - 80}V${base}`, C.wood2) + rect(x + 26, base - h + 34, 46, 40, C.wood, 4) + many(4, i => line(x + 10 + i * w / 4, base - h + 100 + (i % 2) * 30, x + 40 + i * w / 4, base - h + 100 + (i % 2) * 30, 3));
const tent = (x, base, w, h, color) => shape(`M${x} ${base}L${x + w / 2} ${base - h}L${x + w} ${base}Z`, color) + shape(`M${x + w / 2 - 40} ${base}L${x + w / 2} ${base - h * .55}L${x + w / 2 + 40} ${base}Z`, C.wood2) + line(x + w / 2, base - h, x + w / 2, base - h - 34, 4) + many(3, i => line(x + w * (.18 + i * .08), base - h * (.36 + i * .16), x + w * (.82 - i * .08), base - h * (.36 + i * .16), 3));
const palm = (x, base, k = 1) => shape(`M${x} ${base}C${x + 10 * k} ${base - 120 * k} ${x + 40 * k} ${base - 220 * k} ${x + 30 * k} ${base - 300 * k}`, 'none', 22 * k) + shape(`M${x} ${base}C${x + 10 * k} ${base - 120 * k} ${x + 40 * k} ${base - 220 * k} ${x + 30 * k} ${base - 300 * k}`, 'none', 14 * k).replace(`stroke="${INK}"`, `stroke="${C.wood}"`) +
  [[-150, 10], [-110, -50], [0, -80], [110, -50], [150, 15]].map(([dx, dy]) => shape(`M${x + 30 * k} ${base - 300 * k}C${x + 30 * k + dx * .4 * k} ${base - 330 * k + dy * k} ${x + 30 * k + dx * .8 * k} ${base - 320 * k + dy * k} ${x + 30 * k + dx * k} ${base - 260 * k + dy * .5 * k}C${x + 30 * k + dx * .6 * k} ${base - 290 * k + dy * .6 * k} ${x + 30 * k + dx * .3 * k} ${base - 300 * k + dy * .4 * k} ${x + 30 * k} ${base - 300 * k}Z`, C.green)).join('');
const column = (x, base, h) => rect(x - 40, base - 30, 80, 30, C.stone2) + rect(x - 28, base - h + 30, 56, h - 60, C.cream) + many(2, i => line(x - 10 + i * 20, base - h + 50, x - 10 + i * 20, base - 46, 3)) + rect(x - 44, base - h, 88, 34, C.stone2);
const waves = (y, x0 = 0, x1 = 1600, a = 18, color = C.water) => shape(`M${x0} ${y}${many(Math.ceil((x1 - x0) / 120), i => `q30 ${-a} 60 0t60 0`)}V900H${x0}Z`, color);
const stars = list => list.map(([x, y, r]) => shape(`M${x} ${y - r}L${x + r * .3} ${y - r * .3}L${x + r} ${y}L${x + r * .3} ${y + r * .3}L${x} ${y + r}L${x - r * .3} ${y + r * .3}L${x - r} ${y}L${x - r * .3} ${y - r * .3}Z`, C.yellow, 3)).join('');
const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" width="1600" height="900">${body}</svg>`;

const backdrops = {
  classroom: ['Classroom', 'school class lesson teacher board', svg(
    rect(0, 0, 1600, 700, C.wall) + rect(0, 700, 1600, 200, C.floor) + line(0, 700, 1600, 700) +
    rect(380, 120, 840, 380, C.wood, 10) + rect(404, 144, 792, 332, C.board, 6) + rect(420, 500, 760, 20, C.wood2, 6) + rect(520, 488, 60, 14, C.white, 4, 3) + rect(620, 488, 40, 14, C.yellow, 4, 3) +
    shape('M470 230q60-40 120 0t120 0', 'none', 4).replace(`stroke="${INK}"`, 'stroke="#ffffff"') + shape('M470 300h260M470 350h180', 'none', 4).replace(`stroke="${INK}"`, 'stroke="#ffffff"') + shape('M900 380l60-120 60 120zM990 230a36 36 0 1 0 1 0', 'none', 4).replace(`stroke="${INK}"`, 'stroke="#ffffff"') +
    clock(1390, 170) + windowPane(110, 170, 170, 230) + desk(180, 640, 300, 200) + chair(330, 840) + desk(1120, 640, 300, 200) + chair(1270, 840) + plant(1450, 700, .8) + shelf(1340, 360, 200, 260, 2)
  )],
  office: ['Office', 'work desk computer job business', svg(
    rect(0, 0, 1600, 690, C.wall2) + rect(0, 690, 1600, 210, C.gray) + line(0, 690, 1600, 690) +
    windowPane(160, 140, 380, 300, { blinds: true }) + shelf(1180, 180, 260, 420, 3) + frame(700, 150, 200, 150) +
    rect(520, 560, 620, 30, C.wood, 6) + rect(560, 590, 200, 250, C.wood) + line(1100, 590, 1100, 840) + rect(780, 380, 260, 170, C.gray2, 10) + rect(796, 396, 228, 138, C.sky, 4) + line(910, 550, 910, 562, 10) + rect(800, 572, 210, 18, C.white, 4, 3) +
    chair(920, 860, 1.2, C.purple) + plant(1480, 690, 1) + rect(600, 520, 120, 40, C.cream, 4) + rect(1060, 520, 46, 40, C.white, 6)
  )],
  kitchen: ['Kitchen', 'home cooking food cook house', svg(
    rect(0, 0, 1600, 640, C.cream) + rect(0, 640, 1600, 260, C.floor) + line(0, 640, 1600, 640) +
    rect(100, 120, 520, 200, C.blue, 8) + many(3, i => rect(118 + i * 168, 138, 150, 164, C.blue, 6) + circle(250 + i * 168 - 40, 290, 6, C.white, 3)) + windowPane(720, 140, 300, 220, { curtains: false }) +
    rect(100, 480, 900, 40, C.white, 6) + rect(100, 520, 900, 300, C.blue) + many(4, i => rect(120 + i * 220, 540, 200, 260, C.blue, 6) + line(200 + i * 220, 560, 240 + i * 220, 560, 6)) +
    rect(1060, 480, 300, 340, C.gray, 10) + rect(1090, 560, 240, 200, C.gray2, 6) + many(4, i => circle(1110 + i * 60, 470, 22, C.gray2, 4).replace('cy="470"', 'cy="455"')) + rect(1060, 420, 300, 26, C.gray2, 6) +
    rect(1400, 200, 160, 620, C.white, 14) + line(1400, 440, 1560, 440) + line(1420, 260, 1420, 330, 8) + line(1420, 470, 1420, 560, 8) +
    shape('M420 480v-40h120v40', C.red) + line(400, 440, 560, 440, 7) + ellipse(260, 470, 70, 14, C.white)
  )],
  livingRoom: ['Living room', 'home house sofa couch family lounge', svg(
    rect(0, 0, 1600, 680, C.wall) + rect(0, 680, 1600, 220, C.floor2) + line(0, 680, 1600, 680) +
    windowPane(980, 120, 340, 300, { curtains: true }) + frame(300, 150, 240, 170) + frame(580, 190, 130, 110) + lamp(200, 700, 1.2) +
    ellipse(800, 830, 520, 60, C.purple) + shape('M420 700V520q0-40 40-40h660q40 0 40 40v180z', C.red) + rect(380, 560, 80, 200, C.red, 30) + rect(1140, 560, 80, 200, C.red, 30) + rect(460, 600, 680, 100, C.red, 20) + line(800, 610, 800, 690) +
    rect(640, 760, 320, 30, C.wood, 8) + line(670, 790, 670, 840) + line(930, 790, 930, 840) + plant(1420, 700, 1.1) + ellipse(760, 750, 40, 10, C.white)
  )],
  bedroom: ['Bedroom', 'home house bed sleep night', svg(
    rect(0, 0, 1600, 680, C.wall2) + rect(0, 680, 1600, 220, C.floor) + line(0, 680, 1600, 680) +
    windowPane(1140, 140, 280, 260, { curtains: true }) + frame(560, 170, 220, 150) +
    rect(380, 420, 40, 380, C.wood2, 8) + rect(380, 560, 760, 160, C.blue, 16) + rect(380, 520, 760, 60, C.white, 16) + rect(430, 470, 180, 80, C.white, 30) + rect(640, 470, 180, 80, C.white, 30) + rect(1100, 520, 40, 280, C.wood2, 8) + shape('M620 560h520v160H620c40-60 40-100 0-160z', C.purple) +
    rect(170, 600, 160, 200, C.wood, 8) + line(170, 700, 330, 700) + circle(250, 650, 6, INK, 2) + lamp(250, 600, .7) + rect(1250, 470, 230, 330, C.wood, 8) + line(1365, 470, 1365, 800) + circle(1345, 640, 6, INK, 2) + circle(1385, 640, 6, INK, 2)
  )],
  street: ['City street', 'town buildings road shops urban', svg(
    building(40, 640, 300, 460, C.red, 4, 3) + building(360, 640, 260, 360, C.yellow, 3, 2) + building(640, 640, 340, 520, C.blue, 5, 3) + building(1000, 640, 260, 400, C.cream, 3, 2) + building(1280, 640, 300, 480, C.purple, 4, 3) +
    rect(0, 640, 1600, 70, C.gray) + rect(0, 710, 1600, 190, C.gray2) + many(8, i => rect(40 + i * 200, 796, 110, 16, C.white, 4, 3)) + streetLamp(260, 690) + streetLamp(1180, 690) + tree(820, 690, .7) + cloud(500, 120, .9) + cloud(1300, 90, .7)
  )],
  park: ['Park', 'outdoors nature trees grass bench garden', svg(
    sun(1380, 140) + cloud(320, 150) + cloud(860, 110, .8) + shape('M0 560q400-80 800-20t800-20V900H0z', C.grass) + shape('M640 900c40-120 120-220 300-340h90C900 660 860 780 880 900z', C.sand) +
    tree(240, 620, 1.2) + tree(1320, 620, 1.1) + pine(520, 600, .9) + bush(1050, 640) + bush(140, 720, .9) + bench(980, 760) + many(5, i => circle(300 + i * 90, 820 - (i % 2) * 20, 9, i % 2 ? C.pink : C.yellow, 3))
  )],
  stage: ['Stage', 'theater show performance concert presentation', svg(
    rect(0, 0, 1600, 900, C.purple) + rect(0, 600, 1600, 300, C.wood) + line(0, 600, 1600, 600) + many(6, i => line(0, 640 + i * 44, 1600, 640 + i * 44, 3)) +
    shape('M0 0h420c-40 200-30 420 60 620H0z', C.red) + shape('M1600 0h-420c40 200 30 420-60 620h480z', C.red) + many(4, i => shape(`M${60 + i * 90} 0c-20 200 -10 420 40 620`, 'none', 4) + shape(`M${1540 - i * 90} 0c20 200 10 420 -40 620`, 'none', 4)) + rect(0, 0, 1600, 70, C.red) +
    shape('M640 70L520 640h560L960 70z', C.yellow).replace(`fill="${C.yellow}"`, 'fill="#fbe9a8"') + line(800, 640, 800, 470, 6) + rect(784, 430, 32, 50, C.gray2, 14) + ellipse(800, 640, 40, 10, C.gray2)
  )],
  farm: ['Countryside farm', 'farm barn fields fence hills village', svg(
    sun(220, 150) + cloud(820, 130) + cloud(1300, 170, .7) + shape('M0 520q300-120 620-40t520-60 460 40V900H0z', C.grass) + shape('M0 680q500-60 1000 0t600-20V900H0z', C.green) +
    rect(980, 360, 300, 240, C.red) + shape('M960 370l170-140 170 140z', C.red) + rect(1080, 460, 100, 140, C.white) + line(1080, 460, 1180, 600) + line(1180, 460, 1080, 600) + rect(1100, 290, 60, 50, C.white) +
    many(9, i => line(80 + i * 90, 640, 80 + i * 90, 740, 6)) + line(60, 670, 820, 670, 6) + line(60, 710, 820, 710, 6) + tree(1440, 600, .9) + shape('M560 900c40-120 120-220 240-300h40C760 660 720 780 740 900z', C.sand)
  )],
  beach: ['Beach', 'sea ocean sand summer vacation coast', svg(
    sun(1300, 150, 70) + cloud(400, 140) + waves(470, 0, 1600, 14) + shape('M0 600q400-40 800 0t800-10V900H0z', C.sand) + waves(560, 0, 1600, 10).replace(`fill="${C.water}"`, 'fill="none"').replace(/V900H0Z/, '') +
    palm(220, 720, 1.2) + shape('M980 760L1090 470', 'none', 7) + shape('M900 520q190-130 380 0z', C.red) + shape('M970 520q120-90 240 0', 'none', 4) + rect(1150, 700, 180, 40, C.blue, 8) + circle(640, 760, 34, C.yellow) + shape('M606 760h68M640 726v68', 'none', 4)
  )],
  mountains: ['Mountains', 'nature hills peaks lake outdoors snow', svg(
    sun(1360, 140, 55) + cloud(300, 130, .8) + shape('M0 600L330 210l200 230 210-300 330 420 250-260 280 300V900H0z', C.gray) + shape('M330 210l70 80-40 20-30-30-50 40zM740 140l90 120-50 10-40-30-50 40-30-30z', C.snow) +
    shape('M0 640q400-60 800-10t800-20V900H0z', C.grass) + shape('M520 760q300-40 620 0-300 60-620 0z', C.water) + pine(160, 700, .8) + pine(300, 720, .7) + pine(1340, 700, .9) + pine(1470, 720, .75)
  )],
  desert: ['Desert camp', 'bible ancient tents dunes palms sand wilderness', svg(
    sun(1300, 160, 70) + shape('M0 560q300-80 700-20t900-30V900H0z', C.sand) + shape('M0 690q500-70 1100-10t500 0V900H0z', '#e9c27f') +
    tent(220, 640, 360, 260, C.cream) + tent(640, 600, 280, 200, C.red) + palm(1120, 640, 1) + palm(1260, 660, .8) + circle(1010, 650, 26, C.water) + ellipse(400, 760, 90, 20, C.stone2)
  )],
  village: ['Ancient village', 'bible town stone houses well ancient', svg(
    sun(1380, 140, 60) + shape('M0 470q400-90 800-30t800-20V900H0z', '#e9d3a6') + flatHouse(120, 640, 280, 250) + flatHouse(440, 640, 220, 200, C.cream) + flatHouse(1080, 640, 300, 280) + palm(860, 640, .9) +
    rect(0, 640, 1600, 260, C.sand) + line(0, 640, 1600, 640) + ellipse(760, 760, 110, 26, C.stone2) + rect(650, 680, 220, 80, C.stone2, 6) + line(680, 680, 680, 600, 6) + line(840, 680, 840, 600, 6) + line(670, 600, 850, 600, 6) + shape('M760 600v40', 'none', 4) + rect(744, 640, 32, 30, C.wood, 4)
  )],
  temple: ['Temple courtyard', 'bible ancient columns steps palace church worship', svg(
    rect(160, 140, 1280, 80, C.stone2) + shape('M140 140L800 20l660 120z', C.cream) + many(6, i => column(270 + i * 212, 600, 380)) + rect(120, 600, 1360, 30, C.stone2) + rect(80, 630, 1440, 30, C.stone) + rect(40, 660, 1520, 30, C.stone2) +
    rect(0, 690, 1600, 210, C.sand) + line(0, 690, 1600, 690) + many(7, i => line(i * 240, 690, i * 240 - 120, 900, 3))
  )],
  store: ['Store front', 'shop market shopping business town', svg(
    rect(160, 160, 1280, 520, C.cream) + rect(140, 120, 1320, 70, C.blue, 6) + shape(`M160 190${many(8, i => 'h160v70q-80 40-160 0z' + (i < 7 ? 'm160 0' : ''))}`, C.red) + rect(560, 30, 480, 90, C.yellow, 12) +
    rect(240, 330, 420, 300, C.sky) + rect(940, 330, 420, 300, C.sky) + rect(700, 330, 200, 350, C.wood) + circle(870, 510, 9, INK, 3) + rect(270, 560, 360, 70, C.white) + many(3, i => circle(330 + i * 120, 540, 34, [C.red, C.yellow, C.green][i])) +
    rect(0, 680, 1600, 220, C.gray) + line(0, 680, 1600, 680) + plant(140, 680, .8) + plant(1460, 680, .8)
  )],
  meetingRoom: ['Meeting room', 'office team business presentation work table', svg(
    rect(0, 0, 1600, 670, C.wall2) + rect(0, 670, 1600, 230, C.gray) + line(0, 670, 1600, 670) + rect(500, 110, 600, 340, C.white, 10) + shape('M560 380l120-110 100 70 140-150 120 100', 'none', 6) + line(560, 400, 1040, 400, 4) +
    windowPane(110, 150, 260, 260, { blinds: true }) + windowPane(1230, 150, 260, 260, { blinds: true }) + shape('M360 700q440-90 880 0-440 90-880 0z', C.wood) + many(3, i => chair(520 + i * 280, 690, .8, C.blue)) + many(3, i => chair(520 + i * 280, 880, .8, C.blue))
  )],
  night: ['Night sky', 'night stars moon sky evening dream', svg(
    circle(1260, 170, 80, C.yellow) + circle(1300, 150, 70, C.white).replace(`stroke="${INK}"`, 'stroke="none"') + stars([[200, 140, 18], [420, 250, 12], [640, 120, 16], [860, 220, 10], [1020, 110, 14], [1480, 300, 12], [320, 380, 10], [760, 360, 14]]) +
    shape('M0 600q300-140 600-40t500-60 500 40V900H0z', C.blue) + shape('M0 720q500-80 1000 0t600-20V900H0z', C.purple) + rect(1060, 500, 160, 140, C.cream) + shape('M1040 510l100-90 100 90z', C.red) + rect(1100, 560, 50, 50, C.yellow, 4)
  )],
  sea: ['Sea and boat', 'bible fishing boat lake water sailing galilee', svg(
    sun(260, 160, 60) + cloud(900, 140) + cloud(1350, 200, .7) + shape('M0 470q300-60 600-20t1000 0V560H0z', '#b7d7c3') + waves(520, 0, 1600, 16) +
    shape('M560 600h480l-70 110H630z', C.wood) + line(800, 600, 800, 300, 8) + shape('M808 310l180 260H808z', C.white) + shape('M792 330L660 570h132z', C.cream) + waves(700, 0, 1600, 12).replace(`fill="${C.water}"`, 'fill="#7cbad6"')
  )],
};

fs.mkdirSync(out, { recursive: true });
const manifest = [];
for (const [key, [name, words, body]] of Object.entries(backdrops)) {
  const file = key.replace(/[A-Z]/g, c => '-' + c.toLowerCase()) + '.svg';
  fs.writeFileSync(path.join(out, file), body);
  manifest.push([file, name, words]);
}
fs.writeFileSync(path.join(out, 'backdrops.json'), JSON.stringify(manifest, null, 1));
console.log(`${manifest.length} backdrops in ${path.relative(process.cwd(), out)}`);
