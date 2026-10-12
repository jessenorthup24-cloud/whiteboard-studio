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
  const HANDWRITING_FONTS = {patrick:'Patrick Hand',kalam:'Kalam',indie:'Indie Flower',caveat:'Caveat',gochi:'Gochi Hand',handlee:'Handlee',architects:'Architects Daughter',shadows:'Shadows Into Light',gloria:'Gloria Hallelujah',permanent:'Permanent Marker'};
  const FONT_OPTIONS = [['patrick','Classic whiteboard · Patrick Hand'],['kalam','Natural marker · Kalam'],['indie','Casual hand · Indie Flower'],['caveat','Flowing hand · Caveat'],['gochi','Playful marker · Gochi Hand'],['handlee','Neat hand · Handlee'],['architects','Architect hand'],['shadows','Light hand · Shadows Into Light'],['gloria','Lively hand · Gloria Hallelujah'],['permanent','Heavy marker · Permanent Marker'],['futural','Simple stroke'],['futuram','Bold stroke'],['scripts','Script stroke'],['scriptc','Bold script stroke'],['cursive','Cursive stroke'],['gothiceng','Gothic stroke'],['gothicita','Gothic italic stroke'],['timesr','Serif stroke'],['timesi','Italic serif stroke'],['timesrb','Bold serif stroke']];
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
    {name:'Stories',file:'biblical-stories.png',cols:4,rows:3,items:['Empty tomb','Manger','Mustard plant','Burning bush','Rainbow','Ladder','Loaves and fish','Water jar','Sling','Sling stones','Olive press','Winepress']}
  ];
  const HAND = {src:'./assets/marker-hand-v3.png',x:138,y:16,w:650,h:433};
  const sheetCache=new Map(),cropCache=new Map();
  const textTimers=new Map();
  const state = {project:null,sceneIndex:0,selected:null,tool:'select',playing:false,preview:false,previewCameraBox:null,editorView:{cx:800,cy:450,w:1600},time:0,frame:0,lastTick:0,saveTimer:0,undo:[],redo:[],db:null,drag:null,audio:null,exporting:false,recording:null,fonts:null,handImage:null};

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
    const raw=it.icon?ICONS[it.icon]?.paths.map(d=>({d,stroke:it.color,fill:'none',sw:3.7}))||[]:it.paths||[];
    const vb=it.vb||[0,0,100,100],sx=it.w/vb[2],sy=it.h/vb[3];
    return raw.map(p=>({...p,tx:it.x-vb[0]*sx,ty:it.y-vb[1]*sy,sx,sy}));
  }
  function textPaths(it){
    const font=state.fonts?.[it.font]||state.fonts?.futural;if(!font)return [];
    const glyph=c=>font.chars[(c.charCodeAt(0)>=33&&c.charCodeAt(0)<=127?c.charCodeAt(0):63)-33];
    const rows=String(it.text||'Text').split('\n').slice(0,6),advance=c=>/\s/u.test(c)?12:(glyph(c)?.o||10)*1.68;
    const scale=it.fontSize/23,maxWidth=Math.max(1,...rows.map(row=>[...row].reduce((a,c)=>a+advance(c),0))),fit=Math.min(1,it.w/(maxWidth*scale));
    const paths=[];rows.forEach((row,j)=>{let left=0;for(const raw of row){if(!/\s/u.test(raw)){const g=glyph(raw);if(g?.d)paths.push({d:g.d,tx:it.x+left*scale*fit,ty:it.y+j*it.fontSize*1.18,sx:scale*fit,sy:scale,stroke:it.color,sw:1.35});}left+=advance(raw);}});
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
      const body=`<image href="${esc(it.handwritingSrc)}" x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" preserveAspectRatio="none"/>`;
      return start+maskedDrawing(it,body,progress,hand&&progress<1)+hit+end;
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
  function tileLabel(it){return it.type==='icon'?ICONS[it.icon]?.name||'Drawing':it.type==='text'?(it.text||'Text').split('\n')[0]:it.type==='camera'?'Camera move':it.type==='shape'?'Shape':it.type==='image'?(it.label||'Uploaded image'):'Drawing';}
  function tileThumb(it){return it.type==='camera'?'▣':it.type==='icon'?'✎':it.type==='text'?'Ｔ':it.type==='shape'?'▢':it.type==='image'?'▧':'✳';}
  function renderTimeline(){
    $('#sceneStrip').innerHTML=state.project.scenes.map((s,i)=>`<button class="scene-tile ${i===state.sceneIndex?'active':''}" data-scene="${i}"><span class="scene-number">${String(i+1).padStart(2,'0')}</span><span>${esc(s.name)}</span></button>`).join('');
    $('#itemStrip').innerHTML=scene().items.map(it=>`<button class="item-tile ${it.id===state.selected?'selected':''} ${it.type==='camera'?'camera':''}" data-item="${esc(it.id)}" draggable="true"><span class="thumb">${tileThumb(it)}</span><span class="item-duration">${num(it.duration,1).toFixed(1)}s</span><span class="item-name">${esc(tileLabel(it))}</span></button>`).join('');
    const len=totalLen();$('#durationLabel').textContent=fmt(len);$('#timeLabel').textContent=`${fmt(state.time)} / ${fmt(len)}`;
    $('#scrubber').value=len?Math.round(state.time/len*1000):0;$('#scrubPercent').textContent=`${len?Math.round(state.time/len*100):0}%`;
    $('#audioTrackLabel').textContent=state.project.audio?.name||'Add narration or music from the Audio tool';
    $('#playBtn').textContent=state.playing?'Ⅱ':'▶';
  }
  const field=(label,key,val,type='text',opts='')=>`<div class="field"><label>${label}</label><input data-set="${key}" type="${type}" value="${esc(val)}" ${opts}></div>`;
  const selectField=(label,key,val,options)=>`<div class="field"><label>${label}</label><select data-set="${key}">${options.map(([v,n])=>`<option value="${v}" ${val===v?'selected':''}>${n}</option>`).join('')}</select></div>`;
  function renderInspector(){
    const it=item(),s=scene();let html='';
    if(it){
      html=`<div class="panel-eyebrow">SELECTED ${it.type.toUpperCase()}</div><h2 class="panel-title">${esc(tileLabel(it))}</h2><p class="panel-help">Fine tune how this part of your story appears.</p>`;
      if(it.type==='camera'){
        html+=`<div class="panel-divider"></div>${field('Zoom','zoom',it.zoom,'number','min="0.2" max="5" step="0.05"')}<div class="field-row">${field('Center X','cx',Math.round(it.cx),'number','step="10"')}${field('Center Y','cy',Math.round(it.cy),'number','step="10"')}</div><button class="panel-action camera-preview" data-action="preview-camera">Preview this camera frame</button><p class="panel-help camera-help">Drag the green frame to pan. Drag its handles to resize the shot. Preview is cropped to this frame.</p>`;
      }else{
        if(it.type==='text')html+=`<div class="field"><label>Text</label><textarea data-set="text">${esc(it.text)}</textarea></div>${field('Font size','fontSize',it.fontSize,'number','min="16" max="180"')}${selectField('Writing style','font',it.font||'futural',FONT_OPTIONS)}${HANDWRITING_FONTS[it.font]?`<div class="font-sample" style="font-family:'${esc(HANDWRITING_FONTS[it.font])}',sans-serif">The quick brown fox 123</div>`:''}`;
        if(it.type==='icon'||it.type==='text'||it.type==='vector')html+=field('Color','color',it.color||'#285d63','color');
        if(it.type==='shape')html+=`${selectField('Shape','shape',it.shape,[['round','Rounded rectangle'],['rect','Rectangle'],['circle','Ellipse']])}${field('Fill','fill',it.fill,'color')}`;
        html+=`<div class="field-row">${field('X position','x',Math.round(it.x),'number','step="1"')}${field('Y position','y',Math.round(it.y),'number','step="1"')}</div><div class="field-row">${field('Width','w',Math.round(it.w),'number','min="10"')}${field('Height','h',Math.round(it.h),'number','min="10"')}</div>`;
        html+=selectField('Entrance','animation',it.animation==='reveal'?'draw':it.animation,[['draw','Hand draw'],['fade','Fade in'],['slide','Slide in'],['pop','Pop in'],['none','Appear']]);
        if(it.type==='image')html+=`<div class="note-card">The marker traces visible contours and fills only visible artwork. Transparent areas stay clear.</div>`;
      }
      html+=`<div class="panel-divider"></div><div class="field-row">${field('Duration (sec)','duration',it.duration,'number','min="0.1" max="60" step="0.1"')}${field('Pause (sec)','pause',it.pause,'number','min="0" max="60" step="0.1"')}</div><div class="panel-divider"></div><div class="panel-actions"><button class="panel-action" data-action="duplicate">Duplicate</button><button class="panel-action" data-action="back">Move earlier</button><button class="panel-action" data-action="forward">Move later</button><button class="panel-action danger" data-action="delete">Delete</button></div>`;
    }else if(state.tool==='icon'){
      html=`<div class="panel-eyebrow">LIBRARY</div><h2 class="panel-title">Drawings</h2><p class="panel-help">Choose an illustration to add it to the canvas.</p><div class="preset-grid">${iconKeys.map(k=>`<button class="preset" data-icon="${k}" title="${ICONS[k].name}">${({bulb:'♧',chart:'↗',heart:'♡',star:'☆',person:'♙',cloud:'☁',rocket:'♢',check:'✓',pencil:'✎'})[k]}</button>`).join('')}</div><div class="panel-divider"></div><div class="field"><label for="librarySearch">Find an illustration</label><input id="librarySearch" type="search" placeholder="Search all 160 drawings"></div>${SHEETS.map((sheet,si)=>`${si===0?'<div class="panel-eyebrow">BLACK LINE ART</div>':si===10?'<div class="panel-divider"></div><div class="panel-eyebrow">BIBLE ERA COLOR ART</div>':''}<section class="sheet-section"><h3 class="sheet-title">${sheet.name}</h3><div class="sheet-grid">${sheet.items.map((name,ii)=>{const cols=sheet.cols||2,rows=sheet.rows||2;return `<button class="sheet-item" data-sheet="${si}" data-sheet-item="${ii}" title="Add ${esc(name)}"><span class="sheet-thumb" style="background-image:url('./assets/sheets/${sheet.file}');background-size:${cols*100}% ${rows*100}%;background-position:${(ii%cols)/(cols-1)*100}% ${Math.floor(ii/cols)/(rows-1)*100}%"></span><span>${esc(name)}</span></button>`;}).join('')}</div></section>`).join('')}<div class="panel-divider"></div><div class="note-card">All artwork has a transparent background and is added one drawing at a time.</div>`;
    }else if(state.tool==='shape'){
      html=`<div class="panel-eyebrow">ELEMENTS</div><h2 class="panel-title">Shapes</h2><p class="panel-help">Simple shapes help frame your message.</p><div class="preset-grid"><button class="preset" data-shape="round">▢</button><button class="preset" data-shape="rect">□</button><button class="preset" data-shape="circle">○</button></div>`;
    }else if(state.tool==='audio'){
      html=`<div class="panel-eyebrow">SOUND</div><h2 class="panel-title">Audio</h2><p class="panel-help">Add one narration or music track to your video.</p><div class="panel-actions"><button class="button primary" data-action="audio-upload">Upload audio</button><button class="panel-action" data-action="audio-record">${state.recording?'■ Stop recording':'● Record voice'}</button></div><div class="panel-divider"></div>${state.project.audio?`<div class="note-card">♫ ${esc(state.project.audio.name)}</div><p></p><button class="panel-action danger" data-action="audio-remove">Remove audio</button>`:'<div class="note-card">Tip: record narration first, then match the visual timing to it.</div>'}`;
    }else{
      html=`<div class="panel-eyebrow">SCENE SETTINGS</div><h2 class="panel-title">${esc(s.name)}</h2><p class="panel-help">Build your whiteboard story, one moment at a time.</p>${field('Scene name','sceneName',s.name)}${field('Background','background',s.background,'color')}<div class="panel-divider"></div><div class="field"><label>Camera and video format</label><div class="segmented">${[['16:9','Wide'],['1:1','Square'],['9:16','Tall']].map(([v,n])=>`<button data-ratio="${v}" class="${state.project.ratio===v?'active':''}">${n}</button>`).join('')}</div></div><div class="panel-divider"></div><div class="note-card">Pan across the whiteboard to build beyond the first frame. Add camera views to choose each shot.</div><div class="panel-divider"></div><button class="panel-action danger" data-action="scene-delete" ${state.project.scenes.length===1?'disabled':''}>Delete scene</button>`;
    }
    $('#inspector').innerHTML=html;
    if(state.tool==='icon'&&!it)hydrateSheetThumbnails();
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
  async function cropSheetDrawing(sheetIndex,drawingIndex){
    const key=`${sheetIndex}:${drawingIndex}`;if(cropCache.has(key))return cropCache.get(key);
    const pending=(async()=>{const data=await sheetData(sheetIndex);if(data.drawings)return data.drawings[drawingIndex];const {image,cells}=data,[x,y,w,h]=cells[drawingIndex],canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(image,x,y,w,h,0,0,w,h);return {src:canvas.toDataURL('image/png'),width:w,height:h};})().catch(e=>{cropCache.delete(key);throw e;});
    cropCache.set(key,pending);return pending;
  }
  function hydrateSheetThumbnails(){
    state.galleryObserver?.disconnect();
    if(!window.IntersectionObserver)return;
    state.galleryObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;const button=entry.target;state.galleryObserver?.unobserve(button);cropSheetDrawing(+button.dataset.sheet,+button.dataset.sheetItem).then(art=>{const thumb=button.querySelector('.sheet-thumb');if(thumb){thumb.style.backgroundImage=`url("${art.src}")`;thumb.style.backgroundSize='contain';thumb.style.backgroundPosition='center';}}).catch(console.error);}}, {root:$('#inspector'),rootMargin:'160px'});
    document.querySelectorAll('#inspector [data-sheet-item]').forEach(button=>state.galleryObserver.observe(button));
  }
  function filterLibrary(query){
    const needle=query.trim().toLowerCase();
    document.querySelectorAll('#inspector .sheet-section').forEach(section=>{
      let visible=0;section.querySelectorAll('[data-sheet-item]').forEach(button=>{const match=!needle||button.textContent.toLowerCase().includes(needle);button.hidden=!match;if(match)visible++;});
      section.hidden=visible===0;
    });
  }
  async function addSheetDrawing(sheetIndex,drawingIndex){
    const sheet=SHEETS[sheetIndex],name=sheet?.items[drawingIndex];if(!name)return;
    try{
      const art=await cropSheetDrawing(sheetIndex,drawingIndex),trace=await traceImage(art.src);
      let w=sheet.cols?330:420,h=w*art.height/art.width;if(h>470){w*=470/h;h=470;}
      addItem({...baseItem('image'),label:name,src:art.src,tracePaths:trace.paths,fillPaths:trace.fillPaths,transparentArtwork:trace.transparent,sheetRef:[sheetIndex,drawingIndex],cropVersion:2,w,h,duration:2.2});toast(`${name} added to the canvas.`);
    }catch(e){console.error(e);toast('Could not add that illustration.');}
  }
  function textSignature(it){return JSON.stringify([it.text,it.font,it.fontSize,it.color,it.w,it.h]);}
  async function refreshHandwriting(it){
    if(!HANDWRITING_FONTS[it.font])return;
    const signature=textSignature(it),family=HANDWRITING_FONTS[it.font],rows=String(it.text||'').split('\n').slice(0,8);
    try{
      await document.fonts.load(`48px "${family}"`);
      if(textSignature(it)!==signature)return;
      const ratio=Math.max(1,Math.min(3,2400/Math.max(1,it.w),2400/Math.max(1,it.h))),canvas=document.createElement('canvas');
      canvas.width=Math.max(1,Math.ceil(it.w*ratio));canvas.height=Math.max(1,Math.ceil(it.h*ratio));
      const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.scale(ratio,ratio);
      const size=Math.max(12,Math.min(it.fontSize,(it.h-8)/(Math.max(1,rows.length)*1.16)));
      ctx.font=`${size}px "${family}"`;ctx.textBaseline='top';ctx.fillStyle=it.color||'#213b4b';
      const longest=Math.max(1,...rows.map(row=>ctx.measureText(row).width)),fit=Math.min(1,(it.w-8)/longest);
      ctx.scale(fit,1);rows.forEach((row,index)=>ctx.fillText(row,4/fit,2+index*size*1.16));
      const src=canvas.toDataURL('image/png'),trace=await traceImage(src);
      if(textSignature(it)!==signature||!state.project.scenes.some(s=>s.items.includes(it)))return;
      it.handwritingSrc=src;it.handwritingSignature=signature;it.tracePaths=trace.paths;it.fillPaths=trace.fillPaths;it.transparentArtwork=true;changed(false);
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
  function selectItem(itemId){state.selected=itemId;state.tool='select';renderAll();}
  function pause(){state.playing=false;cancelAnimationFrame(state.frame);state.audio?.pause();renderTimeline();}
  function previewCamera(){
    const chosen=item();if(chosen?.type!=='camera')return;
    pause();let local=0;for(const entry of scene().items){local+=Math.max(.1,num(entry.duration,1));if(entry.id===chosen.id)break;local+=Math.max(0,num(entry.pause));}
    state.previewCameraBox=cameraBox(chosen);state.time=clamp(sceneStart(state.sceneIndex)+local,0,totalLen());state.preview=true;renderStage();renderTimeline();
  }
  function seek(time){pause();state.previewCameraBox=null;state.time=clamp(time,0,totalLen());state.preview=true;if(state.audio){try{state.audio.currentTime=state.time}catch{}}renderStage();renderTimeline();}
  function play(){
    if(state.playing){pause();return;}
    if(!state.preview){if(item()?.type==='camera')previewCamera();else state.previewCameraBox=null;}
    if(state.time>=totalLen()-.01)state.time=0;
    state.preview=true;state.playing=true;state.lastTick=performance.now();
    if(state.project.audio){if(!state.audio||state.audio.src!==state.project.audio.src)state.audio=new Audio(state.project.audio.src);state.audio.currentTime=state.time;state.audio.play().catch(()=>{});}
    const tick=(now)=>{if(!state.playing)return;state.time=clamp(state.time+(now-state.lastTick)/1000,0,totalLen());state.lastTick=now;renderStage();renderTimeline();if(state.time>=totalLen())pause();else state.frame=requestAnimationFrame(tick);};
    state.frame=requestAnimationFrame(tick);renderTimeline();
  }
  function stopPreview(){pause();state.preview=false;state.previewCameraBox=null;renderStage();}
  function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open('whiteboard-studio',1);req.onupgradeneeded=()=>req.result.createObjectStore('projects',{keyPath:'id'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
  function dbTask(mode,fn){return new Promise((resolve,reject)=>{const tx=state.db.transaction('projects',mode),store=tx.objectStore('projects');let req=fn(store);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
  async function saveProject(){try{await dbTask('readwrite',s=>s.put(clone(state.project)));localStorage.setItem('whiteboard-current',state.project.id);$('#saveStatus').textContent='Saved locally';}catch(e){$('#saveStatus').textContent='Could not save';toast('This project could not be saved. Check your browser storage.');}}
  async function migrateProject(p){
    for(const s of p.scenes)for(const it of s.items){
      if(it.animation==='reveal')it.animation='draw';
      if(it.type==='text'&&!it.font)it.font='futural';
      if(it.type==='image'&&Array.isArray(it.sheetRef)&&it.sheetRef[0]>=10&&it.cropVersion!==2){
        try{
          const art=await cropSheetDrawing(it.sheetRef[0],it.sheetRef[1]),trace=await traceImage(art.src),centerY=it.y+it.h/2;
          it.src=art.src;it.h=it.w*art.height/art.width;it.y=centerY-it.h/2;
          it.tracePaths=trace.paths;it.fillPaths=trace.fillPaths;it.transparentArtwork=trace.transparent;it.cropVersion=2;
        }catch(e){console.error('Could not refresh illustration',e);}
      }
      if(it.type==='image'&&it.src&&(!Array.isArray(it.tracePaths)||!Array.isArray(it.fillPaths)||it.transparentArtwork==null)){
        try{const trace=await traceImage(it.src);it.tracePaths=trace.paths;it.fillPaths=trace.fillPaths;it.transparentArtwork=trace.transparent;}
        catch{it.tracePaths=it.tracePaths||[];it.fillPaths=[];it.transparentArtwork=false;}
      }
    }
    return p;
  }
  function prepareHandwriting(){for(const s of state.project.scenes)for(const it of s.items)if(it.type==='text'&&HANDWRITING_FONTS[it.font]&&it.handwritingSignature!==textSignature(it))scheduleHandwriting(it);}
  async function ensureHandwriting(){const pending=[];for(const s of state.project.scenes)for(const it of s.items)if(it.type==='text'&&HANDWRITING_FONTS[it.font]&&it.handwritingSignature!==textSignature(it)){clearTimeout(textTimers.get(it.id));pending.push(refreshHandwriting(it));}await Promise.all(pending);}
  async function loadProject(projectId){pause();let p=await dbTask('readonly',s=>s.get(projectId));if(!p)return;state.project=await migrateProject(p);state.editorView=projectView(state.project);state.sceneIndex=0;state.selected=null;state.time=0;state.preview=false;state.previewCameraBox=null;state.audio=null;state.undo=[];state.redo=[];localStorage.setItem('whiteboard-current',p.id);closeModal();renderAll();prepareHandwriting();await saveProject();}
  async function listProjects(){return (await dbTask('readonly',s=>s.getAll())).sort((a,b)=>b.updated-a.updated);}
  function modal(html){$('#modal').innerHTML=`<div class="modal-card">${html}</div>`;$('#modal').classList.remove('hidden');}
  function closeModal(){$('#modal').classList.add('hidden');$('#modal').innerHTML='';}
  async function showProjects(){await saveProject();const projects=await listProjects();modal(`<div class="modal-top"><h2>My projects</h2><button class="close-button" data-modal="close">×</button></div><p class="panel-help">Projects are saved in this browser.</p>${projects.map(p=>`<div class="project-card"><span class="scene-number">✎</span><span><strong>${esc(p.name)}</strong><small>${p.scenes.length} scene${p.scenes.length===1?'':'s'} · ${new Date(p.updated).toLocaleDateString()}</small></span><button class="panel-action" data-open="${esc(p.id)}">Open</button></div>`).join('')}<div class="modal-foot"><button class="button primary" data-modal="new">+ New project</button></div>`);}
  function showNewProject(){modal(`<div class="modal-top"><h2>New video</h2><button class="close-button" data-modal="close">×</button></div><p class="panel-help">Choose a format and start with a blank whiteboard.</p><div class="field"><label>Project name</label><input id="newName" maxlength="80" value="Untitled video"></div><div class="field"><label>Format</label><select id="newRatio"><option value="16:9">16:9 — Landscape</option><option value="1:1">1:1 — Square</option><option value="9:16">9:16 — Portrait</option></select></div><div class="modal-foot"><button class="button ghost" data-modal="close">Cancel</button><button class="button primary" data-modal="create">Create video</button></div>`);}
  async function createProject(){const name=$('#newName').value.trim()||'Untitled video',ratio=$('#newRatio').value;const p={id:id(),name,ratio,updated:Date.now(),editorView:{cx:800,cy:450,w:1600},audio:null,scenes:[{id:id(),name:'Scene 1',background:'#ffffff',items:[]}]};state.project=p;state.editorView=projectView(p);state.sceneIndex=0;state.selected=null;state.time=0;state.preview=false;state.previewCameraBox=null;state.undo=[];state.redo=[];await saveProject();closeModal();renderAll();}
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
    let audioCtx=null,audioEl=null,stream=canvas.captureStream(30),recorder=null;
    try{
      await paintSvg(ctx,0);
      if(state.project.audio){audioCtx=new AudioContext();audioEl=new Audio(state.project.audio.src);audioEl.preload='auto';await new Promise(res=>{audioEl.oncanplay=()=>res();audioEl.onerror=()=>res();audioEl.load();setTimeout(res,2000);});const source=audioCtx.createMediaElementSource(audioEl),dest=audioCtx.createMediaStreamDestination();source.connect(dest);dest.stream.getAudioTracks().forEach(track=>stream.addTrack(track));}
      const chunks=[];recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:8000000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      const ended=new Promise((resolve,reject)=>{recorder.onstop=()=>resolve(new Blob(chunks,{type:mime}));recorder.onerror=e=>reject(e.error||new Error('Recording failed'));});
      recorder.start(1000);audioEl?.play().catch(()=>{});const start=performance.now(),duration=totalLen();let lastFrame=-1;
      while(true){let t=clamp((performance.now()-start)/1000,0,duration),frame=Math.floor(t*30);if(frame!==lastFrame){await paintSvg(ctx,t);lastFrame=frame;$('#progressBar').style.width=`${Math.round(t/duration*100)}%`;$('#exportStatus').textContent=`Rendering ${fmt(t)} of ${fmt(duration)}…`;}
        if(t>=duration)break;await new Promise(r=>setTimeout(r,12));}
      recorder.stop();audioEl?.pause();const blob=await ended;download(blob,`${safeFilename(state.project.name)}.${mime.includes('mp4')?'mp4':'webm'}`);closeModal();toast('Video exported.');
    }catch(e){console.error(e);if(recorder?.state==='recording')recorder.stop();closeModal();toast(`Export failed: ${e.message}`);}
    finally{stream.getTracks().forEach(x=>x.stop());audioEl?.pause();audioCtx?.close();state.exporting=false;}
  }
  async function readFile(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);});}
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
          addItem({...baseItem('image'),src:safe,tracePaths:trace.paths,fillPaths:trace.fillPaths,transparentArtwork:trace.transparent,x:620,y:250,w:420,h:400});toast('SVG artwork added with marker tracing.');return;
        }
        toast('That SVG could not be read.');return;
      }
      const src=await readFile(file);if(!/^data:image\/(png|jpeg|svg\+xml);base64,/.test(src)){toast('Use a PNG, JPEG, or SVG image.');return;}
      const trace=await traceImage(src);
      addItem({...baseItem('image'),src,tracePaths:trace.paths,fillPaths:trace.fillPaths,transparentArtwork:trace.transparent,x:620,y:250,w:420,h:400});toast('Image added with marker tracing.');
    }catch(e){toast('Could not read that image.');}
  }
  async function uploadAudio(file){if(!file)return;if(file.size>25*1024*1024){toast('Choose an audio file under 25 MB.');return;}try{const src=await readFile(file);snapshot();state.project.audio={name:file.name,src};state.audio=null;changed();toast('Audio added.');}catch{toast('Could not read that audio file.');}}
  async function recordAudio(){
    if(state.recording){state.recording.recorder.stop();return;}
    if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){toast('Microphone recording is unavailable in this browser.');return;}
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true}),chunks=[],recorder=new MediaRecorder(stream);
      state.recording={stream,recorder};recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
      recorder.onstop=async()=>{stream.getTracks().forEach(t=>t.stop());state.recording=null;const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});if(blob.size){const src=await readFile(blob);snapshot();state.project.audio={name:'Recorded narration',src};state.audio=null;changed();toast('Narration saved.');}else renderInspector();};
      recorder.start();renderInspector();toast('Recording narration…');
    }catch(e){toast('Microphone access was not available.');}
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
    if(name==='audio-upload'){$('#audioInput').click();return;}
    if(name==='audio-record'){recordAudio();return;}
    if(name==='audio-remove'){snapshot();state.project.audio=null;state.audio=null;changed();return;}
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
    $('#inspector').addEventListener('click',e=>{const icon=e.target.closest('[data-icon]'),sheet=e.target.closest('[data-sheet-item]'),shape=e.target.closest('[data-shape]'),ratio=e.target.closest('[data-ratio]'),act=e.target.closest('[data-action]');if(icon)addIcon(icon.dataset.icon);if(sheet)addSheetDrawing(+sheet.dataset.sheet,+sheet.dataset.sheetItem);if(shape)addShape(shape.dataset.shape);if(ratio){snapshot();state.project.ratio=ratio.dataset.ratio;changed();}if(act)action(act.dataset.action);});
    $('#inspector').addEventListener('focusin',e=>{if(e.target.matches('[data-set]'))snapshot();});
    $('#inspector').addEventListener('input',e=>{if(e.target.id==='librarySearch')filterLibrary(e.target.value);else if(e.target.matches('[data-set]'))applyField(e.target.dataset.set,e.target.value);});
    $('#inspector').addEventListener('change',e=>{if(e.target.matches('[data-set]')){applyField(e.target.dataset.set,e.target.value);renderInspector();}});
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
    $('#sceneStrip').addEventListener('click',e=>{const b=e.target.closest('[data-scene]');if(!b)return;stopPreview();state.sceneIndex=+b.dataset.scene;state.selected=null;state.time=sceneStart(state.sceneIndex);renderAll();});
    $('#itemStrip').addEventListener('click',e=>{const b=e.target.closest('[data-item]');if(b){stopPreview();selectItem(b.dataset.item);}});
    let dragged=null;$('#itemStrip').addEventListener('dragstart',e=>{const b=e.target.closest('[data-item]');if(b){dragged=b.dataset.item;e.dataTransfer.effectAllowed='move';}});$('#itemStrip').addEventListener('dragover',e=>{if(e.target.closest('[data-item]'))e.preventDefault();});$('#itemStrip').addEventListener('drop',e=>{const b=e.target.closest('[data-item]');if(!b||!dragged||dragged===b.dataset.item)return;e.preventDefault();const items=scene().items,from=items.findIndex(x=>x.id===dragged),to=items.findIndex(x=>x.id===b.dataset.item);if(from<0||to<0)return;snapshot();items.splice(to,0,items.splice(from,1)[0]);dragged=null;changed();});
    $('#projectName').addEventListener('focus',()=>snapshot());$('#projectName').addEventListener('input',e=>{state.project.name=e.target.value.slice(0,80);changed(false);});
    $('#addSceneBtn').addEventListener('click',()=>{stopPreview();snapshot();state.project.scenes.push({id:id(),name:`Scene ${state.project.scenes.length+1}`,background:'#ffffff',items:[]});state.sceneIndex=state.project.scenes.length-1;state.selected=null;state.time=sceneStart(state.sceneIndex);changed();});
    $('#duplicateSceneBtn').addEventListener('click',()=>{stopPreview();snapshot();const copy=clone(scene());copy.id=id();copy.name+=` copy`;copy.items.forEach(x=>x.id=id());state.project.scenes.splice(state.sceneIndex+1,0,copy);state.sceneIndex++;state.selected=null;state.time=sceneStart(state.sceneIndex);changed();});
    $('#playBtn').addEventListener('click',play);$('#previewBtn').addEventListener('click',()=>{if(state.playing)pause();else play();});$('#restartBtn').addEventListener('click',()=>seek(0));$('#fitBtn').addEventListener('click',fitContent);$('#zoomInBtn').addEventListener('click',()=>zoomEditor(.8));$('#zoomOutBtn').addEventListener('click',()=>zoomEditor(1.25));
    $('#scrubber').addEventListener('input',e=>seek(+e.target.value/1000*totalLen()));$('#exportBtn').addEventListener('click',exportVideo);$('#projectsBtn').addEventListener('click',showProjects);
    $('#uploadInput').addEventListener('change',async e=>{await uploadImage(e.target.files[0]);e.target.value='';});$('#audioInput').addEventListener('change',async e=>{await uploadAudio(e.target.files[0]);e.target.value='';});
    $('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){if(!state.exporting)closeModal();return;}const b=e.target.closest('[data-modal],[data-open]');if(!b)return;if(b.dataset.open)loadProject(b.dataset.open);else if(b.dataset.modal==='close'&&!state.exporting)closeModal();else if(b.dataset.modal==='new')showNewProject();else if(b.dataset.modal==='create')createProject();});
    document.addEventListener('keydown',e=>{const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName);if(e.ctrlKey||e.metaKey){if(e.key.toLowerCase()==='z'){e.preventDefault();if(state.undo.length){state.redo.push(clone(state.project));state.project=state.undo.pop();state.sceneIndex=clamp(state.sceneIndex,0,state.project.scenes.length-1);state.selected=null;changed();}return;}if(e.key.toLowerCase()==='y'){e.preventDefault();if(state.redo.length){state.undo.push(clone(state.project));state.project=state.redo.pop();state.sceneIndex=clamp(state.sceneIndex,0,state.project.scenes.length-1);state.selected=null;changed();}return;}}if(typing)return;if(e.code==='Space'){e.preventDefault();play();}if((e.key==='Delete'||e.key==='Backspace')&&state.selected){e.preventDefault();action('delete');}if(e.key==='Escape'&&state.preview)stopPreview();});
    window.addEventListener('beforeunload',()=>{if(state.project)saveProject();});
  }
  async function init(){try{
    const fontResponse=await fetch('./assets/stroke-font.json');if(!fontResponse.ok)throw new Error('Writing font did not load');state.fonts=await fontResponse.json();
    const hand=new Image();hand.src=HAND.src;await hand.decode();state.handImage=hand;
    state.db=await openDb();const current=localStorage.getItem('whiteboard-current');let p=current?await dbTask('readonly',s=>s.get(current)):null;if(!p){const all=await listProjects();p=all[0]||demoProject();}
    state.project=await migrateProject(p);state.editorView=projectView(state.project);bind();new ResizeObserver(renderStage).observe($('#canvasShell'));renderAll();prepareHandwriting();await saveProject();
  }catch(e){console.error(e);$('#inspector').innerHTML=`<h2 class="panel-title">Could not open the editor</h2><p class="panel-help">${esc(e.message)}. Reload the app to try again.</p>`;}}
  init();
})();
