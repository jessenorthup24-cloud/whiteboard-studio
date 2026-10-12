(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safePaint = (v,fallback) => /^(none|transparent|#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d\s.,%]+\))$/i.test(String(v||''))?v:fallback;
  const id = () => crypto.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const num = (v,f=0) => Number.isFinite(+v) ? +v : f;
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  const ICONS = {
    bulb:{name:'Lightbulb',paths:['M39 72h22','M41 78h18','M43 84h14','M38 64c-2-9-11-14-11-27a23 23 0 0 1 46 0c0 13-9 18-11 27z','M50 5v9','M18 16l7 7','M82 16l-7 7','M9 45h10','M81 45h10']},
    chart:{name:'Growth chart',paths:['M13 79V19','M13 79h76','M22 62l18-17 14 11 24-29','M69 27h9v9']},
    heart:{name:'Heart',paths:['M50 81 17 50C1 34 17 11 37 23c5 3 9 8 13 13 4-5 8-10 13-13 20-12 36 11 20 27z']},
    star:{name:'Star',paths:['M50 10 61 36 89 38 67 56 74 85 50 69 26 85 33 56 11 38 39 36z']},
    person:{name:'Person',paths:['M50 40a16 16 0 1 0 0-32 16 16 0 0 0 0 32z','M21 86V70c0-15 13-25 29-25s29 10 29 25v16z']},
    cloud:{name:'Cloud',paths:['M22 69C8 69 7 50 20 46c0-20 28-29 39-12 15-5 29 7 27 22 11 11 1 27-13 27H27','M33 79h39']},
    rocket:{name:'Rocket',paths:['M45 67c-13-11-12-28 0-41C55 15 70 10 82 8c-1 12-6 27-18 38-13 12-28 12-39 0z','M58 35a7 7 0 1 0 14 0 7 7 0 0 0-14 0z','M28 50c-12-1-19 6-22 17l20-5','M41 66 36 86c11-3 18-10 17-22','M26 65 16 86l21-10']},
    check:{name:'Check mark',paths:['M16 52 39 73 85 24','M8 51a42 42 0 1 0 11-28']},
    pencil:{name:'Pencil',paths:['M19 75 72 22l8 8-53 53-15 4z','M64 30l8 8','M16 88h70']}
  };
  const iconKeys = Object.keys(ICONS);
  // Fonts whose letters join; they are written word by word without lifting the pen between letters.
  const CONNECTED_FONTS=new Set(['dancing','satisfy','homemade']);
  const HANDWRITING_FONTS = {dancing:'Dancing Script',satisfy:'Satisfy',homemade:'Homemade Apple',patrick:'Patrick Hand',kalam:'Kalam',indie:'Indie Flower',caveat:'Caveat',gochi:'Gochi Hand',handlee:'Handlee',architects:'Architects Daughter',shadows:'Shadows Into Light',gloria:'Gloria Hallelujah',permanent:'Permanent Marker'};
  const FONT_OPTIONS = [['patrick','Classic whiteboard · Patrick Hand'],['kalam','Natural marker · Kalam'],['indie','Casual hand · Indie Flower'],['caveat','Flowing hand · Caveat'],['gochi','Playful marker · Gochi Hand'],['handlee','Neat hand · Handlee'],['architects','Architect hand'],['shadows','Light hand · Shadows Into Light'],['gloria','Lively hand · Gloria Hallelujah'],['permanent','Heavy marker · Permanent Marker'],['dancing','Connected cursive · Dancing Script'],['satisfy','Connected script · Satisfy'],['homemade','Handwritten cursive · Homemade Apple'],['futural','Simple stroke'],['futuram','Bold stroke'],['scripts','Script stroke'],['scriptc','Bold script stroke'],['cursive','Cursive stroke'],['gothiceng','Gothic stroke'],['gothicita','Gothic italic stroke'],['timesr','Serif stroke'],['timesi','Italic serif stroke'],['timesrb','Bold serif stroke']];
  const SHEETS = [
    {name:'People',file:'people.png',items:['Man','Woman','Girl','Boy']},
    {name:'Nature',file:'nature.png',items:['Bush','Tree','Flower','Leaf']},
    {name:'Transport',file:'transport.png',items:['Car','Bicycle','Bus','Airplane']},
    {name:'Road',file:'road.png',items:['Stop sign','Traffic light','Crosswalk sign','Street lamp']},
    {name:'Pets',file:'pets.png',items:['Dog','Cat','Rabbit','Fish']},
    {name:'Wildlife',file:'wildlife.png',items:['Bird','Owl','Butterfly','Deer']},
    {name:'Home',file:'home.png',items:['House','Couch','Lamp','Table']},
    {name:'Work',file:'work.png',items:['Laptop','Briefcase','Phone','Coffee mug']},
    {name:'Education',file:'education.png',items:['Book','Pencil','Backpack','Globe']},
    {name:'Celebration',file:'celebration.png',items:['Heart','Apple','Cupcake','Gift']},
    {name:'Bible era people',file:'biblical-people.png',cols:4,rows:3,items:['Man in a robe','Woman in a robe','Boy in a tunic','Girl in a tunic','Elder man','Elder woman','Shepherd','Farmer','Fisherman','Traveler','Priest','Scribe']},
    {name:'Bible era animals',file:'biblical-animals.png',cols:4,rows:3,items:['Donkey','Sheep','Lamb','Goat','Ox','Camel','Horse','Dove','Snake','Lion','Fish','Rooster']},
    {name:'Garden and nature',file:'biblical-eden-nature.png',cols:4,rows:3,items:['Garden','Fruit tree','Palm tree','Olive tree','Grape vine','Flowering bush','River','Mountain','Wheat stalks','Fig branch','Lily','Date cluster']},
    {name:'Farming tools',file:'biblical-farming.png',cols:4,rows:3,items:['Wooden plow','Sickle','Hoe','Rake','Seed bag','Grain bundle','Harvest basket','Water jug','Millstone','Threshing fork','Ox yoke','Vineyard trellis']},
    {name:'Household objects',file:'biblical-household.png',cols:4,rows:3,items:['Clay vase','Amphora','Oil lamp','Drinking cup','Wooden bowl','Pitcher','Woven basket','Bread oven','Storage jar','Water well','Woven mat','Wooden stool']},
    {name:'Food and harvest',file:'biblical-food.png',cols:4,rows:3,items:['Bread loaf','Fish','Grapes','Figs','Olives','Pomegranate','Dates','Honey jar','Wheat sheaf','Lentil bowl','Wine cup','Almond branch']},
    {name:'Places',file:'biblical-places.png',cols:4,rows:3,items:['Stone house','Nomad tent','City gate','Village well','Watchtower','Synagogue','Temple','Stable','Courtyard','Stone bridge','Vineyard','Desert oasis']},
    {name:'Travel',file:'biblical-travel.png',cols:4,rows:3,items:['Sandals','Walking staff','Travel cloak','Satchel','Wooden cart','Fishing boat','Fishing net','Oar','Donkey saddle','Wagon wheel','Lantern','Rope coil']},
    {name:'Sacred objects',file:'biblical-sacred.png',cols:4,rows:3,items:['Scroll','Stone tablets','Menorah','Altar','Incense burner','Ark chest','Shofar','Harp','Crown','Star','Dove with olive branch','Shepherd crook']},
    {name:'Stories',file:'biblical-stories.png',cols:4,rows:3,items:['Empty tomb','Manger','Mustard plant','Burning bush','Rainbow','Ladder','Loaves and fish','Water jar','Sling','Sling stones','Olive press','Winepress']},
    {name:'Men: emotions',file:'everyday-men-emotions.png',cols:5,rows:2,items:['Happy man','Sad man','Angry man','Surprised man','Confused man','Excited man','Worried man','Thoughtful man','Tired man','Confident man']},
    {name:'Women: emotions',file:'everyday-women-emotions.png',cols:5,rows:2,items:['Happy woman','Sad woman','Angry woman','Surprised woman','Confused woman','Excited woman','Worried woman','Thoughtful woman','Tired woman','Confident woman']},
    {name:'Gestures',file:'everyday-gestures.png',cols:5,rows:2,items:['Waving hand','Handshake','Thumbs up','Thumbs down','High five','Pointing right','Clapping hands','Praying hands','Helping hands','Fist bump']},
    {name:'Work and study',file:'everyday-work-study.png',cols:5,rows:2,items:['Presentation chart','Magnifying glass','Clipboard','Calendar','Clock','Light bulb','Trophy','Target','Puzzle piece','Books']},
    {name:'Communication',file:'everyday-communication.png',cols:5,rows:2,items:['Email envelope','Smartphone','Speech bubble','Question bubble','Video camera','Microphone','Headphones','Megaphone','Chat bubbles','Notification bell']},
    {name:'Home and daily life',file:'everyday-home-life.png',cols:5,rows:2,items:['Key','Front door','Houseplant','Coffee cup','Shopping bag','Umbrella','Gift box','Birthday cake','Dinner plate','Toolbox']},
    {name:'Wellness',file:'everyday-wellness.png',cols:5,rows:2,items:['Heart pulse','First aid kit','Water bottle','Running shoe','Dumbbell','Yoga mat','Bicycle helmet','Sleep moon','Sunglasses sun','Bandage']},
    {name:'Nature and weather',file:'everyday-nature-weather.png',cols:5,rows:2,items:['Smiling sun','Rain cloud','Snowflake','Rainbow','Wind','Mountain','Ocean wave','Leaf','Campfire','Seedling']},
    {name:'Arrows',kind:'symbol',symbolType:'arrow',cols:5,rows:2,items:['Right arrow','Left arrow','Up arrow','Down arrow','Up-right arrow','Curved right arrow','Curved left arrow','U-turn arrow','Circular arrows','Double-headed arrow']},
    {name:'Numbers',kind:'symbol',symbolType:'number',cols:5,rows:2,items:['Number 0','Number 1','Number 2','Number 3','Number 4','Number 5','Number 6','Number 7','Number 8','Number 9']}
  ];
  const HAND = {src:'./assets/marker-hand-v3.png',x:138,y:16,w:650,h:433};
  const sheetCache=new Map(),cropCache=new Map();
  const textTimers=new Map();
  const state = {project:null,sceneIndex:0,selected:null,tool:'select',playing:false,preview:false,previewCameraBox:null,editorView:{cx:800,cy:450,w:1600},time:0,frame:0,lastTick:0,saveTimer:0,undo:[],redo:[],db:null,drag:null,selectedClip:null,audioLane:0,exporting:false,recording:null,fonts:null,handImage:null};

  function demoProject(){
    return {id:id(),name:'Your first story',ratio:'16:9',updated:Date.now(),audio:null,scenes:[
      {id:id(),name:'The big idea',background:'#ffffff',items:[
        {id:id(),type:'icon',icon:'bulb',x:138,y:180,w:245,h:245,color:'#285d63',animation:'draw',duration:2.2,pause:.25},
        {id:id(),type:'text',text:'Make ideas\ncome alive.',x:468,y:250,w:800,h:220,fontSize:93,color:'#1e3445',animation:'draw',duration:2,pause:.5},
        {id:id(),type:'camera',cx:1000,cy:450,zoom:1.18,duration:1,pause:.15},
        {id:id(),type:'text',text:'One line at a time.',x:550,y:575,w:750,h:100,fontSize:51,color:'#f27a59',animation:'draw',duration:1.6,pause:1}
      ]}
    ]};
  }
  const scene = () => state.project.scenes[state.sceneIndex];
  const item = () => scene()?.items.find(x=>x.id===state.selected) || null;
  const itemLen = (x) => Math.max(.1,num(x.duration,1)) + Math.max(0,num(x.pause));
  const sceneLen = (s) => s.items.reduce((a,x)=>a+itemLen(x),0);
  const totalLen = () => state.project.scenes.reduce((a,s)=>a+sceneLen(s),0);
  const sceneStart = (i) => state.project.scenes.slice(0,i).reduce((a,s)=>a+sceneLen(s),0);
  function positionAt(t){
    let offset=0;
    for(let i=0;i<state.project.scenes.length;i++){
      const s=state.project.scenes[i], len=sceneLen(s);
      if(t<=offset+len || i===state.project.scenes.length-1) return {index:i,scene:s,local:clamp(t-offset,0,len)};
      offset+=len;
    }
  }
  function visualAt(s,t){
    const firstCamera=s.items.find(x=>x.type==='camera');
    let clock=0,camera=firstCamera?{cx:firstCamera.cx,cy:firstCamera.cy,zoom:firstCamera.zoom}:{cx:800,cy:450,zoom:1},visible=[];
    for(const it of s.items){
      const start=clock,end=start+Math.max(.1,num(it.duration,1));
      if(it.type==='camera'){
        const next={cx:it.cx,cy:it.cy,zoom:it.zoom};
        if(t>=end) camera=next;
        else if(t>=start){const p=clamp((t-start)/(end-start),0,1);camera={cx:camera.cx+(next.cx-camera.cx)*p,cy:camera.cy+(next.cy-camera.cy)*p,zoom:camera.zoom+(next.zoom-camera.zoom)*p};}
      }else if(t>=start){visible.push({it,progress:clamp((t-start)/(end-start),0,1),active:t<end});}
      clock+=itemLen(it);
      if(t<clock) break;
    }
    return {camera,visible};
  }
  function baseBox(){return state.project.ratio==='1:1'?[350,0,900,900]:state.project.ratio==='9:16'?[547,0,506,900]:[0,0,1600,900];}
  function cameraBox(cam){const base=baseBox(),w=base[2]/cam.zoom,h=base[3]/cam.zoom;return [cam.cx-w/2,cam.cy-h/2,w,h];}
  function editorBox(){const stage=$('#stage'),aspect=(stage.clientWidth||1600)/(stage.clientHeight||900),w=state.editorView.w;return [state.editorView.cx-w/2,state.editorView.cy-w/aspect/2,w,w/aspect];}
  const lengthCache=new Map();
  function pathLength(d){
    if(lengthCache.has(d))return lengthCache.get(d);
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);$('#stage').appendChild(p);
    let n=100;try{n=p.getTotalLength()}catch{}p.remove();lengthCache.set(d,n);return n;
  }
  let exportRender=false,exportHand=null;
  function handMarkup(x,y){
    if(exportRender){exportHand={x,y};return '';}
    return `<image href="${HAND.src}" x="${x-HAND.x}" y="${y-HAND.y}" width="${HAND.w}" height="${HAND.h}" pointer-events="none"/>`;
  }
  function sequenceMarkup(paths,progress,withHand){
    const strokes=paths.flatMap(p=>(p.d.match(/M[^M]*/g)||[p.d]).filter(Boolean).map(d=>({...p,d})));
    const lens=strokes.map(p=>Math.max(.01,pathLength(p.d))),total=lens.reduce((a,b)=>a+b,0)||1;
    let remaining=progress*total,hand=null,markup='';
    for(let i=0;i<strokes.length;i++){
      const p=strokes[i],len=lens[i],done=clamp(remaining/len,0,1);remaining-=len;
      if(done<=0)continue;
      const sx=p.sx??1,sy=p.sy??1,tx=p.tx??0,ty=p.ty??0;
      markup+=`<g transform="translate(${tx} ${ty}) scale(${sx} ${sy})"><path d="${esc(p.d)}" fill="${done>=.999?esc(p.fill||'none'):'none'}" stroke="${esc(p.stroke||'#285d63')}" stroke-width="${num(p.sw,3.7)}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${len}" stroke-dashoffset="${len*(1-done)}"/></g>`;
      if(withHand&&done>0&&done<1){const node=document.createElementNS('http://www.w3.org/2000/svg','path');node.setAttribute('d',p.d);$('#stage').appendChild(node);try{const pt=node.getPointAtLength(len*done);hand={x:tx+pt.x*sx,y:ty+pt.y*sy};}catch{}node.remove();}
    }
    return {markup,hand:hand?handMarkup(hand.x,hand.y):''};
  }
  function vectorPaths(it){
    const raw=it.icon?ICONS[it.icon]?.paths.map(d=>({d,stroke:it.color,fill:'none',sw:3.7}))||[]:it.iconPaths?it.iconPaths.map(d=>({d,stroke:it.color,fill:'none',sw:ICON_STROKE})):it.paths||[];
    const vb=it.vb||[0,0,100,100],sx=it.w/vb[2],sy=it.h/vb[3];
    return raw.map(p=>({...p,tx:it.x-vb[0]*sx,ty:it.y-vb[1]*sy,sx,sy}));
  }
  // Script stroke fonts, and whether each is drawn with a single line (the medium one doubles its lines).
  const SCRIPT_STROKE_FONTS={scripts:true,cursive:true,scriptc:false},scriptGlyphs=new WeakMap();
  // How a script glyph joins its neighbours: its entry and exit are its leftmost and rightmost points on the
  // lowercase band, where script letters meet. Dots and crossbars that touch neither are written after the letter's body.
  function scriptGlyph(g,singleLine){
    if(scriptGlyphs.has(g))return scriptGlyphs.get(g);
    const subs=(g.d.match(/M[^M]*/g)||[]).map(d=>({d,pts:(d.match(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g)||[]).map(p=>p.split(',').map(Number))}));
    const all=subs.flatMap(s=>s.pts),band=all.filter(([,y])=>y>=11&&y<=19),pick=band.length?band:all;
    const entry=pick.reduce((a,p)=>p[0]<a[0]?p:a,pick[0]||[0,0]),exit=pick.reduce((a,p)=>p[0]>a[0]?p:a,pick[0]||[0,0]);
    const has=(s,p)=>s.pts.some(q=>q[0]===p[0]&&q[1]===p[1]),later=s=>{if(has(s,entry)||has(s,exit))return false;const xs=s.pts.map(p=>p[0]),ys=s.pts.map(p=>p[1]),w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys);return singleLine||(w<=2.5&&h<=2.5)||(h<=1.5&&w>=3);};
    const info={offset:-entry[0],advance:Math.max(1,exit[0]-entry[0]),body:subs.filter(s=>!later(s)).map(s=>s.d),marks:subs.filter(later).map(s=>s.d)};
    scriptGlyphs.set(g,info);return info;
  }
  function textPaths(it){
    const font=state.fonts?.[it.font]||state.fonts?.futural;if(!font)return [];
    const glyph=c=>font.chars[(c.charCodeAt(0)>=33&&c.charCodeAt(0)<=127?c.charCodeAt(0):63)-33];
    const script=it.font in SCRIPT_STROKE_FONTS,join=c=>script&&glyph(c)?.d?scriptGlyph(glyph(c),SCRIPT_STROKE_FONTS[it.font]):null;
    const rows=String(it.text||'Text').split('\n').slice(0,6),advance=c=>/\s/u.test(c)?12:join(c)?.advance??(glyph(c)?.o||10)*1.68;
    const scale=it.fontSize/23,widths=rows.map(row=>[...row].reduce((a,c)=>a+advance(c),0)),fit=Math.min(1,it.w/(Math.max(1,...widths)*scale)),room=it.w/(scale*fit);
    const paths=[];
    rows.forEach((row,j)=>{let left=(room-widths[j])*(ALIGN_SHIFT[it.align]||0);const ty=it.y+j*it.fontSize*1.18;
      for(const raw of row){
        const g=glyph(raw),info=join(raw);
        if(!/\s/u.test(raw)&&g?.d){const place=d=>({d,tx:it.x+(left+(info?.offset||0))*scale*fit,ty,sx:scale*fit,sy:scale,stroke:it.color,sw:1.35});
          paths.push(...(info?[...info.body,...info.marks]:[g.d]).map(place));}
        left+=advance(raw);
      }});
    return paths;
  }
  function shapeTracePaths(it){
    const outline=it.shape==='circle'?'M50 1 A49 49 0 1 1 49.9 1 Z':it.shape==='round'?'M15 1 H85 Q99 1 99 15 V85 Q99 99 85 99 H15 Q1 99 1 85 V15 Q1 1 15 1 Z':'M1 1 H99 V99 H1 Z';
    const paths=[{d:outline,sw:3.2}];
    for(let y=4;y<=98;y+=6){let x1=1,x2=99;if(it.shape==='circle'){const r=Math.sqrt(Math.max(0,49*49-(y-50)*(y-50)));x1=50-r;x2=50+r;}else if(it.shape==='round'&&(y<15||y>85)){const dy=y<15?15-y:y-85,dx=Math.sqrt(Math.max(0,14*14-dy*dy));x1=15-dx;x2=85+dx;}paths.push({d:`M${x1.toFixed(2)} ${y} L${x2.toFixed(2)} ${y}`,sw:7.2});}
    return paths;
  }
  function imageTracePaths(it){
    const paths=(it.tracePaths||[]).map(d=>({d,sw:3.5}));
    if(it.transparentArtwork)for(const d of it.fillPaths||[])paths.push({d,sw:7.4});
    else for(let y=3;y<=99;y+=6)paths.push({d:`M0 ${y} L100 ${y}`,sw:7.4});
    return paths;
  }
  // Handwriting is written letter by letter: finished letters show in full, the current letter is uncovered exactly up
  // to the pen using its time map (see letterReveal), and later letters stay hidden.
  // The pen's timeline for handwritten text, in drawn-length units. Between strokes the pen lifts and travels through
  // the air to the next start instead of jumping there.
  // Each later stroke of a letter starts a little later in its time map than the previous one ends, so finishing one
  // stroke never uncovers the start of the next while the pen is still in the air.
  const STROKE_GAP=.03,penPlans=new WeakMap();
  function penPlan(it){
    if(penPlans.has(it.letterPaths))return penPlans.get(it.letterPaths);
    const node=document.createElementNS('http://www.w3.org/2000/svg','path');$('#stage').appendChild(node);
    const steps=[],letterLen=it.letters.map(()=>0),letterStrokes=it.letters.map(()=>0);let last=null,total=0;
    for(const p of it.letterPaths){
      const len=Math.max(.01,pathLength(p.d));node.setAttribute('d',p.d);const a=node.getPointAtLength(0),b=node.getPointAtLength(len);
      // Strokes that meet, as letters do in connected script, carry on without lifting the pen.
      if(last){const gap=Math.hypot(a.x-last.x,a.y-last.y),ground=gap<it.fontSize*.12,time=ground?gap:Math.min(gap,150)*.35+5;steps.push({air:true,ground,from:last,to:{x:a.x,y:a.y},time});total+=time;}
      const time=Math.max(len,6);steps.push({d:p.d,len,letter:p.letter,index:letterStrokes[p.letter]++,time});total+=time;letterLen[p.letter]+=len;last={x:b.x,y:b.y};
    }
    node.remove();
    steps.forEach((s,i)=>{if(!s.air){s.easeIn=!steps[i-1]?.ground;s.easeOut=!steps[i+1]?.ground;}});
    const plan={steps,total,letterLen,letterStrokes};penPlans.set(it.letterPaths,plan);return plan;
  }
  // Position along a stroke at time fraction f. Like a real hand, the pen moves slowly where it touches down (start) or
  // lifts off (end) and fastest in between; where strokes join without a lift it keeps its speed.
  function easeStroke(f,start,end){const k=.6/Math.PI;return (f-(start?k*Math.sin(Math.PI*Math.min(f,.5)):0)-(end&&f>.5?k*(1-Math.sin(Math.PI*f)):0))/(1-k*((start?1:0)+(end?1:0)));}
  function handwritingMarkup(it,progress,withHand){
    if(progress>=1)return `<image href="${esc(it.handwritingSrc)}" x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" preserveAspectRatio="none"/>`;
    const plan=penPlan(it),drawn=it.letters.map(()=>0),index=it.letters.map(()=>0);let clock=progress*plan.total,pen=null,lift=0,started=-1;
    for(const s of plan.steps){
      if(clock<=0)break;const f=clamp(clock/s.time,0,1);clock-=s.time;
      if(s.air){pen={x:s.from.x+(s.to.x-s.from.x)*f,y:s.from.y+(s.to.y-s.from.y)*f};lift=s.ground?0:Math.sin(Math.PI*f);continue;}
      const eased=easeStroke(f,s.easeIn,s.easeOut);drawn[s.letter]+=s.len*eased;index[s.letter]=s.index;started=Math.max(started,s.letter);pen={d:s.d,at:s.len*eased};lift=0;
    }
    let markup='';const key=it.id.replace(/[^a-zA-Z0-9]/g,'');
    it.letters.forEach((l,k)=>{
      const gap=plan.letterLen[k]*STROKE_GAP,done=plan.letterLen[k]?clamp((drawn[k]+index[k]*gap)/(plan.letterLen[k]+(plan.letterStrokes[k]-1)*gap),0,1):k<started?1:0;
      if(done<=0)return;
      const box=`x="${it.x+l.box[0]*it.w}" y="${it.y+l.box[1]*it.h}" width="${l.box[2]*it.w}" height="${l.box[3]*it.h}"`,image=`<image href="${esc(l.src)}" ${box} preserveAspectRatio="none"`;
      if(done>=1){markup+=`${image}/>`;return;}
      // Keep pixels whose stored time (alpha 255 at the letter's start to 5 at its end) the pen has reached. The edge is nearly hard so
      // nothing shows ahead of the pen, even across a pen lift.
      const cut=(255-250*done)/255,slope=200,maskId=`write-${key}-${k}`;
      markup+=`<defs><filter id="${maskId}-f" filterUnits="userSpaceOnUse" ${box} color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="linear" slope="${slope}" intercept="${(1-slope*cut).toFixed(4)}"/></feComponentTransfer></filter><mask id="${maskId}" maskUnits="userSpaceOnUse" ${box} style="mask-type:alpha"><image href="${esc(l.map)}" ${box} preserveAspectRatio="none" filter="url(#${maskId}-f)"/></mask></defs>${image} mask="url(#${maskId})"/>`;
    });
    if(withHand&&pen?.d){const node=document.createElementNS('http://www.w3.org/2000/svg','path');node.setAttribute('d',pen.d);$('#stage').appendChild(node);try{const pt=node.getPointAtLength(pen.at);pen={x:pt.x,y:pt.y};}catch{pen=null;}node.remove();}
    return markup+(withHand&&pen&&!pen.d?handMarkup(it.x+pen.x,it.y+pen.y-lift*it.fontSize*.15):'');
  }
  function maskedDrawing(it,body,progress,withHand){
    if(progress>=1)return body;
    const raw=it.type==='shape'?shapeTracePaths(it):imageTracePaths(it),sx=it.w/100,sy=it.h/100;
    const paths=raw.map(p=>({...p,tx:it.x,ty:it.y,sx,sy,stroke:'#fff'}));
    const drawn=sequenceMarkup(paths,progress,withHand),maskId=`mask-${it.id.replace(/[^a-zA-Z0-9]/g,'')}`;
    return `<defs><mask id="${maskId}" maskUnits="userSpaceOnUse" x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}"><rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" fill="black"/>${drawn.markup}</mask></defs><g mask="url(#${maskId})">${body}</g>${drawn.hand}`;
  }
  function elementMarkup(it,progress=1,selectable=false,hand=false){
    const attr=selectable?`data-item="${esc(it.id)}" style="cursor:move"`:'';
    const start=`<g ${attr}>`,hit=selectable?`<rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" fill="transparent" pointer-events="all"/>`:'',end='</g>';
    if(it.animation==='none')progress=1;
    if(progress<1&&['fade','slide','pop'].includes(it.animation)){
      const full=elementMarkup(it,1,false,false),opacity=it.animation==='fade'?progress:1;
      const transform=it.animation==='slide'?`translate(${(1-progress)*-150} 0)`:it.animation==='pop'?`translate(${it.x+it.w/2} ${it.y+it.h/2}) scale(${.5+.5*progress}) translate(${-it.x-it.w/2} ${-it.y-it.h/2})`:'';
      return `<g ${attr} opacity="${opacity}" transform="${transform}">${full}</g>`;
    }
    if(it.type==='text'&&HANDWRITING_FONTS[it.font]&&it.handwritingSrc&&it.handwritingSignature===textSignature(it)){
      return start+handwritingMarkup(it,it.letters?.length?progress:1,hand&&progress<1)+hit+end;
    }
    if(it.type==='icon'||it.type==='vector'||it.type==='text'){
      const drawn=sequenceMarkup(it.type==='text'?textPaths(it):vectorPaths(it),progress,hand&&progress<1);
      return start+drawn.markup+drawn.hand+hit+end;
    }
    let body='';
    if(it.type==='shape'){
      body=it.shape==='circle'?`<ellipse cx="${it.x+it.w/2}" cy="${it.y+it.h/2}" rx="${it.w/2}" ry="${it.h/2}" fill="${esc(it.fill)}"/>`:`<rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" rx="${it.shape==='round'?30:0}" fill="${esc(it.fill)}"/>`;
    }else if(it.type==='image'){
      body=`<image href="${esc(it.src)}" x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" preserveAspectRatio="none"/>`;
      if(it.illustration?.v===ILLUSTRATION_VERSION)return start+illustrationMarkup(it,body,progress,hand&&progress<1)+hit+end;
    }
    return start+maskedDrawing(it,body,progress,hand&&progress<1)+hit+end;
  }
  function renderMarkup(s,vis,editing=false,frameBox=baseBox()){
    let markup=`<rect x="${frameBox[0]}" y="${frameBox[1]}" width="${frameBox[2]}" height="${frameBox[3]}" fill="${esc(s.background||'#ffffff')}"/>`;
    if(editing)for(const cam of s.items.filter(x=>x.type==='camera')){const [x,y,w,h]=cameraBox(cam);markup+=`<rect data-item="${esc(cam.id)}" x="${x}" y="${y}" width="${w}" height="${h}" fill="#72baa20d" stroke="#64a99a" stroke-width="${Math.max(2,frameBox[2]/500)}" stroke-dasharray="${Math.max(10,frameBox[2]/90)} ${Math.max(6,frameBox[2]/150)}" style="cursor:move" pointer-events="all"/>`;}
    for(const v of vis.visible){
      const it=v.it;
      markup+=elementMarkup(it,v.progress,editing,v.active&&!editing);
    }
    if(editing){
      const selected=item();
      if(selected){
        const [x,y,w,h]=selected.type==='camera'?cameraBox(selected):[selected.x,selected.y,selected.w,selected.h];
        const color=selected.type==='camera'?'#318c79':'#f27a59',sw=Math.max(2,frameBox[2]/650),r=Math.max(6,frameBox[2]/220);
        markup+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-dasharray="${sw*3} ${sw*2}" pointer-events="none"/>`;
        const handles={nw:[x,y],n:[x+w/2,y],ne:[x+w,y],e:[x+w,y+h/2],se:[x+w,y+h],s:[x+w/2,y+h],sw:[x,y+h],w:[x,y+h/2]};
        for(const [name,[hx,hy]] of Object.entries(handles)){const cursor=name==='n'||name==='s'?'ns-resize':name==='e'||name==='w'?'ew-resize':name==='nw'||name==='se'?'nwse-resize':'nesw-resize';markup+=`<circle data-item="${esc(selected.id)}" data-handle="${name}" cx="${hx}" cy="${hy}" r="${r}" fill="#ffffff" stroke="${color}" stroke-width="${sw}" style="cursor:${cursor}" pointer-events="all"/>`;}
      }
    }
    return markup;
  }
  function renderStage(){
    if(!state.project)return;
    fitStage();
    const loc=positionAt(state.time),s=state.preview?loc.scene:scene();
    const vis=state.preview?visualAt(s,loc.local):{camera:{cx:800,cy:450,zoom:1},visible:s.items.filter(x=>x.type!=='camera').map(it=>({it,progress:1,active:false}))};
    const box=state.preview?(state.previewCameraBox||cameraBox(vis.camera)):editorBox();
    $('#stage').setAttribute('viewBox',box.join(' '));
    $('#stage').style.cursor=!state.preview&&state.tool==='pan'?(state.drag?.mode==='pan'?'grabbing':'grab'):'default';
    $('#stage').innerHTML=renderMarkup(s,vis,!state.preview,box);
    $('#sceneNumber').textContent=String((state.preview?loc.index:state.sceneIndex)+1).padStart(2,'0');
    $('#sceneTitle').textContent=s.name;
    $('#modeLabel').textContent=state.preview?(state.previewCameraBox?'Previewing locked camera frame':'Previewing video'):(state.tool==='pan'?'Panning whiteboard':'Editing whiteboard');
    $('#zoomLabel').textContent=`${Math.round(1600/state.editorView.w*100)}%`;
    $('#emptyHint').classList.toggle('hidden',s.items.some(x=>x.type!=='camera'));
  }
  function fitStage(){
    const host=$('#canvasShell'),svg=$('#stage'),ratio=state.project.ratio==='1:1'?1:state.project.ratio==='9:16'?9/16:16/9;
    if(state.preview){const w=Math.min(Math.max(100,host.clientWidth-56),Math.max(100,host.clientHeight-32)*ratio);svg.style.width=`${w}px`;svg.style.height=`${w/ratio}px`;svg.style.aspectRatio=String(ratio);}
    else{svg.style.width=`${Math.max(100,host.clientWidth-56)}px`;svg.style.height=`${Math.max(100,host.clientHeight-32)}px`;svg.style.aspectRatio='auto';}
  }
  function saveEditorView(){state.project.editorView={...state.editorView};state.project.updated=Date.now();clearTimeout(state.saveTimer);state.saveTimer=setTimeout(saveProject,450);}
  function projectView(p){const v=p.editorView||{};return {cx:num(v.cx,800),cy:num(v.cy,450),w:clamp(num(v.w,1600),200,30000)};}
  function zoomEditor(factor){if(state.preview)stopPreview();state.editorView.w=clamp(state.editorView.w*factor,200,30000);saveEditorView();renderStage();}
  function fitContent(){
    if(state.preview)stopPreview();
    const boxes=scene().items.map(it=>it.type==='camera'?cameraBox(it):[it.x,it.y,it.w,it.h]);
    if(!boxes.length){state.editorView={cx:800,cy:450,w:1600};}
    else{const left=Math.min(...boxes.map(b=>b[0])),top=Math.min(...boxes.map(b=>b[1])),right=Math.max(...boxes.map(b=>b[0]+b[2])),bottom=Math.max(...boxes.map(b=>b[1]+b[3]));const stage=$('#stage'),aspect=(stage.clientWidth||1600)/(stage.clientHeight||900);state.editorView={cx:(left+right)/2,cy:(top+bottom)/2,w:clamp(Math.max(800,(right-left)*1.22,(bottom-top)*aspect*1.22),200,30000)};}
    saveEditorView();renderStage();
  }
  function tileLabel(it){return it.type==='icon'?ICONS[it.icon]?.name||it.label||'Drawing':it.type==='text'?(it.text||'Text').split('\n')[0]:it.type==='camera'?'Camera move':it.type==='shape'?'Shape':it.type==='image'?(it.label||'Uploaded image'):'Drawing';}
  // Timeline tiles are as wide as their duration (with a minimum so labels fit), followed by a striped tail for the pause.
  const TIMELINE_PX=56,TILE_MIN=84,TILE_GAP=6,PAUSE_MIN=8;let timelineBoxes=[];
  function timelineLayout(){
    let x=0,t=0;
    return scene().items.map(it=>{const d=Math.max(.1,num(it.duration,1)),p=Math.max(0,num(it.pause)),body=Math.max(TILE_MIN,d*TIMELINE_PX),tail=Math.max(PAUSE_MIN,p*TIMELINE_PX),box={it,x,body,tail,t0:t,d,p};x+=body+tail+TILE_GAP;t+=d+p;return box;});
  }
  // Scene time to strip position and back. Inside a tile, time runs evenly across its body and then across its pause.
  function timelineX(local){
    for(const b of timelineBoxes){if(local<=b.t0+b.d)return b.x+clamp((local-b.t0)/b.d,0,1)*b.body;if(local<=b.t0+b.d+b.p)return b.x+b.body+(local-b.t0-b.d)/b.p*b.tail;}
    const last=timelineBoxes[timelineBoxes.length-1];return last?last.x+last.body+last.tail:0;
  }
  function timelineTime(x){
    for(const b of timelineBoxes){if(x<b.x)return b.t0;if(x<=b.x+b.body)return b.t0+(x-b.x)/b.body*b.d;if(x<=b.x+b.body+b.tail)return b.t0+b.d+(b.p?(x-b.x-b.body)/b.tail*b.p:0);}
    return sceneLen(scene());
  }
  function tileThumb(it){
    const svg=(vb,body)=>`<svg viewBox="${vb.join(' ')}" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
    if(it.type==='image'&&it.src)return `<img src="${esc(it.src)}" alt="">`;
    if(it.type==='icon'){const paths=it.icon?ICONS[it.icon]?.paths||[]:it.iconPaths||[],vb=it.icon?[0,0,100,100]:it.vb||[0,0,24,24];return svg(vb,paths.map(d=>`<path d="${esc(d)}" stroke="${esc(safePaint(it.color,'#285d63'))}" stroke-width="${vb[2]/12}"/>`).join(''));}
    if(it.type==='vector')return svg(it.vb||[0,0,100,100],(it.paths||[]).slice(0,40).map(p=>`<path d="${esc(p.d)}" stroke="${esc(safePaint(p.stroke,'#285d63'))}" fill="${esc(safePaint(p.fill,'none'))}" stroke-width="${(it.vb||[0,0,100])[2]/25}"/>`).join(''));
    if(it.type==='shape')return svg([0,0,10,10],it.shape==='circle'?`<ellipse cx="5" cy="5" rx="4.5" ry="3.6" fill="${esc(safePaint(it.fill,'#cde9df'))}"/>`:`<rect x=".5" y="1.5" width="9" height="7" rx="${it.shape==='round'?2:0}" fill="${esc(safePaint(it.fill,'#cde9df'))}"/>`);
    if(it.type==='text')return `<span class="thumb-text" style="color:${esc(safePaint(it.color,'#213b4b'))};font-family:'${esc(HANDWRITING_FONTS[it.font]||'DM Sans')}',sans-serif">${esc([...String(it.text||'Aa').trim()].slice(0,2).join('')||'Aa')}</span>`;
    return '<span class="thumb-text">▣</span>';
  }
  function renderTimeline(){renderTimelineStrips();renderAudioEditor();renderTimelineClock();}
  function renderTimelineStrips(){
    $('#sceneStrip').innerHTML=state.project.scenes.map((s,i)=>`<button class="scene-tile ${i===state.sceneIndex?'active':''}" data-scene="${i}" title="Drag to reorder scenes"><span class="scene-number">${String(i+1).padStart(2,'0')}</span><span class="scene-name">${esc(s.name)}</span><span class="scene-length">${fmt(sceneLen(s))}</span></button>`).join('');
    timelineBoxes=timelineLayout();
    const width=timelineBoxes.length?timelineX(Infinity)+TILE_GAP:0,len=sceneLen(scene()),every=[1,2,5,10,15,30,60].find(s=>s*TIMELINE_PX>=44)||60;
    let ticks='';for(let t=0;t<=len+1e-6;t+=every)ticks+=`<span class="tick" style="left:${timelineX(t)}px">${Math.round(t)}s</span>`;
    const tiles=timelineBoxes.map(b=>{const it=b.it,sel=it.id===state.selected,idAttr=esc(it.id);
      return `<button class="item-tile ${sel?'selected':''} ${it.type==='camera'?'camera':''}" data-item="${idAttr}" style="left:${b.x}px;width:${b.body+b.tail}px" title="${esc(tileLabel(it))} · ${b.d.toFixed(1)}s${b.p?` + ${b.p.toFixed(1)}s pause`:''}">
        <span class="tile-body" style="width:${b.body}px"><span class="tile-top"><span class="thumb">${tileThumb(it)}</span><span class="item-duration">${b.d.toFixed(1)}s</span></span><span class="item-name">${esc(tileLabel(it))}</span><span class="tile-handle" data-handle-kind="duration" data-item="${idAttr}" title="Drag to change how long it takes"></span></span>
        <span class="tile-pause ${b.p?'':'empty'}" style="width:${b.tail}px"><span class="tile-handle" data-handle-kind="pause" data-item="${idAttr}" title="Drag to change the pause after it"></span></span></button>`;}).join('');
    $('#itemStrip').innerHTML=`<div class="strip-inner" style="width:${Math.max(width,1)}px"><div class="time-ruler" data-ruler title="Click or drag to move the playhead">${ticks}</div><div class="item-row">${tiles}</div><div id="playhead" class="playhead" hidden></div></div>`;
  }
  // The light, per-frame part of the timeline: clock, scrubber, buttons and the playhead.
  function renderTimelineClock(){
    const len=totalLen();$('#durationLabel').textContent=fmt(len);$('#timeLabel').textContent=`${fmt(state.time)} / ${fmt(len)}`;
    $('#scrubber').value=len?Math.round(state.time/len*1000):0;$('#scrubPercent').textContent=`${len?Math.round(state.time/len*100):0}%`;
    const audioHead=$('#audioPlayhead');if(audioHead){const x=state.time*audioScale(),lane=$('#audioScroll');audioHead.style.left=`${x}px`;audioHead.hidden=!(state.preview||state.time>0);
      if(state.playing&&lane&&(x<lane.scrollLeft+20||x>lane.scrollLeft+lane.clientWidth-40))lane.scrollLeft=Math.max(0,x-lane.clientWidth*.3);}
    $('#playBtn').textContent=state.playing?'Ⅱ':'▶';$('#previewBtn').innerHTML=state.playing?'Ⅱ <span>Pause</span>':'▶ <span>Preview</span>';
    $('#stopBtn').disabled=$('#topStopBtn').disabled=!state.preview&&state.time===0;
    const head=$('#playhead');if(!head)return;
    const loc=positionAt(state.time),show=(state.preview||state.time>0)&&loc.index===state.sceneIndex;head.hidden=!show;
    if(show){const x=timelineX(loc.local),strip=$('#itemStrip');head.style.left=`${x}px`;
      // Keep the playhead in view while the video plays.
      if(state.playing&&(x<strip.scrollLeft+20||x>strip.scrollLeft+strip.clientWidth-40))strip.scrollLeft=Math.max(0,x-strip.clientWidth*.3);}
  }
  // Drag-to-reorder for a strip of tiles: the dragged tile follows the pointer, the others slide aside to show where it
  // will land, and the strip scrolls when the pointer nears its edges. Escape cancels. A press without movement stays
  // an ordinary click.
  let suppressTileClick=false;
  function sortable(strip,{tiles,axis,onDrop,onHover}){
    strip.addEventListener('pointerdown',e=>{
      if(e.button!==0||e.target.closest('[data-handle-kind],[data-ruler]'))return;
      const tile=e.target.closest(tiles);if(!tile||!strip.contains(tile))return;
      const list=[...strip.querySelectorAll(tiles)],from=list.indexOf(tile),across=axis==='x',pos=ev=>across?ev.clientX:ev.clientY,start=pos(e);
      const scrollOf=()=>across?strip.scrollLeft:strip.scrollTop,scroll0=scrollOf(),boxes=list.map(el=>{const r=el.getBoundingClientRect();return across?[r.left,r.width]:[r.top,r.height];});
      const step=boxes[from][1]+(list.length>1?Math.max(0,across?TILE_GAP:Math.abs(boxes[1][0]-boxes[0][0])-boxes[0][1]):0);
      let dragging=false,to=from,frame=0,pointer=start,last=e;
      const layout=()=>{
        const delta=pointer-start+scrollOf()-scroll0,center=boxes[from][0]+boxes[from][1]/2+delta;
        tile.style.transform=across?`translateX(${delta}px)`:`translateY(${delta}px)`;
        to=list.reduce((n,el,i)=>n+(i!==from&&boxes[i][0]+boxes[i][1]/2<center?1:0),0);
        list.forEach((el,i)=>{if(i===from)return;const shift=from<to&&i>from&&i<=to?-step:from>to&&i>=to&&i<from?step:0;el.style.transform=shift?(across?`translateX(${shift}px)`:`translateY(${shift}px)`):'';});
        onHover?.(document.elementFromPoint(last.clientX,last.clientY));
      };
      const autoscroll=()=>{const r=strip.getBoundingClientRect(),lo=across?r.left:r.top,hi=across?r.right:r.bottom,speed=pointer<lo+40?-(lo+40-pointer)/3:pointer>hi-40?(pointer-hi+40)/3:0;
        if(speed){if(across)strip.scrollLeft+=speed;else strip.scrollTop+=speed;layout();}frame=requestAnimationFrame(autoscroll);};
      const move=ev=>{if(ev.pointerId!==e.pointerId)return;pointer=pos(ev);last=ev;
        if(!dragging){if(Math.abs(pointer-start)<5)return;dragging=true;strip.classList.add('sorting');tile.classList.add('lifted');frame=requestAnimationFrame(autoscroll);}
        layout();};
      const finish=(ev,cancel)=>{
        window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancelled);window.removeEventListener('keydown',key,true);
        cancelAnimationFrame(frame);if(!dragging)return;
        strip.classList.remove('sorting');tile.classList.remove('lifted');list.forEach(el=>{el.style.transform='';});onHover?.(null);
        suppressTileClick=true;setTimeout(()=>{suppressTileClick=false;},0);
        if(!cancel)onDrop(from,to,document.elementFromPoint(ev.clientX,ev.clientY));
      };
      const up=ev=>{if(ev.pointerId===e.pointerId)finish(ev,false);},cancelled=ev=>{if(ev.pointerId===e.pointerId)finish(ev,true);},key=ev=>{if(ev.key==='Escape'&&dragging){ev.stopPropagation();finish(last,true);}};
      window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',cancelled);window.addEventListener('keydown',key,true);
    });
  }
  function bindTimeline(){
    sortable($('#itemStrip'),{tiles:'.item-tile',axis:'x',
      onHover:el=>{const target=el?.closest?.('#sceneStrip [data-scene]');document.querySelectorAll('#sceneStrip .drop-target').forEach(b=>{if(b!==target)b.classList.remove('drop-target');});if(target&&+target.dataset.scene!==state.sceneIndex)target.classList.add('drop-target');},
      onDrop:(from,to,over)=>{
        const items=scene().items,moved=items[from],target=over?.closest?.('#sceneStrip [data-scene]');
        // Dropping on another scene moves the item to the end of that scene.
        if(target&&+target.dataset.scene!==state.sceneIndex){snapshot();items.splice(from,1);state.project.scenes[+target.dataset.scene].items.push(moved);state.selected=null;changed();toast(`Moved to ${state.project.scenes[+target.dataset.scene].name}.`);return;}
        if(to===from)return;snapshot();items.splice(to,0,items.splice(from,1)[0]);state.selected=moved.id;changed();}});
    sortable($('#sceneStrip'),{tiles:'.scene-tile',axis:'y',onDrop:(from,to)=>{
      if(to===from)return;const current=scene();snapshot();state.project.scenes.splice(to,0,state.project.scenes.splice(from,1)[0]);state.sceneIndex=state.project.scenes.indexOf(current);state.time=sceneStart(state.sceneIndex);changed();}});
    // Edge handles change an item's duration or the pause after it, in tenths of a second, while dragging.
    $('#itemStrip').addEventListener('pointerdown',e=>{
      const handle=e.target.closest('[data-handle-kind]');if(!handle||e.button!==0)return;e.preventDefault();
      const it=scene().items.find(x=>x.id===handle.dataset.item),key=handle.dataset.handleKind,start=e.clientX,original=num(it?.[key],key==='duration'?1:0);if(!it)return;
      let took=false;document.body.classList.add('resizing-timeline');
      const move=ev=>{if(ev.pointerId!==e.pointerId)return;const value=Math.round(clamp(original+(ev.clientX-start)/TIMELINE_PX,key==='duration'?.1:0,60)*10)/10;if(value===num(it[key]))return;
        if(!took){snapshot();took=true;}it[key]=value;renderTimeline();if(state.preview)renderStage();};
      const up=ev=>{if(ev.pointerId!==e.pointerId)return;window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);document.body.classList.remove('resizing-timeline');
        suppressTileClick=true;setTimeout(()=>{suppressTileClick=false;},0);if(took){changed(false);if(state.selected===it.id)renderInspector();}};
      window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);
    });
    // The ruler above the tiles scrubs the preview through the current scene.
    $('#itemStrip').addEventListener('pointerdown',e=>{
      const ruler=e.target.closest('[data-ruler]');if(!ruler||e.button!==0)return;e.preventDefault();
      const at=ev=>seek(sceneStart(state.sceneIndex)+timelineTime(ev.clientX-ruler.getBoundingClientRect().left));at(e);
      const move=ev=>{if(ev.pointerId===e.pointerId)at(ev);},up=ev=>{if(ev.pointerId!==e.pointerId)return;window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);};
      window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);
    });
    $('#sceneStrip').addEventListener('click',e=>{const b=e.target.closest('[data-scene]');if(!b||suppressTileClick)return;stopPreview();state.sceneIndex=+b.dataset.scene;state.selected=null;state.time=sceneStart(state.sceneIndex);renderAll();});
    $('#itemStrip').addEventListener('click',e=>{const b=e.target.closest('.item-tile');if(b&&!suppressTileClick){stopPreview();selectItem(b.dataset.item);}});
  }
  // Audio: clips on two lanes, music and narration, placed anywhere on the whole video's timeline. A clip plays a stretch
  // (offset, length) of one of the project's audio files at a volume, with optional fades. Preview and export mix the
  // clips with the Web Audio API, and the preview clock follows the audio clock so drawing and sound stay in step.
  const AUDIO_LANES=['Music','Narration'],AUDIO_MIN=.2;
  const audio={ctx:null,loading:new Map(),ready:new Map(),peaks:new Map(),voices:[],zoom:null,clockStart:0,timeStart:0};
  const audioClips=()=>state.project.audioClips||(state.project.audioClips=[]);
  const audioFile=clip=>state.project.audioFiles?.[clip.file];
  const clipById=clipId=>audioClips().find(c=>c.id===clipId)||null;
  const clipLength=clip=>Math.max(0,num(clip.length,num(audioFile(clip)?.duration,0)-num(clip.offset)));
  function audioContext(){return audio.ctx??=new AudioContext();}
  // Decodes a project audio file once; its duration and waveform peaks are kept for the editor.
  function loadAudioFile(file){
    if(!audio.loading.has(file.src))audio.loading.set(file.src,fetch(file.src).then(r=>r.arrayBuffer()).then(data=>audioContext().decodeAudioData(data)).then(buffer=>{
      audio.ready.set(file.src,buffer);
      const rate=100,data=buffer.getChannelData(0),step=Math.max(1,Math.floor(buffer.sampleRate/rate)),peaks=new Float32Array(Math.ceil(data.length/step));
      for(let i=0;i<peaks.length;i++){let m=0;for(let j=i*step,e=Math.min(data.length,j+step);j<e;j+=4)m=Math.max(m,Math.abs(data[j]));peaks[i]=m;}
      let top=0;for(const p of peaks)top=Math.max(top,p);if(top>0)for(let i=0;i<peaks.length;i++)peaks[i]/=top;audio.peaks.set(file.src,peaks);
      return buffer;}).catch(e=>{audio.loading.delete(file.src);throw e;}));
    return audio.loading.get(file.src);
  }
  async function prepareAudio(){
    const files=Object.values(state.project.audioFiles||{});
    await Promise.all(files.map(file=>loadAudioFile(file).then(buffer=>{file.duration=buffer.duration;}).catch(e=>console.error('Could not decode audio',e))));
    for(const clip of audioClips())if(clip.length==null&&audioFile(clip)?.duration)clip.length=Math.max(AUDIO_MIN,audioFile(clip).duration-num(clip.offset));
    renderTimeline();if(state.tool==='audio'||state.selectedClip)renderInspector();
  }
  // Starts every clip that sounds at or after video time `at`, returning the audio-clock time that matches `at`.
  function startClips(at,destination){
    stopClips();const ctx=audioContext(),now=ctx.currentTime+.05;
    for(const clip of audioClips()){
      const file=audioFile(clip),buffer=file&&audio.ready.get(file.src),length=clipLength(clip);if(!buffer||length<=0||clip.start+length<=at)continue;
      const into=Math.max(0,at-clip.start),when=now+Math.max(0,clip.start-at),source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;
      const v=clamp(num(clip.volume,1),0,2),fadeIn=Math.min(num(clip.fadeIn),length/2),fadeOut=Math.min(num(clip.fadeOut),length/2),level=t=>v*Math.min(1,fadeIn?t/fadeIn:1,fadeOut?(length-t)/fadeOut:1);
      gain.gain.setValueAtTime(level(into),when);
      if(fadeIn>into)gain.gain.linearRampToValueAtTime(v,when+fadeIn-into);
      if(fadeOut){if(length-fadeOut>into)gain.gain.setValueAtTime(v,when+length-fadeOut-into);gain.gain.linearRampToValueAtTime(0,when+length-into);}
      source.connect(gain).connect(destination||ctx.destination);source.start(when,num(clip.offset)+into,length-into);audio.voices.push(source);
    }
    return now;
  }
  function stopClips(){for(const v of audio.voices){try{v.stop();}catch{}}audio.voices=[];}
  const hasAudio=()=>audioClips().some(c=>{const f=audioFile(c);return f&&audio.ready.has(f.src)&&clipLength(c)>0;});
  // Editor scale in pixels per second: fits the whole video by default, or the chosen zoom.
  function audioScale(){
    const span=Math.max(totalLen(),...audioClips().map(c=>c.start+clipLength(c)),1),width=Math.max(200,($('#audioScroll')?.clientWidth||800)-30);
    return audio.zoom??Math.max(2,width/span);
  }
  function waveformPath(clip,px){
    const file=audioFile(clip),peaks=file&&audio.peaks.get(file.src);if(!peaks)return '';
    const w=clipLength(clip)*px,step=Math.max(2,w/2500);let d='';
    for(let x=0;x<w;x+=step){const a=Math.floor((num(clip.offset)+x/px)*100),b=Math.max(a+1,Math.floor((num(clip.offset)+(x+step)/px)*100));let m=0;for(let i=a;i<b&&i<peaks.length;i++)m=Math.max(m,peaks[i]);const h=Math.max(.5,m*13);d+=`M${x.toFixed(1)} ${(15-h).toFixed(1)}V${(15+h).toFixed(1)}`;}
    return d;
  }
  function renderAudioEditor(){
    const host=$('#audioEditor');if(!host)return;
    const scroll=$('#audioScroll')?.scrollLeft||0,px=audioScale(),video=totalLen(),span=Math.max(video,...audioClips().map(c=>c.start+clipLength(c)),1),width=span*px+40;
    const every=[.5,1,2,5,10,15,30,60,120,300].find(s=>s*px>=46)||600;let ruler='';
    for(let t=0;t<=span+1e-6;t+=every)ruler+=`<span class="tick" style="left:${t*px}px">${every<1?`${t.toFixed(1)}s`:fmt(t)}</span>`;
    state.project.scenes.forEach((s,i)=>{ruler+=`<span class="scene-mark" style="left:${sceneStart(i)*px}px" title="${esc(s.name)}">${String(i+1).padStart(2,'0')} ${esc(s.name)}</span>`;});
    const lanes=AUDIO_LANES.map((name,lane)=>`<div class="audio-lane" data-lane="${lane}">${audioClips().filter(c=>(c.lane||0)===lane).map(c=>{
      const len=clipLength(c),w=Math.max(4,len*px),file=audioFile(c);
      return `<div class="audio-clip ${c.id===state.selectedClip?'selected':''} lane-${lane}" data-clip="${esc(c.id)}" style="left:${c.start*px}px;width:${w}px" title="${esc(file?.name||'Audio')} · ${fmt(c.start)}–${fmt(c.start+len)}">
        <svg class="wave" viewBox="0 0 ${w} 30" preserveAspectRatio="none"><path d="${waveformPath(c,px)}"/></svg>
        ${num(c.fadeIn)?`<span class="clip-fade in" style="width:${Math.min(w/2,num(c.fadeIn)*px)}px"></span>`:''}${num(c.fadeOut)?`<span class="clip-fade out" style="width:${Math.min(w/2,num(c.fadeOut)*px)}px"></span>`:''}
        <span class="clip-name">${esc(file?.name||'Audio')}${num(c.volume,1)!==1?` · ${Math.round(num(c.volume,1)*100)}%`:''}</span>
        <span class="clip-edge left" data-clip-edge="left" title="Drag to trim the start"></span><span class="clip-edge right" data-clip-edge="right" title="Drag to trim the end"></span></div>`;}).join('')}</div>`).join('');
    host.innerHTML=`<div class="audio-head"><span class="audio-title">♫ AUDIO</span><button class="mini-chip" data-audio-add="0">+ Music</button><button class="mini-chip" data-audio-add="1">+ Narration</button><button class="mini-chip ${state.recording?'recording':''}" data-audio-record>${state.recording?'■ Stop recording':'● Record at playhead'}</button><span class="audio-hint">Drag clips to move · drag edges to trim</span><span class="audio-zoom"><button class="mini-chip" data-audio-zoom="out" title="Zoom out">−</button><button class="mini-chip" data-audio-zoom="fit" title="Fit the whole video">Fit</button><button class="mini-chip" data-audio-zoom="in" title="Zoom in">+</button></span></div>
      <div class="audio-body"><div class="audio-labels"><span class="ruler-spacer"></span>${AUDIO_LANES.map(n=>`<span class="lane-label">${n}</span>`).join('')}</div><div id="audioScroll" class="audio-scroll"><div class="audio-inner" style="width:${width}px"><div class="audio-ruler" data-audio-ruler title="Click or drag to move the playhead">${ruler}</div>${lanes}<div class="video-end" style="left:${video*px}px" title="End of the video"></div><div id="audioPlayhead" class="playhead"></div></div></div></div>`;
    $('#audioScroll').scrollLeft=scroll;
  }
  function audioPanel(){
    return `<div class="panel-eyebrow">SOUND</div><h2 class="panel-title">Audio</h2><p class="panel-help">Place music and narration clips anywhere on the video. Drag them in the audio lanes below the drawings.</p><div class="panel-actions"><button class="button primary" data-audio-add="0">Add music</button><button class="panel-action" data-audio-add="1">Add narration</button><button class="panel-action" data-audio-record>${state.recording?'■ Stop recording':'● Record at playhead'}</button></div><div class="panel-divider"></div>
      ${audioClips().length?audioClips().map(c=>`<button class="audio-list-item" data-select-clip="${esc(c.id)}"><span>${AUDIO_LANES[c.lane||0]}</span><strong>${esc(audioFile(c)?.name||'Audio')}</strong><small>${fmt(c.start)} – ${fmt(c.start+clipLength(c))}</small></button>`).join(''):'<div class="note-card">Tip: Record at playhead plays the video while you speak, so your narration lines up with the drawing.</div>'}`;
  }
  function clipPanel(clip){
    const file=audioFile(clip),len=clipLength(clip),f=(label,key,value,attrs)=>`<div class="field"><label>${label}</label><input data-clip-set="${key}" type="number" value="${value}" ${attrs}></div>`;
    return `<div class="panel-eyebrow">AUDIO CLIP</div><h2 class="panel-title">${esc(file?.name||'Audio')}</h2><p class="panel-help">${AUDIO_LANES[clip.lane||0]} lane · plays ${fmt(clip.start)} – ${fmt(clip.start+len)}${file?.duration?` of a ${fmt(file.duration)} file`:''}</p>
      <div class="field"><label>Volume <span id="clipVolumeLabel">${Math.round(num(clip.volume,1)*100)}%</span></label><input data-clip-set="volume" type="range" min="0" max="2" step="0.01" value="${num(clip.volume,1)}"></div>
      <div class="field-row">${f('Fade in (sec)','fadeIn',num(clip.fadeIn),'min="0" max="30" step="0.1"')}${f('Fade out (sec)','fadeOut',num(clip.fadeOut),'min="0" max="30" step="0.1"')}</div>
      <div class="field-row">${f('Starts at (sec)','start',+clip.start.toFixed(2),'min="0" step="0.1"')}${f('Length (sec)','length',+len.toFixed(2),`min="${AUDIO_MIN}" step="0.1"`)}</div>
      ${selectField('Lane','lane',String(clip.lane||0),AUDIO_LANES.map((n,i)=>[String(i),n])).replace('data-set="lane"','data-clip-set="lane"')}
      <div class="panel-divider"></div><div class="panel-actions"><button class="panel-action" data-clip-action="split">Split at playhead</button><button class="panel-action" data-clip-action="duplicate">Duplicate</button><button class="panel-action danger" data-clip-action="delete">Delete</button></div>`;
  }
  function selectClip(clipId){state.selectedClip=clipId;state.selected=null;renderTimeline();renderInspector();}
  function applyClipField(key,value){
    const clip=clipById(state.selectedClip);if(!clip)return;const file=audioFile(clip),n=num(value,0);
    if(key==='volume'){clip.volume=clamp(n,0,2);const label=$('#clipVolumeLabel');if(label)label.textContent=`${Math.round(clip.volume*100)}%`;}
    else if(key==='fadeIn'||key==='fadeOut')clip[key]=clamp(n,0,30);
    else if(key==='start')clip.start=Math.max(0,n);
    else if(key==='length')clip.length=clamp(n,AUDIO_MIN,file?.duration?file.duration-num(clip.offset):3600);
    else if(key==='lane')clip.lane=clamp(Math.round(n),0,AUDIO_LANES.length-1);
    changed(false);
  }
  function clipAction(name){
    const clips=audioClips(),clip=clipById(state.selectedClip);if(!clip)return;snapshot();
    if(name==='delete'){clips.splice(clips.indexOf(clip),1);state.selectedClip=null;}
    if(name==='duplicate'){const copy={...clip,id:id(),start:clip.start+clipLength(clip)};clips.push(copy);state.selectedClip=copy.id;}
    if(name==='split'){const at=state.time-clip.start,len=clipLength(clip);if(at<=AUDIO_MIN||at>=len-AUDIO_MIN){toast('Move the playhead inside the clip to split it.');return;}
      const rest={...clip,id:id(),start:state.time,offset:num(clip.offset)+at,length:len-at,fadeIn:0};clip.length=at;clip.fadeOut=0;clips.push(rest);state.selectedClip=rest.id;}
    changed();
  }
  async function uploadAudio(file,lane=0){
    if(!file)return;if(file.size>25*1024*1024){toast('Choose an audio file under 25 MB.');return;}
    try{await addAudioClip(file.name,await readFile(file),lane,lane===0?Math.max(0,...audioClips().filter(c=>(c.lane||0)===0).map(c=>c.start+clipLength(c))):state.time);toast('Audio added.');}
    catch(e){console.error(e);toast('Could not read that audio file.');}
  }
  async function addAudioClip(name,src,lane,start){
    const file={name,src,duration:null},buffer=await loadAudioFile(file);file.duration=buffer.duration;
    snapshot();const fileId=id();(state.project.audioFiles||(state.project.audioFiles={}))[fileId]=file;
    const clip={id:id(),file:fileId,lane,start:Math.max(0,start),offset:0,length:buffer.duration,volume:1,fadeIn:0,fadeOut:0};audioClips().push(clip);
    state.selectedClip=clip.id;state.selected=null;changed();
  }
  // Records narration while the video plays from the playhead, then places it where the recording began.
  async function recordAudio(){
    if(state.recording){state.recording.recorder.stop();return;}
    if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){toast('Microphone recording is unavailable in this browser.');return;}
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true}),chunks=[],recorder=new MediaRecorder(stream),startAt=state.time>=totalLen()-.01?0:state.time;
      state.recording={stream,recorder};recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      recorder.onstop=async()=>{stream.getTracks().forEach(t=>t.stop());state.recording=null;if(state.playing)pause();
        const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});
        if(blob.size){try{await addAudioClip('Recorded narration',await readFile(blob),1,startAt);toast('Narration saved.');}catch(e){console.error(e);toast('Could not save the recording.');}}else{renderTimeline();renderInspector();}};
      recorder.start();state.time=startAt;renderTimeline();renderInspector();toast('Recording… speak along with the video.');if(!state.playing)play();
    }catch(e){toast('Microphone access was not available.');}
  }
  function bindAudio(){
    const host=$('#audioEditor');
    const panelClick=e=>{const add=e.target.closest('[data-audio-add]'),rec=e.target.closest('[data-audio-record]'),zoom=e.target.closest('[data-audio-zoom]'),pick=e.target.closest('[data-select-clip]'),act=e.target.closest('[data-clip-action]');
      if(add){state.audioLane=+add.dataset.audioAdd;$('#audioInput').click();}
      if(rec)recordAudio();
      if(zoom){const z=zoom.dataset.audioZoom,px=audioScale();audio.zoom=z==='fit'?null:clamp(px*(z==='in'?1.6:1/1.6),2,400);renderAudioEditor();renderTimelineClock();}
      if(pick)selectClip(pick.dataset.selectClip);
      if(act)clipAction(act.dataset.clipAction);};
    host.addEventListener('click',panelClick);$('#inspector').addEventListener('click',panelClick);
    $('#inspector').addEventListener('input',e=>{if(e.target.matches('[data-clip-set]'))applyClipField(e.target.dataset.clipSet,e.target.value);});
    $('#inspector').addEventListener('change',e=>{if(e.target.matches('[data-clip-set]')){applyClipField(e.target.dataset.clipSet,e.target.value);renderInspector();}});
    $('#inspector').addEventListener('focusin',e=>{if(e.target.matches('[data-clip-set]'))snapshot();});
    // Dragging a clip moves it (and between lanes); dragging an edge trims it. Moves snap to the playhead, scene
    // starts and other clips' edges when close.
    host.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;const ruler=e.target.closest('[data-audio-ruler]'),el=e.target.closest('[data-clip]'),lane=e.target.closest('[data-lane]');
      const timeAt=ev=>Math.max(0,(ev.clientX-$('#audioScroll .audio-inner').getBoundingClientRect().left)/audioScale());
      if(ruler||(!el&&lane)){e.preventDefault();if(!ruler&&state.selectedClip){state.selectedClip=null;renderInspector();}
        const at=ev=>seek(Math.min(totalLen(),timeAt(ev)));at(e);
        const move=ev=>{if(ev.pointerId===e.pointerId)at(ev);},up=ev=>{if(ev.pointerId!==e.pointerId)return;window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);};
        window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);return;}
      if(!el)return;e.preventDefault();
      const clip=clipById(el.dataset.clip);if(!clip)return;if(state.selectedClip!==clip.id)selectClip(clip.id);
      const edge=e.target.closest('[data-clip-edge]')?.dataset.clipEdge,px=audioScale(),startX=e.clientX,original={...clip,length:clipLength(clip)},full=audioFile(clip)?.duration||Infinity;let took=false;
      const snapTargets=[state.time,...state.project.scenes.map((_,i)=>sceneStart(i)),...audioClips().filter(c=>c!==clip).flatMap(c=>[c.start,c.start+clipLength(c)])];
      const snap=t=>{for(const s of snapTargets)if(Math.abs(s-t)*px<8)return s;return Math.round(t*20)/20;};
      const move=ev=>{if(ev.pointerId!==e.pointerId)return;const d=(ev.clientX-startX)/px;if(!took&&Math.abs(ev.clientX-startX)<3)return;if(!took){snapshot();took=true;}
        if(edge==='left'){const shift=clamp(snap(original.start+d)-original.start,-Math.min(original.start,num(original.offset)),original.length-AUDIO_MIN);clip.start=original.start+shift;clip.offset=num(original.offset)+shift;clip.length=original.length-shift;}
        else if(edge==='right')clip.length=clamp(snap(original.start+original.length+d)-original.start,AUDIO_MIN,full-num(original.offset));
        else{const start=Math.max(0,original.start+d),end=start+original.length,at=Math.abs(snap(start)-start)<=Math.abs(snap(end)-end)?snap(start):snap(end)-original.length;clip.start=Math.max(0,at);
          const over=document.elementFromPoint(ev.clientX,ev.clientY)?.closest?.('[data-lane]');if(over)clip.lane=+over.dataset.lane;}
        renderAudioEditor();renderTimelineClock();};
      const up=ev=>{if(ev.pointerId!==e.pointerId)return;window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);if(took){changed(false);renderInspector();}};
      window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);
    });
    // The timeline panel can be dragged taller or shorter from its top edge.
    const area=$('.timeline-area'),grip=$('#timelineGrip');
    try{const saved=+localStorage.getItem('whiteboard-timeline-height');if(saved)area.style.height=`${clamp(saved,220,Math.max(260,innerHeight*.7))}px`;}catch{}
    grip.addEventListener('pointerdown',e=>{e.preventDefault();const startY=e.clientY,h0=area.getBoundingClientRect().height;document.body.classList.add('resizing-panel');
      const move=ev=>{area.style.height=`${clamp(h0-(ev.clientY-startY),220,Math.max(260,innerHeight*.7))}px`;if(audio.zoom==null)renderAudioEditor();},up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);document.body.classList.remove('resizing-panel');try{localStorage.setItem('whiteboard-timeline-height',String(Math.round(area.getBoundingClientRect().height)));}catch{}};
      window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);});
    let lastWidth=0;new ResizeObserver(()=>{const w=host.clientWidth;if(w!==lastWidth){lastWidth=w;if(audio.zoom==null)renderAudioEditor();renderTimelineClock();}}).observe(host);
  }
  const field=(label,key,val,type='text',opts='')=>`<div class="field"><label>${label}</label><input data-set="${key}" type="${type}" value="${esc(val)}" ${opts}></div>`;
  const selectField=(label,key,val,options)=>`<div class="field"><label>${label}</label><select data-set="${key}">${options.map(([v,n])=>`<option value="${v}" ${val===v?'selected':''}>${n}</option>`).join('')}</select></div>`;
  function renderInspector(){
    const it=item(),s=scene(),clip=clipById(state.selectedClip);let html='';
    if(clip&&!it)html=clipPanel(clip);
    else if(it){
      html=`<div class="panel-eyebrow">SELECTED ${it.type.toUpperCase()}</div><h2 class="panel-title">${esc(tileLabel(it))}</h2><p class="panel-help">Fine tune how this part of your story appears.</p>`;
      if(it.type==='camera'){
        html+=`<div class="panel-divider"></div>${field('Zoom','zoom',it.zoom,'number','min="0.2" max="5" step="0.05"')}<div class="field-row">${field('Center X','cx',Math.round(it.cx),'number','step="10"')}${field('Center Y','cy',Math.round(it.cy),'number','step="10"')}</div><button class="panel-action camera-preview" data-action="preview-camera">Preview this camera frame</button><p class="panel-help camera-help">Drag the green frame to pan. Drag its handles to resize the shot. Preview is cropped to this frame.</p>`;
      }else{
        if(it.type==='text')html+=`<div class="field"><label>Text</label><textarea data-set="text">${esc(it.text)}</textarea></div>${field('Font size','fontSize',it.fontSize,'number','min="16" max="180"')}<div class="field"><label>Align</label><div class="segmented">${[['left','⇤ Left'],['center','↔ Center'],['right','Right ⇥']].map(([v,n])=>`<button data-align="${v}" class="${(it.align||'left')===v?'active':''}" title="Align text ${v}">${n}</button>`).join('')}</div></div>${selectField('Writing style','font',it.font||'futural',FONT_OPTIONS)}${HANDWRITING_FONTS[it.font]?`<div class="font-sample" style="font-family:'${esc(HANDWRITING_FONTS[it.font])}',sans-serif">The quick brown fox 123</div>`:''}`;
        if(it.type==='icon'||it.type==='text'||it.type==='vector')html+=field('Color','color',it.color||'#285d63','color');
        if(it.type==='shape')html+=`${selectField('Shape','shape',it.shape,[['round','Rounded rectangle'],['rect','Rectangle'],['circle','Ellipse']])}${field('Fill','fill',it.fill,'color')}`;
        html+=`<div class="field-row">${field('X position','x',Math.round(it.x),'number','step="1"')}${field('Y position','y',Math.round(it.y),'number','step="1"')}</div><div class="field-row">${field('Width','w',Math.round(it.w),'number','min="10"')}${field('Height','h',Math.round(it.h),'number','min="10"')}</div>`;
        html+=selectField('Entrance','animation',it.animation==='reveal'?'draw':it.animation,[['draw','Hand draw'],['fade','Fade in'],['slide','Slide in'],['pop','Pop in'],['none','Appear']]);
        if(it.type==='image')html+=`<div class="note-card">${it.illustration?'The marker draws the line work first, then colors in each area. Transparent areas stay clear.':'The marker traces visible contours and fills only visible artwork. Transparent areas stay clear.'}</div>`;
      }
      html+=`<div class="panel-divider"></div><div class="field-row">${field('Duration (sec)','duration',it.duration,'number','min="0.1" max="60" step="0.1"')}${field('Pause (sec)','pause',it.pause,'number','min="0" max="60" step="0.1"')}</div><div class="panel-divider"></div><div class="panel-actions"><button class="panel-action" data-action="duplicate">Duplicate</button><button class="panel-action" data-action="back">Move earlier</button><button class="panel-action" data-action="forward">Move later</button><button class="panel-action danger" data-action="delete">Delete</button></div>`;
    }else if(state.tool==='icon'){
      html=libraryPanel();
    }else if(state.tool==='shape'){
      html=`<div class="panel-eyebrow">ELEMENTS</div><h2 class="panel-title">Shapes</h2><p class="panel-help">Simple shapes help frame your message.</p><div class="preset-grid"><button class="preset" data-shape="round">▢</button><button class="preset" data-shape="rect">□</button><button class="preset" data-shape="circle">○</button></div>`;
    }else if(state.tool==='audio'){
      html=audioPanel();
    }else{
      html=`<div class="panel-eyebrow">SCENE SETTINGS</div><h2 class="panel-title">${esc(s.name)}</h2><p class="panel-help">Build your whiteboard story, one moment at a time.</p>${field('Scene name','sceneName',s.name)}${field('Background','background',s.background,'color')}<div class="panel-divider"></div><div class="field"><label>Camera and video format</label><div class="segmented">${[['16:9','Wide'],['1:1','Square'],['9:16','Tall']].map(([v,n])=>`<button data-ratio="${v}" class="${state.project.ratio===v?'active':''}">${n}</button>`).join('')}</div></div><div class="panel-divider"></div><div class="note-card">Pan across the whiteboard to build beyond the first frame. Add camera views to choose each shot.</div><div class="panel-divider"></div><button class="panel-action danger" data-action="scene-delete" ${state.project.scenes.length===1?'disabled':''}>Delete scene</button>`;
    }
    $('#inspector').innerHTML=html;
    if(state.tool==='icon'&&!it)showLibraryResults();
  }
  function renderAll(){renderStage();renderTimeline();renderInspector();$('#projectName').value=state.project.name;$('#formatLabel').textContent=({'16:9':'16:9 · Landscape','1:1':'1:1 · Square','9:16':'9:16 · Portrait'})[state.project.ratio];document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tool===state.tool));}
  function snapshot(){state.undo.push(clone(state.project));if(state.undo.length>40)state.undo.shift();state.redo=[];}
  function changed(full=true){state.project.updated=Date.now();$('#saveStatus').textContent='Saving…';clearTimeout(state.saveTimer);state.saveTimer=setTimeout(saveProject,450);if(full)renderAll();else{renderStage();renderTimeline();}}
  function toast(message){const t=$('#toast');t.textContent=message;t.classList.remove('hidden');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.add('hidden'),3000);}
  function addItem(it){if(it.type!=='camera'){const max=state.editorView.w*.82;if(it.w>max){const f=max/it.w;it.w*=f;it.h*=f;if(it.fontSize)it.fontSize=Math.round(it.fontSize*f);}it.x=state.editorView.cx-it.w/2;it.y=state.editorView.cy-it.h/2;}snapshot();scene().items.push(it);state.selected=it.id;state.tool='select';changed();}
  function baseItem(type){return {id:id(),type,x:560,y:310,w:450,h:280,animation:'draw',duration:1.6,pause:.3};}
  function addIcon(k){addItem({...baseItem('icon'),icon:k,x:615,y:305,w:275,h:275,color:'#285d63',animation:'draw',duration:2});}
  function gridCuts(counts,parts){
    const dimension=counts.length,cuts=[0];
    for(let k=1;k<parts;k++){
      const expected=Math.round(dimension*k/parts),radius=Math.round(dimension/parts*.3),lo=Math.max(cuts[cuts.length-1]+12,expected-radius),hi=Math.min(dimension-12,expected+radius);
      let best=expected,bestScore=Infinity;
      for(let at=lo;at<=hi;at++){let score=Math.abs(at-expected)*.03;for(let j=Math.max(0,at-3);j<=Math.min(dimension-1,at+3);j++)score+=counts[j];if(score<bestScore){bestScore=score;best=at;}}
      cuts.push(best);
    }
    cuts.push(dimension);return cuts;
  }
  function separateColoredSheet(pixels,width,height,cols,rows){
    const total=width*height,labels=new Uint16Array(total),queue=new Uint32Array(total),components=[];
    for(let start=0;start<total;start++){
      if(labels[start]||pixels[start*4+3]<32)continue;
      const id=components.length+1;let head=0,tail=1,count=0,sumX=0,sumY=0,left=width,top=height,right=0,bottom=0;
      queue[0]=start;labels[start]=id;
      while(head<tail){
        const pos=queue[head++],x=pos%width,y=Math.floor(pos/width);count++;sumX+=x;sumY+=y;
        left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
        let next;
        if(x>0){next=pos-1;if(!labels[next]&&pixels[next*4+3]>=32){labels[next]=id;queue[tail++]=next;}}
        if(x<width-1){next=pos+1;if(!labels[next]&&pixels[next*4+3]>=32){labels[next]=id;queue[tail++]=next;}}
        if(y>0){next=pos-width;if(!labels[next]&&pixels[next*4+3]>=32){labels[next]=id;queue[tail++]=next;}}
        if(y<height-1){next=pos+width;if(!labels[next]&&pixels[next*4+3]>=32){labels[next]=id;queue[tail++]=next;}}
      }
      components.push({id,count,cx:sumX/count,cy:sumY/count,left,top,right,bottom});
    }
    const groups=Array.from({length:cols*rows},()=>({left:width,top:height,right:-1,bottom:-1})),componentGroup=new Uint16Array(components.length+1);
    const join=(comp,cell)=>{const group=groups[cell];componentGroup[comp.id]=cell+1;group.left=Math.min(group.left,comp.left);group.top=Math.min(group.top,comp.top);group.right=Math.max(group.right,comp.right);group.bottom=Math.max(group.bottom,comp.bottom);};
    for(const comp of components){
      if(comp.count<200)continue;
      const col=Math.min(cols-1,Math.floor(comp.cx*cols/width)),row=Math.min(rows-1,Math.floor(comp.cy*rows/height));join(comp,row*cols+col);
    }
    for(const comp of components){
      if(comp.count<12||comp.count>=200)continue;
      let best=-1,bestDistance=Infinity;
      for(let cell=0;cell<groups.length;cell++){
        const group=groups[cell];if(group.right<0)continue;
        const dx=Math.max(group.left-20-comp.right,comp.left-20-group.right,0),dy=Math.max(group.top-20-comp.bottom,comp.top-20-group.bottom,0),distance=dx*dx+dy*dy;
        if(distance<bestDistance){bestDistance=distance;best=cell;}
      }
      if(best>=0&&bestDistance<=400)join(comp,best);
    }
    if(groups.some(group=>group.right<0))throw new Error('An illustration could not be isolated');
    const drawings=[];
    for(let cell=0;cell<groups.length;cell++){
      const group=groups[cell],pad=Math.max(12,Math.round(Math.max(group.right-group.left,group.bottom-group.top)*.04));
      const left=Math.max(0,group.left-pad),top=Math.max(0,group.top-pad),right=Math.min(width-1,group.right+pad),bottom=Math.min(height-1,group.bottom+pad),w=right-left+1,h=bottom-top+1;
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      const context=canvas.getContext('2d'),crop=context.createImageData(w,h);
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        const pos=(top+y)*width+left+x,component=labels[pos],belongs=componentGroup[component]===cell+1;
        if(!belongs)continue;
        const from=pos*4,to=(y*w+x)*4;crop.data[to]=pixels[from];crop.data[to+1]=pixels[from+1];crop.data[to+2]=pixels[from+2];crop.data[to+3]=pixels[from+3];
      }
      context.putImageData(crop,0,0);drawings.push({src:canvas.toDataURL('image/png'),width:w,height:h});
    }
    return drawings;
  }
  async function sheetData(sheetIndex){
    if(sheetCache.has(sheetIndex))return sheetCache.get(sheetIndex);
    const pending=(async()=>{
      const sheet=SHEETS[sheetIndex],image=new Image();image.src=`./assets/sheets/${sheet.file}`;await image.decode();
      const width=image.naturalWidth,height=image.naturalHeight,canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
      const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,width,height).data;
      if(sheet.cols)return {drawings:separateColoredSheet(pixels,width,height,sheet.cols,sheet.rows)};
      const columns=new Uint32Array(width),rows=new Uint32Array(height);
      for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(pixels[(y*width+x)*4+3]>80){columns[x]++;rows[y]++;}
      const xs=gridCuts(columns,sheet.cols||2),ys=gridCuts(rows,sheet.rows||2),cells=[];
      for(let index=0;index<sheet.items.length;index++){
        const col=index%(sheet.cols||2),row=Math.floor(index/(sheet.cols||2)),x0=xs[col],x1=xs[col+1],y0=ys[row],y1=ys[row+1];
        let left=x1,top=y1,right=x0,bottom=y0;
        for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(pixels[(y*width+x)*4+3]>55){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
        if(right<left){cells.push([x0,y0,x1-x0,y1-y0]);continue;}
        const pad=Math.max(14,Math.round(Math.max(right-left,bottom-top)*.075));
        left=Math.max(x0,left-pad);top=Math.max(y0,top-pad);right=Math.min(x1-1,right+pad);bottom=Math.min(y1-1,bottom+pad);
        cells.push([left,top,right-left+1,bottom-top+1]);
      }
      return {image,cells};
    })().catch(e=>{sheetCache.delete(sheetIndex);throw e;});
    sheetCache.set(sheetIndex,pending);return pending;
  }
  function generateSymbolDrawing(type,index){
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
    const ctx=canvas.getContext('2d'),colors=['#ef7358','#4b9ec4','#e6ac3d','#7aaf73','#9b80c8','#e78baa','#65ada3','#d59554','#748bc5','#d87968'];
    const color=colors[index],ink='#263949';ctx.lineJoin='round';ctx.lineCap='round';
    if(type==='number'){
      ctx.font='900 350px system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.lineWidth=22;ctx.strokeStyle=ink;ctx.strokeText(String(index),256,270);
      ctx.fillStyle=color;ctx.fillText(String(index),256,270);
    }else{
      ctx.translate(256,256);
      const fillPath=(path)=>{ctx.fillStyle=color;ctx.strokeStyle=ink;ctx.lineWidth=15;ctx.stroke(path);ctx.fill(path);};
      const head=(x,y,angle)=>{ctx.save();ctx.translate(x,y);ctx.rotate(angle);const p=new Path2D();p.moveTo(0,0);p.lineTo(-85,-61);p.lineTo(-85,61);p.closePath();fillPath(p);ctx.restore();};
      if(index<=4||index===9){
        if(index!==9)ctx.rotate([0,Math.PI,-Math.PI/2,Math.PI/2,-Math.PI/4][index]);
        const p=new Path2D();
        if(index===9){p.moveTo(-195,0);p.lineTo(-80,-88);p.lineTo(-80,-39);p.lineTo(80,-39);p.lineTo(80,-88);p.lineTo(195,0);p.lineTo(80,88);p.lineTo(80,39);p.lineTo(-80,39);p.lineTo(-80,88);}
        else{p.moveTo(-190,-39);p.lineTo(75,-39);p.lineTo(75,-87);p.lineTo(195,0);p.lineTo(75,87);p.lineTo(75,39);p.lineTo(-190,39);}
        p.closePath();fillPath(p);
      }else if(index===5||index===6){
        if(index===6)ctx.scale(-1,1);
        const p=new Path2D();p.moveTo(-165,145);p.bezierCurveTo(-168,-50,-38,-130,112,-112);
        ctx.strokeStyle=ink;ctx.lineWidth=78;ctx.stroke(p);ctx.strokeStyle=color;ctx.lineWidth=59;ctx.stroke(p);head(190,-90,.2);
      }else if(index===7){
        const p=new Path2D();p.moveTo(170,145);p.lineTo(170,-30);p.bezierCurveTo(170,-172,-117,-172,-117,-30);p.lineTo(-117,88);
        ctx.strokeStyle=ink;ctx.lineWidth=78;ctx.stroke(p);ctx.strokeStyle=color;ctx.lineWidth=59;ctx.stroke(p);head(-117,183,Math.PI/2);
      }else if(index===8){
        const first=new Path2D();first.arc(0,0,132,-2.35,.38);
        const second=new Path2D();second.arc(0,0,132,.78,3.53);
        for(const p of [first,second]){ctx.strokeStyle=ink;ctx.lineWidth=65;ctx.stroke(p);ctx.strokeStyle=color;ctx.lineWidth=47;ctx.stroke(p);}
        head(124,49,1.95);head(-122,-50,-1.2);
      }
    }
    return {src:canvas.toDataURL('image/png'),width:512,height:512};
  }
  async function cropSheetDrawing(sheetIndex,drawingIndex){
    const key=`${sheetIndex}:${drawingIndex}`;if(cropCache.has(key))return cropCache.get(key);
    const pending=(async()=>{const sheet=SHEETS[sheetIndex];if(sheet.kind==='symbol')return generateSymbolDrawing(sheet.symbolType,drawingIndex);const data=await sheetData(sheetIndex);if(data.drawings)return data.drawings[drawingIndex];const {image,cells}=data,[x,y,w,h]=cells[drawingIndex],canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(image,x,y,w,h,0,0,w,h);return {src:canvas.toDataURL('image/png'),width:w,height:h};})().catch(e=>{cropCache.delete(key);throw e;});
    cropCache.set(key,pending);return pending;
  }
  function hydrateSheetThumbnails(){
    state.galleryObserver?.disconnect();
    if(!window.IntersectionObserver)return;
    state.galleryObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const button=entry.target;state.galleryObserver?.unobserve(button);cropSheetDrawing(+button.dataset.sheet,+button.dataset.sheetItem).then(art=>{const thumb=button.querySelector('.sheet-thumb');if(thumb){thumb.style.backgroundImage=`url("${art.src}")`;thumb.style.backgroundSize='contain';thumb.style.backgroundPosition='center';}}).catch(console.error);}}, {root:$('#inspector'),rootMargin:'160px'});
    document.querySelectorAll('#inspector [data-sheet-item]').forEach(button=>state.galleryObserver.observe(button));
  }
  // The Drawings library has two tabs. Illustrations: the bundled whiteboard sheets plus color illustrations from
  // Fluent Emoji Flat. Icons: the hand-drawn basics plus Tabler line icons. Both open-source sets are MIT licensed (no
  // credit needed in videos) and load the first time their tab is shown. Results show a page at a time.
  const LIBRARY_PAGE=96,ICON_STROKE=1.25,INK=[0x1f,0x2a,0x36];
  const library={tab:'art',query:'',category:'all',limit:LIBRARY_PAGE,art:null,icons:null,loading:{}};
  function loadLibrarySet(kind){
    library.loading[kind]??=fetch(kind==='art'?'./assets/illustrations/fluent-index.json':'./assets/icons/tabler-icons.json').then(r=>{if(!r.ok)throw new Error('Library did not load');return r.json();})
      .then(data=>{library[kind]=data;}).catch(e=>{delete library.loading[kind];throw e;});
    return library.loading[kind];
  }
  function libraryEntries(){
    if(library.tab==='icons'){
      const basics=iconKeys.map(k=>({kind:'basic',key:k,name:ICONS[k].name,category:'Hand-drawn basics',words:''}));
      return basics.concat((library.icons?.icons||[]).map(([name,cat,words],i)=>({kind:'tabler',i,name:name.replace(/-/g,' '),category:library.icons.categories[cat],words})));
    }
    const sheets=SHEETS.flatMap((sheet,si)=>sheet.items.map((name,ii)=>({kind:'sheet',si,ii,name,category:sheet.name,words:''})));
    return sheets.concat((library.art?.items||[]).map(([slug,name,group,words])=>({kind:'emoji',slug,name,category:group,words})));
  }
  function libraryResults(){
    const words=library.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return libraryEntries().filter(e=>(library.category==='all'||e.category===library.category)&&words.every(w=>`${e.name} ${e.category} ${e.words}`.toLowerCase().includes(w)));
  }
  function libraryThumb(e){
    if(e.kind==='sheet'){const sheet=SHEETS[e.si],cols=sheet.cols||2,rows=sheet.rows||2;return sheet.file?`<span class="sheet-thumb" style="background-image:url('./assets/sheets/${sheet.file}');background-size:${cols*100}% ${rows*100}%;background-position:${(e.ii%cols)/(cols-1)*100}% ${Math.floor(e.ii/cols)/(rows-1)*100}%"></span>`:'<span class="sheet-thumb"></span>';}
    if(e.kind==='emoji')return `<img src="./assets/illustrations/fluent/${esc(e.slug)}.svg" alt="" loading="lazy" decoding="async">`;
    const basic=e.kind==='basic',paths=basic?ICONS[e.key].paths:library.icons.icons[e.i][3];
    return `<svg viewBox="${basic?'0 0 100 100':'0 0 24 24'}" fill="none" stroke="currentColor" stroke-width="${basic?5:1.7}" stroke-linecap="round" stroke-linejoin="round">${paths.map(d=>`<path d="${esc(d)}"/>`).join('')}</svg>`;
  }
  function libraryButton(e){
    const data=e.kind==='sheet'?`data-sheet="${e.si}" data-sheet-item="${e.ii}"`:e.kind==='emoji'?`data-emoji="${esc(e.slug)}"`:e.kind==='basic'?`data-icon="${e.key}"`:`data-tabler="${e.i}"`;
    return `<button class="lib-item" ${data} title="Add ${esc(e.name)}"><span class="lib-thumb">${libraryThumb(e)}</span><span class="lib-name">${esc(e.name)}</span></button>`;
  }
  function libraryPanel(){
    const icons=library.tab==='icons',groups=icons?[['Icons',['Hand-drawn basics',...(library.icons?.categories||[]).slice().sort()]]]:[['Whiteboard drawings',SHEETS.map(s=>s.name)],['Color illustrations',library.art?.groups||[]]];
    return `<div class="panel-eyebrow">LIBRARY</div><h2 class="panel-title">Drawings</h2><div class="segmented lib-tabs">${[['art','Illustrations'],['icons','Icons']].map(([v,n])=>`<button data-lib-tab="${v}" class="${library.tab===v?'active':''}">${n}</button>`).join('')}</div>
      <div class="field"><input id="librarySearch" type="search" placeholder="Search ${icons?'icons':'illustrations'}" value="${esc(library.query)}" aria-label="Search the library"></div>
      <div class="field"><select id="libraryCategory" aria-label="Category"><option value="all">All categories</option>${groups.map(([label,list])=>`<optgroup label="${label}">${list.map(c=>`<option value="${esc(c)}" ${library.category===c?'selected':''}>${esc(c)}</option>`).join('')}</optgroup>`).join('')}</select></div>
      <p id="libraryCount" class="lib-count"></p><div id="libraryGrid" class="lib-grid ${icons?'icons':''}"></div>
      <div class="note-card">${icons?'Icons are drawn line by line with the marker in the color you choose.':'All artwork has a transparent background. Color illustrations get a marker outline and are traced, then colored in.'}</div>`;
  }
  // Fills the results grid without rebuilding the panel, so typing in the search box keeps its focus.
  function showLibraryResults(){
    const grid=$('#libraryGrid');if(!grid)return;
    const kind=library.tab==='icons'?'icons':'art';
    if(!library[kind]){grid.innerHTML='<p class="lib-count">Loading…</p>';loadLibrarySet(kind).then(()=>{if(state.tool==='icon'&&!item())renderInspector();}).catch(()=>{grid.innerHTML='<p class="lib-count">The library could not load. Check your connection and try again.</p>';});}
    const results=libraryResults(),shown=results.slice(0,library.limit);
    $('#libraryCount').textContent=results.length?`${results.length.toLocaleString()} ${results.length===1?'match':'matches'}`:'No matches. Try another word or category.';
    grid.innerHTML=shown.map(libraryButton).join('')+(results.length>shown.length?`<button class="panel-action lib-more" data-lib-more>Show ${Math.min(LIBRARY_PAGE,results.length-shown.length)} more</button>`:'');
    hydrateSheetThumbnails();
  }
  // Fluent illustrations are flat, without outlines. A dark marker outline around the shape and along strong color
  // edges makes them match the whiteboard art; the marker then traces and colors them like the other drawings.
  async function outlinedIllustration(svg){
    const image=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('Illustration did not load'));i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);});
    const S=480,M=16,W=S+M*2,color=document.createElement('canvas');color.width=color.height=W;
    const cg=color.getContext('2d',{willReadFrequently:true});cg.drawImage(image,M,M,S,S);
    const data=cg.getImageData(0,0,W,W),px=data.data,lines=new Uint8Array(W*W);
    for(let y=0;y<W-1;y++)for(let x=0;x<W-1;x++){const i=y*W+x;if(px[i*4+3]<128)continue;
      for(const j of [i+1,i+W])if(px[j*4+3]>=128&&Math.abs(px[i*4]-px[j*4])+Math.abs(px[i*4+1]-px[j*4+1])+Math.abs(px[i*4+2]-px[j*4+2])>120)lines[i]=1;}
    // Widen the color-edge lines to about 5px, like the outlines of the bundled drawings.
    for(let i=0;i<W*W;i++)if(lines[i])for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const k=i+dy*W+dx;if(dx*dx+dy*dy<=5&&k>=0&&k<W*W&&px[k*4+3]>=128){px[k*4]=INK[0];px[k*4+1]=INK[1];px[k*4+2]=INK[2];}}
    cg.putImageData(data,0,0);
    const ink=document.createElement('canvas');ink.width=ink.height=W;const ig2=ink.getContext('2d');ig2.drawImage(color,0,0);ig2.globalCompositeOperation='source-in';ig2.fillStyle=`rgb(${INK})`;ig2.fillRect(0,0,W,W);
    const out=document.createElement('canvas');out.width=out.height=W;const og=out.getContext('2d');
    for(let r=2;r<=8;r+=3)for(let a=0;a<24;a++)og.drawImage(ink,Math.cos(a*Math.PI/12)*r,Math.sin(a*Math.PI/12)*r);
    og.drawImage(color,0,0);
    return {src:out.toDataURL('image/png'),width:W,height:W};
  }
  async function addEmojiDrawing(slug){
    const name=library.art?.items.find(x=>x[0]===slug)?.[1]||'Illustration';
    try{
      const response=await fetch(`./assets/illustrations/fluent/${slug}.svg`);if(!response.ok)throw new Error('Illustration did not load');
      const art=await outlinedIllustration(await response.text()),trace=await traceImage(art.src);
      addItem(await withIllustration({...baseItem('image'),label:name,src:art.src,tracePaths:trace.paths,fillPaths:trace.fillPaths,transparentArtwork:trace.transparent,artRef:['fluent',slug],w:300,h:300,duration:2.2}));toast(`${name} added to the canvas.`);
    }catch(e){console.error(e);toast('Could not add that illustration.');}
  }
  function addTablerIcon(index){
    const [name,,,paths]=library.icons.icons[index];
    addItem({...baseItem('icon'),label:name.replace(/-/g,' ').replace(/^./,c=>c.toUpperCase()),iconPaths:paths,vb:[0,0,24,24],x:615,y:305,w:240,h:240,color:'#285d63',duration:1.8});
  }
  async function addSheetDrawing(sheetIndex,drawingIndex){
    const sheet=SHEETS[sheetIndex],name=sheet?.items[drawingIndex];if(!name)return;
    try{
      const art=await cropSheetDrawing(sheetIndex,drawingIndex),trace=await traceImage(art.src);
      let w=sheet.kind==='symbol'?250:sheet.cols?330:420,h=w*art.height/art.width;if(h>470){w*=470/h;h=470;}
      addItem(await withIllustration({...baseItem('image'),label:name,src:art.src,tracePaths:trace.paths,fillPaths:trace.fillPaths,transparentArtwork:trace.transparent,sheetRef:[sheetIndex,drawingIndex],cropVersion:2,w,h,duration:2.2}));toast(`${name} added to the canvas.`);
    }catch(e){console.error(e);toast('Could not add that illustration.');}
  }
  const GLYPH_TRACE_SIZE=160,glyphTraceCache=new Map();
  function simplifyStroke(pts,eps){
    if(pts.length<3)return pts;
    const keep=new Uint8Array(pts.length),stack=[[0,pts.length-1]];keep[0]=keep[pts.length-1]=1;
    while(stack.length){
      const [a,b]=stack.pop(),[ax,ay]=pts[a],dx=pts[b][0]-ax,dy=pts[b][1]-ay,len=Math.hypot(dx,dy);let far=-1,best=eps;
      for(let i=a+1;i<b;i++){const d=len<1e-6?Math.hypot(pts[i][0]-ax,pts[i][1]-ay):Math.abs((pts[i][0]-ax)*dy-(pts[i][1]-ay)*dx)/len;if(d>best){best=d;far=i;}}
      if(far>=0){keep[far]=1;stack.push([a,far],[far,b]);}
    }
    return pts.filter((_,i)=>keep[i]);
  }
  function relaxStroke(pts,passes){
    let p=pts;for(let k=0;k<passes;k++)p=p.map((q,i)=>i===0||i===p.length-1?q:[(p[i-1][0]+q[0]*2+p[i+1][0])/4,(p[i-1][1]+q[1]*2+p[i+1][1])/4]);
    return p;
  }
  function strokePathData(pts){
    const f=n=>n.toFixed(1);
    if(pts.length===1)return `M${f(pts[0][0])} ${f(pts[0][1])} L${f(pts[0][0]+.1)} ${f(pts[0][1])}`;
    let d=`M${f(pts[0][0])} ${f(pts[0][1])}`;
    for(let i=1;i<pts.length-1;i++)d+=` Q${f(pts[i][0])} ${f(pts[i][1])} ${f((pts[i][0]+pts[i+1][0])/2)} ${f((pts[i][1]+pts[i+1][1])/2)}`;
    const last=pts[pts.length-1];return d+` L${f(last[0])} ${f(last[1])}`;
  }
  // How each character is written by hand: strokes separated by "|", each a list of "x y" waypoints in percent of the
  // letter's ink box (y down). The pen follows the letter's own centerline from waypoint to waypoint, so the order and
  // direction match handwriting (bowls counter-clockwise from the top, "a" bowl before its stem, "e" crossbar first).
  // Strokes starting with "^" are dots and crossbars; in connected script the pen leaves a letter along its exit stroke,
  // never from one of those.
  const STROKE_GUIDES={
    a:'82 18 50 0 10 30 6 68 40 100 80 75 88 3 90 100',b:'10 0 10 100 12 55 55 35 92 68 55 100 12 92',c:'85 15 50 0 8 45 25 90 55 100 88 85',
    d:'82 48 45 35 8 68 45 100 85 82 88 0 90 100',e:'10 55 90 50 80 15 45 0 10 35 15 85 50 100 88 85',f:'80 8 55 0 38 15 35 100|^10 40 75 40',
    g:'80 15 45 0 8 30 40 60 80 45 85 2 85 80 60 100 15 88',h:'10 0 10 100 12 60 50 38 85 55 88 100',i:'50 35 50 100|^50 5',j:'60 35 60 85 40 100 10 90|^60 5',
    k:'12 0 12 100|85 40 15 70 85 100',l:'50 0 50 100',m:'8 0 8 100 8 25 28 2 48 22 50 100 50 25 72 2 90 22 92 100',n:'10 0 10 100 10 25 50 0 88 25 90 100',
    o:'55 0 10 25 8 75 50 100 90 70 88 25 55 0',p:'10 0 10 100 10 8 55 0 92 30 55 60 12 52',q:'85 10 45 0 8 30 45 60 85 50 88 0 90 100',r:'12 0 12 100 12 35 45 3 85 10',
    s:'85 12 50 0 12 20 45 50 88 75 55 100 10 88',t:'45 0 45 85 60 100 85 95|^10 32 85 32',u:'10 0 10 70 40 100 85 72 88 0 90 100',v:'5 0 50 100 95 0',
    w:'3 0 25 100 50 25 75 100 97 0',x:'10 0 90 100|^90 0 10 100',y:'10 0 50 60|90 0 30 100',z:'10 2 90 2 10 98 90 98',
    A:'50 0 5 100|50 0 95 100|25 65 75 65',B:'10 0 10 100|10 2 65 2 88 25 65 48 12 50 75 52 92 76 70 98 12 100',C:'88 15 55 0 10 30 10 70 55 100 90 85',
    D:'10 0 10 100|10 2 60 5 92 50 60 95 10 98',E:'88 0 10 0 10 100 88 100|10 50 70 50',F:'88 0 10 0 10 100|10 50 70 50',G:'88 15 55 0 10 30 10 70 55 100 90 80 90 55 55 55',
    H:'10 0 10 100|90 0 90 100|10 50 90 50',I:'50 0 50 100|15 0 85 0|15 100 85 100',J:'85 0 85 75 60 100 25 98 10 75',K:'12 0 12 100|88 0 15 60|35 45 90 100',L:'10 0 10 100 88 100',
    M:'8 100 8 0 50 70 92 0 92 100',N:'10 100 10 0 90 100 90 0',O:'55 0 10 25 8 75 50 100 90 70 90 25 55 0',P:'10 0 10 100|10 2 65 2 90 28 65 52 12 52',
    Q:'55 0 10 25 8 75 50 100 90 70 90 25 55 0|60 70 95 100',R:'10 0 10 100|10 2 65 2 90 28 65 52 12 52 90 100',S:'85 12 50 0 12 20 45 50 88 75 55 100 10 88',
    T:'5 0 95 0|50 0 50 100',U:'10 0 10 70 50 100 90 70 90 0',V:'5 0 50 100 95 0',W:'3 0 25 100 50 30 75 100 97 0',X:'8 0 92 100|92 0 8 100',
    Y:'8 0 50 50|92 0 50 50 50 100',Z:'8 0 92 0 8 100 92 100',
    0:'55 0 10 30 10 70 50 100 90 70 90 30 55 0',1:'20 20 55 0 55 100',2:'10 22 45 0 88 20 80 50 8 100 92 100',3:'12 12 50 0 85 22 45 48 88 72 50 100 10 88',
    4:'70 0 5 70 95 70|72 30 72 100',5:'85 0 20 0 15 45 55 38 88 65 55 100 10 88',6:'80 5 45 0 10 45 15 85 50 100 88 75 55 50 12 65',7:'8 0 92 0 40 100',
    8:'75 12 50 0 15 22 50 48 88 75 50 100 12 75 50 48 85 22 75 12',9:'88 30 50 50 12 28 50 0 88 25 90 50 85 100',
    '.':'50 50',',':'60 0 35 100','!':'50 0 50 70|50 97','?':'10 22 45 0 88 22 50 55 50 72|50 97',"'":'50 0 50 100','"':'25 0 25 100|75 0 75 100',
    '-':'0 50 100 50',':':'50 5|50 95',';':'50 5|55 60 40 100','(':'75 0 15 50 75 100',')':'25 0 85 50 25 100','/':'90 0 10 100'
  };
  function heapPush(h,item){h.push(item);for(let i=h.length-1;i>0;){const p=(i-1)>>1;if(h[p][0]<=h[i][0])break;[h[p],h[i]]=[h[i],h[p]];i=p;}}
  function heapPop(h){const top=h[0],last=h.pop();if(h.length){h[0]=last;for(let i=0;;){const l=i*2+1,r=l+1;let m=i;if(l<h.length&&h[l][0]<h[m][0])m=l;if(r<h.length&&h[r][0]<h[m][0])m=r;if(m===i)break;[h[m],h[i]]=[h[i],h[m]];i=m;}}return top;}
  // Routes a STROKE_GUIDES entry's waypoints along its one-pixel skeleton. Each waypoint picks one of its nearest
  // skeleton pixels so that the total of waypoint offsets and centerline distance is smallest. Returns null when the
  // character has no guide or this font's letter does not fit it (for example a two-storey "a"); the caller then falls
  // back to the generic tracer.
  function guidedGlyphStrokes(character,g){
    const guide=STROKE_GUIDES[character];if(!guide)return null;
    const {sk,ink,dist,degree,W,H,pad,size,tipOf}=g,N=W*H;
    let x0=W,y0=H,x1=-1,y1=-1;for(let i=0;i<N;i++)if(ink[i]){const x=i%W,y=(i/W)|0;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
    const skel=[];for(let i=0;i<N;i++)if(sk[i])skel.push(i);
    if(x1<0||!skel.length)return null;
    const bw=Math.max(1,x1-x0),bh=Math.max(1,y1-y0),span=Math.max(bw,bh),S=skel.length,idx=new Int32Array(N).fill(-1);skel.forEach((p,k)=>{idx[p]=k;});
    const adj=skel.map(p=>{const x=p%W,list=[];for(const [dx,dy,c] of [[-1,0,1],[1,0,1],[0,-1,1],[0,1,1],[-1,-1,1.414],[1,-1,1.414],[-1,1,1.414],[1,1,1.414]]){if(x+dx<0||x+dx>=W)continue;const j=idx[p+dy*W+dx];if(j>=0)list.push(j,c);}return list;});
    const dijkstra=(src,targets)=>{const d=new Float64Array(S).fill(Infinity),prev=new Int32Array(S).fill(-1),heap=[[0,src]];d[src]=0;let left=targets.size;
      while(heap.length){const [dv,v]=heapPop(heap);if(dv>d[v])continue;if(targets.has(v)&&--left<=0)break;
        const a=adj[v];for(let k=0;k<a.length;k+=2){const u=a[k],nd=dv+a[k+1];if(nd<d[u]){d[u]=nd;prev[u]=v;heapPush(heap,[nd,u]);}}}
      return {d,prev};};
    const pixel=k=>[skel[k]%W,(skel[k]/W)|0],strokes=[],route=new Uint8Array(S);let worst=0;
    const finish=(list,single,mark)=>{
      // Serif bars in the guide (as on "I") collapse to a speck on plain letters; leave those out.
      if(!single&&list.length<4)return;
      // Free ends stop about half a pen width inside the letter; carry them on to its edge.
      let pts=[];list.forEach((k,i)=>{route[k]=1;const [x,y]=pixel(k),p=[x-pad,y-pad];if(pts.length&&pts[pts.length-1][0]===p[0]&&pts[pts.length-1][1]===p[1])return;pts.push(p);
        // Where the pen turns back at a free end (the top of "d"), reach the letter's edge before coming back.
        if(i>0&&i<list.length-1&&degree[skel[k]]===1&&pts.length>1){pts.push(tipOf(pts),p);}});
      if(pts.length>1){if(degree[skel[list[list.length-1]]]===1)pts.push(tipOf(pts));if(degree[skel[list[0]]]===1)pts.unshift(tipOf([...pts].reverse()));}
      strokes.push({pts:simplifyStroke(relaxStroke(pts,3),.7),w:Math.max(1.5,...list.map(k=>dist[skel[k]]))*2+1.5,mark});
    };
    const parts=[];
    for(const raw of guide.split('|')){
      const mark=raw.startsWith('^'),part=mark?raw.slice(1):raw,nums=part.trim().split(/\s+/).map(Number),wps=[];for(let k=0;k<nums.length;k+=2)wps.push([x0+nums[k]/100*bw,y0+nums[k+1]/100*bh]);
      const cands=wps.map(([wx,wy])=>skel.map((p,k)=>[Math.hypot(p%W-wx,((p/W)|0)-wy),k]).sort((a,b)=>a[0]-b[0]).slice(0,24));
      let cost=cands[0].map(([u])=>u*4);const back=[];
      for(let k=1;k<wps.length;k++){
        const next=cands[k].map(()=>Infinity),from=cands[k].map(()=>-1),lift=cands[k].map(()=>false),targets=new Set(cands[k].map(c=>c[1]));
        cands[k-1].forEach(([,src],a)=>{const {d}=dijkstra(src,targets);
          cands[k].forEach(([u,dst],b)=>{let step=d[dst],jump=false;
            // Parts that are not joined (such as the two strokes of a printed "x" in some fonts) are reached by lifting the pen.
            if(!Number.isFinite(step)){const [ax,ay]=pixel(src),[bx,by]=pixel(dst);step=Math.hypot(ax-bx,ay-by)*2+size*.3;jump=true;}
            const c=cost[a]+step+u*4;if(c<next[b]){next[b]=c;from[b]=a;lift[b]=jump;}});});
        back.push({from,lift});cost=next;
      }
      let b=cost.indexOf(Math.min(...cost));const chosen=[b],lifts=[];
      for(let k=back.length-1;k>=0;k--){lifts.unshift(back[k].lift[b]);b=back[k].from[b];chosen.unshift(b);}
      let list=[cands[0][chosen[0]][1]];worst=Math.max(worst,cands[0][chosen[0]][0]/span);
      for(let k=1;k<wps.length;k++){
        const src=cands[k-1][chosen[k-1]][1],dst=cands[k][chosen[k]][1];worst=Math.max(worst,cands[k][chosen[k]][0]/span);
        if(lifts[k-1]){parts.push({list,single:false,mark});list=[dst];continue;}
        const {prev}=dijkstra(src,new Set([dst])),seg=[];for(let v=dst;v!==src&&v>=0;v=prev[v])seg.push(v);list.push(...seg.reverse());
      }
      parts.push({list,single:wps.length===1,mark});
    }
    // In connected script the pen arrives from the previous letter and leaves for the next: start on the letter's entry
    // stroke at the left and finish along its exit stroke at the right (not on a dot or crossbar).
    const body=parts.filter(p=>!p.mark&&p.list.length>1);
    if(g.connected&&body.length){
      const xOf=k=>skel[k]%W,markPixels=parts.filter(p=>p.mark).flatMap(p=>p.list.map(pixel)),first=body[0],last=body[body.length-1];
      const ends=[];for(let k=0;k<S;k++){const [x,y]=pixel(k);if(degree[skel[k]]===1&&markPixels.every(([mx,my])=>Math.hypot(mx-x,my-y)>6))ends.push(k);}
      const between=(from,to)=>{const {d,prev}=dijkstra(from,new Set([to]));if(!Number.isFinite(d[to])||d[to]>span*.9)return null;const seg=[];for(let v=to;v!==from&&v>=0;v=prev[v])seg.push(v);return seg.reverse();};
      const entry=ends.filter(k=>xOf(k)<=x0+bw*.3).sort((a,b)=>xOf(a)-xOf(b))[0],exit=ends.filter(k=>xOf(k)>=x1-bw*.3).sort((a,b)=>xOf(b)-xOf(a))[0];
      if(entry!=null&&!first.list.includes(entry)){const seg=between(entry,first.list[0]);if(seg)first.list=[entry,...seg.slice(0,-1),...first.list];}
      if(exit!=null&&!last.list.includes(exit)){const seg=between(last.list[last.list.length-1],exit);if(seg)last.list.push(...seg);}
    }
    for(const p of parts)finish(p.list,p.single,p.mark);
    // The guide fits when every waypoint found the letter nearby and the route passes close to nearly all of the skeleton.
    const depth=new Int8Array(S).fill(-1),queue=[];for(let k=0;k<S;k++)if(route[k]){depth[k]=0;queue.push(k);}
    for(let q=0;q<queue.length;q++){const k=queue[q];if(depth[k]>=4)continue;for(let a=adj[k],j=0;j<a.length;j+=2)if(depth[a[j]]<0){depth[a[j]]=depth[k]+1;queue.push(a[j]);}}
    g.stats={worst,coverage:queue.length/S};
    return worst<=.3&&queue.length/S>=.85?strokes:null;
  }
  // Traces a letter at a fixed size into ordered pen strokes. Coordinates are in GLYPH_TRACE_SIZE pixels from the
  // fillText origin (textBaseline top); w is the full pen width needed to uncover the letter along that stroke.
  function traceGlyphStrokes(character,family,connected=false){
    const key=`${family}:${connected?1:0}:${character}`;if(glyphTraceCache.has(key))return glyphTraceCache.get(key);
    const size=GLYPH_TRACE_SIZE,pad=Math.ceil(size*.4),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.font=`${size}px "${family}"`;const advance=ctx.measureText(character).width;
    canvas.width=Math.ceil(advance+pad*2);canvas.height=Math.ceil(size*1.5+pad*2);
    ctx.font=`${size}px "${family}"`;ctx.textBaseline='top';ctx.fillText(character,pad,pad);
    const W=canvas.width,H=canvas.height,N=W*H,alpha=ctx.getImageData(0,0,W,H).data,ink=new Uint8Array(N);
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;ink[i]=alpha[i*4+3]>110?1:0;}
    // Distance to the nearest blank pixel is the local half-width of the letter.
    const dist=new Float32Array(N);for(let i=0;i<N;i++)dist[i]=ink[i]?1e6:0;
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(ink[i])dist[i]=Math.min(dist[i],dist[i-1]+1,dist[i-W]+1,dist[i-W-1]+1.414,dist[i-W+1]+1.414);}
    for(let y=H-2;y>0;y--)for(let x=W-2;x>0;x--){const i=y*W+x;if(ink[i])dist[i]=Math.min(dist[i],dist[i+1]+1,dist[i+W]+1,dist[i+W+1]+1.414,dist[i+W-1]+1.414);}
    // Zhang-Suen thinning leaves a one-pixel centerline.
    const sk=ink.slice(),off=[-W,-W+1,1,W+1,W,W-1,-1,-W-1],n=new Uint8Array(8);
    for(let changed=true;changed;){
      changed=false;
      for(let pass=0;pass<2;pass++){
        const remove=[];
        for(let i=W+1;i<N-W-1;i++){
          if(!sk[i])continue;let count=0,transitions=0;
          for(let k=0;k<8;k++){n[k]=sk[i+off[k]];count+=n[k];}
          if(count<2||count>6)continue;
          for(let k=0;k<8;k++)if(!n[k]&&n[(k+1)&7])transitions++;
          if(transitions!==1)continue;
          if(pass===0?(n[0]&&n[2]&&n[4])||(n[2]&&n[4]&&n[6]):(n[0]&&n[2]&&n[6])||(n[0]&&n[4]&&n[6]))continue;
          remove.push(i);
        }
        for(const i of remove)sk[i]=0;if(remove.length)changed=true;
      }
    }
    // Build a graph: clusters of end/junction pixels become nodes, runs of two-neighbor pixels become edges.
    const at=i=>[i%W-pad,Math.floor(i/W)-pad],pixels=[],degree=new Uint8Array(N),nodeOf=new Int32Array(N).fill(-1),nodes=[];
    for(let i=0;i<N;i++)if(sk[i]){pixels.push(i);for(const o of off)degree[i]+=sk[i+o];}
    for(const i of pixels)if(degree[i]!==2&&nodeOf[i]<0){
      const queue=[i],idx=nodes.length;nodeOf[i]=idx;let sx=0,sy=0,r=0;
      for(let q=0;q<queue.length;q++){const p=queue[q];sx+=p%W;sy+=Math.floor(p/W);r=Math.max(r,dist[p]);for(const o of off){const j=p+o;if(sk[j]&&degree[j]!==2&&nodeOf[j]<0){nodeOf[j]=idx;queue.push(j);}}}
      nodes.push({x:sx/queue.length-pad,y:sy/queue.length-pad,r,pixels:queue});
    }
    const visited=new Uint8Array(N),edges=[];
    const follow=(from,start,first)=>{
      const pts=[[nodes[from].x,nodes[from].y]];let prev=start,cur=first,w=0;
      for(;;){
        if(nodeOf[cur]>=0){const to=nodes[nodeOf[cur]];pts.push([to.x,to.y]);return {a:from,b:nodeOf[cur],pts,w:w||Math.max(nodes[from].r,to.r)};}
        visited[cur]=1;pts.push(at(cur));w=Math.max(w,dist[cur]);
        let next=-1;for(const o of off){const j=cur+o;if(sk[j]&&j!==prev&&!visited[j]){next=j;break;}}
        if(next<0)return null;prev=cur;cur=next;
      }
    };
    nodes.forEach((node,k)=>{for(const p of node.pixels)for(const o of off){const j=p+o;if(sk[j]&&nodeOf[j]<0&&!visited[j]){const e=follow(k,p,j);if(e)edges.push(e);}}});
    for(const i of pixels)if(!visited[i]&&nodeOf[i]<0){
      // A closed bowl such as "o" starts at its top and is written counter-clockwise.
      const idx=nodes.length,start=at(i);nodes.push({x:start[0],y:start[1],r:dist[i],pixels:[i]});
      const pts=[start];let prev=i,cur=off.map(o=>i+o).filter(j=>sk[j]).sort((a,b)=>a%W-b%W)[0],w=dist[i];visited[i]=1;
      while(cur!=null&&!visited[cur]){visited[cur]=1;pts.push(at(cur));w=Math.max(w,dist[cur]);const p=prev;prev=cur;cur=off.map(o=>prev+o).find(j=>sk[j]&&j!==p&&!visited[j]);}
      pts.push(start);edges.push({a:idx,b:idx,pts,w});
    }
    const lengthOf=pts=>{let s=0;for(let k=1;k<pts.length;k++)s+=Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]);return s;};
    for(const e of edges)e.length=lengthOf(e.pts);
    const touched=new Set(edges.flatMap(e=>[e.a,e.b]));
    let live=edges.filter(e=>!(e.a===e.b&&e.length<6));
    const direction=(seq,fromEnd)=>{
      const s=fromEnd?[...seq].reverse():seq,[x0,y0]=s[0];let p=s[s.length-1];
      for(const q of s)if(Math.hypot(q[0]-x0,q[1]-y0)>=8){p=q;break;}
      return fromEnd?[x0-p[0],y0-p[1]]:[p[0]-x0,p[1]-y0];
    };
    // The centerline stops about half a pen width short of each free end; carry it on to the letter's edge.
    // Fainter ink counts here so the pen reaches the very end of tapered strokes.
    const inkAt=(x,y)=>alpha[(Math.round(y+pad)*W+Math.round(x+pad))*4+3]>40;
    const tipOf=(seq)=>{const [dx,dy]=direction(seq,true),len=Math.hypot(dx,dy);let [x,y]=seq[seq.length-1];if(!len)return [x,y];
      for(let step=0;step<size;step++){const nx=x+dx/len*.5,ny=y+dy/len*.5;if(!inkAt(nx,ny))break;x=nx;y=ny;}return [x,y];};
    // Prefer the character's handwriting guide; the generic tracer below handles anything the guide does not fit.
    // Some fonts draw lowercase letters as small capitals (Permanent Marker), so the other case's guide is tried too.
    const guide={sk,ink,dist,degree,W,H,pad,size,tipOf,connected},other=character.toLowerCase()===character?character.toUpperCase():character.toLowerCase();
    const guided=guidedGlyphStrokes(character,guide)||(other!==character?guidedGlyphStrokes(other,guide):null);
    if(guided){const result={advance,strokes:guided,guided:true,stats:guide.stats};glyphTraceCache.set(key,result);if(glyphTraceCache.size>500)glyphTraceCache.clear();return result;}
    {const deg=nodes.map(()=>0);for(const e of live){deg[e.a]++;deg[e.b]++;}
      for(const e of live){if(e.a===e.b)continue;if(deg[e.b]===1)e.pts.push(nodes[e.b].tip=tipOf(e.pts));if(deg[e.a]===1)e.pts.unshift(nodes[e.a].tip=tipOf([...e.pts].reverse()));}}
    // Thinning leaves short spurs where a stroke bends or joins. A spur's true end barely reaches past the joint's
    // own thickness; remove those so they are not written as extra strokes.
    for(let pruned=true;pruned;){
      pruned=false;const deg=nodes.map(()=>0);for(const e of live){deg[e.a]++;deg[e.b]++;}
      live=live.filter(e=>{
        if(e.a===e.b)return true;const tipA=deg[e.a]===1,tipB=deg[e.b]===1;if(tipA===tipB)return true;
        const joint=nodes[tipA?e.b:e.a],end=nodes[tipA?e.a:e.b].tip||[nodes[tipA?e.a:e.b].x,nodes[tipA?e.a:e.b].y];
        if(deg[tipA?e.b:e.a]<3||Math.hypot(end[0]-joint.x,end[1]-joint.y)>=joint.r*1.3+3)return true;
        deg[e.a]--;deg[e.b]--;pruned=true;return false;
      });
    }
    // Connected pieces: main letter bodies first, left to right, then small marks such as dots.
    const parent=nodes.map((_,k)=>k),root=k=>parent[k]===k?k:(parent[k]=root(parent[k]));
    for(const e of live)parent[root(e.a)]=root(e.b);
    const groups=new Map();for(const e of live){const g=root(e.a);if(!groups.has(g))groups.set(g,[]);groups.get(g).push(e);}
    const pieces=[...groups.values()].map(list=>{const pts=list.flatMap(e=>e.pts);return {edges:list,length:list.reduce((s,e)=>s+e.length,0),x:Math.min(...pts.map(p=>p[0])),y:Math.min(...pts.map(p=>p[1]))};});
    nodes.forEach((node,k)=>{if(!touched.has(k))pieces.push({dot:node,length:0,x:node.x,y:node.y});});
    const longest=Math.max(0,...pieces.map(p=>p.length)),major=p=>p.length>=longest*.35&&!p.dot;
    pieces.sort((a,b)=>major(b)-major(a)||(Math.abs(a.x-b.x)>size*.08?a.x-b.x:a.y-b.y));
    const turn=(u,v)=>{const lu=Math.hypot(...u),lv=Math.hypot(...v);return lu&&lv?Math.acos(clamp((u[0]*v[0]+u[1]*v[1])/(lu*lv),-1,1)):0;};
    const strokes=[];
    for(const piece of pieces){
      if(piece.dot){strokes.push({pts:[[piece.dot.x,piece.dot.y]],w:Math.max(piece.dot.r,1.5)*2+1.5});continue;}
      const unused=new Set(piece.edges);let pen=null;
      const incident=k=>[...unused].filter(e=>e.a===k||e.b===k);
      while(unused.size){
        const ends=[...new Set([...unused].flatMap(e=>[e.a,e.b]))];
        const score=k=>{const nd=nodes[k],odd=incident(k).reduce((s,e)=>s+(e.a===e.b?2:1),0)%2;
          return (pen?nd.y+nd.x*.5+Math.hypot(nd.x-pen[0],nd.y-pen[1])*.3:nd.x+nd.y*.8)+(odd?0:size*.6);};
        let cur=ends.reduce((best,k)=>score(k)<score(best)?k:best);
        const pts=[];let heading=null,w=0,last=null;
        for(;;){
          // At a junction keep the pen going as straight as possible.
          let pick=null,best=Infinity;
          for(const e of incident(cur))for(const forward of e.a===e.b?(heading?[true,false]:[true]):[e.a===cur]){
            const seq=forward?e.pts:[...e.pts].reverse(),bend=heading?turn(heading,direction(seq,false)):turn([.35,1],direction(seq,false));
            if(bend<best){best=bend;pick={e,seq};}
          }
          if(!pick){
            // After a short run into a peak, such as the points of "M", come back down it instead of lifting the pen.
            if(last&&last.e.a!==last.e.b&&last.e.length<size*.3&&incident(last.from).length){const back=[...last.seq].reverse();pts.push(...back.slice(1));heading=direction(back,true);cur=last.from;last=null;continue;}
            break;
          }
          unused.delete(pick.e);pts.push(...(pts.length?pick.seq.slice(1):pick.seq));w=Math.max(w,pick.e.w);heading=direction(pick.seq,true);
          last={...pick,from:cur};cur=pick.e.a===cur?pick.e.b:pick.e.a;
        }
        strokes.push({pts:simplifyStroke(relaxStroke(pts,3),.7),w:w*2+1.5});pen=pts[pts.length-1];
      }
    }
    const result={advance,strokes,guided:false,stats:guide.stats};glyphTraceCache.set(key,result);if(glyphTraceCache.size>500)glyphTraceCache.clear();return result;
  }
  const ALIGN_SHIFT={left:0,center:.5,right:1};
  function textSignature(it){return JSON.stringify(['letter-cursive-6',it.text,it.font,it.fontSize,it.color,it.w,it.h,it.align||'left']);}
  // Renders one letter by itself and records, for every pixel, how far along the letter's strokes the pen is when it
  // reaches that pixel. Times spread out from the pen path through the letter's own ink, so a pixel is uncovered only
  // once the pen passes the part of the letter it belongs to, never across a gap or from a neighbouring letter.
  // Pixels must line up with the full text image: ctx maps (u,v) to canvas pixels (u*fit*ratio, v*ratio).
  function letterReveal(char,font,color,left,top,size,advance,fit,ratio,canvas,paths){
    const ox=Math.floor((left-size*.6)*fit*ratio),oy=Math.floor((top-size*.5)*ratio);
    const AW=Math.ceil((advance+size*1.2)*fit*ratio)+2,AH=Math.ceil(size*2.1*ratio)+2,area=document.createElement('canvas');area.width=AW;area.height=AH;
    const ac=area.getContext('2d',{willReadFrequently:true});ac.setTransform(ratio*fit,0,0,ratio,-ox,-oy);
    ac.font=font;ac.textBaseline='top';ac.fillStyle=color;ac.fillText(char,left,top);
    const all=ac.getImageData(0,0,AW,AH).data;let x0=AW,y0=AH,x1=-1,y1=-1;
    for(let y=0;y<AH;y++)for(let x=0;x<AW;x++)if(all[(y*AW+x)*4+3]){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
    if(x1<0)return null;
    x0=Math.max(0,x0-3);y0=Math.max(0,y0-3);x1=Math.min(AW-1,x1+3);y1=Math.min(AH-1,y1+3);
    const W=x1-x0+1,H=y1-y0+1,N=W*H,letter=document.createElement('canvas');letter.width=W;letter.height=H;
    letter.getContext('2d').drawImage(area,x0,y0,W,H,0,0,W,H);
    const ink=letter.getContext('2d',{willReadFrequently:true}).getImageData(0,0,W,H).data,bx=ox+x0,by=oy+y0;
    // Distance from each ink pixel to the nearest blank one: the letter's local half-width.
    const solid=new Float32Array(N);for(let i=0;i<N;i++)solid[i]=ink[i*4+3]>=40?1e6:0;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!solid[i])continue;solid[i]=Math.min(solid[i],x?solid[i-1]+1:1,y?solid[i-W]+1:1,x&&y?solid[i-W-1]+1.414:1,y&&x<W-1?solid[i-W+1]+1.414:1);}
    for(let y=H-1;y>=0;y--)for(let x=W-1;x>=0;x--){const i=y*W+x;if(!solid[i])continue;solid[i]=Math.min(solid[i],x<W-1?solid[i+1]+1:1,y<H-1?solid[i+W]+1:1,x<W-1&&y<H-1?solid[i+W+1]+1.414:1,y<H-1&&x?solid[i+W-1]+1.414:1);}
    // Seed the pen path every half pixel, in writing order, with its share of the letter's total stroke length. Where the
    // pen goes back over ink an earlier pass already covered (a retrace, or one stroke crossing another), it adds no seed:
    // those pixels belong to the earlier pass, and seeding them again would leave a hidden line through visible ink.
    const lens=paths.map(p=>Math.max(.01,pathLength(p.d))),total=lens.reduce((a,b)=>a+b,0),time=new Float32Array(N).fill(-1),queue=new Int32Array(N),coveredAt=new Float32Array(N).fill(-1);let tail=0;
    if(total>0){
      const node=document.createElementNS('http://www.w3.org/2000/svg','path');$('#stage').appendChild(node);let before=0,last=-1;const gap=total*STROKE_GAP,span=total+(paths.length-1)*gap;
      paths.forEach((p,k)=>{node.setAttribute('d',p.d);
        for(let l=0;;l=Math.min(lens[k],l+.5/ratio)){
          const pt=node.getPointAtLength(l),x=Math.round(pt.x*ratio-bx),y=Math.round(pt.y*ratio-by),i=y*W+x,along=(before+l)*ratio+k*1e4;
          if(x>=0&&y>=0&&x<W&&y<H&&i!==last){
            // A marker as wide as the letter here covers this circle, which always fits inside the ink. Ink covered by a
            // part of the path the pen has since moved well away from belongs to that earlier pass.
            const r=Math.floor(solid[i]),earlier=coveredAt[i]>=0&&along-coveredAt[i]>2*r+3;
            if(!earlier&&time[i]<0){time[i]=(before+l+k*gap)/span;queue[tail++]=i;}
            for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const j=(y+dy)*W+x+dx;if(x+dx>=0&&y+dy>=0&&x+dx<W&&y+dy<H&&dx*dx+dy*dy<=r*r&&coveredAt[j]<0)coveredAt[j]=along;}
            last=i;
          }
          if(l>=lens[k])break;
        }
        before+=lens[k];
      });
      node.remove();
    }
    if(!tail){time.fill(0);}
    else{
      // First spread only through ink, then out to every remaining pixel so soft edges and stray specks follow along.
      const step=(from,inkOnly)=>{for(let head=from;head<tail;head++){const i=queue[head],x=i%W;
        for(const j of [x>0?i-1:-1,x<W-1?i+1:-1,i-W,i+W,x>0?i-W-1:-1,x<W-1?i-W+1:-1,x>0?i+W-1:-1,x<W-1?i+W+1:-1])
          if(j>=0&&j<N&&time[j]<0&&(!inkOnly||ink[j*4+3]>=40)){time[j]=time[i];queue[tail++]=j;}}};
      step(0,true);step(0,false);
    }
    // The map stores each pixel's time in its alpha: 255 at the start of the letter down to 5 at its end. Pixels more
    // than 3px from any ink stay empty, since the letter is transparent there; this keeps the image small.
    let near=new Uint8Array(N);for(let i=0;i<N;i++)near[i]=ink[i*4+3]?1:0;
    for(let pass=0;pass<3;pass++){const grown=near.slice();for(let i=0;i<N;i++)if(!near[i]){const x=i%W;if((x>0&&near[i-1])||(x<W-1&&near[i+1])||near[i-W]||near[i+W])grown[i]=1;}near=grown;}
    const map=document.createElement('canvas');map.width=W;map.height=H;const mc=map.getContext('2d'),data=mc.createImageData(W,H);
    for(let i=0;i<N;i++)if(near[i]){data.data[i*4]=data.data[i*4+1]=data.data[i*4+2]=255;data.data[i*4+3]=Math.round(255-clamp(time[i],0,1)*250);}
    mc.putImageData(data,0,0);
    return {box:[bx/canvas.width,by/canvas.height,W/canvas.width,H/canvas.height],src:letter.toDataURL('image/png'),map:map.toDataURL('image/png')};
  }
  async function refreshHandwriting(it){
    if(!HANDWRITING_FONTS[it.font])return;
    const signature=textSignature(it),family=HANDWRITING_FONTS[it.font],rows=String(it.text||'').split('\n').slice(0,8);
    try{
      await document.fonts.load(`48px "${family}"`);
      if(textSignature(it)!==signature)return;
      const ratio=Math.max(1,Math.min(3,2400/Math.max(1,it.w),2400/Math.max(1,it.h))),canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.ceil(it.w*ratio));canvas.height=Math.max(1,Math.ceil(it.h*ratio));
      const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(ratio,ratio);
      const size=Math.max(12,Math.min(it.fontSize,(it.h-8)/(Math.max(1,rows.length)*1.16))),font=`${size}px "${family}"`,color=it.color||'#213b4b';
      ctx.font=font;ctx.textBaseline='top';ctx.fillStyle=color;
      const connected=CONNECTED_FONTS.has(it.font),widths=rows.map(row=>ctx.measureText(row).width),fit=Math.min(1,(it.w-8)/Math.max(1,...widths)),room=(it.w-8)/fit;
      ctx.scale(fit,1);const letterPaths=[],letters=[];
      // Each letter starts where the text before it ends (with the font's kerning), so connected scripts join up.
      rows.forEach((row,line)=>{const start=4/fit+(room-widths[line])*(ALIGN_SHIFT[it.align]||0),top=2+line*size*1.16;let before='';
        for(const char of row){
          const left=start+ctx.measureText(before).width,advance=ctx.measureText(char).width;before+=char;
          if(/\s/u.test(char))continue;
          ctx.fillText(char,left,top);
          const glyph=traceGlyphStrokes(char,family,connected),k=size/GLYPH_TRACE_SIZE;
          const paths=glyph.strokes.map(s=>({d:strokePathData(s.pts.map(([x,y])=>[(left+x*k)*fit,top+y*k])),letter:letters.length}));
          const reveal=letterReveal(char,font,color,left,top,size,advance,fit,ratio,canvas,paths);
          if(reveal){letters.push(reveal);letterPaths.push(...paths);}
        }
      });
      const src=canvas.toDataURL('image/png');
      if(textSignature(it)!==signature||!state.project.scenes.some(s=>s.items.includes(it)))return;
      it.handwritingSrc=src;it.handwritingSignature=signature;it.letterPaths=letterPaths;it.letters=letters;it.tracePaths=[];it.fillPaths=[];it.transparentArtwork=true;changed(false);
    }catch(e){console.error(e);toast('Could not load that writing style.');}
  }
  function scheduleHandwriting(it){
    clearTimeout(textTimers.get(it.id));
    if(!HANDWRITING_FONTS[it.font])return;
    textTimers.set(it.id,setTimeout(()=>{textTimers.delete(it.id);refreshHandwriting(it);},100));
  }
  function addShape(shape){addItem({...baseItem('shape'),shape,fill:'#cde9df',w:350,h:225});}
  function addText(){const it={...baseItem('text'),text:'Your message here',x:470,y:350,w:850,h:130,fontSize:72,color:'#213b4b',font:'patrick'};addItem(it);scheduleHandwriting(it);}
  function addCamera(){addItem({id:id(),type:'camera',cx:state.editorView.cx,cy:state.editorView.cy,zoom:clamp(baseBox()[2]/(state.editorView.w*.72),.2,5),duration:1,pause:.2});}
  function selectItem(itemId){state.selected=itemId;state.selectedClip=null;state.tool='select';renderAll();}
  function pause(){state.playing=false;cancelAnimationFrame(state.frame);stopClips();audio.clockActive=false;renderTimelineClock();}
  // While previewing, the timeline shows the scene being played.
  function followPlayingScene(){const loc=positionAt(state.time);if(loc.index!==state.sceneIndex){state.sceneIndex=loc.index;state.selected=null;renderTimelineStrips();if(!item())renderInspector();}}
  function previewCamera(){
    const chosen=item();if(chosen?.type!=='camera')return;
    pause();let local=0;for(const entry of scene().items){local+=Math.max(.1,num(entry.duration,1));if(entry.id===chosen.id)break;local+=Math.max(0,num(entry.pause));}
    state.previewCameraBox=cameraBox(chosen);state.time=clamp(sceneStart(state.sceneIndex)+local,0,totalLen());state.preview=true;renderStage();renderTimeline();
  }
  function seek(time){pause();state.previewCameraBox=null;state.time=clamp(time,0,totalLen());state.preview=true;renderStage();followPlayingScene();renderTimelineClock();}
  function play(){
    if(state.playing){pause();return;}
    if(!state.preview){if(item()?.type==='camera')previewCamera();else state.previewCameraBox=null;}
    if(state.time>=totalLen()-.01)state.time=0;
    state.preview=true;state.playing=true;state.lastTick=performance.now();
    // With audio, the preview follows the audio clock so sound and drawing stay together.
    if(hasAudio()){const ctx=audioContext();ctx.resume().catch(()=>{});audio.clockStart=startClips(state.time);audio.timeStart=state.time;audio.clockActive=true;}
    const tick=(now)=>{if(!state.playing)return;state.time=clamp(audio.clockActive&&audio.ctx?.state==='running'?audio.timeStart+Math.max(0,audio.ctx.currentTime-audio.clockStart):state.time+(now-state.lastTick)/1000,0,totalLen());state.lastTick=now;renderStage();followPlayingScene();renderTimelineClock();if(state.time>=totalLen())pause();else state.frame=requestAnimationFrame(tick);};
    state.frame=requestAnimationFrame(tick);renderTimeline();
  }
  function stopPreview(){pause();state.preview=false;state.previewCameraBox=null;renderStage();}
  // Stop ends the preview and rewinds, so the next Play starts the video from the beginning.
  function stop(){state.time=0;stopPreview();renderTimeline();}
  function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open('whiteboard-studio',1);req.onupgradeneeded=()=>req.result.createObjectStore('projects',{keyPath:'id'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
  function dbTask(mode,fn){return new Promise((resolve,reject)=>{const tx=state.db.transaction('projects',mode),store=tx.objectStore('projects');let req=fn(store);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
  async function saveProject(){try{await dbTask('readwrite',s=>s.put(storedProject(state.project)));localStorage.setItem('whiteboard-current',state.project.id);$('#saveStatus').textContent='Saved locally';}catch(e){$('#saveStatus').textContent='Could not save';toast('This project could not be saved. Check your browser storage.');}}
  async function migrateProject(p){
    p.audioFiles=p.audioFiles||{};p.audioClips=p.audioClips||[];
    if(p.audio?.src){const file=id();p.audioFiles[file]={name:p.audio.name||'Audio',src:p.audio.src,duration:null};p.audioClips.push({id:id(),file,lane:0,start:0,offset:0,length:null,volume:1,fadeIn:0,fadeOut:0});}
    delete p.audio;
    for(const s of p.scenes)for(const it of s.items){
      if(it.animation==='reveal')it.animation='draw';
      if(it.type==='text'&&!it.font)it.font='futural';
      if(it.type==='image'&&Array.isArray(it.sheetRef)&&it.sheetRef[0]>=10&&it.cropVersion!==2){
        try{
          const art=await cropSheetDrawing(it.sheetRef[0],it.sheetRef[1]),trace=await traceImage(art.src),centerY=it.y+it.h/2;
          it.src=art.src;it.h=it.w*art.height/art.width;it.y=centerY-it.h/2;
          it.tracePaths=trace.paths;it.fillPaths=trace.fillPaths;it.transparentArtwork=trace.transparent;it.cropVersion=2;delete it.illustration;
        }catch(e){console.error('Could not refresh illustration',e);}
      }
      if(it.type==='image'&&it.src&&(!Array.isArray(it.tracePaths)||!Array.isArray(it.fillPaths)||it.transparentArtwork==null)){
        try{const trace=await traceImage(it.src);it.tracePaths=trace.paths;it.fillPaths=trace.fillPaths;it.transparentArtwork=trace.transparent;}
        catch{it.tracePaths=it.tracePaths||[];it.fillPaths=[];it.transparentArtwork=false;}
      }
      // Artwork from before illustration drawing is planned once and saved with the project.
      if(it.type==='image'&&it.src&&it.transparentArtwork&&it.illustration?.v!==ILLUSTRATION_VERSION){try{it.illustration=await planIllustration(it.src);}catch(e){console.error('Could not plan the illustration',e);}}
    }
    return p;
  }
  // Per-letter reveal data is rebuilt from the text when a project opens, so it is left out of saved projects and backups.
  const needsHandwriting=it=>it.type==='text'&&HANDWRITING_FONTS[it.font]&&(it.handwritingSignature!==textSignature(it)||!it.letters);
  const storedProject=p=>JSON.parse(JSON.stringify(p,(k,v)=>k==='letters'?undefined:v));
  function prepareHandwriting(){for(const s of state.project.scenes)for(const it of s.items)if(needsHandwriting(it))scheduleHandwriting(it);}
  async function ensureHandwriting(){const pending=[];for(const s of state.project.scenes)for(const it of s.items)if(needsHandwriting(it)){clearTimeout(textTimers.get(it.id));pending.push(refreshHandwriting(it));}await Promise.all(pending);}
  async function loadProject(projectId){pause();let p=await dbTask('readonly',s=>s.get(projectId));if(!p)return;state.project=await migrateProject(p);state.editorView=projectView(state.project);state.sceneIndex=0;state.selected=null;state.time=0;state.preview=false;state.previewCameraBox=null;state.selectedClip=null;stopClips();state.undo=[];state.redo=[];localStorage.setItem('whiteboard-current',p.id);closeModal();renderAll();prepareHandwriting();prepareAudio();await saveProject();}
  async function listProjects(){return (await dbTask('readonly',s=>s.getAll())).sort((a,b)=>b.updated-a.updated);}
  function modal(html){$('#modal').innerHTML=`<div class="modal-card">${html}</div>`;$('#modal').classList.remove('hidden');}
  function closeModal(){$('#modal').classList.add('hidden');$('#modal').innerHTML='';}
  function projectHint(p){const t=p.scenes.flatMap(s=>s.items).find(i=>i.type==='text'&&String(i.text||'').trim());const v=t?String(t.text).replace(/\s+/g,' ').trim():'';return v.length>32?v.slice(0,31)+'…':v;}
  async function deleteProject(projectId){
    const p=await dbTask('readonly',s=>s.get(projectId));if(!p)return;
    if(!confirm(`Delete "${p.name}"${projectHint(p)?` (“${projectHint(p)}”)`:''}? It will be permanently removed from this browser. Download a backup first if you might need it.`))return;
    await dbTask('readwrite',s=>s.delete(projectId));
    if(state.project.id===projectId){
      // The open project is gone: switch to the most recent remaining one, or start a fresh sample.
      const rest=await listProjects();
      if(rest.length)await loadProject(rest[0].id);
      else{pause();state.project=await migrateProject(demoProject());state.editorView=projectView(state.project);state.sceneIndex=0;state.selected=null;state.time=0;state.preview=false;state.previewCameraBox=null;state.selectedClip=null;stopClips();state.undo=[];state.redo=[];renderAll();prepareHandwriting();prepareAudio();}
    }
    toast(`${p.name} deleted.`);await showProjects();
  }
  async function showProjects(){await saveProject();const projects=await listProjects();modal(`<div class="modal-top"><h2>My projects</h2><button class="close-button" data-modal="close">×</button></div><p class="panel-help">Projects are saved in this browser. Download a backup to move them to another browser or computer.</p>${projects.map(p=>`<div class="project-card"><span class="scene-number">✎</span><span><strong>${esc(p.name)}</strong><small>${p.scenes.length} scene${p.scenes.length===1?'':'s'} · ${new Date(p.updated).toLocaleDateString()}${projectHint(p)?` · “${esc(projectHint(p))}”`:''}</small></span><button class="panel-action" data-open="${esc(p.id)}">Open</button><button class="panel-action danger" data-delete-project="${esc(p.id)}">Delete</button></div>`).join('')}<div class="modal-foot"><button class="button ghost" data-modal="backup">Download backup</button><button class="button ghost" data-modal="import">Import backup</button><button class="button primary" data-modal="new">+ New project</button></div>`);}
  async function downloadProjectBackup(){
    await saveProject();const projects=await listProjects();
    const backup={format:'whiteboard-studio-backup',version:1,exportedAt:new Date().toISOString(),projects};
    download(new Blob([JSON.stringify(backup)],{type:'application/json'}),`whiteboard-studio-projects-${new Date().toISOString().slice(0,10)}.json`);
    toast(`${projects.length} project${projects.length===1?'':'s'} backed up.`);
  }
  async function importProjectBackup(file){
    if(!file)return;
    try{
      const backup=JSON.parse(await file.text());
      if(backup?.format!=='whiteboard-studio-backup'||backup.version!==1||!Array.isArray(backup.projects)||!backup.projects.length)throw new Error('This is not a Whiteboard Studio backup.');
      const imported=[];
      for(const source of backup.projects){
        if(!source||typeof source.id!=='string'||!source.id||!Array.isArray(source.scenes)||!source.scenes.every(s=>Array.isArray(s.items)))throw new Error('The backup contains an invalid project.');
        const project=clone(source),existing=await dbTask('readonly',s=>s.get(project.id));
        if(existing){project.id=id();project.name=`${project.name||'Untitled video'} (imported)`;}
        await dbTask('readwrite',s=>s.put(project));imported.push(project.id);
      }
      await loadProject(imported[0]);toast(`${imported.length} project${imported.length===1?'':'s'} imported.`);
    }catch(e){console.error(e);toast(`Could not import backup: ${e.message}`);}
  }
  function showNewProject(){modal(`<div class="modal-top"><h2>New video</h2><button class="close-button" data-modal="close">×</button></div><p class="panel-help">Choose a format and start with a blank whiteboard.</p><div class="field"><label>Project name</label><input id="newName" maxlength="80" value="Untitled video"></div><div class="field"><label>Format</label><select id="newRatio"><option value="16:9">16:9 — Landscape</option><option value="1:1">1:1 — Square</option><option value="9:16">9:16 — Portrait</option></select></div><div class="modal-foot"><button class="button ghost" data-modal="close">Cancel</button><button class="button primary" data-modal="create">Create video</button></div>`);}
  async function createProject(){const name=$('#newName').value.trim()||'Untitled video',ratio=$('#newRatio').value;const p={id:id(),name,ratio,updated:Date.now(),editorView:{cx:800,cy:450,w:1600},audio:null,scenes:[{id:id(),name:'Scene 1',background:'#ffffff',items:[]}]};state.project=p;state.editorView=projectView(p);state.sceneIndex=0;state.selected=null;state.time=0;state.preview=false;state.previewCameraBox=null;state.undo=[];state.redo=[];state.selectedClip=null;await saveProject();closeModal();renderAll();}
  function download(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
  function safeFilename(s){return s.replace(/[^a-z0-9-_]+/gi,'-').replace(/^-|-$/g,'').slice(0,60)||'whiteboard-video';}
  function svgForTime(t,w,h){
    const loc=positionAt(t),v=visualAt(loc.scene,loc.local),box=cameraBox(v.camera);
    exportRender=true;exportHand=null;
    const markup=renderMarkup(loc.scene,v,false,box),hand=exportHand;
    exportRender=false;
    return {svg:`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="${box.join(' ')}">${markup}</svg>`,box,hand};
  }
  function paintSvg(ctx,t){return new Promise((resolve,reject)=>{const frame=svgForTime(t,ctx.canvas.width,ctx.canvas.height),url=URL.createObjectURL(new Blob([frame.svg],{type:'image/svg+xml'})),img=new Image();img.onload=()=>{ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.drawImage(img,0,0,ctx.canvas.width,ctx.canvas.height);if(frame.hand&&state.handImage){const [x,y,w,h]=frame.box,sx=ctx.canvas.width/w,sy=ctx.canvas.height/h;ctx.drawImage(state.handImage,(frame.hand.x-HAND.x-x)*sx,(frame.hand.y-HAND.y-y)*sy,HAND.w*sx,HAND.h*sy);}URL.revokeObjectURL(url);resolve();};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Frame could not be drawn'));};img.src=url;});}
  async function exportVideo(){
    if(state.exporting)return;
    if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){toast('Video export is unavailable in this browser.');return;}
    if(totalLen()<.2){toast('Add something to the timeline before exporting.');return;}
    pause();state.exporting=true;await ensureHandwriting();
    const choices=['video/mp4;codecs=avc1.42E01E','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
    const mime=choices.find(x=>MediaRecorder.isTypeSupported(x));if(!mime){toast('No supported video format found in this browser.');state.exporting=false;return;}
    modal(`<div class="modal-top"><h2>Exporting your video</h2></div><p class="panel-help">Keep this tab open while the video is recorded. Your browser chooses ${mime.includes('mp4')?'MP4':'WebM'} for this export.</p><div class="export-progress"><div id="progressBar"></div></div><p id="exportStatus" class="panel-help">Preparing frames…</p>`);
    const canvas=document.createElement('canvas');[canvas.width,canvas.height]=state.project.ratio==='1:1'?[1080,1080]:state.project.ratio==='9:16'?[900,1600]:[1600,900];const ctx=canvas.getContext('2d',{alpha:false});
    let audioOut=null,stream=canvas.captureStream(30),recorder=null;
    try{
      await paintSvg(ctx,0);
      await Promise.all(Object.values(state.project.audioFiles||{}).map(f=>loadAudioFile(f).catch(()=>{})));
      if(hasAudio()){const ctx=audioContext();await ctx.resume();audioOut=ctx.createMediaStreamDestination();audioOut.stream.getAudioTracks().forEach(track=>stream.addTrack(track));}
      const chunks=[];recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8000000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      const ended=new Promise((resolve,reject)=>{recorder.onstop=()=>resolve(new Blob(chunks,{type:mime}));recorder.onerror=e=>reject(e.error||new Error('Recording failed'));});
      recorder.start(1000);if(audioOut)startClips(0,audioOut);const start=performance.now(),duration=totalLen();let lastFrame=-1;
      while(true){let t=clamp((performance.now()-start)/1000,0,duration),frame=Math.floor(t*30);if(frame!==lastFrame){await paintSvg(ctx,t);lastFrame=frame;$('#progressBar').style.width=`${Math.round(t/duration*100)}%`;$('#exportStatus').textContent=`Rendering ${fmt(t)} of ${fmt(duration)}…`;}
        if(t>=duration)break;await new Promise(r=>setTimeout(r,12));}
      recorder.stop();stopClips();const blob=await ended;download(blob,`${safeFilename(state.project.name)}.${mime.includes('mp4')?'mp4':'webm'}`);closeModal();toast('Video exported.');
    }catch(e){console.error(e);if(recorder?.state==='recording')recorder.stop();closeModal();toast(`Export failed: ${e.message}`);}
    finally{stream.getTracks().forEach(x=>x.stop());stopClips();audioOut?.disconnect();state.exporting=false;}
  }
  async function readFile(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);});}
  // Illustration drawing for artwork with a transparent background. Like an illustrator, the marker first draws the
  // dark line work stroke by stroke, then colors each color area with back-and-forth strokes, biggest areas first.
  // Every pixel gets the moment the pen first covers it, stored in a time map (as for handwriting letters), so the
  // picture appears exactly where the pen has been. The pen path is kept for the hand.
  const ILLUSTRATION_VERSION=1,ILLUSTRATION_SIZE=256;
  // Zhang-Suen thinning of a mask (with an empty one-pixel border) to a one-pixel centerline.
  function thinMask(mask,W,H){
    const sk=mask.slice(),off=[-W,-W+1,1,W+1,W,W-1,-1,-W-1],n=new Uint8Array(8);
    for(let changed=true;changed;){changed=false;
      for(let pass=0;pass<2;pass++){const remove=[];
        for(let i=W+1;i<W*H-W-1;i++){if(!sk[i])continue;let count=0,transitions=0;
          for(let k=0;k<8;k++){n[k]=sk[i+off[k]];count+=n[k];}
          if(count<2||count>6)continue;for(let k=0;k<8;k++)if(!n[k]&&n[(k+1)&7])transitions++;
          if(transitions!==1)continue;if(pass===0?(n[0]&&n[2]&&n[4])||(n[2]&&n[4]&&n[6]):(n[0]&&n[2]&&n[6])||(n[0]&&n[4]&&n[6]))continue;remove.push(i);}
        for(const i of remove)sk[i]=0;if(remove.length)changed=true;}}
    return sk;
  }
  // Walks a skeleton into polylines: from free ends first, then from branches off what is already drawn, then loops,
  // going as straight as possible where lines meet.
  function skeletonStrokes(sk,W,H){
    const N=W*H,off=[-W,-W+1,1,W+1,W,W-1,-1,-W-1],seen=new Uint8Array(N),degree=new Uint8Array(N),strokes=[];
    for(let i=0;i<N;i++)if(sk[i])for(const o of off)degree[i]+=sk[i+o]||0;
    const walk=start=>{const pts=[start];seen[start]=1;let cur=start,dir=null;
      for(;;){let best=-1,score=Infinity;
        for(const o of off){const j=cur+o;if(!sk[j]||seen[j])continue;const dx=j%W-cur%W,dy=((j/W)|0)-((cur/W)|0),s=dir?-(dx*dir[0]+dy*dir[1])/Math.hypot(dx,dy):0;if(s<score){score=s;best=j;}}
        if(best<0)break;seen[best]=1;dir=[best%W-cur%W,((best/W)|0)-((cur/W)|0)];pts.push(best);cur=best;}
      if(pts.length>=4)strokes.push(pts.map(i=>[i%W,(i/W)|0]));};
    for(let i=0;i<N;i++)if(sk[i]&&!seen[i]&&degree[i]===1)walk(i);
    for(let again=true;again;){again=false;for(let i=0;i<N;i++)if(sk[i]&&!seen[i]&&off.some(o=>seen[i+o])){walk(i);again=true;}}
    for(let i=0;i<N;i++)if(sk[i]&&!seen[i])walk(i);
    return strokes;
  }
  // Back-and-forth coloring strokes across one color area, at the given angle and spacing, chained into zigzags.
  function hatchStrokes(pixels,W,angle,gap){
    const c=Math.cos(angle),s=Math.sin(angle),rows=new Map();
    for(const i of pixels){const x=i%W,y=(i/W)|0,u=x*c+y*s,v=-x*s+y*c,k=Math.floor(v/gap);if(!rows.has(k))rows.set(k,[]);rows.get(k).push(u);}
    const keys=[...rows.keys()].sort((a,b)=>a-b),segments=[];
    for(const k of keys){const us=rows.get(k).sort((a,b)=>a-b);let from=us[0];
      for(let j=1;j<=us.length;j++)if(j===us.length||us[j]-us[j-1]>2){const to=us[j-1],inset=Math.min(gap*.45,(to-from)/2);segments.push({k,a:from+inset,b:to-inset,used:false});from=us[j];}}
    const point=(u,k)=>{const v=(k+.5)*gap;return [u*c-v*s,u*s+v*c];},strokes=[];
    for(const first of segments){if(first.used)continue;first.used=true;let seg=first,forward=true;const pts=[point(seg.a,seg.k),point(seg.b,seg.k)];
      for(;;){const next=segments.filter(x=>!x.used&&x.k===seg.k+1&&x.a<=seg.b+gap&&x.b>=seg.a-gap).sort((x,y)=>Math.min(seg.b,y.b)-Math.max(seg.a,y.a)-(Math.min(seg.b,x.b)-Math.max(seg.a,x.a)))[0];
        if(!next)break;next.used=true;forward=!forward;pts.push(...(forward?[point(next.a,next.k),point(next.b,next.k)]:[point(next.b,next.k),point(next.a,next.k)]));seg=next;}
      strokes.push(pts);}
    return strokes;
  }
  async function planIllustration(src){
    const image=new Image();image.src=src;await image.decode();
    const M=2,k=ILLUSTRATION_SIZE/Math.max(image.naturalWidth,image.naturalHeight),w=Math.max(4,Math.round(image.naturalWidth*k)),h=Math.max(4,Math.round(image.naturalHeight*k)),W=w+M*2,H=h+M*2,N=W*H;
    const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,M,M,w,h);
    const px=ctx.getImageData(0,0,W,H).data,opaque=new Uint8Array(N),ink=new Uint8Array(N);let inkCount=0;
    for(let i=0;i<N;i++){if(px[i*4+3]<128)continue;opaque[i]=1;if(.2126*px[i*4]+.7152*px[i*4+1]+.0722*px[i*4+2]<62){ink[i]=1;inkCount++;}}
    // Without dark line work, the shape's own edge is the outline.
    if(inkCount<N*.002)for(let i=W;i<N-W;i++)if(opaque[i]&&(!opaque[i-1]||!opaque[i+1]||!opaque[i-W]||!opaque[i+W]))ink[i]=1;
    // Local half-width of the line work, for a marker as wide as each line.
    const half=new Float32Array(N);for(let i=0;i<N;i++)half[i]=ink[i]?1e6:0;
    for(let i=W+1;i<N;i++)if(ink[i])half[i]=Math.min(half[i],half[i-1]+1,half[i-W]+1,half[i-W-1]+1.414,half[i-W+1]+1.414);
    for(let i=N-W-2;i>=0;i--)if(ink[i])half[i]=Math.min(half[i],half[i+1]+1,half[i+W]+1,half[i+W+1]+1.414,half[i+W-1]+1.414);
    // Line strokes in a natural order: each next stroke starts near where the pen is, preferring longer lines.
    const lengthOf=p=>p.reduce((s,q,j)=>j?s+Math.hypot(q[0]-p[j-1][0],q[1]-p[j-1][1]):0,0),lines=[];
    let pool=skeletonStrokes(thinMask(ink,W,H),W,H).map(p=>simplifyStroke(relaxStroke(p,2),.6)),pen=[M,M];
    while(pool.length){let best=0,score=Infinity,flip=false;
      pool.forEach((p,j)=>{const len=lengthOf(p),a=Math.hypot(p[0][0]-pen[0],p[0][1]-pen[1]),b=Math.hypot(p[p.length-1][0]-pen[0],p[p.length-1][1]-pen[1]),sc=Math.min(a,b)-Math.min(len,60)*.5;if(sc<score){score=sc;best=j;flip=b<a;}});
      const p=pool.splice(best,1)[0];if(flip)p.reverse();lines.push(p);pen=p[p.length-1];}
    // Color areas: connected pixels of similar color that are not line work.
    const label=new Int32Array(N).fill(-1),regions=[];
    for(let i=0;i<N;i++){if(!opaque[i]||ink[i]||label[i]>=0)continue;
      const r=px[i*4],g=px[i*4+1],b=px[i*4+2],id=regions.length,list=[i];label[i]=id;
      for(let q=0;q<list.length;q++){const p=list[q];for(const j of [p-1,p+1,p-W,p+W])if(opaque[j]&&!ink[j]&&label[j]<0&&Math.abs(px[j*4]-r)+Math.abs(px[j*4+1]-g)+Math.abs(px[j*4+2]-b)<70){label[j]=id;list.push(j);}}
      regions.push(list);}
    // Shading, highlights and the blended pixels along the line work form small patches; they join the largest color
    // area beside them so they are colored with it instead of showing up early or late.
    const opaqueCount=opaque.reduce((n,v)=>n+v,0),small=Math.max(24,opaqueCount*.004);
    for(const id of regions.map((_,k)=>k).sort((a,b)=>regions[a].length-regions[b].length)){
      const list=regions[id];if(!list.length||list.length>=small)continue;const near=new Map();
      for(const p of list)for(const j of [p-1,p+1,p-W,p+W]){const l=label[j];if(l>=0&&l!==id)near.set(l,(near.get(l)||0)+regions[l].length);}
      if(!near.size)continue;const into=[...near.entries()].sort((a,b)=>b[1]-a[1])[0][0];
      for(const p of list){label[p]=into;regions[into].push(p);}regions[id]=[];}
    const fills=[];
    regions.map((list,id)=>({list,id})).filter(r=>r.list.length>=16).sort((a,b)=>b.list.length-a.list.length).forEach((r,n)=>{
      const gap=clamp(Math.sqrt(r.list.length)/5,3,8);
      for(const p of hatchStrokes(r.list,W,(n%2?.7:.45)+(n%3)*.08,gap))fills.push({pts:p,region:r.id,radius:gap*.62});});
    // Times: lines at drawing speed, coloring quicker, and short pen lifts between strokes.
    const plan=[...lines.map(pts=>({pts,radius:null,region:-2,speed:1})),...fills.map(f=>({...f,speed:2.4}))];let clock=0,last=null;
    for(const s of plan){if(last)clock+=Math.hypot(s.pts[0][0]-last[0],s.pts[0][1]-last[1])*.35+3;s.len=Math.max(.5,lengthOf(s.pts));s.t0=clock;clock+=s.len/s.speed;s.t1=clock;last=s.pts[s.pts.length-1];}
    const total=Math.max(1e-6,clock),time=new Float32Array(N).fill(-1),queue=new Int32Array(N);let tail=0;
    // Each pen position uncovers a circle the width of the marker: the line's own width on line work, or the coloring
    // band inside its color area.
    for(const s of plan){let along=0;
      for(let j=1;j<s.pts.length;j++){const [ax,ay]=s.pts[j-1],[bx,by]=s.pts[j],seg=Math.hypot(bx-ax,by-ay);
        for(let l=0;l<=seg;l+=.5){const x=Math.round(ax+(bx-ax)*l/Math.max(seg,1e-6)),y=Math.round(ay+(by-ay)*l/Math.max(seg,1e-6)),i=y*W+x;if(x<0||y<0||x>=W||y>=H)continue;
          const t=(s.t0+(along+l)/s.len*(s.t1-s.t0))/total,lineWork=s.region===-2,inside=j2=>lineWork?ink[j2]:label[j2]===s.region;if(!inside(i))continue;
          const r=Math.floor(lineWork?half[i]:s.radius);
          for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const j2=(y+dy)*W+x+dx;if(x+dx<0||y+dy<0||x+dx>=W||y+dy>=H||dx*dx+dy*dy>r*r||time[j2]>=0||!inside(j2))continue;time[j2]=t;queue[tail++]=j2;}}
        along+=seg;}}
    // Then fill what the marker missed from its nearest covered neighbour: first within the same line or color area,
    // then across any visible pixel, then two pixels out into the transparent edge.
    const spread=(test,from)=>{for(let head=from;head<tail;head++){const i=queue[head];for(const j of [i-1,i+1,i-W,i+W])if(j>=0&&j<N&&time[j]<0&&test(i,j)){time[j]=time[i];queue[tail++]=j;}}};
    spread((i,j)=>ink[i]?ink[j]:label[j]===label[i]&&label[i]>=0,0);spread((i,j)=>!ink[i]&&!ink[j]&&px[j*4+3]>0,0);spread((i,j)=>px[j*4+3]>0,0);
    for(let pass=0;pass<2;pass++){const start=tail;for(let i=0;i<N;i++)if(time[i]<0)for(const j of [i-1,i+1,i-W,i+W])if(j>=0&&j<N&&time[j]>=0){time[i]=time[j];queue[tail++]=i;break;}if(tail===start)break;}
    const map=document.createElement('canvas');map.width=w;map.height=h;const mc=map.getContext('2d'),out=mc.createImageData(w,h);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const t=time[(y+M)*W+x+M],o=(y*w+x)*4;out.data[o]=out.data[o+1]=out.data[o+2]=255;out.data[o+3]=t<0?0:Math.round(255-clamp(t,0,1)*250);}
    mc.putImageData(out,0,0);
    const norm=([x,y])=>[+((x-M)/w).toFixed(4),+((y-M)/h).toFixed(4)];
    return {v:ILLUSTRATION_VERSION,map:map.toDataURL('image/png'),pen:plan.map(s=>({p:s.pts.map(norm),a:+(s.t0/total).toFixed(5),b:+(s.t1/total).toFixed(5)}))};
  }
  // Where the hand is at a moment of an illustration: along the current stroke, or lifted between strokes.
  function illustrationPen(pen,progress){
    let prev=null;
    for(const s of pen){
      if(progress<s.a){if(!prev)return {x:s.p[0][0],y:s.p[0][1],lift:0};const f=(progress-prev.b)/Math.max(1e-6,s.a-prev.b),from=prev.p[prev.p.length-1],to=s.p[0];return {x:from[0]+(to[0]-from[0])*f,y:from[1]+(to[1]-from[1])*f,lift:Math.sin(Math.PI*f)};}
      if(progress<=s.b){const lens=s.p.map((q,j)=>j?Math.hypot(q[0]-s.p[j-1][0],q[1]-s.p[j-1][1]):0),total=lens.reduce((a,b)=>a+b,0);let want=(progress-s.a)/Math.max(1e-6,s.b-s.a)*total;
        for(let j=1;j<s.p.length;j++){if(want<=lens[j]){const f=lens[j]?want/lens[j]:0;return {x:s.p[j-1][0]+(s.p[j][0]-s.p[j-1][0])*f,y:s.p[j-1][1]+(s.p[j][1]-s.p[j-1][1])*f,lift:0};}want-=lens[j];}
        return {x:s.p[s.p.length-1][0],y:s.p[s.p.length-1][1],lift:0};}
      prev=s;
    }
    return prev?{x:prev.p[prev.p.length-1][0],y:prev.p[prev.p.length-1][1],lift:0}:null;
  }
  function illustrationMarkup(it,body,progress,withHand){
    if(progress>=1)return body;
    const box=`x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}"`,key=`illustrate-${it.id.replace(/[^a-zA-Z0-9]/g,'')}`,cut=(255-250*progress)/255,slope=200;
    let markup=`<defs><filter id="${key}-f" filterUnits="userSpaceOnUse" ${box} color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="linear" slope="${slope}" intercept="${(1-slope*cut).toFixed(4)}"/></feComponentTransfer></filter><mask id="${key}" maskUnits="userSpaceOnUse" ${box} style="mask-type:alpha"><image href="${esc(it.illustration.map)}" ${box} preserveAspectRatio="none" filter="url(#${key}-f)"/></mask></defs><g mask="url(#${key})">${body}</g>`;
    const pen=withHand&&illustrationPen(it.illustration.pen,progress);
    if(pen)markup+=handMarkup(it.x+pen.x*it.w,it.y+pen.y*it.h-pen.lift*Math.min(it.w,it.h)*.06);
    return markup;
  }
  // Adds the illustration plan to artwork with a transparent background; other images keep the generic tracing.
  async function withIllustration(fields){
    if(!fields.transparentArtwork)return fields;
    try{return {...fields,illustration:await planIllustration(fields.src),duration:Math.max(num(fields.duration,2.2),3.2)};}catch(e){console.error('Could not plan the illustration',e);return fields;}
  }
  async function traceImage(src){
    const image=new Image();image.src=src;await image.decode();
    const size=96,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.clearRect(0,0,size,size);
    ctx.drawImage(image,0,0,size,size);const pixels=ctx.getImageData(0,0,size,size).data;
    const lum=new Float32Array(size*size),alpha=new Uint8Array(size*size);let transparent=0,inside=0;
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const i=y*size+x,j=i*4;lum[i]=.2126*pixels[j]+.7152*pixels[j+1]+.0722*pixels[j+2];alpha[i]=pixels[j+3];
      inside++;if(alpha[i]<230)transparent++;
    }
    const hasAlpha=transparent/Math.max(1,inside)>.03,ink=new Uint8Array(size*size);
    for(let y=1;y<size-1;y++)for(let x=1;x<size-1;x++){
      const i=y*size+x;if(alpha[i]<60)continue;
      if(hasAlpha)ink[i]=1;
      else {const contrast=Math.abs(lum[i-1]-lum[i+1])+Math.abs(lum[i-size]-lum[i+size]);ink[i]=(lum[i]<135||contrast>85)?1:0;}
    }
    const cases={1:[[3,0]],2:[[0,1]],3:[[3,1]],4:[[1,2]],5:[[3,0],[1,2]],6:[[0,2]],7:[[3,2]],8:[[2,3]],9:[[0,2]],10:[[0,1],[2,3]],11:[[1,2]],12:[[1,3]],13:[[0,1]],14:[[3,0]]};
    const segments=[],point=(edge,x,y)=>edge===0?[x+.5,y]:edge===1?[x+1,y+.5]:edge===2?[x+.5,y+1]:[x,y+.5];
    for(let y=0;y<size-1;y++)for(let x=0;x<size-1;x++){
      const bits=ink[y*size+x]|(ink[y*size+x+1]<<1)|(ink[(y+1)*size+x+1]<<2)|(ink[(y+1)*size+x]<<3);
      for(const [a,b] of cases[bits]||[])segments.push([point(a,x,y),point(b,x,y)]);
    }
    const links=new Map(),key=p=>`${p[0]},${p[1]}`;
    segments.forEach((s,i)=>s.forEach(p=>{const k=key(p);if(!links.has(k))links.set(k,[]);links.get(k).push(i);}));
    const used=new Uint8Array(segments.length),traces=[];
    segments.forEach((segment,index)=>{
      if(used[index])return;used[index]=1;const pts=[segment[0],segment[1]];
      for(const atStart of [false,true])for(let n=0;n<500;n++){
        const end=atStart?pts[0]:pts[pts.length-1],next=(links.get(key(end))||[]).find(i=>!used[i]);if(next==null)break;
        used[next]=1;const other=segments[next][key(segments[next][0])===key(end)?1:0];if(atStart)pts.unshift(other);else pts.push(other);
      }
      if(pts.length<6)return;
      let distance=0;for(let i=1;i<pts.length;i++)distance+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);
      if(distance<9)return;
      const reduced=pts.filter((p,i)=>i===0||i===pts.length-1||i%2===0);
      traces.push({distance,d:'M'+reduced.map(p=>`${(p[0]*100/(size-1)).toFixed(1)} ${(p[1]*100/(size-1)).toFixed(1)}`).join(' L')});
    });
    const fillPaths=[];
    if(hasAlpha)for(let y=3;y<size-2;y+=5){
      let start=-1;
      for(let x=0;x<=size;x++){
        const opaque=x<size&&alpha[y*size+x]>=60;
        if(opaque&&start<0)start=x;
        if(!opaque&&start>=0){if(x-start>=2)fillPaths.push(`M${(start*100/(size-1)).toFixed(1)} ${(y*100/(size-1)).toFixed(1)} L${((x-1)*100/(size-1)).toFixed(1)} ${(y*100/(size-1)).toFixed(1)}`);start=-1;}
      }
    }
    return {paths:traces.sort((a,b)=>b.distance-a.distance).slice(0,80).map(x=>x.d),fillPaths,transparent:hasAlpha};
  }
  async function uploadImage(file){
    if(!file)return;if(file.size>12*1024*1024){toast('Choose an image under 12 MB.');return;}
    try{
      if(file.type==='image/svg+xml'){
        const text=await file.text(),doc=new DOMParser().parseFromString(text,'image/svg+xml'),root=doc.documentElement;
        if(root.tagName.toLowerCase()==='svg'&&!doc.querySelector('parsererror')){
          const vb=(root.getAttribute('viewBox')||'0 0 100 100').split(/[\s,]+/).map(Number);
          const paths=[...root.querySelectorAll('path')];
          if(paths.length&&paths.length<200&&paths.every(p=>!p.hasAttribute('transform')&&!p.closest('g[transform]'))&&vb.length===4&&vb.every(Number.isFinite)){
            const clean=paths.map(p=>{const fill=safePaint(p.getAttribute('fill')||'none','none'),stroke=safePaint(p.getAttribute('stroke')||((fill!=='none'&&fill!=='transparent')?fill:'#285d63'),'#285d63');return {d:p.getAttribute('d')||'',stroke:stroke==='none'?(fill==='none'?'#285d63':fill):stroke,fill,sw:num(p.getAttribute('stroke-width'),3)};}).filter(p=>p.d&&p.d.length<50000);
            if(clean.length){addItem({...baseItem('vector'),paths:clean,vb,x:600,y:280,w:400,h:400,color:'#285d63',animation:'draw'});toast('SVG paths added as a drawing.');return;}
          }
          for(const el of [root,...root.querySelectorAll('*')]){
            if(['script','style','foreignobject','iframe','object','embed','image','animate','set'].includes(el.localName.toLowerCase())){el.remove();continue;}
            for(const attr of [...el.attributes]){const name=attr.name.toLowerCase(),value=attr.value;if(name.startsWith('on')||((name==='href'||name.endsWith(':href'))&&!value.startsWith('#'))||/url\(\s*['"]?(?!#)/i.test(value)||(name==='style'&&/@import|expression/i.test(value)))el.removeAttribute(attr.name);}
          }
          const safe=await readFile(new Blob([new XMLSerializer().serializeToString(root)],{type:'image/svg+xml'})),trace=await traceImage(safe);
          addItem(await withIllustration({...baseItem('image'),src:safe,tracePaths:trace.paths,fillPaths:trace.fillPaths,transparentArtwork:trace.transparent,x:620,y:250,w:420,h:400}));toast('SVG artwork added with marker tracing.');return;
        }
        toast('That SVG could not be read.');return;
      }
      const src=await readFile(file);if(!/^data:image\/(png|jpeg|svg\+xml);base64,/.test(src)){toast('Use a PNG, JPEG, or SVG image.');return;}
      const trace=await traceImage(src);
      addItem(await withIllustration({...baseItem('image'),src,tracePaths:trace.paths,fillPaths:trace.fillPaths,transparentArtwork:trace.transparent,x:620,y:250,w:420,h:400}));toast('Image added with marker tracing.');
    }catch(e){toast('Could not read that image.');}
  }
  function applyField(key,value){
    const it=item(),target=['sceneName','background'].includes(key)?scene():it;if(!target)return;
    if(key==='sceneName')target.name=value.slice(0,80)||'Scene';
    else if(['x','y','w','h','fontSize','duration','pause','zoom','cx','cy'].includes(key)){
      const n=num(value,target[key]);target[key]=key==='duration'?clamp(n,.1,60):key==='pause'?clamp(n,0,60):key==='zoom'?clamp(n,.2,5):key==='w'||key==='h'?clamp(n,10,30000):key==='fontSize'?clamp(n,16,180):n;
    }else target[key]=value;
    if(it?.type==='text'&&['text','font','fontSize','color','w','h'].includes(key))scheduleHandwriting(it);
    changed(false);
  }
  function action(name){
    const it=item(),items=scene().items;
    if(name==='scene-delete'){if(state.project.scenes.length===1)return;snapshot();state.project.scenes.splice(state.sceneIndex,1);state.sceneIndex=Math.max(0,state.sceneIndex-1);state.selected=null;state.time=sceneStart(state.sceneIndex);changed();return;}
    if(name==='preview-camera'){previewCamera();return;}
    if(!it)return;
    const index=items.findIndex(x=>x.id===it.id);snapshot();
    if(name==='delete'){items.splice(index,1);state.selected=null;}
    if(name==='duplicate'){const copy=clone(it);copy.id=id();if(copy.x!=null){copy.x+=35;copy.y+=35;}items.splice(index+1,0,copy);state.selected=copy.id;}
    if(name==='back'&&index>0)[items[index-1],items[index]]=[items[index],items[index-1]];
    if(name==='forward'&&index<items.length-1)[items[index+1],items[index]]=[items[index],items[index+1]];
    changed();
  }
  function pointOnStage(e){const svg=$('#stage'),p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());}
  function resizeSelected(it,drag,dx,dy){
    const handle=drag.handle;
    if(it.type==='camera'){
      const box=drag.box,wide=handle.includes('e')?1+2*dx/box[2]:handle.includes('w')?1-2*dx/box[2]:null,tall=handle.includes('s')?1+2*dy/box[3]:handle.includes('n')?1-2*dy/box[3]:null;
      const factor=wide!==null&&tall!==null?(Math.abs(wide-1)>=Math.abs(tall-1)?wide:tall):(wide??tall);
      it.zoom=clamp(drag.original.zoom/Math.max(.05,factor),.2,5);return;
    }
    let left=drag.box[0],top=drag.box[1],right=left+drag.box[2],bottom=top+drag.box[3];
    if(handle.includes('w'))left=Math.min(right-20,left+dx);
    if(handle.includes('e'))right=Math.max(left+20,right+dx);
    if(handle.includes('n'))top=Math.min(bottom-20,top+dy);
    if(handle.includes('s'))bottom=Math.max(top+20,bottom+dy);
    it.x=Math.round(left);it.y=Math.round(top);it.w=Math.round(right-left);it.h=Math.round(bottom-top);
  }
  function bind(){
    document.querySelectorAll('.tool').forEach(b=>b.addEventListener('click',()=>{stopPreview();state.tool=b.dataset.tool;state.selected=null;if(state.tool==='text')addText();else if(state.tool==='upload')$('#uploadInput').click();else if(state.tool==='camera')addCamera();else{renderAll();}}));
    $('#inspector').addEventListener('click',e=>{const icon=e.target.closest('[data-icon]'),sheet=e.target.closest('[data-sheet-item]'),shape=e.target.closest('[data-shape]'),ratio=e.target.closest('[data-ratio]'),align=e.target.closest('[data-align]'),act=e.target.closest('[data-action]');if(align){const it=item();if(it?.type==='text'&&(it.align||'left')!==align.dataset.align){snapshot();it.align=align.dataset.align;scheduleHandwriting(it);changed();}}const tab=e.target.closest('[data-lib-tab]'),emoji=e.target.closest('[data-emoji]'),tabler=e.target.closest('[data-tabler]');
      if(tab&&library.tab!==tab.dataset.libTab){library.tab=tab.dataset.libTab;library.category='all';library.limit=LIBRARY_PAGE;renderInspector();}
      if(e.target.closest('[data-lib-more]')){library.limit+=LIBRARY_PAGE;showLibraryResults();}
      if(emoji)addEmojiDrawing(emoji.dataset.emoji);if(tabler)addTablerIcon(+tabler.dataset.tabler);
      if(icon)addIcon(icon.dataset.icon);if(sheet)addSheetDrawing(+sheet.dataset.sheet,+sheet.dataset.sheetItem);if(shape)addShape(shape.dataset.shape);if(ratio){snapshot();state.project.ratio=ratio.dataset.ratio;changed();}if(act)action(act.dataset.action);});
    $('#inspector').addEventListener('focusin',e=>{if(e.target.matches('[data-set]'))snapshot();});
    $('#inspector').addEventListener('input',e=>{if(e.target.id==='librarySearch'){library.query=e.target.value;library.limit=LIBRARY_PAGE;showLibraryResults();}else if(e.target.matches('[data-set]'))applyField(e.target.dataset.set,e.target.value);});
    $('#inspector').addEventListener('change',e=>{if(e.target.id==='libraryCategory'){library.category=e.target.value;library.limit=LIBRARY_PAGE;showLibraryResults();return;}if(e.target.matches('[data-set]')){applyField(e.target.dataset.set,e.target.value);renderInspector();}});
    $('#stage').addEventListener('pointerdown',e=>{
      if(state.preview||e.button>1)return;
      if(state.tool==='pan'||e.button===1){state.drag={mode:'pan',clientX:e.clientX,clientY:e.clientY,view:{...state.editorView}};$('#stage').setPointerCapture(e.pointerId);return;}
      const hit=e.target.closest('[data-item]'),handle=e.target.closest('[data-handle]');
      if(hit){const it=scene().items.find(x=>x.id===hit.dataset.item);if(!it)return;if(state.selected!==it.id)selectItem(it.id);const p=pointOnStage(e);snapshot();state.drag={mode:handle?'resize':'move',id:it.id,handle:handle?.dataset.handle,start:p,box:it.type==='camera'?cameraBox(it):[it.x,it.y,it.w,it.h],original:it.type==='camera'?{cx:it.cx,cy:it.cy,zoom:it.zoom}:{x:it.x,y:it.y,w:it.w,h:it.h}};$('#stage').setPointerCapture(e.pointerId);}
      else if(state.selected){state.selected=null;renderAll();}
    });
    $('#stage').addEventListener('pointermove',e=>{
      if(!state.drag)return;
      const drag=state.drag;
      if(drag.mode==='pan'){const units=drag.view.w/Math.max(1,$('#stage').clientWidth);state.editorView.cx=drag.view.cx-(e.clientX-drag.clientX)*units;state.editorView.cy=drag.view.cy-(e.clientY-drag.clientY)*units;renderStage();return;}
      const it=scene().items.find(x=>x.id===drag.id);if(!it)return;const p=pointOnStage(e),dx=p.x-drag.start.x,dy=p.y-drag.start.y;
      if(drag.mode==='resize')resizeSelected(it,drag,dx,dy);
      else if(it.type==='camera'){it.cx=Math.round(drag.original.cx+dx);it.cy=Math.round(drag.original.cy+dy);}
      else{it.x=Math.round(drag.original.x+dx);it.y=Math.round(drag.original.y+dy);}
      renderStage();
    });
    const endDrag=()=>{if(!state.drag)return;const wasPan=state.drag.mode==='pan',dragged=scene().items.find(x=>x.id===state.drag.id),resized=state.drag.mode==='resize';state.drag=null;if(wasPan){saveEditorView();renderStage();}else{if(resized&&dragged?.type==='text')scheduleHandwriting(dragged);changed(false);renderInspector();}};$('#stage').addEventListener('pointerup',endDrag);$('#stage').addEventListener('pointercancel',endDrag);
    bindTimeline();bindAudio();
    $('#projectName').addEventListener('focus',()=>snapshot());$('#projectName').addEventListener('input',e=>{state.project.name=e.target.value.slice(0,80);changed(false);});
    $('#addSceneBtn').addEventListener('click',()=>{stopPreview();snapshot();state.project.scenes.push({id:id(),name:`Scene ${state.project.scenes.length+1}`,background:'#ffffff',items:[]});state.sceneIndex=state.project.scenes.length-1;state.selected=null;state.time=sceneStart(state.sceneIndex);changed();});
    $('#duplicateSceneBtn').addEventListener('click',()=>{stopPreview();snapshot();const copy=clone(scene());copy.id=id();copy.name+=` copy`;copy.items.forEach(x=>x.id=id());state.project.scenes.splice(state.sceneIndex+1,0,copy);state.sceneIndex++;state.selected=null;state.time=sceneStart(state.sceneIndex);changed();});
    $('#playBtn').addEventListener('click',play);$('#previewBtn').addEventListener('click',()=>{if(state.playing)pause();else play();});$('#restartBtn').addEventListener('click',()=>seek(0));$('#stopBtn').addEventListener('click',stop);$('#topStopBtn').addEventListener('click',stop);$('#fitBtn').addEventListener('click',fitContent);$('#zoomInBtn').addEventListener('click',()=>zoomEditor(.8));$('#zoomOutBtn').addEventListener('click',()=>zoomEditor(1.25));
    $('#scrubber').addEventListener('input',e=>seek(+e.target.value/1000*totalLen()));$('#exportBtn').addEventListener('click',exportVideo);$('#projectsBtn').addEventListener('click',showProjects);
    $('#uploadInput').addEventListener('change',async e=>{await uploadImage(e.target.files[0]);e.target.value='';});$('#audioInput').addEventListener('change',async e=>{await uploadAudio(e.target.files[0],state.audioLane??0);e.target.value='';});$('#projectBackupInput').addEventListener('change',async e=>{await importProjectBackup(e.target.files[0]);e.target.value='';});
    $('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){if(!state.exporting)closeModal();return;}const b=e.target.closest('[data-modal],[data-open],[data-delete-project]');if(!b)return;if(b.dataset.deleteProject)deleteProject(b.dataset.deleteProject);else if(b.dataset.open)loadProject(b.dataset.open);else if(b.dataset.modal==='close'&&!state.exporting)closeModal();else if(b.dataset.modal==='new')showNewProject();else if(b.dataset.modal==='create')createProject();else if(b.dataset.modal==='backup')downloadProjectBackup();else if(b.dataset.modal==='import')$('#projectBackupInput').click();});
    document.addEventListener('keydown',e=>{const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);if(e.ctrlKey||e.metaKey){if(e.key.toLowerCase()==='z'){e.preventDefault();if(state.undo.length){state.redo.push(clone(state.project));state.project=state.undo.pop();state.sceneIndex=clamp(state.sceneIndex,0,state.project.scenes.length-1);state.selected=null;changed();}return;}if(e.key.toLowerCase()==='y'){e.preventDefault();if(state.redo.length){state.undo.push(clone(state.project));state.project=state.redo.pop();state.sceneIndex=clamp(state.sceneIndex,0,state.project.scenes.length-1);state.selected=null;changed();}return;}}if(typing)return;if(e.altKey&&state.selected&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();action(e.key==='ArrowLeft'?'back':'forward');return;}if(e.code==='Space'){e.preventDefault();play();}if((e.key==='Delete'||e.key==='Backspace')&&state.selected){e.preventDefault();action('delete');}else if((e.key==='Delete'||e.key==='Backspace')&&state.selectedClip){e.preventDefault();clipAction('delete');}if(e.key==='Escape'&&state.preview)stop();});
    window.addEventListener('beforeunload',()=>{if(state.project)saveProject();});
  }
  async function init(){try{
    const fontResponse=await fetch('./assets/stroke-font.json');if(!fontResponse.ok)throw new Error('Writing font did not load');state.fonts=await fontResponse.json();
    const hand=new Image();hand.src=HAND.src;await hand.decode();state.handImage=hand;
    state.db=await openDb();const current=localStorage.getItem('whiteboard-current');let p=current?await dbTask('readonly',s=>s.get(current)):null;if(!p){const all=await listProjects();p=all[0]||demoProject();}
    state.project=await migrateProject(p);state.editorView=projectView(state.project);bind();new ResizeObserver(renderStage).observe($('#canvasShell'));renderAll();prepareHandwriting();prepareAudio();await saveProject();
  }catch(e){console.error(e);$('#inspector').innerHTML=`<h2 class="panel-title">Could not open the editor</h2><p class="panel-help">${esc(e.message)}. Reload the app to try again.</p>`;}}
  init();
})();
