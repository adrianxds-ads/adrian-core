(()=>{
'use strict';
if(window.AdrianSync)return;
const VERSION='1.0.4';
const ENDPOINT='https://adrin.tail8fd071.ts.net/hub-sync';
const META_KEY='adrian_sync_meta_v1';
const DEVICE_KEY='adrian_sync_device_v1';
const RECONCILE_KEY='adrian_sync_reconciled_102';
const nativeSet=Storage.prototype.setItem;
const nativeRemove=Storage.prototype.removeItem;
const nativeClear=Storage.prototype.clear;
let applying=false,flushTimer=0,pullTimer=0,flushing=false;
const dirty=new Map();
const GUARDED_KEYS=new Set(['adaptive_english_campaign1_v1','adaptive_b2_cloze_campaign1_v1','adaptive_verbs_catala_campaign1_v1','adaptive_phrasal_verbs_v1','adaptive_hoti0108_v1','pizarras_state_v1','cambridgeB2ExerciseStatsV3','adrian_hub_stars_v1','adrian_hub_oca_v1','adrian_hub_path_game_v1']);
function progressScore(value,key){
 try{
  const x=JSON.parse(value);if(!x||typeof x!=='object'||Array.isArray(x))return null;
  if(key==='cambridgeB2ExerciseStatsV3')return Array.isArray(x.attempts)?{attempts:x.attempts.length}:null;
  if(key==='adaptive_hoti0108_v1'){const s=x.studyGame;if(!s||typeof s!=='object')return null;return{rounds:(s.roundHistory||[]).length,answers:Object.values(s.attempts||{}).reduce((n,a)=>n+(Number(a.count)||0),0)};}
  return Object.fromEntries(['level','sessions','totalAttempts','answers','studySec','stars','totalGold','turns'].map(k=>[k,Number(x[k])||0]));
 }catch{return null;}
}
function progressRegresses(key,currentValue,incomingValue){
 if(!GUARDED_KEYS.has(key))return false;
 const a=progressScore(currentValue,key),b=progressScore(incomingValue,key);
 if(!a)return false;if(!b)return true;
 return Object.keys(a).some(k=>b[k]<a[k]);
}
function remoteHasMoreProgress(key,remoteValue,localValue){return GUARDED_KEYS.has(key)&&progressRegresses(key,remoteValue,localValue)&&!progressRegresses(key,localValue,remoteValue);}
function preserve(key,value){
 if(value===null||!GUARDED_KEYS.has(key))return true;
 try{let stamp=Date.now();while(localStorage.getItem(key+'_recovery_'+stamp)!==null)stamp++;nativeSet.call(localStorage,key+'_recovery_'+stamp,value);return true;}catch{status('○ conflicto guardado local','conflict');return false;}
}

function eligible(key){
 key=String(key||'');
 if(!key||/^adrian_sync_/i.test(key))return false;
 if(/_recovery_\d+$/i.test(key))return false;
 if(/(?:token|oauth|password|credential|secret|auth_cache)/i.test(key))return false;
 if(key==='cambioActiveV2')return false;
 return true;
}
function uid(){
 let id='';try{id=localStorage.getItem(DEVICE_KEY)||'';}catch{}
 if(!id){id=(crypto.randomUUID?.()||('hub-'+Math.random().toString(36).slice(2)+'-'+Date.now().toString(36)));try{nativeSet.call(localStorage,DEVICE_KEY,id);}catch{}}
 return id;
}
function loadMeta(){
 try{const x=JSON.parse(localStorage.getItem(META_KEY)||'null');if(x&&typeof x==='object')return{revision:Math.max(0,Number(x.revision)||0),times:{...(x.times||{})},deviceId:x.deviceId||uid()};}catch{}
 return{revision:0,times:{},deviceId:uid()};
}
let meta=loadMeta();
try{const saved=JSON.parse(localStorage.getItem(META_KEY)||'{}').pending||{};for(const [k,row] of Object.entries(saved))if(eligible(k)&&row&&typeof row==='object')dirty.set(k,row);}catch{}
function saveMeta(){try{nativeSet.call(localStorage,META_KEY,JSON.stringify({...meta,pending:Object.fromEntries(dirty)}));}catch{}}
function status(text,kind='ok'){
 window.dispatchEvent(new CustomEvent('adrian-sync-status',{detail:{text,kind,revision:meta.revision}}));
 if(!location.pathname.startsWith('/adrian-hub'))return;
 let el=document.getElementById('adrianSyncStatus');
 if(!el){el=document.createElement('div');el.id='adrianSyncStatus';el.style.cssText='position:fixed;right:8px;bottom:8px;z-index:9999;padding:5px 8px;border-radius:999px;background:rgba(9,18,16,.82);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(8px);color:#dce9e2;font:800 9px/1.1 system-ui,sans-serif;letter-spacing:.04em;pointer-events:none;opacity:.86';document.body.appendChild(el);}
 el.textContent=text;el.dataset.kind=kind;
}
function mark(key,value,deleted=false){
 if(!eligible(key)||applying)return;
 const updatedAt=Math.max(Date.now(),(Number(meta.times[key])||0)+1);meta.times[key]=updatedAt;dirty.set(key,{value:deleted?null:String(value),deleted,updatedAt});saveMeta();
 clearTimeout(flushTimer);flushTimer=setTimeout(flush,5000);
}
Storage.prototype.setItem=function(key,value){const r=nativeSet.call(this,key,value);if(this===localStorage)mark(String(key),String(value),false);return r;};
Storage.prototype.removeItem=function(key){const existed=this===localStorage?this.getItem(key)!==null:false;if(this===localStorage&&GUARDED_KEYS.has(String(key))&&!preserve(String(key),this.getItem(key)))return;const r=nativeRemove.call(this,key);if(this===localStorage&&existed)mark(String(key),null,true);return r;};
Storage.prototype.clear=function(){
 if(this!==localStorage)return nativeClear.call(this);
 const keys=[];for(let i=0;i<this.length;i++){const k=this.key(i);if(eligible(k))keys.push(k);}
 for(const k of keys){if(GUARDED_KEYS.has(k)&&!preserve(k,this.getItem(k)))continue;nativeRemove.call(this,k);mark(k,null,true);}return;
};
async function bodyFor(payload){
 const text=JSON.stringify(payload);
 if(text.length>32768&&'CompressionStream'in window){try{const stream=new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));const body=await new Response(stream).arrayBuffer();return{body,headers:{'Content-Type':'application/json','Content-Encoding':'gzip'}};}catch{}}
 return{body:text,headers:{'Content-Type':'application/json'}};
}
async function flush(){
 clearTimeout(flushTimer);flushTimer=0;if(!dirty.size)return true;if(flushing)return false;flushing=true;
 const changes=Object.fromEntries(dirty),sentKeys=Object.keys(changes);status('☁ guardando…','busy');
 try{
  const enc=await bodyFor({deviceId:meta.deviceId,changes});
  const r=await fetch(ENDPOINT+'/sync',{method:'POST',mode:'cors',cache:'no-store',targetAddressSpace:'local',headers:enc.headers,body:enc.body});if(!r.ok)throw new Error('HTTP '+r.status);
  const x=await r.json();
  const acknowledged=Array.isArray(x.acceptedKeys)?x.acceptedKeys:(Number(x.accepted)===sentKeys.length?sentKeys:[]);
  for(const k of acknowledged){if(dirty.get(k)===changes[k])dirty.delete(k);}
  const accepted=Number(x.accepted),needsReconcile=Number.isFinite(accepted)&&accepted<sentKeys.length;
  if(needsReconcile){meta.revision=0;saveMeta();const reconciled=await pull(false);if(!reconciled)throw new Error('reconcile-failed');status('☁ sincronizado','ok');return true;}
  meta.revision=Math.max(meta.revision,Number(x.revision)||0);saveMeta();status('☁ sincronizado','ok');return true;
 }catch(e){status('○ guardado local','offline');clearTimeout(flushTimer);flushTimer=setTimeout(flush,30000);return false;}finally{flushing=false;saveMeta();}
}
async function pull(initial=false){
 clearTimeout(pullTimer);pullTimer=0;status('☁ sincronizando…','busy');
 try{
  const before=new Map();if(initial){for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(eligible(k))before.set(k,localStorage.getItem(k));}}
  const full=initial&&!localStorage.getItem(RECONCILE_KEY),since=full?0:meta.revision;const r=await fetch(ENDPOINT+'/changes?since='+encodeURIComponent(since),{mode:'cors',cache:'no-store',targetAddressSpace:'local'});if(!r.ok)throw new Error('HTTP '+r.status);
  const x=await r.json(),entries=x.entries||{};let changed=false;
  applying=true;
  try{
   for(const [k,row] of Object.entries(entries)){
    if(!eligible(k)||!row)continue;
    if(row.deleted&&GUARDED_KEYS.has(k))continue;
    const remoteTime=Number(row.updatedAt)||0,localTime=Number(meta.times[k])||0;
    const current=localStorage.getItem(k),forceRemote=!row.deleted&&typeof row.value==='string'&&remoteHasMoreProgress(k,row.value,current);
    if((remoteTime<localTime&&!forceRemote)||(!row.deleted&&current!==null&&progressRegresses(k,current,row.value)&&!forceRemote)){if(current!==null)dirty.set(k,{value:current,deleted:false,updatedAt:localTime||Date.now()});continue;}
    if(row.deleted){if(current!==null){nativeRemove.call(localStorage,k);changed=true;}}
    else if(typeof row.value==='string'&&current!==row.value){if(!preserve(k,current))continue;nativeSet.call(localStorage,k,row.value);changed=true;}
    if(dirty.has(k)&&dirty.get(k).value!==localStorage.getItem(k))dirty.delete(k);
    meta.times[k]=remoteTime;
   }
  }finally{applying=false;}
  if(dirty.size&&!flushTimer)flushTimer=setTimeout(flush,5000);if(full)try{nativeSet.call(localStorage,RECONCILE_KEY,'1');}catch{}
  meta.revision=Math.max(meta.revision,Number(x.revision)||0);saveMeta();
  if(initial){for(const [k,v] of before){if(!(k in entries)&&!meta.times[k])mark(k,v,false);}}
  status('☁ sincronizado','ok');
  if(changed){window.dispatchEvent(new CustomEvent('adrian-sync-updated',{detail:{initial,revision:meta.revision,keys:Object.keys(entries)}}));if(initial&&!sessionStorage.getItem('adrian_sync_reload_v2')){sessionStorage.setItem('adrian_sync_reload_v2','1');saveMeta();location.reload();}}
  return true;
 }catch(e){status('○ guardado local','offline');clearTimeout(flushTimer);flushTimer=setTimeout(flush,30000);return false;}
 finally{pullTimer=setTimeout(()=>pull(false),30000);}
}
window.addEventListener('storage',e=>{if(e.storageArea===localStorage&&eligible(e.key))mark(e.key,e.newValue,e.newValue===null);});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pull(false);else flush();});
window.addEventListener('pagehide',()=>{flush();});
window.AdrianSync=Object.freeze({version:VERSION,pull,flush,status,endpoint:ENDPOINT,deviceId:meta.deviceId});
if(dirty.size)flushTimer=setTimeout(flush,5000);
setTimeout(()=>pull(true),0);
})();


