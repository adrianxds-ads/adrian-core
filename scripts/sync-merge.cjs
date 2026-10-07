'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),zlib=require('node:zlib');
const root=path.join(__dirname,'..'),client=fs.readFileSync(path.join(root,'components/adrian-sync.js'),'utf8');
const policy=require(path.join(root,'../adrian-sync-server/merge-policy.js'));
const cam='cambridgeB2ExerciseStatsV3',attempt=(id,n=1)=>({id,exerciseId:'exam-11-part-2',correct:n,total:8,completedAt:'2026-10-07T00:00:00.000Z',items:[{correct:true}]}),state=(...rows)=>JSON.stringify({attempts:rows});
const a=state(attempt('a')),b=state(attempt('b')),c=state(attempt('c')),ids=s=>JSON.parse(s).attempts.map(x=>x.id);
assert.deepEqual(ids(policy.mergePair(cam,a,b)),['a','b']);
assert.equal(policy.mergePair(cam,a,b),policy.mergePair(cam,b,a),'Cambridge pair merge is commutative');
assert.equal(policy.mergePair(cam,policy.mergePair(cam,a,b),c),policy.mergePair(cam,a,policy.mergePair(cam,b,c)),'Cambridge pair merge is associative');
assert.equal(policy.mergePair(cam,policy.mergePair(cam,a,b),policy.mergePair(cam,a,b)),policy.mergePair(cam,a,b),'Cambridge pair merge is idempotent');
assert.equal(policy.mergePair(cam,a,state(attempt('a',2))),null,'same immutable id with different result remains conflict');

function env(seed={},getResponse={entries:{},revision:1},postResponse={accepted:1,acceptedKeys:[],mergedKeys:[],conflictKeys:[],revision:2}){
 class Storage{constructor(x={}){this.data=new Map(Object.entries(x));}get length(){return this.data.size;}key(i){return [...this.data.keys()][i]??null;}getItem(k){return this.data.get(String(k))??null;}setItem(k,v){this.data.set(String(k),String(v));}removeItem(k){this.data.delete(String(k));}clear(){this.data.clear();}}
 const localStorage=new Storage(seed),sessionStorage=new Storage(),calls=[],events={};
 const context={Storage,localStorage,sessionStorage,Map,Set,Date,Math,JSON,Object,Number,String,Uint8Array,Blob,Response,crypto:{randomUUID:()=> 'test-device'},atob:s=>Buffer.from(s,'base64').toString('binary'),pako:{ungzip(bytes,opt){const out=zlib.gunzipSync(Buffer.from(bytes));return opt&&opt.to==='string'?out.toString('utf8'):new Uint8Array(out);}},setTimeout:()=>1,clearTimeout(){},CustomEvent:class{constructor(n,x){this.type=n;this.detail=x.detail;}},location:{pathname:'/test',reload(){}},document:{addEventListener(){},visibilityState:'hidden'},window:{pako:null,addEventListener(n,f){events[n]=f;},dispatchEvent(){}},async fetch(url,opts){calls.push({url,opts});return{ok:true,json:async()=>opts?.method==='POST'?postResponse:getResponse};}};
 context.window.pako=context.pako;vm.runInNewContext(client,context);return{context,localStorage,calls};
}
(async()=>{
 const key='adrian_hub_stars_v1',base={version:2,apps:{english:4,'phrasal-verbs':1},stars:1,totalGold:5,progress:0,step:5,updatedAt:100},baseValue=JSON.stringify(base);
 let remote={entries:{[key]:{value:baseValue,deleted:false,updatedAt:100,revision:10,deviceId:'seed'}},revision:10};
 let post={accepted:0,acceptedKeys:[],mergedKeys:[key],conflictKeys:[],revision:12};
 const e=env({[key]:baseValue},remote,post);
 await e.context.window.AdrianSync.pull(true);
 let meta=JSON.parse(e.localStorage.getItem('adrian_sync_meta_v1'));assert.equal(meta.baseRevisions[key],10,'initial full pull seeds per-key base revision');
 const local={...base,apps:{...base.apps,english:5},totalGold:6,stars:1,progress:1,updatedAt:200};e.localStorage.setItem(key,JSON.stringify(local));
 meta=JSON.parse(e.localStorage.getItem('adrian_sync_meta_v1'));assert.equal(meta.pending[key].baseRevision,10,'local edit keeps common ancestor revision');
 const merged={...base,apps:{english:5,'phrasal-verbs':3},totalGold:8,stars:1,progress:3,updatedAt:300};
 remote={entries:{[key]:{value:JSON.stringify(merged),deleted:false,updatedAt:300,revision:12,deviceId:'server'}},revision:12};
 e.context.fetch=async(url,opts)=>{e.calls.push({url,opts});return{ok:true,json:async()=>opts?.method==='POST'?post:remote};};
 assert.equal(await e.context.window.AdrianSync.flush(),true,'server-merged payload reconciles in same flush');
 const sent=e.calls.find(x=>x.opts?.method==='POST');assert(sent,'POST emitted');assert.equal(JSON.parse(sent.opts.body).changes[key].baseRevision,10,'wire payload carries baseRevision');
 assert.deepEqual(JSON.parse(e.localStorage.getItem(key)).apps,merged.apps,'client adopts canonical merged server value');
 meta=JSON.parse(e.localStorage.getItem('adrian_sync_meta_v1'));assert.equal(meta.baseRevisions[key],12);assert(!meta.pending[key],'merged key is cleared only after canonical pull');
 const compressed='ADRIAN:GZIP:1:'+zlib.gzipSync(Buffer.from(baseValue)).toString('base64');
 const f=env({[key]:baseValue},{entries:{[key]:{value:compressed,deleted:false,updatedAt:400,revision:20}},revision:20});
 await f.context.window.AdrianSync.pull(true);assert.deepEqual(JSON.parse(f.localStorage.getItem(key)).apps,base.apps,'compressed server value compares as the same logical state');
 assert.equal(JSON.parse(f.localStorage.getItem('adrian_sync_meta_v1')).baseRevisions[key],20);
 console.log('PASS Sync 1.0.7 merge client: Cambridge algebra, baseRevision wire contract, merged-result adoption, compressed-state normalization');
})().catch(e=>{console.error(e);process.exitCode=1;});
