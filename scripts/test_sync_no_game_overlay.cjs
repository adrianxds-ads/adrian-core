'use strict';
// Full production Sync module in a disposable VM: no browser profile or real HTTP.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const code = fs.readFileSync(process.argv[2] || path.join(__dirname, '../components/adrian-sync.js'), 'utf8');
const KEY = 'adaptive_english_campaign1_v1';
const snapshot = (sessions, totalAttempts) => JSON.stringify({sessions,totalAttempts,level:900,history:[],sessionHistory:[]});
function boot({pathname='/adaptive-english/',origin='https://adrianxds-ads.github.io',data={},network='offline',body=true}={}) {
  class Storage {
    constructor(seed={}) { this.rows = new Map(Object.entries(seed)); }
    get length() { return this.rows.size; }
    key(i) { return [...this.rows.keys()][i] ?? null; }
    getItem(k) { return this.rows.get(String(k)) ?? null; }
    setItem(k,v) { this.rows.set(String(k),String(v)); }
    removeItem(k) { this.rows.delete(String(k)); }
    clear() { this.rows.clear(); }
  }
  const nodes=new Map(),events=[],timers=new Map(),listeners=new Map(),calls=[];
  let next=0,mode=network,remote={},revision=1200,reloads=0;
  const document={
    body:body?{appendChild(el){nodes.set(el.id,el);}}:null,
    getElementById:id=>nodes.get(id)||null,
    createElement:()=>({style:{},dataset:{},remove(){nodes.delete(this.id);}}),
    addEventListener:(name,fn)=>listeners.set('document:'+name,fn),
    visibilityState:'visible'
  };
  nodes.set('gameScreen',{classList:{contains:()=>false}});
  const localStorage=new Storage(data), sessionStorage=new Storage();
  const ctx={Storage,localStorage,sessionStorage,document,console,
    crypto:{randomUUID:()=> 'synthetic-device'},
    CustomEvent:class{constructor(type,init){this.type=type;this.detail=init.detail;}},
    location:{origin,pathname,reload(){reloads++;}},
    setTimeout(fn,ms){const id=++next;timers.set(id,{fn,ms});return id;},
    clearTimeout:id=>timers.delete(id),
    addEventListener:(name,fn)=>listeners.set('window:'+name,fn),
    dispatchEvent:e=>{events.push(e);return true;},
    fetch:async(url,init={})=>{
      calls.push({url,init});
      if(mode==='offline')throw new TypeError('Synthetic network unavailable');
      if(mode==='http-error')return {ok:false,status:503};
      if(url.includes('/changes?'))return {ok:true,json:async()=>({revision,entries:remote})};
      const keys=Object.keys(JSON.parse(init.body).changes);
      return {ok:true,json:async()=>mode==='conflict'?{revision,accepted:0,acceptedKeys:[],conflictKeys:keys}:{revision:++revision,accepted:keys.length,acceptedKeys:keys}};
    }
  };
  ctx.window=ctx;vm.createContext(ctx);vm.runInContext(code,ctx);
  return {ctx,nodes,events,timers,calls,listeners,
    mode:x=>mode=x,remote:x=>remote=x,reloads:()=>reloads,
    async tick(ms){const selected=[...timers].filter(([,x])=>x.ms===ms);for(const [id,x] of selected){if(!timers.has(id))continue;timers.delete(id);await x.fn();}},
    data:()=>Object.fromEntries(localStorage.rows),
    noOverlay(){assert.equal(nodes.has('adrianSyncStatus'),false);}
  };
}
(async()=>{
  let scenarios=0;
  for(const pathname of ['/adaptive-english/','/b2-multiple-choice-cloze/','/adaptive-verbs-catala/','/adaptive-phrasal-verbs/','/adaptive-pizarras/']) {
    const h=boot({pathname});
    await h.tick(0);assert.equal(h.events.at(-1).detail.kind,'offline');h.noOverlay();
    for(const phase of ['start','answer','pause','transition','resume']) {
      for(const kind of ['busy','offline','conflict','blocked','local','ok']) {
        h.ctx.AdrianSync.status(phase,kind);h.noOverlay();
        assert.equal(h.events.at(-1).detail.kind,kind);
      }
    }
    for(let i=0;i<3;i++){await h.tick(30000);h.noOverlay();}
    // A pre-existing legacy node is removed at the next status call.
    h.nodes.set('adrianSyncStatus',{remove(){h.nodes.delete('adrianSyncStatus');}});
    h.ctx.AdrianSync.status('retry','offline');h.noOverlay();scenarios++;
  }
  const early=boot({body:false});early.ctx.AdrianSync.status('offline','offline');
  assert.equal(early.listeners.has('document:DOMContentLoaded'),false);early.noOverlay();scenarios++;
  const hub=boot({pathname:'/adrian-hub/'});hub.ctx.AdrianSync.status('local','offline');
  assert.equal(hub.nodes.get('adrianSyncStatus').textContent,'local');scenarios++;
  const isolated=boot({origin:'http://localhost:8000'});
  assert.equal(isolated.ctx.AdrianSync.mode,'isolated-preview');assert.equal(isolated.calls.length,0);scenarios++;
  // Historically populated save, offline answers and completed round survive reload.
  const h=boot({data:{[KEY]:snapshot(446,6922)}});await h.tick(0);h.noOverlay();
  assert.equal(h.calls.some(x=>x.init.method==='POST'),false);
  h.ctx.localStorage.setItem(KEY,snapshot(447,6937));
  assert.equal(await h.ctx.AdrianSync.flush(),false);h.noOverlay();
  const reloaded=boot({data:h.data()});await reloaded.tick(0);
  assert.equal(reloaded.ctx.localStorage.getItem(KEY),snapshot(447,6937));
  assert.equal(JSON.parse(reloaded.ctx.localStorage.getItem('adrian_sync_meta_v1')).pending[KEY].value,snapshot(447,6937));scenarios++;
  // Reconnect against a known baseline and acknowledge the legitimate local save.
  reloaded.mode('online');reloaded.remote({[KEY]:{value:snapshot(446,6922),revision:1200,updatedAt:1}});
  assert.equal(await reloaded.ctx.AdrianSync.pull(),true);
  assert.equal(await reloaded.ctx.AdrianSync.flush(),true);
  assert.equal(reloaded.ctx.localStorage.getItem(KEY),snapshot(447,6937));
  assert.equal(Object.keys(JSON.parse(reloaded.ctx.localStorage.getItem('adrian_sync_meta_v1')).pending).length,0);
  reloaded.noOverlay();scenarios++;
  // HTTP failure after baseline verification: queued data retained and retries scheduled.
  reloaded.mode('http-error');reloaded.ctx.localStorage.setItem(KEY,snapshot(448,6952));
  assert.equal(await reloaded.ctx.AdrianSync.flush(),false);
  assert.equal(reloaded.events.at(-1).detail.kind,'offline');reloaded.noOverlay();
  assert([...reloaded.timers.values()].some(x=>x.ms===30000));scenarios++;
  // Incoming richer progress restores storage and emits notification without a badge/reload mid-game.
  const restore=boot({data:{[KEY]:snapshot(0,0)},network:'online'});
  restore.remote({[KEY]:{value:snapshot(446,6922),revision:1200,updatedAt:1}});
  await restore.tick(0);assert.equal(restore.ctx.localStorage.getItem(KEY),snapshot(446,6922));
  assert(restore.events.some(x=>x.type==='adrian-sync-updated'));restore.noOverlay();assert.equal(restore.reloads(),0);scenarios++;
  console.log(`PASS ${scenarios} scenarios; five quiz routes, all status kinds and repeated retries; offline queue/reload/reconnect, HTTP error, remote recovery, Hub and isolated preview. VM simulation only.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
