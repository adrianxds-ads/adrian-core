(()=>{
'use strict';
if(window.AdrianSync)return;
const VERSION='1.0.2';
const ENDPOINT='https://adrin.tail8fd071.ts.net/hub-sync';
const META_KEY='adrian_sync_meta_v1';
const DEVICE_KEY='adrian_sync_device_v1';
const RECONCILE_KEY='adrian_sync_reconciled_102';
const nativeSet=Storage.prototype.setItem;
const nativeRemove=Storage.prototype.removeItem;
const nativeClear=Storage.prototype.clear;
let applying=false,freezeWrites=false,flushTimer=0,pullTimer=0;
const dirty=new Map();
const GUARDED_KEYS=new Set(['adaptive_english_campaign1_v1','adaptive_b2_cloze_campaign1_v1','adaptive_verbs_catala_campaign1_v1','adaptive_phrasal_verbs_v1','adaptive_hoti0108_v1','pizarras_state_v1','cambridgeB2ExerciseStatsV3']);
function progressScore(value){try{const x=JSON.parse(value||'{}');return{level:Number(x.level)||0,sessions:Number(x.sessions)||0,attempts:Number(x.totalAttempts)||0};}catch{return null;}}
function remoteHasMoreProgress(key,remoteValue,localValue){if(!GUARDED_KEYS.has(key))return false;const r=progressScore(remoteValue),l=progressScore(localValue);if(!r||!l)return false;return r.level>l.level||r.sessions>l.sessions||r.attempts>l.attempts;}

function eligible(key){
 key=String(key||'');
 if(!key||key===META_KEY||key===DEVICE_KEY)return false;
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
function saveMeta(){try{nativeSet.call(localStorage,META_KEY,JSON.stringify(meta));}catch{}}
function status(text,kind='ok'){
 window.dispatchEvent(new CustomEvent('adrian-sync-status',{detail:{text,kind,revision:meta.revision}}));
 if(!location.pathname.startsWith('/adrian-hub'))return;
 let el=document.getElementById('adrianSyncStatus');
 if(!el){el=document.createElement('div');el.id='adrianSyncStatus';el.style.cssText='position:fixed;right:8px;bottom:8px;z-index:9999;padding:5px 8px;border-radius:999px;background:rgba(9,18,16,.82);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(8px);color:#dce9e2;font:800 9px/1.1 system-ui,sans-serif;letter-spacing:.04em;pointer-events:none;opacity:.86';document.body.appendChild(el);}
 el.textContent=text;el.dataset.kind=kind;
}
function mark(key,value,deleted=false){
 if(!eligible(key)||applying)return;
 const updatedAt=Date.now();meta.times[key]=updatedAt;dirty.set(key,{value:deleted?null:String(value),deleted,updatedAt});saveMeta();
 clearTimeout(flushTimer);flushTimer=setTimeout(flush,5000);
}
Storage.prototype.setItem=function(key,value){if(this===localStorage&&freezeWrites&&eligible(key))return;const r=nativeSet.call(this,key,value);if(this===localStorage)mark(String(key),String(value),false);return r;};
Storage.prototype.removeItem=function(key){if(this===localStorage&&freezeWrites&&eligible(key))return;const existed=this===localStorage?this.getItem(key)!==null:false;const r=nativeRemove.call(this,key);if(this===localStorage&&existed)mark(String(key),null,true);return r;};
Storage.prototype.clear=function(){
 if(this!==localStorage)return nativeClear.call(this);if(freezeWrites)return;
 const keys=[];for(let i=0;i<this.length;i++){const k=this.key(i);if(eligible(k))keys.push(k);}
 const r=nativeClear.call(this);for(const k of keys)mark(k,null,true);return r;
};
async function bodyFor(payload){
 const text=JSON.stringify(payload);
 if(text.length>32768&&'CompressionStream'in window){try{const stream=new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));const body=await new Response(stream).arrayBuffer();return{body,headers:{'Content-Type':'application/json','Content-Encoding':'gzip'}};}catch{}}
 return{body:text,headers:{'Content-Type':'application/json'}};
}
async function flush(){
 clearTimeout(flushTimer);flushTimer=0;if(!dirty.size)return true;
 const changes=Object.fromEntries(dirty);status('Ã¢ËœÂ guardandoÃ¢â‚¬Â¦','busy');
 try{
  const enc=await bodyFor({deviceId:meta.deviceId,changes});
  const r=await fetch(ENDPOINT+'/sync',{method:'POST',mode:'cors',cache:'no-store',targetAddressSpace:'local',headers:enc.headers,body:enc.body});if(!r.ok)throw new Error('HTTP '+r.status);
  const x=await r.json();for(const k of Object.keys(changes)){const cur=dirty.get(k);if(cur&&cur.updatedAt===changes[k].updatedAt)dirty.delete(k);}meta.revision=Math.max(meta.revision,Number(x.revision)||0);saveMeta();status('Ã¢ËœÂ sincronizado','ok');return true;
 }catch(e){status('Ã¢â€”â€¹ guardado local','offline');clearTimeout(flushTimer);flushTimer=setTimeout(flush,30000);return false;}
}
async function pull(initial=false){
 clearTimeout(pullTimer);pullTimer=0;status('Ã¢ËœÂ sincronizandoÃ¢â‚¬Â¦','busy');
 try{
  const before=new Map();if(initial){for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(eligible(k))before.set(k,localStorage.getItem(k));}}
  const full=initial&&!localStorage.getItem(RECONCILE_KEY),since=full?0:meta.revision;const r=await fetch(ENDPOINT+'/changes?since='+encodeURIComponent(since),{mode:'cors',cache:'no-store',targetAddressSpace:'local'});if(!r.ok)throw new Error('HTTP '+r.status);
  const x=await r.json(),entries=x.entries||{};let changed=false;
  applying=true;
  try{
   for(const [k,row] of Object.entries(entries)){
    if(!eligible(k)||!row)continue;
    const remoteTime=Number(row.updatedAt)||0,localTime=Number(meta.times[k])||0;
    const current=localStorage.getItem(k),forceRemote=!row.deleted&&typeof row.value==='string'&&remoteHasMoreProgress(k,row.value,current);
    if(remoteTime<localTime&&!forceRemote){if(initial&&current!==null)dirty.set(k,{value:current,deleted:false,updatedAt:localTime||Date.now()});continue;}
    if(row.deleted){if(current!==null){nativeRemove.call(localStorage,k);changed=true;}}
    else if(typeof row.value==='string'&&current!==row.value){nativeSet.call(localStorage,k,row.value);changed=true;}
    meta.times[k]=Math.max(localTime,remoteTime);
   }
  }finally{applying=false;}
  if(dirty.size&&!flushTimer)flushTimer=setTimeout(flush,5000);if(full)try{nativeSet.call(localStorage,RECONCILE_KEY,'1');}catch{}
  meta.revision=Math.max(meta.revision,Number(x.revision)||0);saveMeta();
  if(initial){for(const [k,v] of before){if(!(k in entries)&&!meta.times[k])mark(k,v,false);}}
  status('Ã¢ËœÂ sincronizado','ok');
  if(changed){window.dispatchEvent(new CustomEvent('adrian-sync-updated',{detail:{initial,revision:meta.revision,keys:Object.keys(entries)}}));if(initial&&!sessionStorage.getItem('adrian_sync_reload_v2')){sessionStorage.setItem('adrian_sync_reload_v2','1');freezeWrites=true;location.reload();}}
  return true;
 }catch(e){status('Ã¢â€”â€¹ guardado local','offline');return false;}
 finally{pullTimer=setTimeout(()=>pull(false),30000);}
}
window.addEventListener('storage',e=>{if(e.storageArea===localStorage&&eligible(e.key))mark(e.key,e.newValue,e.newValue===null);});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pull(false);else flush();});
window.addEventListener('pagehide',()=>{flush();});
window.AdrianSync=Object.freeze({version:VERSION,pull,flush,status,endpoint:ENDPOINT,deviceId:meta.deviceId});
setTimeout(()=>pull(true),0);
})();



