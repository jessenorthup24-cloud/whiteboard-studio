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
  const CONNECTED_FONTS=new Set(['dancing','satisfy','homemade','pacifico','kaushan','yellowtail','greatvibes','sacramento']);
  // Writing styles, grouped so each kind of lettering is easy to tell apart in the picker: [key, font, what it looks like].
  // The smooth fonts are Google Fonts (Open Font License, free to use in videos); the single-line pen fonts are the
  // bundled Hershey glyphs, written as one stroke per line.
  const FONT_GROUPS=[
    ['Neat handwriting',[['patrick','Patrick Hand','Classic whiteboard'],['handlee','Handlee','Neat and round'],['kalam','Kalam','Natural marker'],['architects','Architects Daughter','Architect print'],['coming','Coming Soon','Friendly print'],['schoolbell','Schoolbell','Teacher on the board']]],
    ['Casual & marker',[['indie','Indie Flower','Bubbly hand'],['gochi','Gochi Hand','Playful marker'],['gloria','Gloria Hallelujah','Lively doodle'],['shadows','Shadows Into Light','Light, quick hand'],['caveat','Caveat','Flowing notes'],['covered','Covered By Your Grace','Loose and tall'],['reenie','Reenie Beanie','Scribbled note'],['nanum','Nanum Pen Script','Thin felt pen'],['justhand','Just Another Hand','Tall and narrow'],['permanent','Permanent Marker','Heavy marker'],['rocksalt','Rock Salt','Rough, scratchy marker']]],
    ['Cursive & script',[['dancing','Dancing Script','Joined cursive'],['satisfy','Satisfy','Joined script'],['homemade','Homemade Apple','Handwritten cursive'],['pacifico','Pacifico','Bold retro script'],['kaushan','Kaushan Script','Brush script'],['yellowtail','Yellowtail','Sign-painter script'],['greatvibes','Great Vibes','Elegant calligraphy'],['sacramento','Sacramento','Thin monoline script']]],
    ['Bold & playful',[['bangers','Bangers','Comic book'],['luckiest','Luckiest Guy','Chunky cartoon'],['chewy','Chewy','Soft and bouncy'],['fredoka','Fredoka','Rounded and friendly']]],
    ['Chalk & sketch',[['fredericka','Fredericka the Great','Chalk outline'],['cabinsketch','Cabin Sketch','Sketched letters']]],
    ['Classic & formal',[['playfair','Playfair Display','Elegant serif'],['cinzel','Cinzel','Carved Roman capitals'],['fell','IM Fell English','Old printed book'],['elite','Special Elite','Typewriter'],['montserrat','Montserrat','Clean modern sans']]],
    ['Single-line pen',[['futural','Simple','Plain pen line'],['futuram','Bold','Doubled pen line'],['scripts','Script','Joined script line'],['scriptc','Bold script','Doubled script line'],['gothiceng','Gothic','Blackletter line'],['gothicita','Gothic italic','Italic blackletter'],['timesr','Serif','Book serif line'],['timesi','Italic serif','Slanted serif line'],['timesrb','Bold serif','Heavy serif line']]]
  ];
  const HANDWRITING_FONTS=Object.fromEntries(FONT_GROUPS.slice(0,-1).flatMap(([,list])=>list.map(([key,family])=>[key,family])));
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
  // When each item of a scene plays. An item starts once everything before it has finished (pauses included), or
  // together with the item before it when it is set to start with previous; then its own delay is added. Items that
  // start together form a group, shown stacked in the timeline. Entries: {it, from, start, end, next, group, together}.
  function sceneSchedule(s){
    let cursor=0,previous=0,group=-1;
    return s.items.map((it,i)=>{
      const d=Math.max(.1,num(it.duration,1)),p=Math.max(0,num(it.pause)),together=i>0&&!!it.withPrevious,from=together?previous:cursor,start=from+Math.max(0,num(it.delay));
      if(!together)group++;previous=start;cursor=Math.max(cursor,start+d+p);
      return {it,from,start,end:start+d,next:start+d+p,group,together};
    });
  }
  const sceneLen = (s) => sceneSchedule(s).reduce((a,e)=>Math.max(a,e.next),0);
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
  // The drawing hand's size is a multiple of its normal size, and its angle a tilt in degrees about the pen tip. Each
  // camera move keeps its own (handSize, handAngle), so a close-up can use a smaller hand than a wide shot; scenes
  // without camera moves use the project's (project.handSize, project.handAngle).
  const HAND_SIZES=[.3,4],HAND_ANGLES=[-90,90];
  const handSizeOf=cam=>clamp(num(cam?.handSize,num(state.project?.handSize,1)),...HAND_SIZES);
  const handAngleOf=cam=>clamp(num(cam?.handAngle,num(state.project?.handAngle,0)),...HAND_ANGLES);
  let handScale=1,handAngle=0;
  const handImage=(x,y,k,deg,extra='')=>`<image href="${HAND.src}" x="${x-HAND.x*k}" y="${y-HAND.y*k}" width="${HAND.w*k}" height="${HAND.h*k}" ${deg?`transform="rotate(${+deg.toFixed(2)} ${x} ${y})"`:''} ${extra} pointer-events="none"/>`;
  function visualAt(s,t){
    const firstCamera=s.items.find(x=>x.type==='camera');
    let camera=firstCamera?{cx:firstCamera.cx,cy:firstCamera.cy,zoom:firstCamera.zoom,hand:handSizeOf(firstCamera),angle:handAngleOf(firstCamera)}:{cx:800,cy:450,zoom:1,hand:handSizeOf(),angle:handAngleOf()},visible=[];
    for(const {it,start,end} of sceneSchedule(s)){
      if(it.type==='camera'){
        const next={cx:it.cx,cy:it.cy,zoom:it.zoom,hand:handSizeOf(it),angle:handAngleOf(it)};
        if(t>=end) camera=next;
        else if(t>=start){const p=clamp((t-start)/(end-start),0,1);camera={cx:camera.cx+(next.cx-camera.cx)*p,cy:camera.cy+(next.cy-camera.cy)*p,zoom:camera.zoom+(next.zoom-camera.zoom)*p,hand:camera.hand+(next.hand-camera.hand)*p,angle:camera.angle+(next.angle-camera.angle)*p};}
      }else if(t>=start){visible.push({it,progress:clamp((t-start)/(end-start),0,1),active:t<end,since:t-end});}
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
  // Rotation and snapping on the canvas. Items rotate about their centre (it.rotation, in degrees) and can be flipped
  // (it.flipX, it.flipY). While such an item is drawn, handTransform lets the hand land on the right point and stay upright.
  const SNAP_PX=8;let stageSnap=true,handTransform=null;
  const matMul=(A,B)=>[A[0]*B[0]+A[2]*B[1],A[1]*B[0]+A[3]*B[1],A[0]*B[2]+A[2]*B[3],A[1]*B[2]+A[3]*B[3],A[0]*B[4]+A[2]*B[5]+A[4],A[1]*B[4]+A[3]*B[5]+A[5]];
  const matApply=(M,[x,y])=>[M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]];
  const matInvert=M=>{const d=M[0]*M[3]-M[1]*M[2];return [M[3]/d,-M[1]/d,-M[2]/d,M[0]/d,(M[2]*M[5]-M[3]*M[4])/d,(M[1]*M[4]-M[0]*M[5])/d];};
  // An item's rotation and flips about its centre, or null when it has neither.
  function itemMatrix(it){const r=rotationOf(it),fx=it.flipX?-1:1,fy=it.flipY?-1:1;if(!r&&fx===1&&fy===1)return null;const [cx,cy]=centerOf(it),a=r*Math.PI/180,c=Math.cos(a),sn=Math.sin(a);return matMul([1,0,0,1,cx,cy],matMul([c,sn,-sn,c,0,0],matMul([fx,0,0,fy,0,0],[1,0,0,1,-cx,-cy])));}
  const rotationOf=it=>it.type==='camera'?0:num(it.rotation,0)%360;
  const centerOf=it=>[it.x+it.w/2,it.y+it.h/2];
  function rotateVec([x,y],deg){const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return [x*c-y*s,x*s+y*c];}
  function rotatePoint([x,y],[cx,cy],deg){const [rx,ry]=rotateVec([x-cx,y-cy],deg);return [cx+rx,cy+ry];}
  // The upright box around an item as it appears on the canvas.
  function boundsOf(it){
    if(it.type==='camera')return cameraBox(it);const r=rotationOf(it);if(!r)return [it.x,it.y,it.w,it.h];
    const c=centerOf(it),pts=[[it.x,it.y],[it.x+it.w,it.y],[it.x+it.w,it.y+it.h],[it.x,it.y+it.h]].map(p=>rotatePoint(p,c,r)),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
    return [Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)];
  }
  // Lines a moving item can snap to: the edges and centres of the other items, the camera frames and the video frame.
  function snapTargets(except){
    const skip=[].concat(except),xs=[],ys=[],add=([x,y,w,h])=>{for(const v of [x,x+w/2,x+w])xs.push({v,from:y,to:y+h});for(const v of [y,y+h/2,y+h])ys.push({v,from:x,to:x+w});};
    add(baseBox());for(const it of scene().items)if(!skip.includes(it.id))add(boundsOf(it));
    return {xs,ys};
  }
  const stageUnitsPerPixel=()=>editorBox()[2]/Math.max(1,$('#stage').clientWidth);
  // The closest snap for a span [start, start+size] (its start, middle or end), within the snapping distance.
  function nearestSnap(start,size,lines,tolerance,offsets=[0,size/2,size]){
    let best=null;for(const off of offsets)for(const line of lines){const d=line.v-(start+off);if(Math.abs(d)<=tolerance&&(!best||Math.abs(d)<Math.abs(best.d)))best={d,line};}
    return best;
  }
  function guideFor(axis,snap,from,to){return axis==='x'?{x1:snap.line.v,y1:Math.min(snap.line.from,from),x2:snap.line.v,y2:Math.max(snap.line.to,to)}:{x1:Math.min(snap.line.from,from),y1:snap.line.v,x2:Math.max(snap.line.to,to),y2:snap.line.v};}
  function moveWithSnap(it,drag,dx,dy,free){
    state.guides=[];let mx=dx,my=dy;
    if(stageSnap&&!free){
      const b=drag.bounds,tolerance=SNAP_PX*stageUnitsPerPixel(),sx=nearestSnap(b[0]+dx,b[2],drag.targets.xs,tolerance),sy=nearestSnap(b[1]+dy,b[3],drag.targets.ys,tolerance);
      if(sx)mx+=sx.d;if(sy)my+=sy.d;
      if(sx)state.guides.push(guideFor('x',sx,b[1]+my,b[1]+my+b[3]));if(sy)state.guides.push(guideFor('y',sy,b[0]+mx,b[0]+mx+b[2]));
    }
    if(drag.group){for(const g of drag.group){g.it.x=Math.round((g.x+mx)*10)/10;g.it.y=Math.round((g.y+my)*10)/10;}return;}
    it.x=Math.round((drag.original.x+mx)*10)/10;it.y=Math.round((drag.original.y+my)*10)/10;
  }
  // Dragging the rotate handle turns the item about its centre. It clicks into place near every 45 degrees; Shift
  // keeps it to 15-degree steps.
  function rotateWithDrag(it,drag,p,shift){
    let angle=drag.original.rotation+(Math.atan2(p.y-drag.center[1],p.x-drag.center[0])-drag.startAngle)*180/Math.PI;
    if(shift)angle=Math.round(angle/15)*15;else{const near=Math.round(angle/45)*45;if(Math.abs(angle-near)<4)angle=near;}
    angle=((angle+180)%360+360)%360-180;it.rotation=Math.round(angle*10)/10;
    $('#modeLabel').textContent=`Rotation ${Math.round(it.rotation)}°`;
  }
  function selectionMarkup(selected,frameBox){
    const camera=selected.type==='camera',[x,y,w,h]=camera?cameraBox(selected):[selected.x,selected.y,selected.w,selected.h],r=camera?0:rotationOf(selected),[cx,cy]=[x+w/2,y+h/2];
    const color=camera?'#318c79':'#f27a59',sw=Math.max(2,frameBox[2]/650),dot=Math.max(6,frameBox[2]/220),lift=Math.max(28,frameBox[2]/38);
    let markup=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-dasharray="${sw*3} ${sw*2}" pointer-events="none"/>`;
    const handles={nw:[x,y],n:[x+w/2,y],ne:[x+w,y],e:[x+w,y+h/2],se:[x+w,y+h],s:[x+w/2,y+h],sw:[x,y+h],w:[x,y+h/2]};
    for(const [name,[hx,hy]] of Object.entries(handles)){const cursor=name==='n'||name==='s'?'ns-resize':name==='e'||name==='w'?'ew-resize':name==='nw'||name==='se'?'nwse-resize':'nesw-resize';markup+=`<circle data-item="${esc(selected.id)}" data-handle="${name}" cx="${hx}" cy="${hy}" r="${dot}" fill="#ffffff" stroke="${color}" stroke-width="${sw}" style="cursor:${cursor}" pointer-events="all"/>`;}
    if(!camera)markup+=`<path d="M${cx} ${y}V${y-lift}" stroke="${color}" stroke-width="${sw}" pointer-events="none"/><circle data-item="${esc(selected.id)}" data-handle="rotate" cx="${cx}" cy="${y-lift}" r="${dot*1.15}" fill="${color}" stroke="#ffffff" stroke-width="${sw}" style="cursor:grab" pointer-events="all"><title>Drag to rotate (Shift for 15° steps)</title></circle>`;
    return r?`<g transform="rotate(${r} ${cx} ${cy})">${markup}</g>`:markup;
  }
  function guidesMarkup(frameBox){
    const sw=Math.max(1.5,frameBox[2]/800);
    return (state.guides||[]).map(g=>`<line x1="${g.x1}" y1="${g.y1}" x2="${g.x2}" y2="${g.y2}" stroke="#e84393" stroke-width="${sw}" stroke-dasharray="${sw*4} ${sw*3}" pointer-events="none"/>`).join('');
  }
  function handMarkup(x,y){
    const world=handTransform?matApply(handTransform,[x,y]):[x,y];
    if(exportRender){exportHand={x:world[0],y:world[1],k:handScale,deg:handAngle};return '';}
    const image=handImage(world[0],world[1],handScale,handAngle);
    return handTransform?`<g transform="matrix(${matInvert(handTransform).map(v=>+v.toFixed(6)).join(' ')})">${image}</g>`:image;
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
  function scriptGlyph(g,singleLine,capital){
    if(scriptGlyphs.has(g))return scriptGlyphs.get(g);
    const subs=(g.d.match(/M[^M]*/g)||[]).map(d=>({d,pts:(d.match(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g)||[]).map(p=>p.split(',').map(Number))}));
    const all=subs.flatMap(s=>s.pts),band=all.filter(([,y])=>y>=11&&y<=19),pick=band.length?band:all;
    const entry=pick.reduce((a,p)=>p[0]<a[0]?p:a,pick[0]||[0,0]),exit=pick.reduce((a,p)=>p[0]>a[0]?p:a,pick[0]||[0,0]);
    const has=(s,p)=>s.pts.some(q=>q[0]===p[0]&&q[1]===p[1]),later=s=>{if(has(s,entry)||has(s,exit))return false;const xs=s.pts.map(p=>p[0]),ys=s.pts.map(p=>p[1]),w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys);return singleLine||(w<=2.5&&h<=2.5)||(h<=1.5&&w>=3);};
    // Capitals often join from the middle. A capital whose entry is not at its left edge is placed like a normal letter,
    // clear of its neighbours, instead of by its entry point.
    const left=Math.min(...all.map(q=>q[0])),right=Math.max(...all.map(q=>q[0])),joins=!capital||entry[0]-left<=3;
    const info={offset:joins?-entry[0]:-left,advance:joins?Math.max(1,exit[0]-entry[0],right-entry[0]-2):right-left+3,body:subs.filter(s=>!later(s)).map(s=>s.d),marks:subs.filter(later).map(s=>s.d)};
    scriptGlyphs.set(g,info);return info;
  }
  // The pen fonts store each stroke as straight segments on a coarse grid, which shows as corners on every curve. Draw
  // them as smooth curves through the same points (Catmull-Rom), keeping a sharp corner wherever the stroke turns by
  // more than about 60 degrees, as at the points of "M" or the corners of "E".
  const smoothPens=new Map();
  function smoothPenPath(d){
    if(smoothPens.has(d))return smoothPens.get(d);
    const f=q=>`${+q[0].toFixed(2)} ${+q[1].toFixed(2)}`;let out='';
    for(const sub of d.match(/M[^M]*/g)||[]){
      const p=(sub.match(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g)||[]).map(q=>q.split(',').map(Number)).filter((q,i,a)=>!i||q[0]!==a[i-1][0]||q[1]!==a[i-1][1]);
      if(p.length<3){out+=`M${p.map(f).join('L')}`;if(p.length===1)out+=`L${f(p[0])}`;continue;}
      const n=p.length,closed=n>3&&p[0][0]===p[n-1][0]&&p[0][1]===p[n-1][1];
      const neighbour=(i,step)=>{const j=i+step;return j<0?(closed?p[n-2]:null):j>=n?(closed?p[1]:null):p[j];};
      const turns=p.map((b,i)=>{const a=neighbour(i,-1),c=neighbour(i,1);if(!a||!c)return Math.PI;const u=[b[0]-a[0],b[1]-a[1]],v=[c[0]-b[0],c[1]-b[1]];return Math.acos(clamp((u[0]*v[0]+u[1]*v[1])/((Math.hypot(...u)*Math.hypot(...v))||1),-1,1));}),sharp=i=>turns[i]>1.05;
      // Ease curve points a little toward their neighbours to even out the grid's lumps; corners and ends stay put.
      const eased=p.map((b,i)=>{if(sharp(i))return b;const a=neighbour(i,-1),c=neighbour(i,1);return [(a[0]+b[0]*2+c[0])/4,(a[1]+b[1]*2+c[1])/4];});
      if(closed)eased[n-1]=eased[0];p.splice(0,n,...eased);
      out+=`M${f(p[0])}`;
      for(let i=0;i<n-1;i++){
        const a=p[i],b=p[i+1],before=sharp(i)?a:neighbour(i,-1),after=sharp(i+1)?b:neighbour(i+1,1);
        out+=`C${f([a[0]+(b[0]-before[0])/6,a[1]+(b[1]-before[1])/6])} ${f([b[0]-(after[0]-a[0])/6,b[1]-(after[1]-a[1])/6])} ${f(b)}`;
      }
    }
    smoothPens.set(d,out);return out;
  }
  function textPaths(it){
    const font=state.fonts?.[it.font]||state.fonts?.futural;if(!font)return [];
    const glyph=c=>font.chars[(c.charCodeAt(0)>=33&&c.charCodeAt(0)<=127?c.charCodeAt(0):63)-33];
    const script=it.font in SCRIPT_STROKE_FONTS,join=c=>script&&glyph(c)?.d?scriptGlyph(glyph(c),SCRIPT_STROKE_FONTS[it.font],/[A-Z]/.test(c)):null;
    const rows=String(it.text||'Text').split('\n').slice(0,6),advance=c=>/\s/u.test(c)?12:join(c)?.advance??(glyph(c)?.o||10)*1.68;
    const scale=it.fontSize/23,widths=rows.map(row=>[...row].reduce((a,c)=>a+advance(c),0)),fit=Math.min(1,it.w/(Math.max(1,...widths)*scale)),room=it.w/(scale*fit);
    const paths=[];
    rows.forEach((row,j)=>{let left=(room-widths[j])*(ALIGN_SHIFT[it.align]||0);const ty=it.y+j*it.fontSize*1.18;
      for(const raw of row){
        const g=glyph(raw),info=join(raw);
        if(!/\s/u.test(raw)&&g?.d){const place=d=>({d:smoothPenPath(d),tx:it.x+(left+(info?.offset||0))*scale*fit,ty,sx:scale*fit,sy:scale,stroke:it.color,sw:1.35});
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
    const m=itemMatrix(it);if(!m)return drawElement(it,progress,selectable,hand);
    const outer=handTransform;handTransform=outer?matMul(outer,m):m;
    try{return `<g transform="matrix(${m.map(v=>+v.toFixed(6)).join(' ')})">${drawElement(it,progress,selectable,hand)}</g>`;}finally{handTransform=outer;}
  }
  // Looping effects play once an item has finished drawing and carry on until its scene ends: pulse (grows and
  // settles), spin (full turns), rock (tilts back and forth) and glow (a soft colored halo that brightens and fades).
  // Speed is seconds per cycle; strength runs from 0 to 1. They show in Preview and in exported videos.
  const EFFECTS=[['none','None'],['pulse','Pulse'],['spin','Spin'],['rock','Rock back and forth'],['glow','Glow']],EFFECT_SPEED={pulse:1.2,spin:3,rock:1.6,glow:1.8};
  function effectMarkup(it,since,inner){
    const e=it.effect;if(!e||e==='none'||!EFFECT_SPEED[e]||it.type==='camera'||!(since>=0))return inner;
    const period=clamp(num(it.effectSpeed,EFFECT_SPEED[e]),.2,20),k=clamp(num(it.effectStrength,.5),0,1),turn=since/period*2*Math.PI,swell=(1-Math.cos(turn))/2,[cx,cy]=centerOf(it);
    if(e==='pulse'){const s=1+swell*(.04+k*.26);return `<g transform="translate(${cx} ${cy}) scale(${s.toFixed(4)}) translate(${-cx} ${-cy})">${inner}</g>`;}
    if(e==='spin'||e==='rock'){const deg=e==='spin'?since/period*360*(it.effectReverse?-1:1):Math.sin(turn)*(4+k*26);return `<g transform="rotate(${deg.toFixed(3)} ${cx} ${cy})">${inner}</g>`;}
    const fid='fx'+String(it.id).replace(/[^\w-]/g,''),blur=Math.max(4,Math.max(it.w,it.h)*(.03+k*.05)),color=/^#[0-9a-f]{3,8}$/i.test(it.effectColor||'')?it.effectColor:'#ffd447';
    return `<defs><filter id="${fid}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur in="SourceAlpha" stdDeviation="${blur.toFixed(1)}" result="b"/><feFlood flood-color="${color}"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/></feMerge></filter></defs><g opacity="${(swell*(.45+k*.55)).toFixed(3)}" filter="url(#${fid})">${inner}</g>${inner}`;
  }
  function effectFields(it){
    const e=EFFECT_SPEED[it.effect]?it.effect:'none';
    return `<div class="panel-divider"></div><div class="field"><label>Effect after drawing</label><select data-set="effect">${EFFECTS.map(([v,n])=>`<option value="${v}" ${e===v?'selected':''}>${n}</option>`).join('')}</select></div>`+(e==='none'?'':
      `<div class="field-row">${field('Seconds per cycle','effectSpeed',num(it.effectSpeed,EFFECT_SPEED[e]),'number','min="0.2" max="20" step="0.1"')}${e==='spin'?'<div class="field"></div>':`<div class="field"><label>Strength</label><input data-set="effectStrength" type="range" min="0" max="1" step="0.05" value="${clamp(num(it.effectStrength,.5),0,1)}"></div>`}</div>`+
      (e==='glow'?field('Glow color','effectColor',it.effectColor||'#ffd447','color'):'')+(e==='spin'?`<label class="check-row"><input type="checkbox" data-effect-reverse ${it.effectReverse?'checked':''}> Spin counter-clockwise</label>`:'')+
      '<p class="panel-help">Starts when this drawing is finished and keeps going until the scene ends. Press Preview to see it.</p>');
  }
  function drawElement(it,progress,selectable,hand){
    const attr=selectable?`data-item="${esc(it.id)}" style="cursor:move"`:'';
    const start=`<g ${attr}>`,hit=selectable?`<rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" fill="transparent" pointer-events="all"/>`:'',end='</g>';
    if(it.animation==='none')progress=1;
    if(progress<1&&['fade','slide','pop'].includes(it.animation)){
      const full=drawElement(it,1,false,false),opacity=it.animation==='fade'?progress:1;
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
  // Boards: the surface a scene is drawn on (scene.board). Plain uses the scene's background color. The dirty whiteboard
  // is a texture of faint smudges and half-erased marker, painted once on a canvas; the yellow notepad is ruled lines
  // with a red margin. Both are tiled in whiteboard space, so they pan and zoom with the camera like a real surface.
  const BOARDS=[['plain','Plain'],['dirty','Dirty whiteboard'],['notepad','Yellow notepad']];
  let dirtyBoard=null;
  function dirtyBoardSrc(){
    if(dirtyBoard)return dirtyBoard;
    const W=1600,H=900,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
    let seed=20261012;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    g.fillStyle='#f3f4f1';g.fillRect(0,0,W,H);
    // Everything is drawn nine times, shifted by the tile size, so the texture repeats without seams.
    const tiled=draw=>{for(const dx of [-W,0,W])for(const dy of [-H,0,H]){g.save();g.translate(dx,dy);draw();g.restore();}};
    const dab=(x,y,r,rgb,alpha)=>{const grad=g.createRadialGradient(x,y,0,x,y,r);grad.addColorStop(0,`rgba(${rgb},${alpha})`);grad.addColorStop(1,`rgba(${rgb},0)`);g.fillStyle=grad;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();};
    // A grey haze of old smudges.
    for(let i=0;i<34;i++){const x=rand()*W,y=rand()*H,r=50+rand()*230,sx=.6+rand()*1.6,alpha=.018+rand()*.045,turn=rand()*Math.PI;
      tiled(()=>{g.translate(x,y);g.rotate(turn);g.scale(sx,1);dab(0,0,r,'112,124,132',alpha);});}
    // Ghosts of erased writing: rows of loops and humps, fading in and out where the eraser caught them.
    g.lineCap='round';g.lineJoin='round';
    for(let i=0;i<22;i++){
      const x0=rand()*W,y0=rand()*H,rgb=rand()<.2?'150,80,80':rand()<.35?'60,95,150':'70,84,98',alpha=.05+rand()*.06,lw=2.4+rand()*2.2,words=1+Math.floor(rand()*3),pts=[];
      let x=x0;
      for(let w=0;w<words;w++){const letters=2+Math.floor(rand()*6);
        for(let l=0;l<letters;l++){const kind=rand(),wide=12+rand()*12,tall=kind<.25?44+rand()*20:18+rand()*14,fade=.25+rand()*.75;
          if(kind<.25)pts.push([x+wide*.2,y0-tall,x+wide*.6,y0,fade]);
          else if(kind<.6)pts.push([x+wide*.5,y0-tall*1.6,x+wide,y0,fade]);
          else{pts.push([x+wide*.1,y0-tall,x+wide*.5,y0-tall,fade]);pts.push([x+wide*.9,y0-tall,x+wide,y0,fade]);}
          x+=wide;}
        x+=18+rand()*20;}
      tiled(()=>{g.lineWidth=lw;let px=x0,py=y0;for(const [cx,cy,ex,ey,fade] of pts){g.strokeStyle=`rgba(${rgb},${alpha*fade})`;g.beginPath();g.moveTo(px,py);g.quadraticCurveTo(cx,cy,ex,ey);g.stroke();px=ex;py=ey;}});}
    // Eraser swipes: soft bands with fine drag lines along them.
    for(let i=0;i<9;i++){const x=rand()*W,y=rand()*H,len=220+rand()*420,bend=(rand()-.5)*90,w=40+rand()*50,alpha=.012+rand()*.012,lines=Array.from({length:10},()=>[(rand()-.5)*w*.8,.02+rand()*.035,rand()*.3,.7+rand()*.3]);
      const at=t=>[x+len*t,y+bend*4*t*(1-t)];
      tiled(()=>{for(let t=0;t<=1;t+=.025){const [px,py]=at(t);dab(px,py,w*.6,'104,116,126',alpha);}
        g.lineWidth=1.2;for(const [off,a,from,to] of lines){g.strokeStyle=`rgba(96,108,118,${a})`;g.beginPath();for(let t=from;t<=to;t+=.05){const [px,py]=at(t);if(t===from)g.moveTo(px,py+off);else g.lineTo(px,py+off);}g.stroke();}});}
    for(let i=0;i<70;i++){const x=rand()*W,y=rand()*H,r=.6+rand()*1.8,alpha=.08+rand()*.12;tiled(()=>{g.fillStyle=`rgba(90,100,108,${alpha})`;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();});}
    return dirtyBoard=c.toDataURL('image/jpeg',.9);
  }
  function boardMarkup(s,[x,y,w,h]){
    if(s.board==='dirty')return `<defs><pattern id="board-dirty" patternUnits="userSpaceOnUse" width="1600" height="900"><image href="${dirtyBoardSrc()}" width="1600" height="900"/></pattern></defs><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#board-dirty)"/>`;
    if(s.board==='notepad'){
      const left=baseBox()[0]+Math.min(130,baseBox()[2]*.09);
      return `<defs><pattern id="board-lines" patternUnits="userSpaceOnUse" width="1600" height="50" y="12"><rect width="1600" height="50" fill="#fdf2a6"/><path d="M0 49H1600" stroke="#9fbfd8" stroke-width="2.2"/></pattern></defs><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#board-lines)"/><path d="M${left} ${y}V${y+h}M${left+8} ${y}V${y+h}" stroke="#e58a86" stroke-width="2"/>`;
    }
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${esc(s.background||'#ffffff')}"/>`;
  }
  function renderMarkup(s,vis,editing=false,frameBox=baseBox()){
    handScale=vis.camera?.hand??handSizeOf();handAngle=vis.camera?.angle??handAngleOf();
    let markup=boardMarkup(s,frameBox);
    if(editing)for(const cam of s.items.filter(x=>x.type==='camera')){const [x,y,w,h]=cameraBox(cam);markup+=`<rect data-item="${esc(cam.id)}" x="${x}" y="${y}" width="${w}" height="${h}" fill="#72baa20d" stroke="#64a99a" stroke-width="${Math.max(2,frameBox[2]/500)}" stroke-dasharray="${Math.max(10,frameBox[2]/90)} ${Math.max(6,frameBox[2]/150)}" style="cursor:move" pointer-events="all"/>`;}
    for(const v of [...vis.visible].sort((a,b)=>num(a.it.z)-num(b.it.z))){
      const it=v.it;
      markup+=effectMarkup(it,v.since,elementMarkup(it,v.progress,editing,v.active&&!editing));
    }
    if(editing){
      const selected=item();
      const many=selectedItems().filter(x=>x.type!=='camera');
      if(many.length>1){const sw=Math.max(2,frameBox[2]/650);for(const it of many){const [x,y,w,h]=[it.x,it.y,it.w,it.h],r=rotationOf(it),[cx,cy]=centerOf(it);markup+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#f27a59" stroke-width="${sw}" stroke-dasharray="${sw*3} ${sw*2}" ${r?`transform="rotate(${r} ${cx} ${cy})"`:''} pointer-events="none"/>`;}const [ux,uy,uw,uh]=unionBox(many);markup+=`<rect x="${ux}" y="${uy}" width="${uw}" height="${uh}" fill="#f27a5908" stroke="#f27a59" stroke-width="${sw}" pointer-events="none"/>`;}
      else if(selected)markup+=selectionMarkup(selected,frameBox);
      if(selected?.type==='camera'&&many.length<2){const [x,y,w,h]=cameraBox(selected);markup+=handImage(x+w*.62,y+h*.55,handSizeOf(selected),handAngleOf(selected),'opacity=".5"');}
      if(state.marquee){const [x,y,w,h]=state.marquee,sw=Math.max(1.5,frameBox[2]/800);markup+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#64a99a14" stroke="#64a99a" stroke-width="${sw}" stroke-dasharray="${sw*4} ${sw*3}" pointer-events="none"/>`;}
      markup+=guidesMarkup(frameBox);
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
    $('#stage').innerHTML=renderMarkup(s,vis,!state.preview,box)+(state.preview?captionMarkup(box,state.time):'');
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
  let timelineGroups=[];
  function timelineLayout(){
    const boxes=[],groups=[];let x=0;
    for(const e of sceneSchedule(scene())){
      if(!e.together){groups.push({x,t0:e.from,t1:e.next,width:0,members:[]});}
      const g=groups[groups.length-1],d=e.end-e.start,p=e.next-e.end,body=Math.max(TILE_MIN,d*TIMELINE_PX),tail=Math.max(PAUSE_MIN,p*TIMELINE_PX),offset=(e.start-g.t0)*TIMELINE_PX;
      const box={it:e.it,x:g.x+offset,row:g.members.length,body,tail,t0:e.start,d,p,together:e.together};g.members.push(box);boxes.push(box);
      g.t1=Math.max(g.t1,e.next);g.width=Math.max(g.width,offset+body+tail);
      x=g.x+g.width+TILE_GAP;
    }
    timelineGroups=groups;return boxes;
  }
  // Scene time to strip position and back. In a group of one undelayed item, time runs evenly across the tile's body
  // and then its pause; in other groups it runs evenly across the group.
  function timelineX(local){
    for(const g of timelineGroups){
      if(local>g.t1)continue;const b=g.members[0];
      if(g.members.length===1&&b.t0===g.t0){if(local<=b.t0+b.d)return b.x+clamp((local-b.t0)/b.d,0,1)*b.body;return b.x+b.body+(b.p?(local-b.t0-b.d)/b.p*b.tail:0);}
      return g.x+clamp((local-g.t0)/Math.max(1e-6,g.t1-g.t0),0,1)*g.width;
    }
    const last=timelineGroups[timelineGroups.length-1];return last?last.x+last.width:0;
  }
  function timelineTime(x){
    for(const g of timelineGroups){
      if(x<g.x)return g.t0;if(x>g.x+g.width)continue;const b=g.members[0];
      if(g.members.length===1&&b.t0===g.t0){if(x<=b.x+b.body)return b.t0+(x-b.x)/b.body*b.d;return b.t0+b.d+(b.p?Math.min(1,(x-b.x-b.body)/b.tail)*b.p:0);}
      return g.t0+(x-g.x)/Math.max(1,g.width)*(g.t1-g.t0);
    }
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
    $('#sceneStrip').innerHTML=state.project.scenes.map((s,i)=>`<button class="scene-tile ${i===state.sceneIndex?'active':''}" data-scene="${i}" title="Drag to reorder scenes"><span class="scene-number">${String(i+1).padStart(2,'0')}</span><span class="scene-name">${esc(s.name)}</span><span class="scene-length">${fmt(sceneLen(s))}</span>${state.project.scenes.length>1?`<span class="scene-del" data-scene-delete="${i}" title="Delete this scene" role="button" aria-label="Delete ${esc(s.name)}">×</span>`:''}</button>`).join('');
    timelineBoxes=timelineLayout();
    const width=timelineBoxes.length?timelineX(Infinity)+TILE_GAP:0,rows=Math.max(1,...timelineBoxes.map(b=>b.row+1)),len=sceneLen(scene()),every=[1,2,5,10,15,30,60].find(s=>s*TIMELINE_PX>=44)||60;
    let ticks='';for(let t=0;t<=len+1e-6;t+=every)ticks+=`<span class="tick" style="left:${timelineX(t)}px">${Math.round(t)}s</span>`;
    const tiles=timelineBoxes.map(b=>{const it=b.it,sel=it.id===state.selected,idAttr=esc(it.id);
      return `<button class="item-tile ${sel?'selected':''} ${it.type==='camera'?'camera':''}" data-item="${idAttr}" style="left:${b.x}px;top:${b.row*68}px;width:${b.body+b.tail}px" title="${esc(tileLabel(it))} · ${b.d.toFixed(1)}s${b.p?` + ${b.p.toFixed(1)}s pause`:''}${b.together?' · starts with the item before it':''}">
        <span class="tile-body" style="width:${b.body}px"><span class="tile-top"><span class="thumb">${tileThumb(it)}</span><span class="item-duration">${b.together?'<span class="with-badge" title="Starts with the item before it">⇉</span> ':''}${b.d.toFixed(1)}s</span></span><span class="item-name">${esc(tileLabel(it))}</span><span class="tile-handle" data-handle-kind="duration" data-item="${idAttr}" title="Drag to change how long it takes"></span></span>
        <span class="tile-pause ${b.p?'':'empty'}" style="width:${b.tail}px"><span class="tile-handle" data-handle-kind="pause" data-item="${idAttr}" title="Drag to change the pause after it"></span></span></button>`;}).join('');
    $('#itemStrip').innerHTML=`<div class="strip-inner" style="width:${Math.max(width,1)}px;height:${24+rows*68}px"><div class="time-ruler" data-ruler title="Click or drag to move the playhead">${ticks}</div><div class="item-row" style="height:${rows*68-6}px">${tiles}</div><div id="playhead" class="playhead" hidden></div></div>`;
  }
  // The light, per-frame part of the timeline: clock, scrubber, buttons and the playhead.
  function renderTimelineClock(){
    const len=totalLen();$('#durationLabel').textContent=fmt(len);$('#timeLabel').textContent=`${fmt(state.time)} / ${fmt(len)}`;
    $('#scrubber').value=len?Math.round(state.time/len*1000):0;$('#scrubPercent').textContent=`${len?Math.round(state.time/len*100):0}%`;
    const audioHead=$('#audioPlayhead');if(audioHead){const x=state.time*audioScale(),lane=$('#audioScroll');audioHead.style.left=`${x}px`;audioHead.hidden=!(state.preview||state.time>0);
      if(state.playing&&lane&&(x<lane.scrollLeft+20||x>lane.scrollLeft+lane.clientWidth-40))lane.scrollLeft=Math.max(0,x-lane.clientWidth*.3);}
    $('#playBtn').textContent=state.playing?'Ⅱ':'▶';$('#previewBtn').innerHTML=state.playing?'Ⅱ <span>Pause</span>':'▶ <span>Preview</span>';
    $('#stopBtn').disabled=$('#topStopBtn').disabled=!state.preview&&state.time===0;
    renderEditTools();
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
    $('#sceneStrip').addEventListener('click',e=>{const del=e.target.closest('[data-scene-delete]');if(del&&!suppressTileClick){stopPreview();deleteScene(+del.dataset.sceneDelete);return;}const b=e.target.closest('[data-scene]');if(!b||suppressTileClick)return;stopPreview();state.sceneIndex=+b.dataset.scene;state.selected=null;state.time=sceneStart(state.sceneIndex);renderAll();});
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
  // Schedules every clip that sounds at or after video time `at` on an audio context, starting `lead` seconds from now.
  // Returns the context time that matches `at` and the started sources.
  function scheduleClips(ctx,at,destination,lead){
    const now=ctx.currentTime+lead,voices=[],spans=state.project.duckMusic===false?[]:narrationSpans(),duckLevel=clamp(num(state.project.duckLevel,.3),0,1),at0=at;
    for(const clip of audioClips()){
      const file=audioFile(clip),buffer=file&&audio.ready.get(file.src),length=clipLength(clip);if(!buffer||length<=0||clip.start+length<=at)continue;
      const into=Math.max(0,at-clip.start),when=now+Math.max(0,clip.start-at),source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;
      const v=clamp(num(clip.volume,1),0,2),fadeIn=Math.min(num(clip.fadeIn),length/2),fadeOut=Math.min(num(clip.fadeOut),length/2),level=t=>v*Math.min(1,fadeIn?t/fadeIn:1,fadeOut?(length-t)/fadeOut:1);
      gain.gain.setValueAtTime(level(into),when);
      if(fadeIn>into)gain.gain.linearRampToValueAtTime(v,when+fadeIn-into);
      if(fadeOut){if(length-fadeOut>into)gain.gain.setValueAtTime(v,when+length-fadeOut-into);gain.gain.linearRampToValueAtTime(0,when+length-into);}
      let chain=source.connect(gain);
      // Music dips to the duck level while narration plays, easing down just before and back up just after.
      if((clip.lane||0)===0&&spans.length){const duck=ctx.createGain(),T=v=>now+Math.max(0,v-at0);duck.gain.setValueAtTime(spans.some(([a,b])=>a<=at0&&b>at0)?duckLevel:1,now);
        for(const [a,b] of spans){if(b<=at0)continue;if(a>at0){duck.gain.setValueAtTime(1,T(Math.max(at0,a-.35)));duck.gain.linearRampToValueAtTime(duckLevel,T(a));}duck.gain.setValueAtTime(duckLevel,T(b));duck.gain.linearRampToValueAtTime(1,T(b+.45));}
        chain=chain.connect(duck);}
      chain.connect(destination);source.start(when,num(clip.offset)+into,length-into);voices.push(source);
    }
    return {now,voices};
  }
  // Starts the clips for live playback, returning the audio-clock time that matches `at`.
  function startClips(at,destination){stopClips();const ctx=audioContext(),r=scheduleClips(ctx,at,destination||ctx.destination,.05);audio.voices=r.voices;return r.now;}
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
    const host=$('#audioEditor');if(!host)return;host.classList.toggle('razor',!!state.razor);
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
    return `<div class="panel-eyebrow">SOUND</div><h2 class="panel-title">Audio</h2><p class="panel-help">Place music and narration clips anywhere on the video. Drag them in the audio lanes below the drawings.</p><div class="panel-actions"><button class="button primary" data-audio-add="0">Add music</button><button class="panel-action" data-audio-add="1">Add narration</button><button class="panel-action" data-audio-record>${state.recording?'■ Stop recording':'● Record at playhead'}</button><button class="panel-action" data-action="narrate-all">Narrate all scene scripts</button></div><div class="panel-divider"></div><label class="check-row"><input type="checkbox" data-duck ${state.project.duckMusic===false?'':'checked'}> Lower music under narration</label><div class="field"><label>Music level under narration <span id="duckLevelLabel">${Math.round(clamp(num(state.project.duckLevel,.3),0,1)*100)}%</span></label><input data-duck-level type="range" min="0" max="1" step="0.05" value="${clamp(num(state.project.duckLevel,.3),0,1)}"></div><label class="check-row"><input type="checkbox" data-preview-captions ${state.project.previewCaptions?'checked':''}> Show narration captions in preview</label><div class="panel-divider"></div>
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
    else if(key==='start'){clip.start=Math.max(0,n);linkOffset(clip);}
    else if(key==='length')clip.length=clamp(n,AUDIO_MIN,file?.duration?file.duration-num(clip.offset):3600);
    else if(key==='lane')clip.lane=clamp(Math.round(n),0,AUDIO_LANES.length-1);
    changed(false);
  }
  function clipAction(name){
    const clips=audioClips(),clip=clipById(state.selectedClip);if(!clip)return;
    if(name==='split'){editClips('split',clipsAt(state.time).includes(clip)?[clip]:[],state.time);return;}
    snapshot();
    if(name==='delete'){clips.splice(clips.indexOf(clip),1);state.selectedClip=null;}
    if(name==='duplicate'){const copy={...clip,id:id(),start:clip.start+clipLength(clip)};clips.push(copy);linkOffset(copy);state.selectedClip=copy.id;}
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
    $('#inspector').addEventListener('input',e=>{
      if(e.target.matches('[data-scene-script]')){scene().script=e.target.value;changed(false);return;}
      if(e.target.matches('[data-duck-level]')){state.project.duckLevel=+e.target.value;$('#duckLevelLabel').textContent=`${Math.round(e.target.value*100)}%`;changed(false);return;}
      if(e.target.matches('[data-voice-speed]')){state.project.voiceSpeed=+e.target.value;$('#voiceSpeedLabel').textContent=`${Math.round(e.target.value*100)}%`;changed(false);return;}
      if(e.target.matches('[data-clip-set]'))applyClipField(e.target.dataset.clipSet,e.target.value);});
    $('#inspector').addEventListener('click',e=>{const del=e.target.closest('[data-mine-delete]');if(del){e.stopPropagation();deleteMine(del.dataset.mineDelete);return;}const mine=e.target.closest('[data-mine]');if(mine){addMineDrawing(mine.dataset.mine);return;}if(e.target.closest('[data-lib-upload]'))$('#libraryInput').click();});
    $('#libraryInput').addEventListener('change',e=>{const files=[...e.target.files];e.target.value='';if(files.length)chooseMineUploads(files);});
    $('#inspector').addEventListener('click',e=>{const b=e.target.closest('[data-board]');if(!b)return;snapshot();scene().board=b.dataset.board==='plain'?undefined:b.dataset.board;changed();});
    $('#inspector').addEventListener('click',e=>{const sw=e.target.closest('[data-color]');if(!sw||!item())return;snapshot();applyField('color',sw.dataset.color);renderInspector();});
    $('#inspector').addEventListener('change',e=>{
      if(e.target.matches('[data-effect-reverse]')){const it=item();if(it){snapshot();it.effectReverse=e.target.checked;changed(false);}return;}
      if(e.target.matches('[data-voice]')){state.project.voice=e.target.value;changed(false);return;}
      if(e.target.matches('[data-scene-timing]')){scene().narrationTiming=e.target.value;changed(false);return;}
      if(e.target.matches('[data-duck]')){state.project.duckMusic=e.target.checked;changed(false);return;}
      if(e.target.matches('[data-preview-captions]')){state.project.previewCaptions=e.target.checked;changed(false);return;}
      if(e.target.matches('[data-clip-set]')){applyClipField(e.target.dataset.clipSet,e.target.value);renderInspector();}});
    $('#inspector').addEventListener('focusin',e=>{if(e.target.matches('[data-clip-set],[data-scene-script]'))snapshot();});
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
      const clip=clipById(el.dataset.clip);if(!clip)return;
      if(state.razor){const t=timeAt(e);editClips('split',t>clip.start+AUDIO_MIN&&t<clip.start+clipLength(clip)-AUDIO_MIN?[clip]:[],t);return;}
      if(state.selectedClip!==clip.id)selectClip(clip.id);
      const edge=e.target.closest('[data-clip-edge]')?.dataset.clipEdge,px=audioScale(),startX=e.clientX,original={...clip,length:clipLength(clip)},full=audioFile(clip)?.duration||Infinity;let took=false;
      const snapTargets=[state.time,...state.project.scenes.map((_,i)=>sceneStart(i)),...audioClips().filter(c=>c!==clip).flatMap(c=>[c.start,c.start+clipLength(c)])];
      const snap=t=>{if(audio.snap!==false)for(const s of snapTargets)if(Math.abs(s-t)*px<8)return s;return Math.round(t*20)/20;};
      const move=ev=>{if(ev.pointerId!==e.pointerId)return;const d=(ev.clientX-startX)/px;if(!took&&Math.abs(ev.clientX-startX)<3)return;if(!took){snapshot();took=true;}
        if(edge==='left'){const shift=clamp(snap(original.start+d)-original.start,-Math.min(original.start,num(original.offset)),original.length-AUDIO_MIN);clip.start=original.start+shift;clip.offset=num(original.offset)+shift;clip.length=original.length-shift;}
        else if(edge==='right')clip.length=clamp(snap(original.start+original.length+d)-original.start,AUDIO_MIN,full-num(original.offset));
        else{const start=Math.max(0,original.start+d),end=start+original.length,at=Math.abs(snap(start)-start)<=Math.abs(snap(end)-end)?snap(start):snap(end)-original.length;clip.start=Math.max(0,at);
          const over=document.elementFromPoint(ev.clientX,ev.clientY)?.closest?.('[data-lane]');if(over)clip.lane=+over.dataset.lane;}
        renderAudioEditor();renderTimelineClock();};
      const up=ev=>{if(ev.pointerId!==e.pointerId)return;window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);if(took){linkOffset(clip);changed(false);renderInspector();}};
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
  // Narration from scene scripts, spoken by Kokoro in tts-worker.js. Each scene's narration is a clip on the Narration
  // lane linked to its scene (clip.scene), so it moves with the scene when earlier scenes change length or scenes are
  // reordered. Moving or trimming the clip by hand unlinks it.
  const VOICES=[['af_heart','Heart · US female'],['af_bella','Bella · US female'],['af_nicole','Nicole · US female (soft)'],['af_sarah','Sarah · US female'],['af_nova','Nova · US female'],['af_sky','Sky · US female'],['af_alloy','Alloy · US female'],['af_aoede','Aoede · US female'],['af_jessica','Jessica · US female'],['af_kore','Kore · US female'],['af_river','River · US female'],
    ['am_michael','Michael · US male'],['am_fenrir','Fenrir · US male'],['am_puck','Puck · US male'],['am_adam','Adam · US male'],['am_echo','Echo · US male'],['am_eric','Eric · US male'],['am_liam','Liam · US male'],['am_onyx','Onyx · US male'],['am_santa','Santa · US male'],
    ['bf_emma','Emma · UK female'],['bf_isabella','Isabella · UK female'],['bf_alice','Alice · UK female'],['bf_lily','Lily · UK female'],['bm_george','George · UK male'],['bm_fable','Fable · UK male'],['bm_lewis','Lewis · UK male'],['bm_daniel','Daniel · UK male']];
  const tts={worker:null,jobs:new Map(),next:1,status:'',busy:new Set(),cache:new Map(),playing:null};
  function speak(text,voice,speed){
    const key=`${voice}|${speed}|${text}`;if(tts.cache.has(key))return tts.cache.get(key);
    const spoken=speakNow(text,voice,speed).catch(e=>{tts.cache.delete(key);throw e;});tts.cache.set(key,spoken);if(tts.cache.size>12)tts.cache.delete(tts.cache.keys().next().value);return spoken;
  }
  function speakNow(text,voice,speed){
    if(!tts.worker){
      tts.worker=new Worker('./tts-worker.js',{type:'module'});
      tts.worker.onmessage=({data})=>{
        if(data.type==='progress'){
          tts.status=data.status==='progress'&&data.total>1e6?`Downloading the voice model… ${Math.round(data.loaded/data.total*100)}%`:data.status==='speaking'?`Speaking sentence ${data.done} of ${data.of}…`:data.status==='ready'?'Voice model ready. Speaking…':tts.status||'Loading the voice model…';
          const line=$('#narrationStatus');if(line)line.textContent=tts.status;return;}
        const job=tts.jobs.get(data.id);if(!job)return;tts.jobs.delete(data.id);
        if(data.type==='done')job.resolve(data);else job.reject(new Error(data.message));};
      tts.worker.onerror=e=>{for(const job of tts.jobs.values())job.reject(new Error(e.message||'The voice could not start'));tts.jobs.clear();tts.worker=null;};
    }
    const jobId=tts.next++;return new Promise((resolve,reject)=>{tts.jobs.set(jobId,{resolve,reject});tts.worker.postMessage({id:jobId,text,voice,speed});});
  }
  const voiceSettings=()=>({voice:state.project.voice||'af_heart',speed:clamp(num(state.project.voiceSpeed,1),.6,1.5)});
  function stopPreviewVoice(){try{tts.playing?.source.stop();}catch{}tts.playing=null;}
  // Plays spoken audio without adding it to the project. what is 'script' or 'voice', for the button that shows Stop.
  async function previewVoice(text,what){
    if(tts.playing?.what===what){stopPreviewVoice();renderInspector();return;}
    stopPreviewVoice();const {voice,speed}=voiceSettings();tts.busy.add(what);tts.status=tts.worker?'Speaking…':'Loading the voice model…';renderInspector();
    try{
      const {samples,rate}=await speak(text,voice,speed),ctx=audioContext();await ctx.resume();
      const buffer=ctx.createBuffer(1,samples.length,rate);buffer.copyToChannel(samples,0);const source=ctx.createBufferSource();source.buffer=buffer;source.connect(ctx.destination);
      source.onended=()=>{if(tts.playing?.source===source){tts.playing=null;renderInspector();}};source.start();tts.playing={source,what};
      tts.status=`Playing ${(samples.length/rate).toFixed(1)} s preview${what==='script'?'. Add it to the timeline when it sounds right.':'.'}`;
    }catch(e){console.error(e);tts.status='The voice could not be played. Check your connection for the first download and try again.';}
    finally{tts.busy.delete(what);renderInspector();}
  }
  // 16-bit mono WAV, stored with the project like any other audio file.
  function wavDataUrl(samples,rate){
    const bytes=new Uint8Array(44+samples.length*2),v=new DataView(bytes.buffer),text=(o,s)=>{for(let i=0;i<s.length;i++)bytes[o+i]=s.charCodeAt(i);};
    text(0,'RIFF');v.setUint32(4,36+samples.length*2,true);text(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);text(36,'data');v.setUint32(40,samples.length*2,true);
    for(let i=0;i<samples.length;i++)v.setInt16(44+i*2,Math.round(clamp(samples[i],-1,1)*32767),true);
    let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
    return 'data:audio/wav;base64,'+btoa(binary);
  }
  function fitSceneTo(s,target){
    const len=sceneLen(s);if(len<=0)return;const k=target/len;
    for(const it of s.items){it.duration=Math.max(.1,Math.round(num(it.duration,1)*k*100)/100);it.pause=Math.max(0,Math.round(num(it.pause)*k*100)/100);}
  }
  function syncNarration(){
    for(const clip of audioClips()){if(!clip.scene)continue;const index=state.project.scenes.findIndex(s=>s.id===clip.scene);if(index<0)delete clip.scene;else clip.start=Math.max(0,sceneStart(index)+num(clip.sceneOffset));}
  }
  async function narrateScene(s){
    const text=String(s.script||'').trim();if(!text){toast('Write a script for this scene first.');return false;}
    if(tts.busy.has(s.id))return false;tts.busy.add(s.id);tts.status='Loading the voice model…';if(scene()===s)renderInspector();
    try{
      const {voice,speed}=voiceSettings(),{samples,rate,sentences}=await speak(text,voice,speed),seconds=samples.length/rate,mode=timingMode(s);
      const src=wavDataUrl(samples,rate),buffer=await loadAudioFile({src});
      snapshot();
      // Replace this scene's earlier narration, and drop its audio file if nothing else uses it.
      const clips=audioClips();for(const old of clips.filter(c=>c.scene===s.id)){clips.splice(clips.indexOf(old),1);if(!clips.some(c=>c.file===old.file))delete state.project.audioFiles[old.file];}
      if(mode==='fit')fitSceneTo(s,seconds+.5);else if(mode==='sentences'&&sentences?.length)timeSceneToSentences(s,sentences,seconds+.5);
      const fileId=id(),name=`${s.name} narration`;(state.project.audioFiles||(state.project.audioFiles={}))[fileId]={name,src,duration:buffer.duration};
      clips.push({id:id(),file:fileId,lane:1,start:0,offset:0,length:buffer.duration,volume:1,fadeIn:0,fadeOut:0,scene:s.id,sentences:sentences||[]});
      tts.status=`Narration ready: ${seconds.toFixed(1)} s${mode==='sentences'?', drawings matched to its sentences':mode==='fit'?', scene timing matched':''}.`;changed();return true;
    }catch(e){console.error(e);tts.status='The narration could not be made. Check your connection for the first download and try again.';toast('Could not make the narration.');return false;}
    finally{tts.busy.delete(s.id);if(state.tool!=='audio'&&!item()&&!state.selectedClip)renderInspector();}
  }
  async function narrateAll(){
    const scenes=state.project.scenes.filter(s=>String(s.script||'').trim());if(!scenes.length){toast('Add a script to a scene first.');return;}
    let made=0;for(const s of scenes)if(await narrateScene(s))made++;toast(`Narrated ${made} of ${scenes.length} scene${scenes.length===1?'':'s'}.`);
  }
  function scriptFields(s){
    const busy=tts.busy.has(s.id),mode=timingMode(s),retime=!!sceneNarrationMarks(s);
    return `<div class="panel-divider"></div><div class="field"><label>Script</label><textarea data-scene-script rows="5" placeholder="What the narrator says in this scene…">${esc(s.script||'')}</textarea></div>
      <div class="field"><label>Voice</label><select data-voice>${VOICES.map(([v,n])=>`<option value="${v}" ${(state.project.voice||'af_heart')===v?'selected':''}>${n}</option>`).join('')}</select></div>
      <div class="field"><label>Speaking speed <span id="voiceSpeedLabel">${Math.round(clamp(num(state.project.voiceSpeed,1),.6,1.5)*100)}%</span></label><input data-voice-speed type="range" min="0.6" max="1.5" step="0.05" value="${clamp(num(state.project.voiceSpeed,1),.6,1.5)}"></div>
      <div class="field"><label>Scene timing with narration</label><select data-scene-timing>${[['sentences','Match each drawing to its sentence'],['fit','Fit the whole scene to the narration'],['none','Keep my timing']].map(([v,n])=>`<option value="${v}" ${mode===v?'selected':''}>${n}</option>`).join('')}</select></div>${retime?'<button class="panel-action retime-button" data-action="retime">Re-time drawings to the narration</button>':''}
      <div class="narrate-row"><button class="panel-action" data-action="preview-script" ${tts.busy.has('script')?'disabled':''}>${tts.playing?.what==='script'?'■ Stop':tts.busy.has('script')?'Speaking…':'▶ Preview'}</button><button class="panel-action" data-action="preview-voice" ${tts.busy.has('voice')?'disabled':''}>${tts.playing?.what==='voice'?'■ Stop':tts.busy.has('voice')?'Speaking…':'Try voice'}</button></div>
      <button class="button primary narrate-button" data-action="narrate" ${busy?'disabled':''}>${busy?'Adding narration…':audioClips().some(c=>c.scene===s.id)?'Replace narration on timeline':'Add narration to timeline'}</button>
      <p id="narrationStatus" class="panel-help">${esc(tts.status)}</p>
      <div class="note-card">Narration is spoken by Kokoro on this computer. The first time, the voice model (about 92 MB) downloads once.</div>`;
  }
  // A sample of a single-line pen font, drawn from its glyphs.
  function strokeSample(key){
    const paths=textPaths({text:'Hello there',font:key,fontSize:23,x:0,y:2,w:2000,h:40,color:'currentColor'});if(!paths.length)return '';
    const right=Math.max(...paths.map(p=>p.tx))+20;
    return `<svg viewBox="0 0 ${right} 36" preserveAspectRatio="xMinYMid meet">${paths.map(p=>`<path d="${esc(p.d)}" transform="translate(${p.tx} ${p.ty}) scale(${p.sx} ${p.sy})" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`).join('')}</svg>`;
  }
  function fontPicker(it){
    const current=it.font||'futural';
    return `<div class="field"><label>Writing style</label><div class="font-picker">${FONT_GROUPS.map(([group,list])=>`<div class="font-group">${group}</div>${list.map(([key,name,looks])=>`<button class="font-tile ${current===key?'active':''}" data-font="${key}" title="${esc(name)} · ${esc(looks)}"><span class="font-face"${HANDWRITING_FONTS[key]?` style="font-family:'${esc(HANDWRITING_FONTS[key])}',cursive"`:''}>${HANDWRITING_FONTS[key]?'Hello there':strokeSample(key)}</span><span class="font-name">${esc(name)}<small>${esc(looks)}</small></span></button>`).join('')}`).join('')}</div></div>`;
  }
  // Timeline editing tools. Split and trims work on audio at the playhead: the selected clip if it is under the
  // playhead, otherwise every clip under it, as in most video editors. Scenes can be split at the playhead too.
  function undo(){if(!state.undo.length)return;state.redo.push(clone(state.project));state.project=state.undo.pop();state.sceneIndex=clamp(state.sceneIndex,0,state.project.scenes.length-1);state.selected=null;state.selectedClip=null;changed();}
  function redo(){if(!state.redo.length)return;state.undo.push(clone(state.project));state.project=state.redo.pop();state.sceneIndex=clamp(state.sceneIndex,0,state.project.scenes.length-1);state.selected=null;state.selectedClip=null;changed();}
  // A narration clip linked to its scene keeps its distance from the scene's start, so it follows the scene.
  function linkOffset(clip){
    if(!clip.scene)return;const index=state.project.scenes.findIndex(s=>s.id===clip.scene);
    if(index<0){delete clip.scene;delete clip.sceneOffset;return;}clip.sceneOffset=clip.start-sceneStart(index);
  }
  const clipsAt=t=>audioClips().filter(c=>t>c.start+AUDIO_MIN&&t<c.start+clipLength(c)-AUDIO_MIN);
  function editTargets(t){const chosen=clipById(state.selectedClip);return chosen?(clipsAt(t).includes(chosen)?[chosen]:[]):clipsAt(t);}
  function splitClipAt(clip,t){
    const at=t-clip.start,len=clipLength(clip),rest={...clip,id:id(),start:t,offset:num(clip.offset)+at,length:len-at,fadeIn:0};
    clip.length=at;clip.fadeOut=0;audioClips().push(rest);linkOffset(rest);return rest;
  }
  function trimClipStart(clip,t){const d=t-clip.start,len=clipLength(clip);clip.start=t;clip.offset=num(clip.offset)+d;clip.length=len-d;clip.fadeIn=Math.min(num(clip.fadeIn),clip.length/2);linkOffset(clip);}
  function trimClipEnd(clip,t){clip.length=t-clip.start;clip.fadeOut=Math.min(num(clip.fadeOut),clip.length/2);}
  // Applies split or a trim to the given clips at video time t.
  function editClips(name,clips,t){
    if(!clips.length){toast(state.selectedClip?'Move the playhead inside the selected clip.':'Move the playhead over an audio clip.');return;}
    snapshot();let last=null;
    for(const c of clips){if(name==='split')last=splitClipAt(c,t);else if(name==='trim-start')trimClipStart(c,t);else trimClipEnd(c,t);}
    if(name==='split'&&clips.length===1){state.selectedClip=last.id;state.selected=null;}
    changed();
  }
  // Moves the drawings that start at or after the playhead into a new scene right after this one.
  function splitSceneAt(t){
    const index=state.sceneIndex,s=scene(),local=t-sceneStart(index),schedule=sceneSchedule(s);
    if(local<0||local>sceneLen(s)+1e-6){toast('Move the playhead into this scene to split it.');return;}
    const at=schedule.findIndex(e=>!e.together&&e.from>=local-1e-6),clock=at>=0?schedule[at].from:0;
    if(at<=0){toast('Move the playhead between two drawings in this scene to split it.');return;}
    snapshot();const rest={id:id(),name:`${s.name} (continued)`,background:s.background,items:s.items.splice(at)};state.project.scenes.splice(index+1,0,rest);
    for(const c of audioClips())if(c.scene===s.id&&num(c.sceneOffset)>=clock-1e-6){c.scene=rest.id;c.sceneOffset=num(c.sceneOffset)-clock;}
    state.selected=null;changed();toast(`Split into “${s.name}” and “${rest.name}”.`);
  }
  function editAction(name,t=state.time){
    if(name==='undo')return undo();if(name==='redo')return redo();
    if(name==='razor'){state.razor=!state.razor;renderAudioEditor();renderEditTools(true);return;}
    if(name==='snap'){audio.snap=audio.snap===false;renderEditTools(true);return;}
    if(name==='split-scene')return splitSceneAt(t);
    if(name==='delete'||name==='duplicate'){if(state.selectedClip)clipAction(name);else if(state.selected)action(name);else toast('Select a drawing or an audio clip first.');return;}
    editClips(name,editTargets(t),t);
  }
  let editToolsKey='';
  function renderEditTools(force){
    const host=$('#editTools');if(!host)return;
    const targets=editTargets(state.time).length,chosen=!!(clipById(state.selectedClip)||item()),key=[targets>0,chosen,state.undo.length>0,state.redo.length>0,!!state.razor,audio.snap!==false].join();
    if(key===editToolsKey&&!force)return;editToolsKey=key;
    const b=(name,label,title,enabled=true,active=false)=>`<button class="tool-chip ${active?'active':''}" data-edit="${name}" title="${title}" ${enabled?'':'disabled'}>${label}</button>`;
    host.innerHTML=b('undo','↶','Undo (Ctrl+Z)',state.undo.length>0)+b('redo','↷','Redo (Ctrl+Y)',state.redo.length>0)+'<span class="tool-sep"></span>'+
      b('split','✂ Split','Split audio at the playhead (S)',targets>0)+b('trim-start','⇤','Trim the start of audio to the playhead ([)',targets>0)+b('trim-end','⇥','Trim the end of audio to the playhead (])',targets>0)+'<span class="tool-sep"></span>'+
      b('duplicate','⧉','Duplicate the selection (Ctrl+D)',chosen)+b('delete','🗑','Delete the selection (Delete)',chosen)+'<span class="tool-sep"></span>'+
      b('razor','Razor','Razor: click an audio clip to cut it there (C)',true,!!state.razor)+b('snap','Snap','Snap clips to the playhead, scenes and other clips',true,audio.snap!==false)+b('split-scene','✂ Scene','Split this scene into two at the playhead');
  }
  // Right-click menu for an audio clip, acting at the point that was clicked.
  function showClipMenu(clip,t,x,y){
    closeClipMenu();const menu=document.createElement('div');menu.id='clipMenu';menu.className='clip-menu';
    const inside=t>clip.start+AUDIO_MIN&&t<clip.start+clipLength(clip)-AUDIO_MIN;
    menu.innerHTML=[['split','✂ Split here',inside],['trim-start','⇤ Trim start to here',inside],['trim-end','Trim end to here ⇥',inside],['duplicate','⧉ Duplicate',true],['delete','🗑 Delete',true]].map(([name,label,ok])=>`<button data-menu="${name}" ${ok?'':'disabled'}>${label}</button>`).join('');
    menu.style.left=`${Math.min(x,innerWidth-190)}px`;menu.style.top=`${Math.min(y,innerHeight-190)}px`;document.body.appendChild(menu);
    menu.addEventListener('click',e=>{const b=e.target.closest('[data-menu]');if(!b)return;closeClipMenu();const name=b.dataset.menu;state.selectedClip=clip.id;state.selected=null;
      if(name==='duplicate'||name==='delete')clipAction(name);else editClips(name,[clip],t);});
    setTimeout(()=>{window.addEventListener('pointerdown',closeOnOutside,true);},0);
  }
  function closeOnOutside(e){if(!e.target.closest('#clipMenu'))closeClipMenu();}
  function closeClipMenu(){$('#clipMenu')?.remove();window.removeEventListener('pointerdown',closeOnOutside,true);}
  function bindEditing(){
    $('#editTools').addEventListener('click',e=>{const b=e.target.closest('[data-edit]');if(b)editAction(b.dataset.edit);});
    $('#audioEditor').addEventListener('contextmenu',e=>{const el=e.target.closest('[data-clip]'),clip=el&&clipById(el.dataset.clip);if(!clip)return;e.preventDefault();
      const t=Math.max(0,(e.clientX-$('#audioScroll .audio-inner').getBoundingClientRect().left)/audioScale());selectClip(clip.id);showClipMenu(clip,t,e.clientX,e.clientY);});
  }
  // How a scene follows its narration (scene.narrationTiming): 'sentences' gives each drawing its own sentence,
  // 'fit' stretches the whole scene to the narration, 'none' keeps the scene's own timing.
  const timingMode=s=>s.narrationTiming||(s.fitToNarration===false?'none':'sentences');
  // Gives each drawing a slot of the narration. With as many drawings as sentences, each starts with its sentence; with
  // fewer, they spread across the sentences; with more, several take turns within a sentence. marks are sentence times
  // from the scene's start; total is how long the scene should last.
  function timeSceneToSentences(s,marks,total){
    const items=s.items,n=items.length,m=marks.length;if(!n||!m)return;
    const sentenceOf=i=>n<=m?Math.round(i*m/n):Math.floor(i*m/n);
    const starts=items.map((_,i)=>{const k=sentenceOf(i),mark=marks[k];if(n<=m)return mark.start;
      const shared=items.map((__,j)=>j).filter(j=>sentenceOf(j)===k);return mark.start+(mark.end-mark.start)*shared.indexOf(i)/shared.length;});
    starts[0]=0;
    items.forEach((it,i)=>{const slot=Math.max(.3,(i<n-1?starts[i+1]:total)-starts[i]);it.withPrevious=false;it.delay=0;
      it.duration=Math.round(clamp(num(it.duration,1),.3,Math.max(.3,slot-.1))*100)/100;it.pause=Math.round(Math.max(0,slot-it.duration)*100)/100;});
  }
  // Sentence times of a scene's narration, measured from the scene's start, and when the narration ends.
  function sceneNarrationMarks(s){
    const clip=audioClips().filter(c=>c.scene===s.id&&c.sentences?.length).sort((a,b)=>a.start-b.start)[0];if(!clip)return null;
    const shift=clip.start-sceneStart(state.project.scenes.indexOf(s))-num(clip.offset),end=num(clip.offset)+clipLength(clip);
    const marks=clip.sentences.filter(x=>x.start<end).map(x=>({text:x.text,start:Math.max(0,x.start+shift),end:Math.min(end,x.end)+shift}));
    return marks.length?{marks,total:marks[marks.length-1].end+.5}:null;
  }
  function retimeScene(s){
    const found=sceneNarrationMarks(s);if(!found){toast('Add narration to this scene first.');return;}
    snapshot();timeSceneToSentences(s,found.marks,found.total);changed();toast('Drawings matched to the narration, sentence by sentence.');
  }
  // Captions: one cue per narration sentence, at its place in the video and inside the clip's trimmed part.
  function captionCues(){
    const cues=[];
    for(const c of audioClips()){if(!c.sentences?.length)continue;const off=num(c.offset),len=clipLength(c);
      for(const m of c.sentences){const a=Math.max(m.start,off),b=Math.min(m.end,off+len);if(b-a>=.2)cues.push({start:c.start+a-off,end:c.start+b-off,text:m.text});}}
    return cues.sort((a,b)=>a.start-b.start);
  }
  function srtText(cues,t0=0){
    const time=v=>{const ms=Math.max(0,Math.round(v*1000)),p=(n,w=2)=>String(n).padStart(w,'0');return `${p(Math.floor(ms/3600000))}:${p(Math.floor(ms/60000)%60)}:${p(Math.floor(ms/1000)%60)},${p(ms%1000,3)}`;};
    return cues.map((c,i)=>`${i+1}\n${time(c.start-t0)} --> ${time(c.end-t0)}\n${c.text}\n`).join('\n');
  }
  function wrapCaption(text,maxWidth,measure){const lines=[];let line='';for(const word of text.split(/\s+/)){const test=line?`${line} ${word}`:word;if(line&&measure(test)>maxWidth){lines.push(line);line=word;}else line=test;}if(line)lines.push(line);return lines;}
  // Draws the caption for video time t at the bottom of an export frame.
  function drawCaption(ctx,cues,t){
    const cue=cues.find(c=>t>=c.start&&t<c.end);if(!cue)return;
    const W=ctx.canvas.width,H=ctx.canvas.height,size=Math.round(Math.min(W,H)*.045);ctx.save();ctx.font=`600 ${size}px "DM Sans", sans-serif`;
    const lines=wrapCaption(cue.text,W*.8,x=>ctx.measureText(x).width),lh=size*1.3,bw=Math.max(...lines.map(l=>ctx.measureText(l).width))+size*1.2,bh=lines.length*lh+size*.5,x=(W-bw)/2,y=H-bh-H*.05;
    ctx.fillStyle='rgba(20,28,38,.8)';ctx.beginPath();ctx.roundRect(x,y,bw,bh,size*.4);ctx.fill();
    ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.textBaseline='top';lines.forEach((l,i)=>ctx.fillText(l,W/2,y+size*.25+i*lh));ctx.restore();
  }
  // The same caption in the preview, drawn into the camera's view.
  function captionMarkup(box,t){
    if(!state.project.previewCaptions)return '';const cue=captionCues().find(c=>t>=c.start&&t<c.end);if(!cue)return '';
    const [x,y,w,h]=box,size=Math.min(w,h)*.045,lines=wrapCaption(cue.text,w*.8,s=>s.length*size*.52),lh=size*1.3,bw=Math.max(...lines.map(l=>l.length*size*.52))+size*1.2,bh=lines.length*lh+size*.5,bx=x+(w-bw)/2,by=y+h-bh-h*.05;
    return `<g pointer-events="none"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${size*.4}" fill="#141c26" fill-opacity=".8"/>${lines.map((l,i)=>`<text x="${x+w/2}" y="${by+size*.25+i*lh+size*.82}" text-anchor="middle" font-family="DM Sans, sans-serif" font-weight="600" font-size="${size}" fill="#ffffff">${esc(l)}</text>`).join('')}</g>`;
  }
  // Where narration plays, merged when close together, for lowering the music underneath.
  function narrationSpans(){
    const spans=audioClips().filter(c=>(c.lane||0)===1&&clipLength(c)>0).map(c=>[c.start,c.start+clipLength(c)]).sort((a,b)=>a[0]-b[0]),out=[];
    for(const sp of spans){const last=out[out.length-1];if(last&&sp[0]-last[1]<.8)last[1]=Math.max(last[1],sp[1]);else out.push([...sp]);}
    return out;
  }
  // Selecting several items: state.selected is the item the inspector shows, state.multi holds the rest of a
  // multi-selection. Cameras are only ever selected on their own.
  function selectionIds(){const ids=new Set(state.multi||[]);if(state.selected)ids.add(state.selected);return [...ids].filter(i=>scene().items.some(x=>x.id===i));}
  const selectedItems=()=>{const ids=selectionIds();return scene().items.filter(x=>ids.includes(x.id));};
  function setSelection(ids){const list=ids.filter(i=>scene().items.some(x=>x.id===i&&x.type!=='camera'));state.selected=list[list.length-1]||null;state.multi=list;state.selectedClip=null;state.tool='select';renderAll();}
  function unionBox(items){const boxes=items.map(boundsOf),l=Math.min(...boxes.map(b=>b[0])),t=Math.min(...boxes.map(b=>b[1])),r=Math.max(...boxes.map(b=>b[0]+b[2])),b=Math.max(...boxes.map(b=>b[1]+b[3]));return [l,t,r-l,b-t];}
  // The shot that shows an item: the camera frame when it starts drawing, or the video frame.
  function frameFor(it){const e=sceneSchedule(scene()).find(x=>x.it===it);return cameraBox(visualAt(scene(),e?e.start:0).camera);}
  // Aligns items to a box: the selection's own bounds, or for a single item the frame that shows it.
  function alignItems(items,how){
    if(!items.length)return;const ref=items.length>1?unionBox(items):frameFor(items[0]);snapshot();
    for(const it of items){const b=boundsOf(it),dx=how==='left'?ref[0]-b[0]:how==='center'?ref[0]+ref[2]/2-b[0]-b[2]/2:how==='right'?ref[0]+ref[2]-b[0]-b[2]:0,dy=how==='top'?ref[1]-b[1]:how==='middle'?ref[1]+ref[3]/2-b[1]-b[3]/2:how==='bottom'?ref[1]+ref[3]-b[1]-b[3]:0;it.x=Math.round((it.x+dx)*10)/10;it.y=Math.round((it.y+dy)*10)/10;}
    changed(false);
  }
  // Spreads three or more items so the gaps between them are equal, keeping the outer two in place.
  function distributeItems(items,axis){
    if(items.length<3){toast('Select three or more items to distribute.');return;}snapshot();
    const k=axis==='x'?0:1,list=items.map(it=>({it,b:boundsOf(it)})).sort((a,b)=>a.b[k]+a.b[k+2]/2-(b.b[k]+b.b[k+2]/2)),first=list[0].b,last=list[list.length-1].b;
    const gap=(last[k]+last[k+2]-first[k]-list.reduce((s,x)=>s+x.b[k+2],0))/(list.length-1);let at=first[k];
    for(const {it,b} of list){const d=at-b[k];if(axis==='x')it.x=Math.round((it.x+d)*10)/10;else it.y=Math.round((it.y+d)*10)/10;at+=b[k+2]+gap;}
    changed(false);
  }
  // Layer order is separate from draw order: items with a higher z appear on top (it.z, default 0).
  function arrangeItems(items,how){
    if(!items.length)return;snapshot();const zs=scene().items.map(x=>num(x.z));
    for(const it of items){if(how==='front')it.z=Math.max(...zs)+1;else if(how==='back')it.z=Math.min(...zs)-1;else it.z=num(it.z)+(how==='forward'?1:-1);}
    changed(false);toast(how==='front'?'Brought to front.':how==='back'?'Sent to back.':how==='forward'?'Brought forward.':'Sent backward.');
  }
  function flipItems(items,axis){if(!items.length)return;snapshot();for(const it of items){if(axis==='x')it.flipX=!it.flipX;else it.flipY=!it.flipY;}changed();}
  // Copy, cut and paste. Pasting into the same scene offsets the copies a little so they are easy to see.
  let clipboard=null;
  function copyItems(cut){
    const items=selectedItems().filter(x=>x.type!=='camera');if(!items.length)return;clipboard={scene:scene().id,items:clone(items)};
    if(cut){snapshot();const ids=items.map(x=>x.id);scene().items=scene().items.filter(x=>!ids.includes(x.id));state.selected=null;state.multi=[];changed();toast(`Cut ${items.length} item${items.length===1?'':'s'}.`);}
    else toast(`Copied ${items.length} item${items.length===1?'':'s'}.`);
  }
  function pasteItems(){
    if(!clipboard?.items.length){toast('Copy something first.');return;}snapshot();const same=clipboard.scene===scene().id,copies=clone(clipboard.items).map(x=>({...x,id:id(),...(same?{x:x.x+30,y:x.y+30}:{})}));
    scene().items.push(...copies);if(same)clipboard.items=clone(copies);changed();setSelection(copies.map(x=>x.id));toast(`Pasted ${copies.length} item${copies.length===1?'':'s'}.`);
  }
  function deleteItems(items){if(!items.length)return;snapshot();const ids=items.map(x=>x.id);scene().items=scene().items.filter(x=>!ids.includes(x.id));state.selected=null;state.multi=[];changed();}
  function duplicateItems(items){if(!items.length)return;snapshot();const copies=clone(items).map(x=>({...x,id:id(),x:x.x+35,y:x.y+35}));scene().items.push(...copies);changed();setSelection(copies.map(x=>x.id));}
  // Arrow keys nudge the selection by one unit, or ten with Shift; a run of nudges is a single undo step.
  let lastNudge=0;
  function nudge(dx,dy){const items=selectedItems().filter(x=>x.type!=='camera');if(!items.length)return false;if(Date.now()-lastNudge>800)snapshot();lastNudge=Date.now();for(const it of items){it.x+=dx;it.y+=dy;}changed(false);return true;}
  const ALIGN_BUTTONS=[['left','⇤','Align left'],['center','↔','Align centres'],['right','⇥','Align right'],['top','⤒','Align top'],['middle','↕','Align middles'],['bottom','⤓','Align bottom']];
  function arrangeFields(items){
    const many=items.length>1,b=(attr,label,title)=>`<button class="panel-action icon-action" ${attr} title="${title}">${label}</button>`;
    return `<div class="field"><label>${many?'Align selection':'Align in its shot'}</label><div class="icon-row">${ALIGN_BUTTONS.map(([v,l,t])=>b(`data-align-items="${v}"`,l,t+(many?'':' of the frame'))).join('')}</div></div>
      ${many?`<div class="field"><label>Distribute</label><div class="icon-row">${b('data-distribute="x"','⇿ Across','Equal gaps left to right')}${b('data-distribute="y"','⇳ Down','Equal gaps top to bottom')}</div></div>`:''}
      <div class="field"><label>Arrange</label><div class="icon-row">${b('data-flip="x"','⇋ Flip','Flip left to right')}${b('data-flip="y"','⇵ Flip','Flip upside down')}${b('data-layer="front"','To front','Bring to front (Ctrl+Shift+])')}${b('data-layer="back"','To back','Send to back (Ctrl+Shift+[)')}</div></div>`;
  }
  function multiPanel(items){
    return `<div class="panel-eyebrow">${items.length} ITEMS SELECTED</div><h2 class="panel-title">Selection</h2><p class="panel-help">Drag any of them to move them together. Shift-click to add or remove items.</p>${arrangeFields(items)}<div class="panel-divider"></div><div class="panel-actions"><button class="panel-action" data-multi="copy">Copy</button><button class="panel-action" data-multi="duplicate">Duplicate</button><button class="panel-action danger" data-multi="delete">Delete</button></div>`;
  }
  function bindArrange(){
    $('#inspector').addEventListener('click',e=>{
      const items=selectedItems().filter(x=>x.type!=='camera'),a=e.target.closest('[data-align-items]'),d=e.target.closest('[data-distribute]'),f=e.target.closest('[data-flip]'),l=e.target.closest('[data-layer]'),m=e.target.closest('[data-multi]');
      if(a)alignItems(items,a.dataset.alignItems);if(d)distributeItems(items,d.dataset.distribute);if(f)flipItems(items,f.dataset.flip);if(l)arrangeItems(items,l.dataset.layer);
      if(m){if(m.dataset.multi==='copy')copyItems(false);if(m.dataset.multi==='duplicate')duplicateItems(items);if(m.dataset.multi==='delete')deleteItems(items);}
      if(a||d||f||l)renderInspector();
    });
  }
  const field=(label,key,val,type='text',opts='')=>`<div class="field"><label>${label}</label><input data-set="${key}" type="${type}" value="${esc(val)}" ${opts}></div>`;
  const selectField=(label,key,val,options)=>`<div class="field"><label>${label}</label><select data-set="${key}">${options.map(([v,n])=>`<option value="${v}" ${val===v?'selected':''}>${n}</option>`).join('')}</select></div>`;
  // The video's aspect ratio (all camera frames follow it), offered in scene settings and on camera moves.
  // Marker colors for text and line drawings: quick swatches plus a custom color.
  const INK_COLORS=['#213b4b','#111111','#285d63','#2f6fb3','#3f8f4a','#c0392b','#e67e22','#d4a017','#8e44ad','#7a4e2d','#ffffff'];
  const colorField=it=>{const cur=String(it.color||(it.type==='text'?'#213b4b':'#285d63')).toLowerCase();return `<div class="field"><label>Color</label><div class="swatch-row">${INK_COLORS.map(c=>`<button class="swatch ${cur===c?'active':''}" data-color="${c}" style="background:${c}" title="${c}" aria-label="Color ${c}"></button>`).join('')}<input data-set="color" type="color" value="${esc(cur)}" title="Custom color" aria-label="Custom color"></div></div>`;};
  const handField=(target,help)=>{const k=handSizeOf(target),deg=handAngleOf(target);return `<div class="field"><label>Hand size <span id="handSizeLabel">${Math.round(k*100)}%</span></label><input data-set="handSize" type="range" min="${HAND_SIZES[0]}" max="${HAND_SIZES[1]}" step="0.05" value="${k}"></div><div class="field"><label>Hand angle <span id="handAngleLabel">${Math.round(deg)}°</span></label><input data-set="handAngle" type="range" min="${HAND_ANGLES[0]}" max="${HAND_ANGLES[1]}" step="1" value="${deg}"><p class="panel-help">${help}</p></div>`;};
  const formatField=()=>`<div class="field"><label>Camera and video format</label><div class="segmented">${[['16:9','Wide'],['1:1','Square'],['9:16','Tall']].map(([v,n])=>`<button data-ratio="${v}" class="${state.project.ratio===v?'active':''}">${n}</button>`).join('')}</div></div>`;
  function renderInspector(){
    const it=item(),s=scene(),clip=clipById(state.selectedClip),several=selectedItems().filter(x=>x.type!=='camera');let html='';
    if(several.length>1)html=multiPanel(several);
    else if(clip&&!it)html=clipPanel(clip);
    else if(it){
      html=`<div class="panel-eyebrow">SELECTED ${it.type.toUpperCase()}</div><h2 class="panel-title">${esc(tileLabel(it))}</h2><p class="panel-help">Fine tune how this part of your story appears.</p>`;
      if(it.type==='camera'){
        html+=`<div class="panel-divider"></div>${field('Zoom','zoom',it.zoom,'number','min="0.2" max="5" step="0.05"')}<div class="field-row">${field('Center X','cx',Math.round(it.cx),'number','step="10"')}${field('Center Y','cy',Math.round(it.cy),'number','step="10"')}</div>${formatField()}${handField(it,'How big the drawing hand is in this shot, and how it is tilted. Later camera moves start with these.')}<button class="panel-action camera-preview" data-action="preview-camera">Preview this camera frame</button><p class="panel-help camera-help">Drag the green frame to pan. Drag its handles to resize the shot. Preview is cropped to this frame.</p>`;
      }else{
        if(it.type==='text')html+=`<div class="field"><label>Text</label><textarea data-set="text">${esc(it.text)}</textarea></div>${field('Font size','fontSize',it.fontSize,'number','min="16" max="180"')}${colorField(it)}<div class="field"><label>Align</label><div class="segmented">${[['left','⇤ Left'],['center','↔ Center'],['right','Right ⇥']].map(([v,n])=>`<button data-align="${v}" class="${(it.align||'left')===v?'active':''}" title="Align text ${v}">${n}</button>`).join('')}</div></div>${fontPicker(it)}`;
        if(it.type==='icon'||it.type==='vector')html+=colorField(it);
        if(it.type==='shape')html+=`${selectField('Shape','shape',it.shape,[['round','Rounded rectangle'],['rect','Rectangle'],['circle','Ellipse']])}${field('Fill','fill',it.fill,'color')}`;
        html+=`<div class="field-row">${field('X position','x',Math.round(it.x),'number','step="1"')}${field('Y position','y',Math.round(it.y),'number','step="1"')}</div><div class="field-row">${field('Width','w',Math.round(it.w),'number','min="10"')}${field('Height','h',Math.round(it.h),'number','min="10"')}</div><div class="field-row">${field('Rotation (°)','rotation',Math.round(num(it.rotation)*10)/10,'number','min="-180" max="180" step="1"')}<div class="field"><label>&nbsp;</label><button class="panel-action" data-action="rotate-reset" ${num(it.rotation)?'':'disabled'}>Straighten</button></div></div>${arrangeFields([it])}`;
        html+=selectField('Entrance','animation',it.animation==='reveal'?'draw':it.animation,[['draw','Hand draw'],['fade','Fade in'],['slide','Slide in'],['pop','Pop in'],['none','Appear']]);
        if(it.type==='image'&&it.character)html+=characterFaceField(it);
        if(it.type==='image')html+=`<div class="note-card">${it.illustration?'The marker draws the line work first, then colors in each area. Transparent areas stay clear.':'The marker traces visible contours and fills only visible artwork. Transparent areas stay clear.'}</div>`;
      }
      const first=s.items[0]===it;
      html+=`<div class="panel-divider"></div><div class="field"><label>Starts</label><div class="segmented"><button data-start-mode="after" class="${it.withPrevious&&!first?'':'active'}">After previous</button><button data-start-mode="with" class="${it.withPrevious&&!first?'active':''}" ${first?'disabled title="The first item has nothing before it"':''}>With previous</button></div></div><div class="field-row">${field('Duration (sec)','duration',it.duration,'number','min="0.1" max="60" step="0.1"')}${field('Pause (sec)','pause',it.pause,'number','min="0" max="60" step="0.1"')}</div><div class="field-row">${field('Delay (sec)','delay',num(it.delay),'number','min="0" max="60" step="0.1"')}<div class="field"></div></div>${it.type==='camera'?'':effectFields(it)}<div class="panel-divider"></div><div class="panel-actions"><button class="panel-action" data-action="duplicate">Duplicate</button><button class="panel-action" data-action="back">Move earlier</button><button class="panel-action" data-action="forward">Move later</button><button class="panel-action danger" data-action="delete">Delete</button></div>`;
    }else if(state.tool==='icon'){
      html=libraryPanel();
    }else if(state.tool==='shape'){
      html=`<div class="panel-eyebrow">ELEMENTS</div><h2 class="panel-title">Shapes</h2><p class="panel-help">Simple shapes help frame your message.</p><div class="preset-grid"><button class="preset" data-shape="round">▢</button><button class="preset" data-shape="rect">□</button><button class="preset" data-shape="circle">○</button></div>`;
    }else if(state.tool==='audio'){
      html=audioPanel();
    }else{
      html=`<div class="panel-eyebrow">SCENE SETTINGS</div><h2 class="panel-title">${esc(s.name)}</h2><p class="panel-help">Build your whiteboard story, one moment at a time.</p>${field('Scene name','sceneName',s.name)}<div class="field"><label>Board</label><div class="segmented board-picker">${BOARDS.map(([v,n])=>`<button data-board="${v}" class="${(s.board||'plain')===v?'active':''}">${n}</button>`).join('')}</div></div>${(s.board||'plain')==='plain'?field('Background','background',s.background,'color'):''}<button class="panel-action" data-action="board-all">Use this board on every scene</button>${scriptFields(s)}<div class="panel-divider"></div>${handField(null,'Used in scenes without camera moves. Each camera move can set its own size and angle.')}<div class="panel-divider"></div>${formatField()}<div class="panel-divider"></div><div class="note-card">Pan across the whiteboard to build beyond the first frame. Add camera views to choose each shot.</div><div class="panel-divider"></div><button class="panel-action danger" data-action="scene-delete" ${state.project.scenes.length===1?'disabled':''}>Delete scene</button>`;
    }
    $('#inspector').innerHTML=html;
    const picker=$('.font-picker'),chosen=picker?.querySelector('.active');if(chosen)picker.scrollTop=chosen.offsetTop-picker.offsetTop-picker.clientHeight/2+chosen.clientHeight/2;
    if(state.tool==='icon'&&!it)showLibraryResults();
  }
  function renderAll(){renderStage();renderTimeline();renderInspector();$('#projectName').value=state.project.name;$('#formatLabel').textContent=({'16:9':'16:9 · Landscape','1:1':'1:1 · Square','9:16':'9:16 · Portrait'})[state.project.ratio];document.querySelectorAll('.tool').forEach(b=>b.classList.toggle('active',b.dataset.tool===state.tool));}
  function snapshot(){state.undo.push(clone(state.project));if(state.undo.length>40)state.undo.shift();state.redo=[];}
  function changed(full=true){syncNarration();state.project.updated=Date.now();$('#saveStatus').textContent='Saving…';clearTimeout(state.saveTimer);state.saveTimer=setTimeout(saveProject,450);if(full)renderAll();else{renderStage();renderTimeline();}}
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
      const sheet=SHEETS[sheetIndex],image=await loadImage(`./assets/sheets/${sheet.file}`);
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
  const SKIN_TONES=[['','Default','#ffc83d'],['light','Light','#f7d7c4'],['medium-light','Medium-light','#e5b593'],['medium','Medium','#c48f6a'],['medium-dark','Medium-dark','#8d5a3b'],['dark','Dark','#5b3a29']];
  const library={tab:'art',query:'',category:'all',limit:LIBRARY_PAGE,tone:'',art:null,icons:null,mine:[],loading:{},peep:{head:'short2',face:'smile',facialHair:'',accessories:'',skin:'edb98a',clothing:'8fa7df',hair:'2c1b18'}};
  function loadLibrarySet(kind){
    library.loading[kind]??=fetch(kind==='art'?'./assets/illustrations/index.json':'./assets/icons/tabler-icons.json').then(r=>{if(!r.ok)throw new Error('Library did not load');return r.json();})
      .then(data=>{library[kind]=data;}).catch(e=>{delete library.loading[kind];throw e;});
    return library.loading[kind];
  }
  function libraryEntries(){
    if(library.tab==='icons'){
      const basics=iconKeys.map(k=>({kind:'basic',key:k,name:ICONS[k].name,category:'Hand-drawn basics',words:''}));
      return basics.concat((library.icons?.icons||[]).map(([name,cat,words],i)=>({kind:'tabler',i,name:name.replace(/-/g,' '),category:library.icons.categories[cat],words})));
    }
    const mine=(library.mine||[]).map(m=>({kind:'mine',id:m.id,name:m.name,category:MINE_CATEGORY,words:'my upload uploaded own',src:m.src}));
    const sheets=SHEETS.flatMap((sheet,si)=>sheet.items.map((name,ii)=>({kind:'sheet',si,ii,name,category:sheet.name,words:''})));
    return mine.concat(sheets).concat((library.art?.items||[]).map(([path,name,group,words,toned])=>({kind:'art',path,name,category:group,words,toned})));
  }
  function libraryResults(){
    const words=library.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return libraryEntries().filter(e=>(library.category==='all'||e.category===library.category)&&words.every(w=>`${e.name} ${e.category} ${e.words}`.toLowerCase().includes(w)));
  }
  // People with skin tones use the chosen tone's file.
  const artFile=e=>e.toned&&library.tone?e.path.replace(/\.svg$/,`--${library.tone}.svg`):e.path;
  function libraryThumb(e){
    if(e.kind==='sheet'){const sheet=SHEETS[e.si],cols=sheet.cols||2,rows=sheet.rows||2;return sheet.file?`<span class="sheet-thumb" style="background-image:url('./assets/sheets/${sheet.file}');background-size:${cols*100}% ${rows*100}%;background-position:${(e.ii%cols)/(cols-1)*100}% ${Math.floor(e.ii/cols)/(rows-1)*100}%"></span>`:'<span class="sheet-thumb"></span>';}
    if(e.kind==='art')return `<img src="./assets/illustrations/${esc(artFile(e))}" alt="" loading="lazy" decoding="async">`;
    if(e.kind==='mine')return `<img src="${esc(e.src)}" alt="" decoding="async">`;
    const basic=e.kind==='basic',paths=basic?ICONS[e.key].paths:library.icons.icons[e.i][3];
    return `<svg viewBox="${basic?'0 0 100 100':'0 0 24 24'}" fill="none" stroke="currentColor" stroke-width="${basic?5:1.7}" stroke-linecap="round" stroke-linejoin="round">${paths.map(d=>`<path d="${esc(d)}"/>`).join('')}</svg>`;
  }
  function libraryButton(e){
    const data=e.kind==='mine'?`data-mine="${esc(e.id)}"`:e.kind==='sheet'?`data-sheet="${e.si}" data-sheet-item="${e.ii}"`:e.kind==='art'?`data-art="${esc(artFile(e))}" data-art-name="${esc(e.name)}"`:e.kind==='basic'?`data-icon="${e.key}"`:`data-tabler="${e.i}"`;
    return `<button class="lib-item ${e.category==='Backdrops'?'wide':''}" ${data} title="Add ${esc(e.name)}"><span class="lib-thumb">${libraryThumb(e)}</span><span class="lib-name">${esc(e.name)}</span>${e.kind==='mine'?`<span class="mine-del" data-mine-delete="${esc(e.id)}" role="button" title="Remove from my library" aria-label="Remove ${esc(e.name)} from my library">×</span>`:''}</button>`;
  }
  function libraryPanel(){
    const tabs=`<div class="segmented lib-tabs">${[['art','Illustrations'],['characters','Characters'],['icons','Icons']].map(([v,n])=>`<button data-lib-tab="${v}" class="${library.tab===v?'active':''}">${n}</button>`).join('')}</div>`;
    if(library.tab==='characters')return `<div class="panel-eyebrow">LIBRARY</div><h2 class="panel-title">Drawings</h2>${tabs}${characterBuilder()}`;
    const icons=library.tab==='icons',groups=icons?[['Icons',['Hand-drawn basics',...(library.icons?.categories||[]).slice().sort()]]]:[['Illustrations',[...(library.mine?.length?[MINE_CATEGORY]:[]),...(library.art?.groups||[])]],['Whiteboard drawings',SHEETS.map(s=>s.name)]];
    return `<div class="panel-eyebrow">LIBRARY</div><h2 class="panel-title">Drawings</h2>${tabs}
      ${icons?'':`<button class="button subtle small lib-upload" data-lib-upload>⬆ Upload to my library</button>`}<div class="field"><input id="librarySearch" type="search" placeholder="Search ${icons?'icons':'illustrations'}" value="${esc(library.query)}" aria-label="Search the library"></div>
      <div class="field"><select id="libraryCategory" aria-label="Category"><option value="all">All categories</option>${groups.map(([label,list])=>`<optgroup label="${label}">${list.map(c=>`<option value="${esc(c)}" ${library.category===c?'selected':''}>${esc(c)}</option>`).join('')}</optgroup>`).join('')}</select></div>
      ${icons?'':`<div class="tone-row" title="Skin tone for people"><span>Skin tone</span>${SKIN_TONES.map(([v,n,c])=>`<button class="tone ${library.tone===v?'active':''}" data-lib-tone="${v}" title="${n}" style="background:${c}"></button>`).join('')}</div>`}
      <p id="libraryCount" class="lib-count"></p><div id="libraryGrid" class="lib-grid ${icons?'icons':''}"></div>
      <div class="note-card">${icons?'Icons are drawn line by line with the marker in the color you choose.':'Everything is drawn like an illustrator would: line work first, then colored in. All of it is free to use in your videos without credit.'}</div>`;
  }
  // Fills the results grid without rebuilding the panel, so typing in the search box keeps its focus.
  function showLibraryResults(){
    if(library.tab==='characters'){showCharacterPreview();return;}
    const grid=$('#libraryGrid');if(!grid)return;
    const kind=library.tab==='icons'?'icons':'art';
    if(!library[kind]){grid.innerHTML='<p class="lib-count">Loading…</p>';loadLibrarySet(kind).then(()=>{if(state.tool==='icon'&&!item())renderInspector();}).catch(()=>{grid.innerHTML='<p class="lib-count">The library could not load. Check your connection and try again.</p>';});}
    const results=libraryResults(),shown=results.slice(0,library.limit);
    $('#libraryCount').textContent=results.length?`${results.length.toLocaleString()} ${results.length===1?'match':'matches'}`:'No matches. Try another word or category.';
    grid.innerHTML=shown.map(libraryButton).join('')+(results.length>shown.length?`<button class="panel-action lib-more" data-lib-more>Show ${Math.min(LIBRARY_PAGE,results.length-shown.length)} more</button>`:'');
    hydrateSheetThumbnails();
  }
  // Images are awaited with load rather than decode(): browsers hold decode() back while the page is hidden (a background
  // tab), which would stall start-up and adding drawings.
  function loadImage(src){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('An image did not load'));i.src=src;});}
  function svgImage(svg){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('Illustration did not load'));i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);});}
  // Draws an SVG to a transparent PNG about 480px on its long side, keeping its shape.
  async function rasterizeSvg(svg){
    const image=await svgImage(svg),k=480/Math.max(image.naturalWidth||480,image.naturalHeight||480),w=Math.round((image.naturalWidth||480)*k),h=Math.round((image.naturalHeight||480)*k),M=12;
    const c=document.createElement('canvas');c.width=w+M*2;c.height=h+M*2;c.getContext('2d').drawImage(image,M,M,w,h);
    return {src:c.toDataURL('image/png'),width:c.width,height:c.height};
  }
  // Painted library art (storybook/*.webp) already has a transparent background; it is used as a PNG data URL like uploads.
  async function rasterImage(blob){
    const url=URL.createObjectURL(blob);
    try{const image=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>no(new Error('Illustration did not load'));i.src=url;});
      const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;c.getContext('2d').drawImage(image,0,0);return {src:c.toDataURL('image/png'),width:c.width,height:c.height};}
    finally{URL.revokeObjectURL(url);}
  }
  // Fluent illustrations are flat, without outlines. A dark marker outline around the shape and along strong color
  // edges makes them match the whiteboard art; the marker then traces and colors them like the other drawings.
  async function outlinedIllustration(svg){
    const image=await svgImage(svg);
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
  // Adds an illustration from the index. Fluent art gets the marker outline; doodles, backdrops and this project's own
  // drawings (drawn/) are line art already. Wide pieces such as underlines and timelines start wider.
  // My uploads: the person's own pictures, illustrations and icons, kept in this browser's database (the "library"
  // store) so they can be reused in every project. A file can be one drawing, or a sheet of drawings in a grid that is
  // cut into separate drawings like the storybook sheets. Download backup carries them along with the projects.
  const MINE_CATEGORY='My uploads',MINE_SIDE=720;
  function mineTask(mode,fn){return new Promise((resolve,reject)=>{const tx=state.db.transaction('library',mode),req=fn(tx.objectStore('library'));req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
  async function loadMine(){try{library.mine=(await mineTask('readonly',s=>s.getAll())).sort((a,b)=>a.added-b.added);}catch(e){console.error(e);library.mine=[];}}
  // Reads an image file onto a canvas, at most 2400px on its long side.
  async function fileCanvas(file){
    const url=URL.createObjectURL(file);
    try{const image=await loadImage(url),k=Math.min(1,2400/Math.max(image.naturalWidth||1,image.naturalHeight||1)),c=document.createElement('canvas');
      c.width=Math.max(1,Math.round((image.naturalWidth||800)*k));c.height=Math.max(1,Math.round((image.naturalHeight||800)*k));c.getContext('2d').drawImage(image,0,0,c.width,c.height);return c;}
    finally{URL.revokeObjectURL(url);}
  }
  // Clears a plain white or near-white background that touches the edges, softening the edge around the artwork.
  function clearWhite(data,W,H){
    const px=data.data,N=W*H,bg=new Uint8Array(N),queue=new Int32Array(N);let tail=0;
    const white=i=>{const r=px[i*4],g=px[i*4+1],b=px[i*4+2],lo=Math.min(r,g,b);return px[i*4+3]<16||(lo>=232&&Math.max(r,g,b)-lo<=22);};
    for(let x=0;x<W;x++)for(const y of [0,H-1]){const i=y*W+x;if(!bg[i]&&white(i)){bg[i]=1;queue[tail++]=i;}}
    for(let y=0;y<H;y++)for(const x of [0,W-1]){const i=y*W+x;if(!bg[i]&&white(i)){bg[i]=1;queue[tail++]=i;}}
    for(let head=0;head<tail;head++){const i=queue[head],x=i%W;for(const j of [x>0?i-1:-1,x<W-1?i+1:-1,i-W,i+W])if(j>=0&&j<N&&!bg[j]&&white(j)){bg[j]=1;queue[tail++]=j;}}
    for(let i=0;i<N;i++){
      if(bg[i]){px[i*4+3]=0;continue;}
      const x=i%W;if(!((x>0&&bg[i-1])||(x<W-1&&bg[i+1])||bg[i-W]||bg[i+W]))continue;
      // Edge pixels are partly white: keep the part that is artwork.
      const lo=Math.min(px[i*4],px[i*4+1],px[i*4+2]),a=clamp((255-lo)/70,0,1);if(a>=1)continue;
      if(a<=.02){px[i*4+3]=0;continue;}
      for(let k=0;k<3;k++)px[i*4+k]=clamp((px[i*4+k]-255*(1-a))/a,0,255);px[i*4+3]=Math.round(px[i*4+3]*a);
    }
  }
  const hasTransparency=data=>{const px=data.data;for(let i=3;i<px.length;i+=4*97)if(px[i]<200)return true;return false;};
  // Splits a sheet laid out in a grid. Each drawing's solid core (nearly opaque pieces of a fair size) decides its
  // cell; faint edge and glow pixels go to the nearest core they connect to; loose bits go to the cell they sit in.
  function cutSheetCells(data,W,H,cols,rows){
    const px=data.data,N=W*H,owner=new Int16Array(N).fill(-1),seen=new Uint8Array(N),queue=new Int32Array(N),minCore=Math.max(60,N*.0006);
    const cellAt=(cx,cy)=>Math.min(rows-1,Math.floor(cy/(H/rows)))*cols+Math.min(cols-1,Math.floor(cx/(W/cols)));
    const blobs=(test,visit)=>{for(let s=0;s<N;s++){if(seen[s]||!test(s))continue;let head=0,tail=0,sx=0,sy=0;queue[tail++]=s;seen[s]=1;
      while(head<tail){const i=queue[head++],x=i%W,y=(i/W)|0;sx+=x;sy+=y;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const j=ny*W+nx;if(!seen[j]&&test(j)){seen[j]=1;queue[tail++]=j;}}}
      visit(queue.slice(0,tail),tail,sx/tail,sy/tail);}};
    const seeds=[];
    blobs(i=>px[i*4+3]>=240,(list,n,cx,cy)=>{if(n<minCore)return;const cell=cellAt(cx,cy);for(const i of list){owner[i]=cell;seeds.push(i);}});
    const grown=new Int32Array(N);grown.set(seeds);let tail=seeds.length;
    for(let head=0;head<tail;head++){const i=grown[head],x=i%W,y=(i/W)|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const j=ny*W+nx;if(owner[j]<0&&px[j*4+3]>=12){owner[j]=owner[i];grown[tail++]=j;}}}
    seen.fill(0);
    blobs(i=>owner[i]<0&&px[i*4+3]>=12,(list,n,cx,cy)=>{const cell=cellAt(cx,cy);for(const i of list)owner[i]=cell;});
    return Array.from({length:cols*rows},(_,c)=>{let x0=W,y0=H,x1=-1,y1=-1;for(let i=0;i<N;i++)if(owner[i]===c){const x=i%W,y=(i/W)|0;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
      if(x1<0)return null;const out=new ImageData(x1-x0+1,y1-y0+1);
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const i=y*W+x;if(owner[i]!==c)continue;const o=((y-y0)*(x1-x0+1)+x-x0)*4;for(let k=0;k<4;k++)out.data[o+k]=px[i*4+k];}
      return out;}).filter(Boolean);
  }
  // Trims transparent margins, keeps at most MINE_SIDE pixels on the long side and returns a compact image.
  function pieceImage(data){
    const {width:W,height:H}=data,px=data.data;let x0=W,y0=H,x1=-1,y1=-1;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(px[(y*W+x)*4+3]>=8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
    if(x1<0)return null;
    const P=8,w=x1-x0+1,h=y1-y0+1,src=document.createElement('canvas');src.width=W;src.height=H;src.getContext('2d').putImageData(data,0,0);
    const k=Math.min(1,MINE_SIDE/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.round(w*k)+P*2;c.height=Math.round(h*k)+P*2;
    const g=c.getContext('2d');g.imageSmoothingQuality='high';g.drawImage(src,x0,y0,w,h,P,P,c.width-P*2,c.height-P*2);
    const webp=c.toDataURL('image/webp',.9);
    return {src:webp.startsWith('data:image/webp')?webp:c.toDataURL('image/png'),width:c.width,height:c.height};
  }
  function chooseMineUploads(files){
    files=[...files].filter(f=>/^image\/(png|jpeg|webp|svg\+xml)$/.test(f.type));if(!files.length){toast('Choose PNG, JPEG, WebP or SVG images.');return;}
    const one=files.length===1;
    modal(`<div class="modal-top"><h2>Add to my library</h2><button class="close-button" data-mine-cancel>×</button></div>
      <p class="panel-help">${one?esc(files[0].name):`${files.length} images`} will be saved in this browser and listed under “${MINE_CATEGORY}” in Drawings, ready for any project.</p>
      <div class="field"><label>Each image is</label><div class="segmented"><button data-mine-kind="single" class="active">One drawing</button><button data-mine-kind="sheet">A sheet to cut up</button></div></div>
      <div class="field-row mine-grid hidden"><div class="field"><label>Columns</label><input id="mineCols" type="number" min="1" max="10" value="4"></div><div class="field"><label>Rows</label><input id="mineRows" type="number" min="1" max="10" value="3"></div></div>
      ${one?`<div class="field"><label>Name</label><input id="mineName" type="text" value="${esc(files[0].name.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' '))}"></div>`:''}
      <label class="check-row"><input id="mineWhite" type="checkbox" checked> Remove a plain white background</label>
      <p id="mineStatus" class="panel-help"></p>
      <div class="modal-foot"><button class="button ghost" data-mine-cancel>Cancel</button><button class="button primary" data-mine-save>Add to library</button></div>`);
    let kind='single';
    $('#modal').onclick=async e=>{
      const k=e.target.closest('[data-mine-kind]');
      if(k){kind=k.dataset.mineKind;document.querySelectorAll('#modal [data-mine-kind]').forEach(b=>b.classList.toggle('active',b===k));$('#modal .mine-grid').classList.toggle('hidden',kind!=='sheet');return;}
      if(e.target.closest('[data-mine-cancel]')){$('#modal').onclick=null;closeModal();return;}
      if(!e.target.closest('[data-mine-save]'))return;
      const button=e.target.closest('[data-mine-save]');button.disabled=true;
      const cols=clamp(Math.round(num($('#mineCols').value,4)),1,10),rows=clamp(Math.round(num($('#mineRows').value,3)),1,10),white=$('#mineWhite').checked,baseName=one?($('#mineName').value.trim()||'My drawing'):'';
      let added=0;
      try{
        for(const [fi,file] of files.entries()){
          $('#mineStatus').textContent=`Preparing ${file.name}… (${fi+1} of ${files.length})`;await new Promise(r=>setTimeout(r,30));
          const canvas=await fileCanvas(file),g=canvas.getContext('2d',{willReadFrequently:true}),data=g.getImageData(0,0,canvas.width,canvas.height);
          if(white&&!hasTransparency(data))clearWhite(data,canvas.width,canvas.height);
          const pieces=kind==='sheet'?cutSheetCells(data,canvas.width,canvas.height,cols,rows):[data];
          const name=baseName||file.name.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ');
          for(const [pi,piece] of pieces.entries()){
            const img=pieceImage(piece);if(!img)continue;
            await mineTask('readwrite',s=>s.put({id:id(),name:pieces.length>1?`${name} ${pi+1}`:name,...img,added:Date.now()+added}));added++;
          }
        }
        await loadMine();$('#modal').onclick=null;closeModal();
        library.tab='art';library.category=MINE_CATEGORY;library.query='';library.limit=LIBRARY_PAGE;state.tool='icon';state.selected=null;renderAll();
        toast(added?`${added} drawing${added===1?'':'s'} added to ${MINE_CATEGORY}.`:'Nothing was found in that image.');
      }catch(err){console.error(err);button.disabled=false;$('#mineStatus').textContent='Could not read that image. Try a PNG, JPEG, WebP or SVG file.';}
    };
  }
  async function addMineDrawing(mineId){
    const entry=library.mine?.find(m=>m.id===mineId);if(!entry)return;
    try{const trace=await traceImage(entry.src),w=420,h=w*entry.height/entry.width;
      addItem(await withIllustration({...baseItem('image'),label:entry.name,src:entry.src,tracePaths:trace.paths,fillPaths:trace.fillPaths,transparentArtwork:trace.transparent,x:800-w/2,y:450-h/2,w,h,duration:2.2}));
      toast(`${entry.name} added to the canvas.`);}
    catch(e){console.error(e);toast('Could not add that drawing.');}
  }
  async function deleteMine(mineId){
    const entry=library.mine?.find(m=>m.id===mineId);if(!entry)return;
    if(!confirm(`Remove “${entry.name}” from your library? Drawings already placed in projects stay where they are.`))return;
    await mineTask('readwrite',s=>s.delete(mineId));await loadMine();showLibraryResults();toast(`${entry.name} removed from your library.`);
  }
  async function addArtDrawing(file,name){
    try{
      const response=await fetch(`./assets/illustrations/${file}`);if(!response.ok)throw new Error('Illustration did not load');
      const art=/.svg$/i.test(file)?await (async svg=>file.startsWith('fluent/')?outlinedIllustration(svg):rasterizeSvg(svg))(await response.text()):await rasterImage(await response.blob()),trace=await traceImage(art.src),backdrop=file.startsWith('backdrops/');
      const w=backdrop?1200:file.startsWith('doodles/')||file.startsWith('storybook/')?420:art.width/art.height>1.6?440:300,h=w*art.height/art.width;
      addItem(await withIllustration({...baseItem('image'),label:name||'Illustration',src:art.src,tracePaths:trace.paths,fillPaths:trace.fillPaths,transparentArtwork:trace.transparent,artRef:['art',file],w,h,duration:backdrop?5:2.2},backdrop));
      // A backdrop sits behind everything else in the scene and is drawn first.
      if(backdrop){const items=scene().items,added=items.pop();added.z=Math.min(0,...items.map(x=>num(x.z)))-1;items.unshift(added);changed();toast(`${name} backdrop added behind the scene and drawn first.`);}else toast(`${name||'Illustration'} added to the canvas.`);
    }catch(e){console.error(e);toast('Could not add that illustration.');}
  }
  function addTablerIcon(index){
    const [name,,,paths]=library.icons.icons[index];
    addItem({...baseItem('icon'),label:name.replace(/-/g,' ').replace(/^./,c=>c.toUpperCase()),iconPaths:paths,vb:[0,0,24,24],x:615,y:305,w:240,h:240,color:'#285d63',duration:1.8});
  }
  // Character builder: Open Peeps by Pablo Stanley (CC0), vendored in vendor/open-peeps. A character is a recipe of
  // parts and colors, kept on the item so its expression can be changed later.
  let peepsModule=null;
  const loadPeeps=()=>peepsModule??=Promise.all([import('./vendor/open-peeps/index.js'),import('./vendor/open-peeps/schema.js')]).then(([m,s])=>({create:m.create,schema:s.schema.properties}));
  const partName=key=>key.replace(/([a-z])([A-Z0-9])/g,'$1 $2').replace(/(\d+)$/,' $1').replace(/\s+/g,' ').replace(/^./,c=>c.toUpperCase());
  async function characterSvg(p){
    const {create}=await loadPeeps(),one=v=>v?[v]:[];
    const prng={pick:(list,fallback)=>list&&list.length?list[0]:fallback,bool:chance=>chance>=50};
    const r=create({prng,options:{head:one(p.head),face:one(p.face),facialHair:one(p.facialHair),facialHairProbability:p.facialHair?100:0,accessories:one(p.accessories),accessoriesProbability:p.accessories?100:0,mask:[],maskProbability:0,skinColor:[p.skin],clothingColor:[p.clothing],headContrastColor:[p.hair]}});
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r.attributes.viewBox}" fill="none">${r.body}</svg>`;
  }
  const PEEP_COLORS={skin:['ffdbb4','edb98a','d08b5b','ae5d29','694d3d'],hair:['2c1b18','6a4e35','b58143','d6b370','e8e1e1','f59797'],clothing:['e78276','ffcf77','fdea6b','78e185','9ddadb','8fa7df','e279c7','2b3a4a','ffffff']};
  function characterBuilder(){
    const p=library.peep,select=(label,key,list,none)=>`<div class="field"><label>${label}</label><select data-peep="${key}">${none?`<option value="">${none}</option>`:''}${list.map(v=>`<option value="${v}" ${p[key]===v?'selected':''}>${partName(v)}</option>`).join('')}</select></div>`;
    const swatches=(label,key)=>`<div class="tone-row"><span>${label}</span>${PEEP_COLORS[key].map(c=>`<button class="tone ${p[key]===c?'active':''}" data-peep-color="${key}" data-value="${c}" style="background:#${c}" title="#${c}"></button>`).join('')}</div>`;
    const parts=library.peepParts;
    return `<p class="panel-help">Build a hand-drawn character, then reuse them with different expressions.</p><div id="characterPreview" class="character-preview"></div>
      ${parts?`${select('Expression','face',parts.face)}${select('Hair','head',parts.head)}<div class="field-row">${select('Facial hair','facialHair',parts.facialHair,'None')}${select('Glasses','accessories',parts.accessories,'None')}</div>${swatches('Skin','skin')}${swatches('Hair color','hair')}${swatches('Shirt','clothing')}
      <div class="panel-actions"><button class="panel-action" data-peep-shuffle>Shuffle</button><button class="button primary" data-peep-add>Add to canvas</button></div>`:'<p class="lib-count">Loading the character parts…</p>'}
      <div class="note-card">Characters are Open Peeps by Pablo Stanley, free to use in your videos without credit.</div>`;
  }
  // The lists of parts, once the pieces have loaded; until then this starts loading them and redraws the panel after.
  function peepParts(){
    if(library.peepParts)return library.peepParts;
    loadPeeps().then(({schema})=>{if(library.peepParts)return;library.peepParts={face:schema.face.items.enum,head:schema.head.items.enum,facialHair:schema.facialHair.items.enum,accessories:schema.accessories.items.enum.filter(x=>x!=='eyepatch')};renderInspector();}).catch(e=>{console.error(e);toast('The character parts could not load.');});
    return null;
  }
  async function showCharacterPreview(){
    if(!peepParts())return;const box=$('#characterPreview');
    try{if(box)box.innerHTML=await characterSvg(library.peep);}catch(e){console.error(e);if(box)box.textContent='The character could not be drawn.';}
  }
  function characterFaceField(it){
    const parts=peepParts();if(!parts)return '';
    return `<div class="field"><label>Expression</label><select data-character-face>${parts.face.map(v=>`<option value="${v}" ${it.character.face===v?'selected':''}>${partName(v)}</option>`).join('')}</select></div>`;
  }
  function shuffleCharacter(){
    const parts=library.peepParts,pick=list=>list[Math.floor(Math.random()*list.length)];if(!parts)return;
    library.peep={head:pick(parts.head),face:pick(['smile','smileBig','calm','cute','explaining','cheeky','smileLOL','driven','serious']),facialHair:Math.random()<.3?pick(parts.facialHair):'',accessories:Math.random()<.25?pick(parts.accessories):'',skin:pick(PEEP_COLORS.skin),hair:pick(PEEP_COLORS.hair),clothing:pick(PEEP_COLORS.clothing)};
  }
  async function characterArt(p){const art=await rasterizeSvg(await characterSvg(p)),trace=await traceImage(art.src);return {art,trace};}
  async function addCharacter(){
    try{const p={...library.peep},{art,trace}=await characterArt(p);
      addItem(await withIllustration({...baseItem('image'),label:`Character (${partName(p.face).toLowerCase()})`,src:art.src,tracePaths:trace.paths,fillPaths:trace.fillPaths,transparentArtwork:trace.transparent,character:p,w:360,h:360*art.height/art.width,duration:2.6}));toast('Character added to the canvas.');}
    catch(e){console.error(e);toast('Could not add that character.');}
  }
  // Swaps a placed character's expression, keeping its place, size and timing.
  async function setCharacterFace(it,face){
    if(!it?.character||it.character.face===face)return;
    try{const p={...it.character,face},{art,trace}=await characterArt(p),plan=await planIllustration(art.src);
      snapshot();Object.assign(it,{character:p,src:art.src,tracePaths:trace.paths,fillPaths:trace.fillPaths,transparentArtwork:trace.transparent,illustration:plan,label:`Character (${partName(face).toLowerCase()})`});changed();}
    catch(e){console.error(e);toast('Could not change the expression.');}
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
  // A letter's image and time map depend only on the letter, its font, color and scale and where it falls within a pixel,
  // so they are kept and reused: retyping text only traces letters it has not seen in that place before.
  const letterCache=new Map();
  function letterReveal(char,font,color,left,top,size,advance,fit,ratio,canvas,paths){
    const fx=(left-size*.6)*fit*ratio,fy=(top-size*.5)*ratio,ox=Math.floor(fx),oy=Math.floor(fy);
    const key=[char,font,color,size,fit.toFixed(4),ratio.toFixed(4),Math.round((fx-ox)*8),Math.round((fy-oy)*8),paths.map(p=>p.d.length).join()].join('|'),hit=letterCache.get(key);
    if(hit!==undefined)return hit&&{box:[(ox+hit.x0)/canvas.width,(oy+hit.y0)/canvas.height,hit.W/canvas.width,hit.H/canvas.height],src:hit.src,map:hit.map};
    const made=traceLetterReveal(char,font,color,left,top,size,advance,fit,ratio,canvas,paths,ox,oy);
    if(letterCache.size>4000)letterCache.clear();
    letterCache.set(key,made&&{x0:made.x0,y0:made.y0,W:made.W,H:made.H,src:made.src,map:made.map});
    return made&&{box:made.box,src:made.src,map:made.map};
  }
  function traceLetterReveal(char,font,color,left,top,size,advance,fit,ratio,canvas,paths,ox,oy){
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
    return {box:[bx/canvas.width,by/canvas.height,W/canvas.width,H/canvas.height],src:letter.toDataURL('image/png'),map:map.toDataURL('image/png'),x0,y0,W,H};
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
      // Tracing yields to the browser every few milliseconds so typing stays smooth, and stops if the text changes again.
      let slice=performance.now();
      for(const [line,row] of rows.entries()){const start=4/fit+(room-widths[line])*(ALIGN_SHIFT[it.align]||0),top=2+line*size*1.16;let before='';
        for(const char of row){
          if(performance.now()-slice>12){await new Promise(r=>setTimeout(r));if(textSignature(it)!==signature)return;slice=performance.now();}
          const left=start+ctx.measureText(before).width,advance=ctx.measureText(char).width;before+=char;
          if(/\s/u.test(char))continue;
          ctx.fillText(char,left,top);
          const glyph=traceGlyphStrokes(char,family,connected),k=size/GLYPH_TRACE_SIZE;
          const paths=glyph.strokes.map(s=>({d:strokePathData(s.pts.map(([x,y])=>[(left+x*k)*fit,top+y*k])),letter:letters.length}));
          const reveal=letterReveal(char,font,color,left,top,size,advance,fit,ratio,canvas,paths);
          if(reveal){letters.push(reveal);letterPaths.push(...paths);}
        }
      }
      const src=canvas.toDataURL('image/png');
      if(textSignature(it)!==signature||!state.project.scenes.some(s=>s.items.includes(it)))return;
      it.handwritingSrc=src;it.handwritingSignature=signature;it.letterPaths=letterPaths;it.letters=letters;it.tracePaths=[];it.fillPaths=[];it.transparentArtwork=true;changed(false);
    }catch(e){console.error(e);toast('Could not load that writing style.');}
  }
  function scheduleHandwriting(it){
    clearTimeout(textTimers.get(it.id));
    if(!HANDWRITING_FONTS[it.font])return;
    textTimers.set(it.id,setTimeout(()=>{textTimers.delete(it.id);refreshHandwriting(it);},250));
  }
  function addShape(shape){addItem({...baseItem('shape'),shape,fill:'#cde9df',w:350,h:225});}
  function addText(){const it={...baseItem('text'),text:'Your message here',x:470,y:350,w:850,h:130,fontSize:72,color:'#213b4b',font:'patrick'};addItem(it);scheduleHandwriting(it);}
  function addCamera(){const last=scene().items.filter(x=>x.type==='camera').pop();addItem({id:id(),type:'camera',handSize:handSizeOf(last),handAngle:handAngleOf(last),cx:state.editorView.cx,cy:state.editorView.cy,zoom:clamp(baseBox()[2]/(state.editorView.w*.72),.2,5),duration:1,pause:.2});}
  function selectItem(itemId){state.selected=itemId;state.multi=[];state.selectedClip=null;state.tool='select';renderAll();}
  function pause(){state.playing=false;cancelAnimationFrame(state.frame);stopClips();audio.clockActive=false;renderTimelineClock();}
  // While previewing, the timeline shows the scene being played.
  function followPlayingScene(){const loc=positionAt(state.time);if(loc.index!==state.sceneIndex){state.sceneIndex=loc.index;state.selected=null;renderTimelineStrips();if(!item())renderInspector();}}
  function previewCamera(){
    const chosen=item();if(chosen?.type!=='camera')return;
    pause();const local=sceneSchedule(scene()).find(e=>e.it===chosen)?.end||0;
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
  // Automatic backups to a folder on this computer (File System Access API: Chrome and Edge). Each project is written to
  // "<name> (<id>).json" a few seconds after it changes, with one dated copy a day in history/. The files use the
  // regular backup format, so Import backup opens them. The folder handle is kept in the settings store.
  const backup={folder:null,permission:'none',timer:0,last:0,error:''};
  const backupSupported=()=>'showDirectoryPicker' in window;
  function settingsTask(mode,fn){return new Promise((resolve,reject)=>{const tx=state.db.transaction('settings',mode),req=fn(tx.objectStore('settings'));req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
  async function loadBackupFolder(){
    try{const saved=await settingsTask('readonly',s=>s.get('backupFolder'));backup.folder=saved?.handle||null;backup.last=saved?.last||0;
      backup.permission=backup.folder?await backup.folder.queryPermission({mode:'readwrite'}):'none';}catch(e){console.error(e);backup.folder=null;backup.permission='none';}
    showBackupStatus();
  }
  async function rememberBackupFolder(){await settingsTask('readwrite',s=>s.put({key:'backupFolder',handle:backup.folder,last:backup.last}));}
  async function chooseBackupFolder(){
    if(!backupSupported()){toast('This browser cannot back up to a folder. Use Download backup instead.');return;}
    try{backup.folder=await window.showDirectoryPicker({id:'whiteboard-backups',mode:'readwrite'});backup.permission='granted';await rememberBackupFolder();await backupAll();toast(`Backing up to “${backup.folder.name}”.`);}
    catch(e){if(e.name!=='AbortError'){console.error(e);toast('That folder could not be used.');}}
    if(!$('#modal').classList.contains('hidden'))showProjects();
  }
  async function reconnectBackupFolder(){
    if(!backup.folder)return chooseBackupFolder();
    try{backup.permission=await backup.folder.requestPermission({mode:'readwrite'});if(backup.permission==='granted'){await backupAll();toast('Backups are on again.');}}catch(e){console.error(e);}
    showBackupStatus();
  }
  async function stopBackups(){backup.folder=null;backup.permission='none';await settingsTask('readwrite',s=>s.delete('backupFolder'));showBackupStatus();showProjects();}
  const backupName=p=>`${safeFilename(p.name||'Untitled video')} (${String(p.id).slice(0,8)}).json`;
  async function writeBackup(p){
    const text=JSON.stringify({format:'whiteboard-studio-backup',version:1,exportedAt:new Date().toISOString(),projects:[storedProject(p)]});
    const put=async(dir,name)=>{const file=await dir.getFileHandle(name,{create:true}),w=await file.createWritable();await w.write(text);await w.close();};
    await put(backup.folder,backupName(p));
    await put(await backup.folder.getDirectoryHandle('history',{create:true}),backupName(p).replace(/\.json$/,` ${new Date().toISOString().slice(0,10)}.json`));
  }
  async function backupAll(){if(backup.permission!=='granted')return;for(const p of await listProjects())await writeBackup(p);backup.last=Date.now();backup.error='';await rememberBackupFolder();showBackupStatus();}
  // Called after every save; writes the open project once things have been quiet for a few seconds.
  function scheduleBackup(){
    if(!backup.folder||backup.permission!=='granted')return;clearTimeout(backup.timer);
    backup.timer=setTimeout(async()=>{try{await writeBackup(state.project);backup.last=Date.now();backup.error='';await rememberBackupFolder();}catch(e){console.error(e);backup.error='Backup failed';if(e.name==='NotAllowedError')backup.permission='prompt';}showBackupStatus();},4000);
  }
  function showBackupStatus(){
    const el=$('#backupStatus');if(!el)return;
    if(backup.folder&&backup.permission==='granted'){el.className='backup-status ok';el.textContent=backup.error||(backup.last?`Backed up ${new Date(backup.last).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`:'Backups on');el.title=`Backing up to the “${backup.folder.name}” folder`;}
    else if(backup.folder){el.className='backup-status warn';el.textContent='Reconnect backups';el.title='Click to let the app keep writing backups to your folder';}
    else{el.className='backup-status warn';el.textContent='Not backed up';el.title='Projects live only in this browser. Set up a backup folder in My projects.';}
  }
  function backupPanel(){
    if(!backupSupported())return `<div class="note-card">This browser cannot back up to a folder automatically. Use <strong>Download backup</strong> regularly, or open the app in Chrome or Edge for automatic backups.</div>`;
    if(!backup.folder)return `<div class="backup-card"><strong>Automatic backup</strong><span>Keep a copy of every project in a folder on this computer, updated as you work.</span><button class="button primary small" data-backup="choose">Choose backup folder</button></div>`;
    return `<div class="backup-card ok"><strong>Automatic backup ${backup.permission==='granted'?'on':'paused'}</strong><span>Folder “${esc(backup.folder.name)}”${backup.last?` · last backup ${new Date(backup.last).toLocaleString()}`:''}. A dated copy is kept each day in its history folder.</span><span class="backup-actions">${backup.permission==='granted'?'<button class="panel-action" data-backup="now">Back up now</button>':'<button class="button primary small" data-backup="reconnect">Reconnect folder</button>'}<button class="panel-action" data-backup="choose">Change folder</button><button class="panel-action danger" data-backup="stop">Stop</button></span></div>`;
  }
  // Version 2 adds a settings store (the backup folder) beside the projects.
  function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open('whiteboard-studio',3);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('projects'))db.createObjectStore('projects',{keyPath:'id'});if(!db.objectStoreNames.contains('settings'))db.createObjectStore('settings',{keyPath:'key'});if(!db.objectStoreNames.contains('library'))db.createObjectStore('library',{keyPath:'id'});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
  function dbTask(mode,fn){return new Promise((resolve,reject)=>{const tx=state.db.transaction('projects',mode),store=tx.objectStore('projects');let req=fn(store);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
  async function saveProject(){try{await dbTask('readwrite',s=>s.put(storedProject(state.project)));localStorage.setItem('whiteboard-current',state.project.id);$('#saveStatus').textContent='Saved locally';scheduleBackup();}catch(e){$('#saveStatus').textContent='Could not save';toast('This project could not be saved. Check your browser storage.');}}
  async function migrateProject(p){
    p.audioFiles=p.audioFiles||{};p.audioClips=p.audioClips||[];
    if(p.audio?.src){const file=id();p.audioFiles[file]={name:p.audio.name||'Audio',src:p.audio.src,duration:null};p.audioClips.push({id:id(),file,lane:0,start:0,offset:0,length:null,volume:1,fadeIn:0,fadeOut:0});}
    delete p.audio;
    for(const s of p.scenes)for(const it of s.items){
      if(it.animation==='reveal')it.animation='draw';
      if(it.type==='text'&&!it.font)it.font='futural';
      // The bundled "cursive" pen font is the same as "script".
      if(it.type==='text'&&it.font==='cursive')it.font='scripts';
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
  async function showProjects(){await saveProject();const projects=await listProjects();modal(`<div class="modal-top"><h2>My projects</h2><button class="close-button" data-modal="close">×</button></div><p class="panel-help">Projects are saved in this browser. Download a backup to move them to another browser or computer.</p>${backupPanel()}${projects.map(p=>`<div class="project-card"><span class="scene-number">✎</span><span><strong>${esc(p.name)}</strong><small>${p.scenes.length} scene${p.scenes.length===1?'':'s'} · ${new Date(p.updated).toLocaleDateString()}${projectHint(p)?` · “${esc(projectHint(p))}”`:''}</small></span><button class="panel-action" data-open="${esc(p.id)}">Open</button><button class="panel-action danger" data-delete-project="${esc(p.id)}">Delete</button></div>`).join('')}<div class="modal-foot"><button class="button ghost" data-modal="backup">Download backup</button><button class="button ghost" data-modal="import">Import backup</button><button class="button primary" data-modal="new">+ New project</button></div>`);}
  async function downloadProjectBackup(){
    await saveProject();const projects=await listProjects();
    const backup={format:'whiteboard-studio-backup',version:1,exportedAt:new Date().toISOString(),projects,library:await mineTask('readonly',s=>s.getAll())};
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
      let drawings=0;
      for(const m of Array.isArray(backup.library)?backup.library:[]){if(!m||typeof m.id!=='string'||!/^data:image\/(png|webp|jpeg);base64,/.test(m.src||''))continue;if(await mineTask('readonly',s=>s.get(m.id)))continue;await mineTask('readwrite',s=>s.put({id:m.id,name:String(m.name||'My drawing').slice(0,80),src:m.src,width:num(m.width,400),height:num(m.height,400),added:num(m.added,Date.now())}));drawings++;}
      if(drawings)await loadMine();
      await loadProject(imported[0]);toast(`${imported.length} project${imported.length===1?'':'s'} imported${drawings?` with ${drawings} library drawing${drawings===1?'':'s'}`:''}.`);
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
  function paintSvg(ctx,t){return new Promise((resolve,reject)=>{const frame=svgForTime(t,ctx.canvas.width,ctx.canvas.height),url=URL.createObjectURL(new Blob([frame.svg],{type:'image/svg+xml'})),img=new Image();img.onload=()=>{ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);ctx.drawImage(img,0,0,ctx.canvas.width,ctx.canvas.height);if(frame.hand&&state.handImage){const [x,y,w,h]=frame.box,sx=ctx.canvas.width/w,sy=ctx.canvas.height/h;const k=frame.hand.k||1;ctx.save();ctx.translate((frame.hand.x-x)*sx,(frame.hand.y-y)*sy);ctx.rotate((frame.hand.deg||0)*Math.PI/180);ctx.drawImage(state.handImage,-HAND.x*k*sx,-HAND.y*k*sy,HAND.w*k*sx,HAND.h*k*sy);ctx.restore();}URL.revokeObjectURL(url);resolve();};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Frame could not be drawn'));};img.src=url;});}
  // Export renders the video frame by frame (never in real time, so nothing is dropped) and encodes it with WebCodecs
  // into an MP4 written by mp4-muxer (vendor/mp4-muxer, MIT). The file has its index at the start and a keyframe every
  // two seconds, so it plays and scrubs in any player. The audio clips are mixed offline into the same file.
  const EXPORT_SIZES=[['720','720p'],['1080','1080p (Full HD)'],['1440','1440p'],['2160','4K']],EXPORT_QUALITY=[['standard','Standard',.07],['high','High',.12],['max','Maximum',.2]];
  const exportPrefs={size:'1080',fps:30,quality:'high',range:'all',audio:true,captions:'none'};
  function exportDimensions(size){const n=+size,r=state.project.ratio;return r==='1:1'?[n,n]:r==='9:16'?[n,Math.round(n*16/9/2)*2]:[Math.round(n*16/9/2)*2,n];}
  function exportRange(range){return range==='scene'?[sceneStart(state.sceneIndex),sceneStart(state.sceneIndex)+sceneLen(scene())]:[0,totalLen()];}
  function exportBitrate(o){const [w,h]=exportDimensions(o.size);return Math.round(w*h*o.fps*(EXPORT_QUALITY.find(q=>q[0]===o.quality)?.[2]||.12));}
  // The smallest H.264 High profile level that fits the frame size and rate.
  function avcCodec([w,h],fps){const mbs=Math.ceil(w/16)*Math.ceil(h/16),levels=[[31,108000,3600],[40,245760,8192],[42,522240,8704],[50,589824,22080],[51,983040,36864],[52,2073600,36864]],level=levels.find(([,rate,size])=>mbs*fps<=rate&&mbs<=size)||levels[levels.length-1];return `avc1.6400${level[0].toString(16).padStart(2,'0')}`;}
  function exportSummary(){
    const o=exportPrefs,[w,h]=exportDimensions(o.size),[t0,t1]=exportRange(o.range),seconds=Math.max(0,t1-t0),mb=(exportBitrate(o)+(o.audio&&hasAudio()?192000:0))*seconds/8/1e6;
    return `${w} × ${h} · ${o.fps} fps · ${fmt(seconds)} long · about ${mb<1?mb.toFixed(1):Math.round(mb)} MB`;
  }
  function showExportOptions(){
    if(state.exporting)return;if(totalLen()<.2){toast('Add something to the timeline before exporting.');return;}
    const o=exportPrefs,pick=(key,list)=>`<select data-export="${key}">${list.map(([v,n])=>`<option value="${v}" ${String(o[key])===String(v)?'selected':''}>${n}</option>`).join('')}</select>`,modern=!!window.VideoEncoder;
    modal(`<div class="modal-top"><h2>Export video</h2><button class="close-button" data-modal="close">×</button></div>
      <p class="panel-help">${modern?'Each frame is drawn in full and encoded as an MP4 (H.264) that plays and scrubs in any player.':'This browser cannot encode frame by frame, so the video will be recorded in real time instead. For the best file, export in Chrome or Edge.'}</p>
      <div class="field"><label>File name</label><input id="exportName" value="${esc(safeFilename(state.project.name))}" maxlength="80"></div>
      <div class="field-row"><div class="field"><label>Resolution</label>${pick('size',EXPORT_SIZES)}</div><div class="field"><label>Frame rate</label>${pick('fps',[[24,'24 fps (film)'],[30,'30 fps'],[60,'60 fps (smoothest)']])}</div></div>
      <div class="field-row"><div class="field"><label>Quality</label>${pick('quality',EXPORT_QUALITY)}</div><div class="field"><label>Range</label>${pick('range',[['all','Whole video'],['scene',`This scene (${esc(scene().name)})`]])}</div></div>
      <label class="check-row"><input type="checkbox" data-export="audio" ${o.audio?'checked':''} ${hasAudio()?'':'disabled'}> Include audio${hasAudio()?'':' (no audio clips yet)'}</label>
      <div class="field"><label>Captions${captionCues().length?'':' (made from narration scripts; none yet)'}</label>${captionCues().length?pick('captions',[['none','None'],['srt','Subtitle file (.srt)'],['burn','Burned into the video'],['both','Both']]):'<select disabled><option>None</option></select>'}</div>
      <p id="exportSummary" class="lib-count">${exportSummary()}</p>
      <div class="modal-foot"><button class="button ghost" data-modal="close">Cancel</button><button class="button primary" data-export-start>Export MP4</button></div>`);
  }
  // Mixes the audio clips between video times t0 and t1 into a stereo buffer.
  async function mixAudio(t0,t1,rate=48000){
    await Promise.all(Object.values(state.project.audioFiles||{}).map(f=>loadAudioFile(f).catch(()=>{})));
    const ctx=new OfflineAudioContext(2,Math.max(1,Math.ceil((t1-t0)*rate)),rate);scheduleClips(ctx,t0,ctx.destination,0);return ctx.startRendering();
  }
  async function exportVideo(){
    const o={...exportPrefs},name=safeFilename($('#exportName')?.value||state.project.name);
    if(!window.VideoEncoder){recordVideoRealtime(name);return;}
    const cues=captionCues(),burn=(o.captions==='burn'||o.captions==='both')&&cues.length,srt=(o.captions==='srt'||o.captions==='both')&&cues.length;
    const [w,h]=exportDimensions(o.size),[t0,t1]=exportRange(o.range),fps=+o.fps,frames=Math.max(1,Math.ceil((t1-t0)*fps)),bitrate=exportBitrate(o),withAudio=o.audio&&hasAudio();
    const codecs=[avcCodec([w,h],fps),'avc1.4d0034','avc1.640034'],configs=codecs.map(codec=>({codec,width:w,height:h,bitrate,framerate:fps,avc:{format:'avc'},latencyMode:'quality'}));
    let config=null;for(const c of configs){try{if((await VideoEncoder.isConfigSupported(c)).supported){config=c;break;}}catch{}}
    if(!config){toast(`This browser cannot encode ${w} × ${h} video. Try a smaller resolution.`);return;}
    pause();state.exporting=true;state.exportCancelled=false;await ensureHandwriting();
    modal(`<div class="modal-top"><h2>Exporting your video</h2></div><p class="panel-help">${w} × ${h} at ${fps} fps. Every frame is drawn in full, so this can take a little while; you can keep using other tabs.</p><div class="export-progress"><div id="progressBar"></div></div><p id="exportStatus" class="panel-help">Preparing…</p><div class="modal-foot"><button class="button ghost" data-export-cancel>Cancel export</button></div>`);
    const status=text=>{const el=$('#exportStatus');if(el)el.textContent=text;},bar=f=>{const el=$('#progressBar');if(el)el.style.width=`${Math.round(f*100)}%`;};
    let videoEncoder=null,audioEncoder=null;
    try{
      const {Muxer,ArrayBufferTarget}=await import('./vendor/mp4-muxer/mp4-muxer.js');
      let audioCodec=null;
      if(withAudio&&window.AudioEncoder){for(const [codec,kind] of [['mp4a.40.2','aac'],['opus','opus']]){try{if((await AudioEncoder.isConfigSupported({codec,sampleRate:48000,numberOfChannels:2,bitrate:192000})).supported){audioCodec={codec,kind};break;}}catch{}}}
      const target=new ArrayBufferTarget(),muxer=new Muxer({target,fastStart:'in-memory',video:{codec:'avc',width:w,height:h,frameRate:fps},...(audioCodec?{audio:{codec:audioCodec.kind,numberOfChannels:2,sampleRate:48000}}:{})});
      let failure=null;
      videoEncoder=new VideoEncoder({output:(chunk,meta)=>muxer.addVideoChunk(chunk,meta),error:e=>{failure=e;}});videoEncoder.configure(config);
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{alpha:false}),started=performance.now();
      for(let i=0;i<frames;i++){
        if(state.exportCancelled)throw new Error('cancelled');if(failure)throw failure;
        ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);await paintSvg(ctx,Math.min(t1,t0+i/fps));if(burn)drawCaption(ctx,cues,Math.min(t1,t0+i/fps));
        const frame=new VideoFrame(canvas,{timestamp:Math.round(i*1e6/fps),duration:Math.round(1e6/fps)});videoEncoder.encode(frame,{keyFrame:i%(fps*2)===0});frame.close();
        while(videoEncoder.encodeQueueSize>6)await new Promise(r=>setTimeout(r,4));
        if(i%3===0||i===frames-1){const done=(i+1)/frames,left=(performance.now()-started)/done*(1-done)/1000;bar(done*(audioCodec?.92:1));status(`Frame ${i+1} of ${frames} · about ${left<60?Math.ceil(left)+' s':Math.ceil(left/60)+' min'} left`);}
      }
      await videoEncoder.flush();
      if(audioCodec){
        status('Mixing the audio…');const mix=await mixAudio(t0,t1),rate=mix.sampleRate,left=mix.getChannelData(0),right=mix.getChannelData(1);
        audioEncoder=new AudioEncoder({output:(chunk,meta)=>muxer.addAudioChunk(chunk,meta),error:e=>{failure=e;}});audioEncoder.configure({codec:audioCodec.codec,sampleRate:rate,numberOfChannels:2,bitrate:192000});
        for(let at=0;at<mix.length;at+=4800){const n=Math.min(4800,mix.length-at),data=new Float32Array(n*2);data.set(left.subarray(at,at+n),0);data.set(right.subarray(at,at+n),n);
          const chunk=new AudioData({format:'f32-planar',sampleRate:rate,numberOfFrames:n,numberOfChannels:2,timestamp:Math.round(at/rate*1e6),data});audioEncoder.encode(chunk);chunk.close();}
        await audioEncoder.flush();if(failure)throw failure;bar(1);
      }else if(withAudio)toast('This browser cannot encode audio, so the video was exported without sound.');
      status('Finishing the file…');muxer.finalize();
      download(new Blob([target.buffer],{type:'video/mp4'}),`${name}.mp4`);
      if(srt)download(new Blob([srtText(cues.filter(c=>c.end>t0&&c.start<t1).map(c=>({...c,start:Math.max(c.start,t0),end:Math.min(c.end,t1)})),t0)],{type:'application/x-subrip'}),`${name}.srt`);
      closeModal();toast(`Exported ${name}.mp4${srt?' and its captions':''}`);
    }catch(e){closeModal();if(e?.message==='cancelled')toast('Export cancelled.');else{console.error(e);toast(`Export failed: ${e?.message||e}`);}}
    finally{try{videoEncoder?.state!=='closed'&&videoEncoder?.close();}catch{}try{audioEncoder?.state!=='closed'&&audioEncoder?.close();}catch{}state.exporting=false;}
  }
  // Fallback for browsers without WebCodecs: records the canvas in real time.
  async function recordVideoRealtime(name){
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
      recorder.stop();stopClips();const blob=await ended;download(blob,`${name}.${mime.includes('mp4')?'mp4':'webm'}`);closeModal();toast('Video exported.');
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
    const image=await loadImage(src);
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
  // Adds the illustration plan to artwork with a transparent background (or any artwork when forced, as for backdrops);
  // other images keep the generic tracing.
  async function withIllustration(fields,force=false){
    if(!fields.transparentArtwork&&!force)return fields;
    try{return {...fields,illustration:await planIllustration(fields.src),duration:Math.max(num(fields.duration,2.2),3.2)};}catch(e){console.error('Could not plan the illustration',e);return fields;}
  }
  async function traceImage(src){
    const image=await loadImage(src);
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
    if(key==='handSize'||key==='handAngle'){const size=key==='handSize',v=size?clamp(num(value,1),...HAND_SIZES):clamp(num(value,0),...HAND_ANGLES),cam=item()?.type==='camera'?item():state.project;cam[key]=v;const label=$(size?'#handSizeLabel':'#handAngleLabel');if(label)label.textContent=size?`${Math.round(v*100)}%`:`${Math.round(v)}°`;changed(false);return;}
    const it=item(),target=['sceneName','background'].includes(key)?scene():it;if(!target)return;
    if(key==='sceneName')target.name=value.slice(0,80)||'Scene';
    else if(key==='rotation')target.rotation=((num(value,0)+180)%360+360)%360-180;
    else if(key==='delay')target.delay=clamp(num(value,0),0,60);
    else if(key==='effectSpeed')target.effectSpeed=clamp(num(value,EFFECT_SPEED[target.effect]||1.5),.2,20);
    else if(key==='effectStrength')target.effectStrength=clamp(num(value,.5),0,1);
    else if(key==='effect'){snapshot();target.effect=value;changed(false);renderInspector();return;}
    else if(['x','y','w','h','fontSize','duration','pause','zoom','cx','cy'].includes(key)){
      const n=num(value,target[key]);target[key]=key==='duration'?clamp(n,.1,60):key==='pause'?clamp(n,0,60):key==='zoom'?clamp(n,.2,5):key==='w'||key==='h'?clamp(n,10,30000):key==='fontSize'?clamp(n,16,180):n;
    }else target[key]=value;
    if(it?.type==='text'&&['text','font','fontSize','color','w','h'].includes(key))scheduleHandwriting(it);
    changed(false);
  }
  function deleteScene(index){
    const scenes=state.project.scenes,s=scenes[index];if(!s||scenes.length===1)return;
    snapshot();scenes.splice(index,1);
    const clips=audioClips();for(const old of clips.filter(c=>c.scene===s.id)){clips.splice(clips.indexOf(old),1);if(!clips.some(c=>c.file===old.file))delete state.project.audioFiles[old.file];}
    if(index<state.sceneIndex||state.sceneIndex>=scenes.length)state.sceneIndex=Math.max(0,state.sceneIndex-1);
    state.selected=null;state.time=sceneStart(state.sceneIndex);changed();toast(`Deleted “${s.name}”. Press Ctrl+Z to undo.`);
  }
  // Opens the current scene's settings and puts the cursor in its script box.
  function openScript(){
    stopPreview();state.tool='select';state.selected=null;state.multi=[];state.selectedClip=null;renderAll();
    const box=$('#inspector [data-scene-script]');if(box){box.scrollIntoView({block:'center',behavior:'smooth'});box.focus();}
  }
  function action(name){
    const it=item(),items=scene().items;
    if(name==='scene-delete'){deleteScene(state.sceneIndex);return;}
    if(name==='board-all'){snapshot();const s=scene();for(const other of state.project.scenes){other.board=s.board;if(!s.board)other.background=s.background;}changed();toast(`Every scene now uses the ${BOARDS.find(([v])=>v===(s.board||'plain'))[1].toLowerCase()} board.`);return;}
    if(name==='preview-camera'){previewCamera();return;}
    if(name==='narrate'){stopPreviewVoice();narrateScene(scene());return;}
    if(name==='preview-script'){const text=String(scene().script||'').trim();if(text)previewVoice(text,'script');else toast('Write a script for this scene first.');return;}
    if(name==='preview-voice'){const label=(VOICES.find(v=>v[0]===voiceSettings().voice)?.[1]||'').split(' · ')[0];previewVoice(`Hello, I'm ${label}. This is how I sound telling your story.`,'voice');return;}
    if(name==='narrate-all'){narrateAll();return;}
    if(name==='retime'){retimeScene(scene());return;}
    const several=selectedItems().filter(x=>x.type!=='camera');if(several.length>1&&(name==='delete'||name==='duplicate')){name==='delete'?deleteItems(several):duplicateItems(several);return;}
    if(!it)return;
    if(name==='rotate-reset'){snapshot();it.rotation=0;changed();return;}
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
    const r=num(drag.original.rotation,0),[ldx,ldy]=r?rotateVec([dx,dy],-r):[dx,dy];
    let left=drag.box[0],top=drag.box[1],right=left+drag.box[2],bottom=top+drag.box[3];
    if(handle.includes('w'))left=Math.min(right-20,left+ldx);
    if(handle.includes('e'))right=Math.max(left+20,right+ldx);
    if(handle.includes('n'))top=Math.min(bottom-20,top+ldy);
    if(handle.includes('s'))bottom=Math.max(top+20,bottom+ldy);
    state.guides=[];
    if(!r&&stageSnap&&!drag.free&&drag.targets){
      const tolerance=SNAP_PX*stageUnitsPerPixel(),edge=(v,lines)=>nearestSnap(v,0,lines,tolerance,[0]);
      let snap;
      if(handle.includes('w')&&(snap=edge(left,drag.targets.xs))){left=Math.min(right-20,left+snap.d);state.guides.push(guideFor('x',snap,top,bottom));}
      if(handle.includes('e')&&(snap=edge(right,drag.targets.xs))){right=Math.max(left+20,right+snap.d);state.guides.push(guideFor('x',snap,top,bottom));}
      if(handle.includes('n')&&(snap=edge(top,drag.targets.ys))){top=Math.min(bottom-20,top+snap.d);state.guides.push(guideFor('y',snap,left,right));}
      if(handle.includes('s')&&(snap=edge(bottom,drag.targets.ys))){bottom=Math.max(top+20,bottom+snap.d);state.guides.push(guideFor('y',snap,left,right));}
    }
    if(r){const oc=[drag.box[0]+drag.box[2]/2,drag.box[1]+drag.box[3]/2],[sx,sy]=rotateVec([(left+right)/2-oc[0],(top+bottom)/2-oc[1]],r),w=right-left,h=bottom-top;
      it.x=Math.round((oc[0]+sx-w/2)*10)/10;it.y=Math.round((oc[1]+sy-h/2)*10)/10;it.w=Math.round(w);it.h=Math.round(h);return;}
    it.x=Math.round(left);it.y=Math.round(top);it.w=Math.round(right-left);it.h=Math.round(bottom-top);
  }
  function bind(){
    document.querySelectorAll('.tool').forEach(b=>b.addEventListener('click',()=>{stopPreview();state.tool=b.dataset.tool;state.selected=null;if(state.tool==='text')addText();else if(state.tool==='upload')$('#uploadInput').click();else if(state.tool==='camera')addCamera();else{renderAll();}}));
    $('#inspector').addEventListener('click',e=>{const icon=e.target.closest('[data-icon]'),sheet=e.target.closest('[data-sheet-item]'),shape=e.target.closest('[data-shape]'),ratio=e.target.closest('[data-ratio]'),align=e.target.closest('[data-align]'),act=e.target.closest('[data-action]');if(align){const it=item();if(it?.type==='text'&&(it.align||'left')!==align.dataset.align){snapshot();it.align=align.dataset.align;scheduleHandwriting(it);changed();}}const startMode=e.target.closest('[data-start-mode]');if(startMode){const it=item();if(it&&!!it.withPrevious!==(startMode.dataset.startMode==='with')){snapshot();it.withPrevious=startMode.dataset.startMode==='with';changed();}return;}const font=e.target.closest('[data-font]');if(font){const it=item();if(it?.type==='text'&&it.font!==font.dataset.font){snapshot();applyField('font',font.dataset.font);renderInspector();}return;}const tab=e.target.closest('[data-lib-tab]'),art=e.target.closest('[data-art]'),tabler=e.target.closest('[data-tabler]'),tone=e.target.closest('[data-lib-tone]'),color=e.target.closest('[data-peep-color]');
      if(tab&&library.tab!==tab.dataset.libTab){library.tab=tab.dataset.libTab;library.category='all';library.limit=LIBRARY_PAGE;renderInspector();}
      if(e.target.closest('[data-lib-more]')){library.limit+=LIBRARY_PAGE;showLibraryResults();}
      if(tone){library.tone=tone.dataset.libTone;document.querySelectorAll('[data-lib-tone]').forEach(b=>b.classList.toggle('active',b===tone));showLibraryResults();}
      if(color){library.peep[color.dataset.peepColor]=color.dataset.value;document.querySelectorAll(`[data-peep-color="${color.dataset.peepColor}"]`).forEach(b=>b.classList.toggle('active',b===color));showCharacterPreview();}
      if(e.target.closest('[data-peep-shuffle]')){shuffleCharacter();renderInspector();}
      if(e.target.closest('[data-peep-add]'))addCharacter();
      if(art)addArtDrawing(art.dataset.art,art.dataset.artName);if(tabler)addTablerIcon(+tabler.dataset.tabler);
      if(icon)addIcon(icon.dataset.icon);if(sheet)addSheetDrawing(+sheet.dataset.sheet,+sheet.dataset.sheetItem);if(shape)addShape(shape.dataset.shape);if(ratio){snapshot();state.project.ratio=ratio.dataset.ratio;changed();}if(act)action(act.dataset.action);});
    $('#inspector').addEventListener('focusin',e=>{if(e.target.matches('[data-set]'))snapshot();});
    $('#inspector').addEventListener('input',e=>{if(e.target.id==='librarySearch'){library.query=e.target.value;library.limit=LIBRARY_PAGE;showLibraryResults();}else if(e.target.matches('[data-set]'))applyField(e.target.dataset.set,e.target.value);});
    $('#inspector').addEventListener('change',e=>{if(e.target.matches('[data-peep]')){library.peep[e.target.dataset.peep]=e.target.value;showCharacterPreview();return;}if(e.target.matches('[data-character-face]')){setCharacterFace(item(),e.target.value);return;}if(e.target.id==='libraryCategory'){library.category=e.target.value;library.limit=LIBRARY_PAGE;showLibraryResults();return;}if(e.target.matches('[data-set]')){applyField(e.target.dataset.set,e.target.value);renderInspector();}});
    $('#stage').addEventListener('pointerdown',e=>{
      if(state.preview||e.button>1)return;
      if(state.tool==='pan'||e.button===1){state.drag={mode:'pan',clientX:e.clientX,clientY:e.clientY,view:{...state.editorView}};$('#stage').setPointerCapture(e.pointerId);return;}
      const hit=e.target.closest('[data-item]'),handle=e.target.closest('[data-handle]');
      if(hit){const it=scene().items.find(x=>x.id===hit.dataset.item);if(!it)return;
        // Shift or Ctrl adds an item to the selection or takes it out.
        if((e.shiftKey||e.ctrlKey||e.metaKey)&&!handle&&it.type!=='camera'){const ids=selectionIds().filter(i=>scene().items.find(x=>x.id===i)?.type!=='camera');setSelection(ids.includes(it.id)?ids.filter(i=>i!==it.id):[...ids,it.id]);return;}
        const together=!handle&&selectionIds().length>1&&selectionIds().includes(it.id);
        if(!together&&state.selected!==it.id)selectItem(it.id);const p=pointOnStage(e),turn=handle?.dataset.handle==='rotate';snapshot();state.drag={mode:turn?'rotate':handle?'resize':'move',id:it.id,handle:handle?.dataset.handle,start:p,box:it.type==='camera'?cameraBox(it):[it.x,it.y,it.w,it.h],bounds:boundsOf(it),targets:it.type==='camera'?null:snapTargets(it.id),center:it.type==='camera'?null:centerOf(it),startAngle:it.type==='camera'?0:Math.atan2(p.y-it.y-it.h/2,p.x-it.x-it.w/2),...(together?{group:selectedItems().map(g=>({it:g,x:g.x,y:g.y})),bounds:unionBox(selectedItems()),targets:snapTargets(selectionIds())}:{}),original:it.type==='camera'?{cx:it.cx,cy:it.cy,zoom:it.zoom}:{x:it.x,y:it.y,w:it.w,h:it.h,rotation:rotationOf(it)}};$('#stage').setPointerCapture(e.pointerId);}
      // Dragging on empty canvas draws a selection box; a plain click clears the selection.
      else if(state.tool==='select'&&e.button===0){state.drag={mode:'marquee',start:pointOnStage(e),add:e.shiftKey,moved:false};$('#stage').setPointerCapture(e.pointerId);}
      else if(state.selected){state.selected=null;state.multi=[];renderAll();}
    });
    $('#stage').addEventListener('pointermove',e=>{
      if(!state.drag)return;
      const drag=state.drag;
      if(drag.mode==='pan'){const units=drag.view.w/Math.max(1,$('#stage').clientWidth);state.editorView.cx=drag.view.cx-(e.clientX-drag.clientX)*units;state.editorView.cy=drag.view.cy-(e.clientY-drag.clientY)*units;renderStage();return;}
      if(drag.mode==='marquee'){const p=pointOnStage(e),x=Math.min(p.x,drag.start.x),y=Math.min(p.y,drag.start.y),w=Math.abs(p.x-drag.start.x),h=Math.abs(p.y-drag.start.y);if(w/stageUnitsPerPixel()>4||h/stageUnitsPerPixel()>4){drag.moved=true;state.marquee=[x,y,w,h];renderStage();}return;}
      const it=scene().items.find(x=>x.id===drag.id);if(!it)return;const p=pointOnStage(e),dx=p.x-drag.start.x,dy=p.y-drag.start.y;
      drag.free=e.altKey;
      if(drag.mode==='rotate')rotateWithDrag(it,drag,p,e.shiftKey);
      else if(drag.mode==='resize')resizeSelected(it,drag,dx,dy);
      else if(it.type==='camera'){it.cx=Math.round(drag.original.cx+dx);it.cy=Math.round(drag.original.cy+dy);}
      else moveWithSnap(it,drag,dx,dy,e.altKey);
      renderStage();
    });
    const endDrag=()=>{if(!state.drag)return;
      if(state.drag.mode==='marquee'){const drag=state.drag,box=state.marquee;state.drag=null;state.marquee=null;
        if(!drag.moved){if(state.selected||state.multi?.length){state.selected=null;state.multi=[];renderAll();}else renderStage();return;}
        const hits=scene().items.filter(it=>{if(it.type==='camera')return false;const b=boundsOf(it);return b[0]<box[0]+box[2]&&b[0]+b[2]>box[0]&&b[1]<box[1]+box[3]&&b[1]+b[3]>box[1];}).map(it=>it.id);
        setSelection(drag.add?[...new Set([...selectionIds(),...hits])]:hits);return;}const wasPan=state.drag.mode==='pan',dragged=scene().items.find(x=>x.id===state.drag.id),resized=state.drag.mode==='resize';state.drag=null;state.guides=[];if(wasPan){saveEditorView();renderStage();}else{if(resized&&dragged?.type==='text')scheduleHandwriting(dragged);changed(false);renderInspector();}};$('#stage').addEventListener('pointerup',endDrag);$('#stage').addEventListener('pointercancel',endDrag);
    bindTimeline();bindAudio();bindEditing();bindArrange();
    $('#projectName').addEventListener('focus',()=>snapshot());$('#projectName').addEventListener('input',e=>{state.project.name=e.target.value.slice(0,80);changed(false);});
    $('#addSceneBtn').addEventListener('click',()=>{stopPreview();snapshot();state.project.scenes.push({id:id(),name:`Scene ${state.project.scenes.length+1}`,background:'#ffffff',items:[]});state.sceneIndex=state.project.scenes.length-1;state.selected=null;state.time=sceneStart(state.sceneIndex);changed();});
    $('#sceneScriptBtn').addEventListener('click',openScript);$('#duplicateSceneBtn').addEventListener('click',()=>{stopPreview();snapshot();const copy=clone(scene());copy.id=id();copy.name+=` copy`;copy.items.forEach(x=>x.id=id());state.project.scenes.splice(state.sceneIndex+1,0,copy);state.sceneIndex++;state.selected=null;state.time=sceneStart(state.sceneIndex);changed();});
    $('#playBtn').addEventListener('click',play);$('#previewBtn').addEventListener('click',()=>{if(state.playing)pause();else play();});$('#restartBtn').addEventListener('click',()=>seek(0));$('#stopBtn').addEventListener('click',stop);$('#topStopBtn').addEventListener('click',stop);$('#fitBtn').addEventListener('click',fitContent);$('#snapBtn').addEventListener('click',e=>{stageSnap=!stageSnap;e.currentTarget.classList.toggle('active',stageSnap);toast(stageSnap?'Snapping on. Hold Alt while dragging to move freely.':'Snapping off.');});$('#zoomInBtn').addEventListener('click',()=>zoomEditor(.8));$('#zoomOutBtn').addEventListener('click',()=>zoomEditor(1.25));
    $('#scrubber').addEventListener('input',e=>seek(+e.target.value/1000*totalLen()));$('#exportBtn').addEventListener('click',showExportOptions);$('#projectsBtn').addEventListener('click',showProjects);$('#backupStatus').addEventListener('click',()=>{if(backup.folder&&backup.permission!=='granted')reconnectBackupFolder();else showProjects();});
    $('#uploadInput').addEventListener('change',async e=>{await uploadImage(e.target.files[0]);e.target.value='';});$('#audioInput').addEventListener('change',async e=>{await uploadAudio(e.target.files[0],state.audioLane??0);e.target.value='';});$('#projectBackupInput').addEventListener('change',async e=>{await importProjectBackup(e.target.files[0]);e.target.value='';});
    $('#modal').addEventListener('change',e=>{const f=e.target.closest('[data-export]');if(!f)return;exportPrefs[f.dataset.export]=f.type==='checkbox'?f.checked:f.dataset.export==='fps'?+f.value:f.value;const sum=$('#exportSummary');if(sum)sum.textContent=exportSummary();});
    $('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){if(!state.exporting)closeModal();return;}const bk=e.target.closest('[data-backup]');if(bk){const a=bk.dataset.backup;if(a==='choose')chooseBackupFolder();if(a==='reconnect')reconnectBackupFolder().then(showProjects);if(a==='stop')stopBackups();if(a==='now')backupAll().then(()=>{toast('All projects backed up.');showProjects();}).catch(err=>{console.error(err);toast('Backup failed.');});return;}if(e.target.closest('[data-export-start]')){exportVideo();return;}if(e.target.closest('[data-export-cancel]')){state.exportCancelled=true;const s=$('#exportStatus');if(s)s.textContent='Cancelling…';return;}const b=e.target.closest('[data-modal],[data-open],[data-delete-project]');if(!b)return;if(b.dataset.deleteProject)deleteProject(b.dataset.deleteProject);else if(b.dataset.open)loadProject(b.dataset.open);else if(b.dataset.modal==='close'&&!state.exporting)closeModal();else if(b.dataset.modal==='new')showNewProject();else if(b.dataset.modal==='create')createProject();else if(b.dataset.modal==='backup')downloadProjectBackup();else if(b.dataset.modal==='import')$('#projectBackupInput').click();});
    document.addEventListener('keydown',e=>{const typing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName),key=e.key.toLowerCase();
      if(e.ctrlKey||e.metaKey){if(key==='z'&&!typing){e.preventDefault();e.shiftKey?redo():undo();return;}if(key==='y'&&!typing){e.preventDefault();redo();return;}if(key==='d'&&!typing){e.preventDefault();editAction('duplicate');}if(!typing&&key==='c'){copyItems(false);}if(!typing&&key==='x'){e.preventDefault();copyItems(true);}if(!typing&&key==='v'){e.preventDefault();pasteItems();}if(!typing&&key==='a'){e.preventDefault();setSelection(scene().items.map(x=>x.id));}if(!typing&&(e.key===']'||e.key===']'||e.code==='BracketRight')){e.preventDefault();arrangeItems(selectedItems(),e.shiftKey?'front':'forward');}if(!typing&&e.code==='BracketLeft'){e.preventDefault();arrangeItems(selectedItems(),e.shiftKey?'back':'backward');}return;}
      if(typing)return;if(e.altKey&&state.selected&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){e.preventDefault();action(e.key==='ArrowLeft'?'back':'forward');return;}
      if(e.code==='Space'){e.preventDefault();play();return;}
      if(!e.altKey&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){const step=e.shiftKey?10:1,[dx,dy]=e.key==='ArrowLeft'?[-step,0]:e.key==='ArrowRight'?[step,0]:e.key==='ArrowUp'?[0,-step]:[0,step];if(nudge(dx,dy)){e.preventDefault();return;}}
      if(key==='s'){e.preventDefault();editAction('split');return;}if(e.key==='['){e.preventDefault();editAction('trim-start');return;}if(e.key===']'){e.preventDefault();editAction('trim-end');return;}if(key==='c'){editAction('razor');return;}
      if((e.key==='Delete'||e.key==='Backspace')&&(state.selected||state.multi?.length)){e.preventDefault();action('delete');}else if((e.key==='Delete'||e.key==='Backspace')&&state.selectedClip){e.preventDefault();clipAction('delete');}
      if(e.key==='Escape'){closeClipMenu();if(state.razor)editAction('razor');else if(state.preview)stop();else if(state.selected||state.multi?.length){state.selected=null;state.multi=[];renderAll();}}});
    window.addEventListener('beforeunload',()=>{if(state.project)saveProject();});
  }
  async function init(){try{
    const fontResponse=await fetch('./assets/stroke-font.json');if(!fontResponse.ok)throw new Error('Writing font did not load');state.fonts=await fontResponse.json();
    state.handImage=await loadImage(HAND.src);
    state.db=await openDb();await loadMine();
    // Ask the browser to keep this site's storage through automatic clean-ups.
    try{await navigator.storage?.persist?.();}catch{}
    await loadBackupFolder();const current=localStorage.getItem('whiteboard-current');let p=current?await dbTask('readonly',s=>s.get(current)):null;if(!p){const all=await listProjects();p=all[0]||demoProject();}
    state.project=await migrateProject(p);state.editorView=projectView(state.project);bind();new ResizeObserver(renderStage).observe($('#canvasShell'));renderAll();prepareHandwriting();prepareAudio();await saveProject();
  }catch(e){console.error(e);$('#inspector').innerHTML=`<h2 class="panel-title">Could not open the editor</h2><p class="panel-help">${esc(e.message)}. Reload the app to try again.</p>`;}}
  init();
})();
