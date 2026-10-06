'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const client=fs.readFileSync(path.join(__dirname,'../components/adrian-sync.js'),'utf8');
const server=fs.readFileSync(path.join(__dirname,'../../adrian-sync-server/server.js'),'utf8');
const key='pizarras_state_v1';
function env(seed={},response={entries:{},revision:1},offline=false){
 class Storage {constructor(x={}){this.data=new Map(Object.entries(x));}get length(){return this.data.size;}key(i){return [...this.data.keys()][i]??null;}getItem(k){return this.data.get(String(k))??null;}setItem(k,v){this.data.set(String(k),String(v));}removeItem(k){this.data.delete(String(k));}clear(){this.data.clear();}}
 const timers=[],events={},localStorage=new Storage(seed),sessionStorage=new Storage(),calls=[];
 const context={Storage,localStorage,sessionStorage,Map,Set,Date,Math,JSON,Object,Number,String,crypto:{randomUUID:()=> 'test-device'},setTimeout:f=>{timers.push(f);return timers.length;},clearTimeout(){},CustomEvent:class{constructor(n,x){this.type=n;this.detail=x.detail;}},location:{pathname:'/test',reload(){context.reloads++;}},reloads:0,document:{addEventListener(){},visibilityState:'hidden'},window:{addEventListener(n,f){events[n]=f;},dispatchEvent(e){context.lastStatus=e.detail;}},async fetch(url,opts){calls.push({url,opts});if(offline)throw Error('offline');return {ok:true,json:async()=>url.includes('/changes')?response:{accepted:Object.keys(JSON.parse(opts.body).changes).length,revision:2}};}};
 vm.runInNewContext(client,context);return {context,localStorage,calls,timers,events};
}
(async()=>{
 let e=env({[key]:JSON.stringify({sessions:12,level:4,answers:60})},{entries:{[key]:{value:null,deleted:true,updatedAt:Date.now()}},revision:3});
 await e.context.window.AdrianSync.pull();assert.equal(JSON.parse(e.localStorage.getItem(key)).sessions,12,'remote deletion blocked');
 e=env({[key]:JSON.stringify({sessions:12,level:4,answers:60})},{entries:{[key]:{value:JSON.stringify({sessions:10,level:5,answers:50}),updatedAt:Date.now()+1}},revision:3});
 await e.context.window.AdrianSync.pull();assert.equal(JSON.parse(e.localStorage.getItem(key)).sessions,12,'divergent progress stays local');
 e=env({[key]:JSON.stringify({sessions:1,level:2,answers:10})},{entries:{[key]:{value:JSON.stringify({sessions:2,level:3,answers:20}),updatedAt:Date.now()+1}},revision:3});
 await e.context.window.AdrianSync.pull(true);assert.equal(JSON.parse(e.localStorage.getItem(key)).sessions,2);assert([...e.localStorage.data.keys()].some(k=>k.startsWith(key+'_recovery_')),'recovery before replacement');
 e.localStorage.setItem(key,JSON.stringify({sessions:3}));assert.equal(JSON.parse(e.localStorage.getItem(key)).sessions,3,'writes after reload are never frozen');
 e=env({},undefined,true);e.localStorage.setItem(key,'{"sessions":7}');await e.context.window.AdrianSync.flush();
 const seed=Object.fromEntries(e.localStorage.data);e=env(seed);await e.context.window.AdrianSync.flush();assert(e.calls.some(c=>c.opts?.method==='POST'),'pending survives reload');
 e.localStorage.removeItem(key);assert([...e.localStorage.data.keys()].some(k=>k.startsWith(key+'_recovery_')),'local delete recovery');
 e=env({[key]:'{"sessions":12,"level":4,"answers":60}'},{entries:{[key]:{value:'{"sessions":10,"level":5,"answers":50}',updatedAt:Date.now()+1}},revision:3});
 e.localStorage.setItem(key,'{"sessions":12,"level":4,"answers":60}');
 const fetchChanges=e.context.fetch;
 e.context.fetch=async(url,opts)=>url.endsWith('/sync')?{ok:true,json:async()=>({accepted:0,acceptedKeys:[],revision:3})}:fetchChanges(url,opts);
 assert.equal(await e.context.window.AdrianSync.flush(),false,'unresolved conflict is not synchronized');
 assert.equal(e.context.lastStatus.kind,'conflict','conflict status is visible');
 assert(JSON.parse(e.localStorage.getItem('adrian_sync_meta_v1')).pending[key],'conflict remains pending');
 let handler;const data={schema:1,revision:1,entries:{}};
 const fakeFs={mkdirSync(){},readFileSync(){return JSON.stringify(data);},appendFileSync(){},existsSync(){return false;},writeFileSync(){},renameSync(){}};
 const ctx={require(n){if(n==='http')return{createServer(fn){handler=fn;return{listen(p,h,f){f();}};}};if(n==='fs')return fakeFs;return require(n);},__dirname:'.',Buffer,URL,console:{log(){}},Date,JSON,Set,Object,Number,String};
 vm.runInNewContext(server,ctx);
 const src=server.slice(server.indexOf('const GUARDED_KEYS='),server.indexOf('const server='));
 const policy=vm.runInNewContext(src+';({isRegression,progressScore})');
 for(const k of ['pizarras_state_v1','adrian_hub_stars_v1','cambridgeB2ExerciseStatsV3'])assert(policy.isRegression(k,{value:'{}'},{deleted:true}),'server critical delete blocked');
 assert(policy.isRegression(key,{value:'{"answers":20}'},{value:'{"answers":10}'}),'Pizarras answer guard');
 assert(policy.isRegression('cambridgeB2ExerciseStatsV3',{value:'{"attempts":[{},{}]}'},{value:'{"attempts":[{}]}'}),'Cambridge schema guard');
 assert(policy.isRegression('adaptive_hoti0108_v1',{value:'{"studyGame":{"attempts":{"a":{"count":4}}}}'},{value:'{"studyGame":{"attempts":{"a":{"count":1}}}}'}),'HOTI nested guard');
 assert(policy.isRegression(key,{value:'{"sessions":2}'},{value:'broken'}),'invalid guarded state rejected');
 assert.equal(policy.isRegression('settings',{value:'a'},{deleted:true}),false,'ordinary settings remain deletable');
 console.log('PASS: sync integrity, schema guards, protected deletes, divergence, recovery, reload writes, offline queue; synthetic storage only');
})().catch(e=>{console.error(e);process.exitCode=1;});