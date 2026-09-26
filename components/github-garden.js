(function(){"use strict";
if(window.AdrianGarden)return;

const CORE="https://adrianxds-ads.github.io/adrian-core/";
const REGISTRY_URL=CORE+"garden/registry.json?v=3";
const SNAPSHOT_KEY="adrian_github_garden_v1";
const CACHE=new Map();

const PROFILES={
  olive:{h:126,spread:.90,split:.55,depth:6,leaf:[5.8,1.9],trunk:["#5c3c29","#84634b"],greens:["#657a48","#788b54","#8f9d68","#596e41"]},
  cherry:{h:136,spread:1.08,split:.58,depth:6,leaf:[5.7,3.0],trunk:["#5e3436","#8a5a59"],greens:["#587848","#6d8d55","#82a363"],flower:"#e9a8bb"},
  cypress:{h:160,spread:.26,split:.42,depth:7,leaf:[3.4,1.8],trunk:["#52392b","#715443"],greens:["#274f3a","#315e45","#3f7553"]},
  orange:{h:118,spread:.82,split:.52,depth:6,leaf:[5.7,3.0],trunk:["#5b3a25","#815a3d"],greens:["#3f7543","#559052","#6aa45f"],fruit:"#d98a27"},
  jacaranda:{h:132,spread:1.12,split:.60,depth:6,leaf:[5.0,2.7],trunk:["#604232","#87614d"],greens:["#4b7654","#5f8a64","#759d78"],flower:"#9f7bd8"},
  pine:{h:158,spread:.56,split:.50,depth:7,leaf:[7.0,1.35],trunk:["#5b3c27","#7c5738"],greens:["#294e3a","#315a43","#3f6d4d"]},
  maple:{h:132,spread:1.04,split:.58,depth:6,leaf:[5.8,3.4],trunk:["#58402e","#7d5a3e"],greens:["#724536","#8b5038","#a8603c","#be7449"]},
  shrub:{h:74,spread:1.28,split:.72,depth:5,leaf:[5.4,3.0],trunk:["#5b402d","#7a5a40"],greens:["#496f45","#5d8454","#71945f"],flower:"#c8a0dd"}
};

function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function rng(seed=1){let t=seed>>>0;return()=>{t+=0x6D2B79F5;let x=t;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return((x^x>>>14)>>>0)/4294967296;};}
function readSnapshots(){try{return JSON.parse(localStorage.getItem(SNAPSHOT_KEY)||"{}")||{};}catch{return{};}}
function writeSnapshots(x){try{localStorage.setItem(SNAPSHOT_KEY,JSON.stringify(x));}catch{}}
function getPath(obj,path){return String(path||"").split(".").filter(Boolean).reduce((a,k)=>a&&a[k],obj);}
function detectAppId(){
  const p=location.pathname.toLowerCase();
  if(p.startsWith("/adaptive-english"))return"english";
  if(p.startsWith("/b2-multiple-choice-cloze"))return"b2-cloze";
  if(p.startsWith("/adaptive-phrasal-verbs"))return"phrasal-verbs";
  if(p.startsWith("/adaptive-exam"))return"cambridge";
  if(p.startsWith("/adaptive-verbs-catala"))return"catala";
  if(p.startsWith("/adaptive-hoti0108"))return"hoti0108";
  if(p.startsWith("/adrian-hub/apps/entrenamiento"))return"entrenamiento";
  if(p.startsWith("/adrian-hub/apps/dc-inbox"))return"dcinbox";
  if(p.startsWith("/limpieza"))return"limpieza";
  return null;
}
async function loadRegistry(){
  if(CACHE.has("registry"))return CACHE.get("registry");
  const r=await fetch(REGISTRY_URL,{cache:"no-store"});
  if(!r.ok)throw Error("Garden registry "+r.status);
  const j=await r.json();CACHE.set("registry",j);return j;
}
function resolveLevel(entry){
  const p=entry.progress||{},sn=readSnapshots();
  const remember=n=>{if(Number.isFinite(n)&&n>=0){sn[entry.appId]={level:n,at:Date.now(),source:"live"};writeSnapshots(sn);}return n;};
  if(p.mode==="localStorageLevel"){
    try{const raw=localStorage.getItem(p.storageKey);if(raw){const n=Number(getPath(JSON.parse(raw),p.path));if(Number.isFinite(n)&&n>=0)return remember(n);}}catch{}
  }
  const saved=Number(sn[entry.appId]?.level);
  return Number.isFinite(saved)&&saved>=0?saved:null;
}
function growth(entry,root){
  const level=resolveLevel(entry),max=Number(root.maxLevel)||10000,interval=Number(root.growthInterval)||50;
  return{level,stage:level==null?0:clamp(Math.floor(level/interval),0,Math.floor(max/interval)),connected:entry.progress?.status==="connected",max,interval};
}

function legacyParts(seed){
  const rnd=rng(seed||20260912),branches=[],leaves=[];
  const grow=(x,y,len,ang,width,depth,dist)=>{
    const angle=ang+(rnd()-.5)*.18,x2=x+Math.cos(angle)*len,y2=y+Math.sin(angle)*len,bend=(rnd()-.5)*10;
    const mx=(x+x2)/2+Math.cos(angle+Math.PI/2)*bend,my=(y+y2)/2+Math.sin(angle+Math.PI/2)*bend,score=dist+len*.58+depth*2+rnd()*2;
    branches.push({score,kind:"branch",d:`M ${x.toFixed(1)} ${y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,w:Math.max(1.25,width)});
    if(depth>=4){const rot=Math.round((rnd()-.5)*90),green=["#607d3b","#769447","#8ca85a","#526f36"][Math.floor(rnd()*4)];leaves.push({score:score+8+rnd()*15,kind:"leaf",x:x2+(rnd()-.5)*7,y:y2+(rnd()-.5)*6,rx:5+rnd()*5,ry:2.8+rnd()*3,rot,fill:green});}
    if(depth>=6)return;
    const next=len*(.72+rnd()*.09),w=width*.72,spread=.35+rnd()*.20;
    grow(x2,y2,next,angle-spread,w,depth+1,dist+len);
    grow(x2,y2,next*(.92+rnd()*.12),angle+spread*(.88+rnd()*.22),w*.96,depth+1,dist+len);
  };
  grow(110,207,42,-Math.PI/2,9,0,0);
  return[...branches,...leaves].sort((a,b)=>a.score-b.score||a.kind.localeCompare(b.kind)).slice(0,200);
}

function genericParts(entry){
  const key=entry.species,p=PROFILES[key]||PROFILES.olive,rnd=rng(entry.seed||1),parts=[],tips=[];
  const baseY=207,starts=key==="shrub"?[-17,-8,0,9,18]:[0];
  let branchCount=0;
  const grow=(x,y,len,ang,width,depth,dist)=>{
    if(branchCount>82)return;branchCount++;
    const angle=ang+(rnd()-.5)*(key==="cypress"?.06:key==="pine"?.12:.20),x2=x+Math.cos(angle)*len,y2=y+Math.sin(angle)*len;
    const bend=(rnd()-.5)*(key==="cypress"?2.5:key==="pine"?5:9),mx=(x+x2)/2+Math.cos(angle+Math.PI/2)*bend,my=(y+y2)/2+Math.sin(angle+Math.PI/2)*bend,score=dist+depth*4+rnd()*3;
    parts.push({score,kind:"branch",d:`M ${x.toFixed(1)} ${y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`,w:Math.max(.85,width)});
    tips.push({x:x2,y:y2,depth,score});
    if(depth>=p.depth)return;
    const next=len*(.66+rnd()*.10),spread=(.22+rnd()*.16)*p.spread,children=depth<2?2:(rnd()<p.split?2:1);
    for(let i=0;i<children;i++){const side=children===1?(rnd()<.5?-1:1):(i?1:-1);grow(x2,y2,next*(.92+rnd()*.14),angle+side*spread*(.8+rnd()*.45),width*.71,depth+1,dist+len);}
  };
  starts.forEach((sx,i)=>grow(110+sx,baseY,p.h*(key==="shrub"?.38:.30),-Math.PI/2+(sx/120),key==="shrub"?3.2:8.4,0,i*3));
  const greens=p.greens;
  for(const t of tips){
    if(t.depth<2)continue;
    const count=key==="cypress"?6:key==="pine"?5:3;
    for(let i=0;i<count;i++){
      const a=rnd()*Math.PI*2,rad=(key==="cypress"?6:key==="pine"?10:12)*(rnd()*.75+.35),x=t.x+Math.cos(a)*rad*p.spread,y=t.y+Math.sin(a)*rad*.55;
      parts.push({score:t.score+18+rnd()*58+t.depth*3,kind:"leaf",x,y,rx:p.leaf[0]*(.72+rnd()*.55),ry:p.leaf[1]*(.75+rnd()*.5),rot:Math.round(rnd()*160-80),fill:greens[Math.floor(rnd()*greens.length)]});
    }
  }
  const ornament=p.flower||p.fruit;
  if(ornament){
    const candidates=tips.filter(t=>t.depth>=p.depth-1);
    for(let i=0;i<32&&candidates.length;i++){
      const t=candidates[Math.floor(rnd()*candidates.length)],late=p.fruit?150:118;
      parts.push({score:late+rnd()*76,kind:p.fruit?"fruit":"flower",x:t.x+(rnd()-.5)*16,y:t.y+(rnd()-.5)*12,r:p.fruit?2.7+rnd()*1.2:2.2+rnd()*1.6,fill:ornament});
    }
  }
  let filler=0;
  while(parts.length<200&&tips.length){
    const t=tips[Math.floor(rnd()*tips.length)],a=rnd()*Math.PI*2,rad=5+rnd()*15;
    parts.push({score:95+filler*1.35+rnd()*4,kind:"leaf",x:t.x+Math.cos(a)*rad*p.spread,y:t.y+Math.sin(a)*rad*.55,rx:p.leaf[0]*(.68+rnd()*.48),ry:p.leaf[1]*(.72+rnd()*.42),rot:Math.round(rnd()*160-80),fill:greens[Math.floor(rnd()*greens.length)]});filler++;
  }
  return parts.sort((a,b)=>a.score-b.score||a.kind.localeCompare(b.kind)).slice(0,200);
}
function leafMarkup(x,species){
  if(species==="maple"){
    const r=Math.max(2.5,x.rx*.72),cx=x.x,cy=x.y;
    return `<path d="M ${cx} ${cy-r} L ${cx+r*.34} ${cy-r*.25} L ${cx+r} ${cy-r*.12} L ${cx+r*.48} ${cy+r*.30} L ${cx+r*.62} ${cy+r} L ${cx} ${cy+r*.56} L ${cx-r*.62} ${cy+r} L ${cx-r*.48} ${cy+r*.30} L ${cx-r} ${cy-r*.12} L ${cx-r*.34} ${cy-r*.25} Z" fill="${x.fill}" transform="rotate(${x.rot} ${cx} ${cy})"/>`;
  }
  return `<ellipse cx="${x.x.toFixed(1)}" cy="${x.y.toFixed(1)}" rx="${x.rx.toFixed(1)}" ry="${x.ry.toFixed(1)}" transform="rotate(${x.rot} ${x.x.toFixed(1)} ${x.y.toFixed(1)})" fill="${x.fill}"/>`;
}
function plantSvg(entry,stage){
  const uid="g"+entry.appId.replace(/[^a-z0-9]/gi,""),parts=(entry.species==="adaptive-legacy"?legacyParts(entry.seed):genericParts(entry)).slice(0,stage);
  if(stage===0)return`<svg viewBox="0 0 220 220" aria-label="Semilla de ${entry.name}"><ellipse class="gg-soil" cx="110" cy="207" rx="27" ry="6"/><path class="gg-seed" d="M108 203c-1-7 4-11 10-9-1 6-4 10-10 9Z"/></svg>`;
  const branches=parts.filter(x=>x.kind==="branch").map(x=>`<path d="${x.d}" stroke-width="${x.w.toFixed(2)}"/>`).join("");
  const foliage=parts.filter(x=>x.kind==="leaf").map(x=>leafMarkup(x,entry.species)).join("");
  const orn=parts.filter(x=>x.kind==="flower"||x.kind==="fruit").map(x=>`<circle cx="${x.x.toFixed(1)}" cy="${x.y.toFixed(1)}" r="${x.r.toFixed(1)}" fill="${x.fill}" opacity=".94"/>`).join("");
  const prof=PROFILES[entry.species]||{},trunk=entry.species==="adaptive-legacy"?["#5d3827","#957258"]:(prof.trunk||["#5d3827","#957258"]);
  return`<svg viewBox="0 0 220 220" aria-label="${entry.name}, crecimiento ${stage} de 200"><defs><linearGradient id="${uid}tr" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${trunk[0]}"/><stop offset="1" stop-color="${trunk[1]}"/></linearGradient></defs><ellipse class="gg-soil" cx="110" cy="207" rx="${entry.species==="shrub"?42:32}" ry="6"/><g fill="none" stroke="url(#${uid}tr)" stroke-linecap="round" stroke-linejoin="round">${branches}</g><g>${foliage}${orn}</g></svg>`;
}

function solarState(now=new Date()){
  const start=new Date(now.getFullYear(),0,0),doy=Math.floor((now-start)/86400000);
  const lat=41.39*Math.PI/180,decl=23.44*Math.PI/180*Math.sin(2*Math.PI*(284+doy)/365);
  const ha=Math.acos(clamp(-Math.tan(lat)*Math.tan(decl),-1,1)),dayLength=24*ha/Math.PI;
  const month=now.getMonth(),summerClock=month>=2&&month<=9,solarNoon=summerClock?13.55:12.55;
  const sunrise=solarNoon-dayLength/2,sunset=solarNoon+dayLength/2,h=now.getHours()+now.getMinutes()/60;
  const phase=clamp((h-sunrise)/Math.max(.1,sunset-sunrise),0,1),sun=Math.sin(Math.PI*phase);
  const twilight=clamp(1-Math.min(Math.abs(h-sunrise),Math.abs(h-sunset))/1.25,0,1);
  const daylight=h>=sunrise&&h<=sunset;
  let top,bottom,ground,stars=0,sunOpacity=.92,period;
  if(daylight){
    const warm=Math.pow(1-sun,.8);
    top=`rgb(${Math.round(42+58*sun+ 48*warm)},${Math.round(77+85*sun)},${Math.round(108+104*sun)})`;
    bottom=`rgb(${Math.round(126+76*sun)},${Math.round(145+76*sun)},${Math.round(133+83*sun)})`;
    ground=`rgb(${Math.round(24+20*sun)},${Math.round(48+32*sun)},${Math.round(30+24*sun)})`;
    period=h<solarNoon-1?"MAÑANA":h>solarNoon+2.2?"TARDE":"MEDIODÍA";
  }else{
    top="#09141d";bottom=twilight>.18?"#443b3a":"#101c24";ground="#102018";stars=clamp(1-twilight,0,1);sunOpacity=0;period=h<sunrise?"NOCHE / AMANECER":"NOCHE";
  }
  const season=month===11||month<=1?"INVIERNO":month<=4?"PRIMAVERA":month<=7?"VERANO":"OTOÑO";
  return{top,bottom,ground,stars,sunOpacity,phase,period,season,sunrise,sunset,time:now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),month:now.toLocaleDateString([],{month:"short"}).toUpperCase()};
}
function applyAtmosphere(host,now=new Date()){
  const s=solarState(now);
  host.style.setProperty("--gg-sky-top",s.top);host.style.setProperty("--gg-sky-bottom",s.bottom);host.style.setProperty("--gg-ground",s.ground);
  host.style.setProperty("--gg-stars",s.stars);host.style.setProperty("--gg-sun-opacity",s.sunOpacity);
  host.style.setProperty("--gg-sun-x",(12+s.phase*76)+"%");host.style.setProperty("--gg-sun-y",(34-Math.sin(Math.PI*s.phase)*22)+"%");
  const stamp=host.querySelector(".gg-time");if(stamp)stamp.textContent=`${s.month} · ${s.time} · ${s.period}`;
  return s;
}

function css(){
  if(document.getElementById("adrian-garden-css"))return;
  const s=document.createElement("style");s.id="adrian-garden-css";s.textContent=`
.github-garden{--gg-pan:0px;--gg-sky-top:#132126;--gg-sky-bottom:#33443d;--gg-ground:#17271f;position:relative;min-height:360px;overflow:hidden;border:1px solid rgba(255,255,255,.09);border-radius:22px;background:linear-gradient(180deg,var(--gg-sky-top) 0 48%,var(--gg-sky-bottom) 49% 58%,var(--gg-ground) 59% 100%);box-shadow:inset 0 1px rgba(255,255,255,.05),0 14px 38px rgba(0,0,0,.20);touch-action:pan-y;isolation:isolate}
.github-garden:before{content:"";position:absolute;inset:0;z-index:0;background-image:radial-gradient(circle at 10% 16%,rgba(255,255,255,.85) 0 1px,transparent 1.6px),radial-gradient(circle at 28% 9%,rgba(255,255,255,.72) 0 1px,transparent 1.5px),radial-gradient(circle at 47% 18%,rgba(255,255,255,.76) 0 1px,transparent 1.5px),radial-gradient(circle at 67% 11%,rgba(255,255,255,.72) 0 1px,transparent 1.5px),radial-gradient(circle at 88% 20%,rgba(255,255,255,.82) 0 1px,transparent 1.5px);opacity:var(--gg-stars,0);transition:opacity .8s ease}
.gg-sun{position:absolute;z-index:1;left:var(--gg-sun-x);top:var(--gg-sun-y);width:34px;height:34px;margin:-17px;border-radius:50%;background:radial-gradient(circle,#fff8d5 0 28%,#f0c66f 45%,rgba(240,198,111,.15) 67%,transparent 72%);box-shadow:0 0 34px rgba(255,219,139,.40);opacity:var(--gg-sun-opacity,.9);transition:left .8s ease,top .8s ease,opacity .8s ease}
.gg-hills{position:absolute;z-index:2;left:-10%;right:-10%;bottom:22%;height:37%;opacity:.48;background:radial-gradient(ellipse at 18% 100%,#24392f 0 42%,transparent 43%),radial-gradient(ellipse at 55% 100%,#1c3026 0 47%,transparent 48%),radial-gradient(ellipse at 88% 100%,#26392f 0 42%,transparent 43%)}
.github-garden:after{content:"";position:absolute;z-index:3;left:-12%;right:-12%;bottom:-16%;height:56%;border-radius:50% 50% 0 0/30% 30% 0 0;background:radial-gradient(ellipse at center,color-mix(in srgb,var(--gg-ground) 75%,#33503a) 0,var(--gg-ground) 46%,#0d1712 78%);transform:perspective(420px) rotateX(58deg);transform-origin:bottom}
.gg-horizon{position:absolute;z-index:4;left:0;right:0;top:58%;height:1px;background:linear-gradient(90deg,transparent,rgba(205,225,210,.15),transparent)}
.gg-scene{position:absolute;z-index:8;inset:0;transform:translateX(var(--gg-pan));transition:transform .12s ease-out}
.gg-plant{position:absolute;left:var(--x);bottom:var(--bottom);width:150px;height:160px;margin-left:-75px;padding:0;border:0;background:none;color:#eef5f1;transform:scale(var(--scale));transform-origin:50% 100%;filter:drop-shadow(0 12px 10px rgba(0,0,0,.28));cursor:pointer;z-index:var(--z);transition:filter .2s ease,transform .22s ease}.gg-plant svg{width:100%;height:100%;overflow:visible}.gg-plant:hover,.gg-plant:focus-visible{filter:drop-shadow(0 14px 14px rgba(0,0,0,.35)) brightness(1.08);outline:none}.gg-plant[data-active="true"]{width:188px;height:200px;margin-left:-94px;filter:drop-shadow(0 18px 18px rgba(0,0,0,.42))}.gg-soil{fill:rgba(4,10,7,.46)}.gg-seed{fill:#9d7754;stroke:#d5b38d;stroke-width:1}
.gg-label{position:absolute;left:50%;bottom:-23px;transform:translateX(-50%) scale(.96);min-width:112px;max-width:170px;padding:5px 8px;border:1px solid rgba(255,255,255,.12);border-radius:999px;background:rgba(7,14,11,.82);backdrop-filter:blur(8px);font:850 10px/1.15 system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#dce9e2;opacity:0;pointer-events:none;transition:opacity .15s ease,transform .15s ease}.gg-label small{display:block;margin-top:2px;color:#91a89b;font-size:8px}.gg-plant:hover .gg-label,.gg-plant:focus-visible .gg-label,.gg-plant[data-selected="true"] .gg-label,.gg-plant[data-active="true"] .gg-label{opacity:1;transform:translateX(-50%) scale(1)}.gg-plant[data-edge="right"] .gg-label{left:auto;right:2px;transform:scale(.96)}.gg-plant[data-edge="right"]:hover .gg-label,.gg-plant[data-edge="right"]:focus-visible .gg-label,.gg-plant[data-edge="right"][data-selected="true"] .gg-label,.gg-plant[data-edge="right"][data-active="true"] .gg-label{transform:scale(1)}.gg-plant[data-edge="left"] .gg-label{left:2px;transform:scale(.96)}.gg-plant[data-edge="left"]:hover .gg-label,.gg-plant[data-edge="left"]:focus-visible .gg-label,.gg-plant[data-edge="left"][data-selected="true"] .gg-label,.gg-plant[data-edge="left"][data-active="true"] .gg-label{transform:scale(1)}
.gg-heading{position:absolute;z-index:20;left:16px;top:14px;display:grid;gap:2px;pointer-events:none}.gg-heading b{font:950 13px/1 system-ui,sans-serif;letter-spacing:.08em}.gg-heading span{font:800 9px/1.3 system-ui,sans-serif;letter-spacing:.08em;color:rgba(225,237,230,.66)}.gg-time{position:absolute;z-index:20;right:14px;top:13px;padding:6px 8px;border-radius:10px;background:rgba(7,14,11,.42);font:850 9px/1.2 system-ui,sans-serif;color:rgba(237,244,240,.74);backdrop-filter:blur(5px)}
.gg-empty{display:grid;place-items:center;min-height:220px;color:#9fb3aa}
.adrian-plant-card{position:relative;min-height:215px;display:grid;grid-template-columns:minmax(150px,44%) 1fr;align-items:center;gap:10px;overflow:hidden;border:1px solid rgba(255,255,255,.08);border-radius:17px;background:radial-gradient(circle at 22% 44%,rgba(111,145,116,.12),transparent 32%),linear-gradient(145deg,rgba(16,31,23,.94),rgba(10,20,15,.96));padding:12px 14px}.adrian-plant-card__plant{height:190px;display:grid;place-items:center;filter:drop-shadow(0 14px 13px rgba(0,0,0,.28))}.adrian-plant-card__plant svg{height:100%;max-width:220px;overflow:visible}.adrian-plant-card__copy{min-width:0}.adrian-plant-card__copy small{display:block;font:900 10px/1.3 system-ui,sans-serif;letter-spacing:.11em;color:#87a092}.adrian-plant-card__copy b{display:block;margin:4px 0;font:950 clamp(21px,5vw,31px)/1.05 system-ui,sans-serif;color:#eef6f1}.adrian-plant-card__copy span{display:block;font:800 12px/1.4 system-ui,sans-serif;color:#a9bab1}.adrian-plant-card__progress{margin-top:11px;height:5px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden}.adrian-plant-card__progress i{display:block;height:100%;border-radius:inherit;background:#6f9872}
@media(max-width:560px){.github-garden{min-height:310px;border-radius:18px}.gg-plant{width:122px;height:132px;margin-left:-61px}.gg-plant[data-active="true"]{width:154px;height:166px;margin-left:-77px}.gg-label{min-width:90px;max-width:126px;font-size:9px}.gg-heading{left:12px;top:11px}.gg-time{right:10px;top:10px}.adrian-plant-card{min-height:190px;grid-template-columns:42% 1fr;padding:9px 10px}.adrian-plant-card__plant{height:165px}.adrian-plant-card__copy b{font-size:21px}.adrian-plant-card__copy span{font-size:11px}}
`;document.head.appendChild(s);
}

function renderScene(host,root,opts={}){
  css();const active=opts.currentApp===undefined?detectAppId():opts.currentApp,apps=root.apps||[];
  host.className="github-garden";host.dataset.mode="overview";
  host.innerHTML='<div class="gg-heading"><b>JARDÍN GITHUB</b><span>JUEGO VISUAL DEL ECOSISTEMA</span></div><div class="gg-time"></div><div class="gg-sun"></div><div class="gg-hills"></div><div class="gg-horizon"></div><div class="gg-scene"></div>';
  applyAtmosphere(host);
  const scene=host.querySelector(".gg-scene"),ordered=apps.slice().sort((a,b)=>(b.position?.depth||.5)-(a.position?.depth||.5));
  for(const e of ordered){
    const g=growth(e,root),isActive=active===e.appId,depth=isActive?.05:(e.position?.depth??.5),x=isActive?50:(e.position?.x??50),scale=(isActive?1.12:(1-depth*.48))*(e.size||1),bottom=isActive?5:9+depth*30,z=Math.round((1-depth)*100)+(isActive?200:0),btn=document.createElement("button");
    btn.className="gg-plant";btn.dataset.app=e.appId;btn.dataset.active=String(isActive);btn.dataset.selected="false";btn.dataset.edge=x>78?"right":x<22?"left":"mid";btn.style.cssText=`--x:${x}%;--bottom:${bottom}%;--scale:${scale};--z:${z}`;
    const state=g.level==null?"SEMILLA · PROGRESO PENDIENTE":`LEVEL ${Math.floor(g.level).toLocaleString()} · ${g.stage}/200`;
    btn.innerHTML=plantSvg(e,g.stage)+`<span class="gg-label">${e.name}<small>${e.speciesName} · ${state}</small></span>`;
    btn.title=g.level==null?(e.progress?.note||"Progress connection pending"):`${e.name}: level ${g.level}`;
    btn.addEventListener("click",()=>{const already=btn.dataset.selected==="true";scene.querySelectorAll(".gg-plant").forEach(x=>x.dataset.selected="false");btn.dataset.selected="true";host.dispatchEvent(new CustomEvent("adrian-garden-select",{detail:{entry:e,growth:g},bubbles:true}));if(opts.navigate===true&&e.url&&already)location.href=e.url;});
    scene.appendChild(btn);
  }
  let startX=null,startPan=0,pan=0;
  host.addEventListener("pointerdown",ev=>{if(ev.target.closest(".gg-plant"))return;startX=ev.clientX;startPan=pan;host.setPointerCapture?.(ev.pointerId);});
  host.addEventListener("pointermove",ev=>{if(startX==null)return;pan=clamp(startPan+(ev.clientX-startX),-90,90);host.style.setProperty("--gg-pan",pan+"px");});
  host.addEventListener("pointerup",()=>startX=null);host.addEventListener("pointercancel",()=>startX=null);
  if(host.__gardenClock)clearInterval(host.__gardenClock);host.__gardenClock=setInterval(()=>applyAtmosphere(host),60000);
  return{active,apps:apps.length};
}
function renderPlant(host,root,appId){
  css();const entry=(root.apps||[]).find(x=>x.appId===appId);if(!entry)return null;
  const g=growth(entry,root),state=g.level==null?"PROGRESO PENDIENTE":`LEVEL ${Math.floor(g.level).toLocaleString()} · ${g.stage}/200`;
  host.className="adrian-plant-card";host.dataset.app=appId;
  host.innerHTML=`<div class="adrian-plant-card__plant">${plantSvg(entry,g.stage)}</div><div class="adrian-plant-card__copy"><small>TU PLANTA · ${entry.speciesName.toUpperCase()}</small><b>${entry.name}</b><span>${state}</span><div class="adrian-plant-card__progress"><i style="width:${g.stage/2}%"></i></div></div>`;
  return{entry,growth:g};
}
async function mount(target,opts={}){
  const host=typeof target==="string"?document.querySelector(target):target;if(!host)return null;
  try{const root=await loadRegistry();return renderScene(host,root,opts);}catch(e){css();host.className="github-garden";host.innerHTML='<div class="gg-empty">No se pudo cargar el Jardín GitHub.</div>';console.error(e);return null;}
}
async function mountPlant(target,appId){
  const host=typeof target==="string"?document.querySelector(target):target;if(!host)return null;
  try{const root=await loadRegistry();return renderPlant(host,root,appId||detectAppId());}catch(e){console.error(e);return null;}
}
function reportProgress(appId,data={}){
  const n=Number(data.level);if(!appId||!Number.isFinite(n)||n<0)return false;
  const sn=readSnapshots();sn[appId]={level:n,at:Date.now(),source:data.source||"reported"};writeSnapshots(sn);return true;
}

window.AdrianGarden=Object.freeze({version:"1.2.0",registryUrl:REGISTRY_URL,loadRegistry,mount,mountPlant,detectAppId,reportProgress,growthStage:(level,interval=50,max=10000)=>clamp(Math.floor((Number(level)||0)/interval),0,Math.floor(max/interval)),solarState});
function auto(){document.querySelectorAll("[data-adrian-garden]").forEach(el=>{if(el.dataset.gardenMounted)return;el.dataset.gardenMounted="1";mount(el,{currentApp:el.dataset.currentApp||undefined,navigate:el.dataset.navigate==="true"});});}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",auto,{once:true});else auto();
})();