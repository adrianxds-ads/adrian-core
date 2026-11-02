(()=>{
'use strict';
if(window.AdrianSync)return;
const VERSION='1.0.16';
// Localhost, file previews and QA origins never participate in the official campaign.
// This must run before patching localStorage or scheduling any remote request.
if(location.origin!=='https://adrianxds-ads.github.io'){
 window.AdrianSync=Object.freeze({version:VERSION,mode:'isolated-preview',baselineChecked:()=>true,
  pull:async()=>false,flush:async()=>true,recover:async()=>({restored:0,protected:0}),
  status:()=>{},deviceId:'isolated-preview'});
 return;
}
const ENDPOINT='https://adrin.tail8fd071.ts.net/hub-sync';
const META_KEY='adrian_sync_meta_v1';
const DEVICE_KEY='adrian_sync_device_v1';
const RECONCILE_KEY='adrian_sync_reconciled_102';
const BASELINE_KEY='adrian_sync_baselines_107';
const STORED_PREFIX='ADRIAN:GZIP:1:';
// A quiz only owns its own campaign. A pending Grammar save must not be
// retransmitted by Cloze (all apps share this origin's localStorage).
const APP_OWNER=location.pathname.startsWith('/adaptive-english/')?'adaptive_english_campaign1_v1':
 location.pathname.startsWith('/b2-multiple-choice-cloze/')?'adaptive_b2_cloze_campaign1_v1':
 location.pathname.startsWith('/adaptive-phrasal-verbs/')?'adaptive_phrasal_verbs_v1':
 location.pathname.startsWith('/adaptive-pizarras/')?'classroom_b2_state_v3':
 location.pathname.startsWith('/adaptive-verbs-catala/')?'adaptive_verbs_catala_campaign1_v1':null;
const CAMPAIGN_KEYS=new Set(['adaptive_english_campaign1_v1','adaptive_b2_cloze_campaign1_v1','adaptive_phrasal_verbs_v1','classroom_b2_state_v3','adaptive_verbs_catala_campaign1_v1']);
const nativeSet=Storage.prototype.setItem;
const nativeRemove=Storage.prototype.removeItem;
const nativeClear=Storage.prototype.clear;
let applying=false,flushTimer=0,pullTimer=0,flushing=false,baselineReady=false;
const dirty=new Map();
const serverMerged=new Set();
const GUARDED_KEYS=new Set(['adaptive_english_campaign1_v1','adaptive_b2_cloze_campaign1_v1','adaptive_verbs_catala_campaign1_v1','adaptive_phrasal_verbs_v1','classroom_b2_state_v3','adaptive_hoti0108_v1','pizarras_state_v1','cambridgeB2ExerciseStatsV3','adrian_hub_stars_v1','adrian_hub_oca_v1','adrian_hub_path_game_v1','keywordSpeakingStatsV1']);
// Explicit recovery only: restore study data, never general settings, credentials or unrelated applications.
const RECOVERY_KEY=/^(?:adaptive_|pizarras_state_v1$|classroom_b2_state_v3$|cambridgeB2ExerciseStatsV3$|keywordSpeakingStatsV1$|b2_mcc_state_v1$|adrian_hub_(?:stars|oca|path_game)|adrian_language_game_v1$|adrian_github_garden_v1$|adrianEasyCatalanTaskSessionsV1$)/;
function recoveryDominates(key,remote,local){
 if(remoteHasMoreProgress(key,remote,local))return true;
 if(/^adaptive_(?:english|b2_cloze|verbs_catala)_global_level_v1$/.test(key)){
  const a=Number(remote),b=Number(local);
  return remote!==null&&local!==null&&Number.isSafeInteger(a)&&Number.isSafeInteger(b)&&a>b;
 }
 if(!['b2_mcc_state_v1','adrian_language_game_v1'].includes(key))return false;
 try{
  const a=JSON.parse(decodeStored(remote)),b=JSON.parse(decodeStored(local));
  if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;
  const fields=['level','sessions','totalAttempts'],arrays=['history','sessionHistory'];
  const left=[...fields.map(x=>Number(a[x])||0),...arrays.map(x=>Array.isArray(a[x])?a[x].length:0)];
  const right=[...fields.map(x=>Number(b[x])||0),...arrays.map(x=>Array.isArray(b[x])?b[x].length:0)];
  return left.every((n,i)=>n>=right[i])&&left.some((n,i)=>n>right[i]);
 }catch{return false;}
}
// Only immutable, identified Cambridge attempts can be joined without inventing counters.
function mergeProgress(key,left,right){
 if(key!=='cambridgeB2ExerciseStatsV3')return null;
 function canonical(x){if(Array.isArray(x))return JSON.stringify(x.map(v=>JSON.parse(canonical(v))));if(x&&typeof x==='object')return JSON.stringify(Object.fromEntries(Object.keys(x).sort().map(k=>[k,JSON.parse(canonical(x[k]))])));return JSON.stringify(x);}
 try{
  const a=JSON.parse(decodeStored(left)),b=JSON.parse(decodeStored(right));
  if(!a||!b||Array.isArray(a)||Array.isArray(b)||!Array.isArray(a.attempts)||!Array.isArray(b.attempts))return null;
  const extras=x=>Object.fromEntries(Object.entries(x).filter(([k])=>k!=='attempts'));
  if(canonical(extras(a))!==canonical(extras(b)))return null;
  const rows=new Map();
  for(const row of [...a.attempts,...b.attempts]){
   if(!row||typeof row.id!=='string'||!row.id||typeof row.exerciseId!=='string'||!Number.isFinite(row.correct)||!Number.isFinite(row.total)||row.total<=0||row.correct<0||row.correct>row.total||typeof row.completedAt!=='string'||!Number.isFinite(Date.parse(row.completedAt)))return null;
   const old=rows.get(row.id);if(old&&canonical(old)!==canonical(row))return null;
   rows.set(row.id,row);
  }
  const attempts=[...rows.values()].sort((x,y)=>Date.parse(x.completedAt)-Date.parse(y.completedAt)||(x.id<y.id?-1:x.id>y.id?1:0));
  return canonical({...extras(a),attempts});
 }catch{return null;}
}
function decodeStored(value){
 if(typeof value!=='string'||!value.startsWith(STORED_PREFIX))return value;
 try{if(!window.pako)return value;return pako.ungzip(Uint8Array.from(atob(value.slice(STORED_PREFIX.length)),c=>c.charCodeAt(0)),{to:'string'});}catch{return value;}
}
function sameStored(a,b){return decodeStored(a)===decodeStored(b);}
function progressScore(value,key){
 try{
  const x=JSON.parse(decodeStored(value));if(!x||typeof x!=='object'||Array.isArray(x))return null;
  if(key==='cambridgeB2ExerciseStatsV3')return Array.isArray(x.attempts)?{attempts:x.attempts.length}:null;
  if(key==='keywordSpeakingStatsV1'){const sessions=Array.isArray(x.sessions)?x.sessions:[],items=x.items&&typeof x.items==='object'?Object.values(x.items):[];return{sessions:sessions.length,attempts:items.reduce((n,a)=>n+(Number(a?.attempts)||0),0),points:items.reduce((n,a)=>n+(Number(a?.points)||0),0),durationSec:sessions.reduce((n,a)=>n+(Number(a?.durationSec)||0),0)};}
  if(key==='adaptive_hoti0108_v1'){const s=x.studyGame;if(!s||typeof s!=='object')return null;return{rounds:(s.roundHistory||[]).length,answers:Object.values(s.attempts||{}).reduce((n,a)=>n+(Number(a.count)||0),0)};}
  // Never mistake legacy adaptive difficulty or level for completed study progress.
  if(['adaptive_english_campaign1_v1','adaptive_b2_cloze_campaign1_v1','adaptive_verbs_catala_campaign1_v1'].includes(key))return{sessions:Number(x.sessions)||0,totalAttempts:Number(x.totalAttempts)||0};
  if(key==='adaptive_phrasal_verbs_v1')return{sessions:Number(x.sessions)||0,answers:Number(x.answers)||0,studySec:Number(x.studySec)||0};
  // Classroom v3 uses IndexedDB-backed virtual localStorage: compare actual study evidence.
  if(key==='classroom_b2_state_v3')return{sessions:Number(x.sessions)||0,answers:Number(x.answers)||0,classSessions:Number(x.classSessions)||0,quickSessions:Number(x.quickSessions)||0};
  return Object.fromEntries(['level','sessions','totalAttempts','answers','studySec','stars','totalGold','turns'].map(k=>[k,Number(x[k])||0]));
 }catch{return null;}
}
function progressRegresses(key,currentValue,incomingValue){
 if(!GUARDED_KEYS.has(key))return false;
 const a=progressScore(currentValue,key),b=progressScore(incomingValue,key);
 if(!a)return false;if(!b)return true;
 return Object.keys(a).some(k=>b[k]<a[k]);
}
// One-time cleanup of the pre-fix residual queue only. Future legitimate offline
// sessions must never be dropped merely because the difference is 1-2 rounds.
function tinyResidual(key,localValue,remoteValue,remoteRevision){
 if(!['adaptive_english_campaign1_v1','adaptive_b2_cloze_campaign1_v1','adaptive_phrasal_verbs_v1'].includes(key))return false;
 const pending=dirty.get(key);
 const cutoff=Date.parse('2026-10-31T21:42:00Z');
 if(!pending||!Number(pending.baseRevision)||Number(pending.baseRevision)>=Number(remoteRevision)||
    !Number.isFinite(Number(pending.updatedAt))||Number(pending.updatedAt)>cutoff)return false;
 const local=progressScore(localValue,key),remote=progressScore(remoteValue,key);
 if(!local||!remote||!Number.isSafeInteger(local.sessions)||!Number.isSafeInteger(remote.sessions)||remote.sessions<=0)return false;
 const field=key==='adaptive_phrasal_verbs_v1'?'answers':'totalAttempts';
 return local.sessions>=remote.sessions&&local.sessions-remote.sessions<=2&&
   Number.isSafeInteger(local[field])&&Number.isSafeInteger(remote[field])&&
   local[field]>=remote[field]&&local[field]-remote[field]<=30;
}
function remoteHasMoreProgress(key,remoteValue,localValue){
 if(GUARDED_KEYS.has(key)&&progressRegresses(key,remoteValue,localValue)&&!progressRegresses(key,localValue,remoteValue))return true;
 // Preserve the legacy Catalan difficulty when both snapshots contain zero completed sessions.
 if(key==='adaptive_verbs_catala_campaign1_v1')try{const a=JSON.parse(decodeStored(remoteValue)),b=JSON.parse(decodeStored(localValue));return Number(a.sessions)===0&&Number(b.sessions)===0&&Number(a.totalAttempts)===0&&Number(b.totalAttempts)===0&&Number(a.level)>Number(b.level);}catch{}
 return false;
}
function encodeRecoveryCopy(value){
 if(typeof value!=='string'||value.length<32768||!window.pako)return value;
 try{
  const bytes=pako.gzip(value),parts=[];
  for(let i=0;i<bytes.length;i+=8192)parts.push(String.fromCharCode(...bytes.subarray(i,i+8192)));
  return STORED_PREFIX+btoa(parts.join(''));
 }catch{return value;}
}
function preserve(key,value){
 if(value===null||!GUARDED_KEYS.has(key))return true;
 try{
  let stamp=Date.now();while(localStorage.getItem(key+'_recovery_'+stamp)!==null)stamp++;
  // Recovery copies are stored under distinct keys; compress them without changing the original.
  nativeSet.call(localStorage,key+'_recovery_'+stamp,encodeRecoveryCopy(value));return true;
 }catch{status('○ conflicto guardado local','conflict');return false;}
}

function eligible(key){
 key=String(key||'');
 if(!key||/^adrian_sync_/i.test(key))return false;
 if(/_recovery_\d+$/i.test(key))return false;
 if(/(?:token|oauth|password|credential|secret|auth_cache)/i.test(key))return false;
 if(key==='cambioActiveV2')return false;
 return true;
}
function inScope(key){
 return eligible(key)&&(!APP_OWNER||!CAMPAIGN_KEYS.has(key)||key===APP_OWNER);
}
function uid(){
 let id='';try{id=localStorage.getItem(DEVICE_KEY)||'';}catch{}
 if(!id){id=(crypto.randomUUID?.()||('hub-'+Math.random().toString(36).slice(2)+'-'+Date.now().toString(36)));try{nativeSet.call(localStorage,DEVICE_KEY,id);}catch{}}
 return id;
}
function loadMeta(){
 try{const x=JSON.parse(localStorage.getItem(META_KEY)||'null');if(x&&typeof x==='object')return{revision:Math.max(0,Number(x.revision)||0),times:{...(x.times||{})},baseRevisions:{...(x.baseRevisions||{})},deviceId:x.deviceId||uid()};}catch{}
 return{revision:0,times:{},baseRevisions:{},deviceId:uid()};
}
let meta=loadMeta();
try{const saved=JSON.parse(localStorage.getItem(META_KEY)||'{}').pending||{};for(const [k,row] of Object.entries(saved))if(eligible(k)&&row&&typeof row==='object')dirty.set(k,{...row,baseRevision:Math.max(0,Number(row.baseRevision)||0)});}catch{}
function saveMeta(){try{
 const existing=JSON.parse(localStorage.getItem(META_KEY)||'{}');
 // Shared origin, shared metadata: preserve other apps' queues when saving.
 // Never overwrite Grammar's pending record from an open Cloze tab.
 const other=Object.fromEntries(Object.entries(existing?.pending||{}).filter(([k])=>eligible(k)&&!inScope(k)));
 const own=Object.fromEntries([...dirty].filter(([k])=>inScope(k)));
 nativeSet.call(localStorage,META_KEY,JSON.stringify({...meta,pending:{...other,...own}}));
}catch{}}
function status(text,kind='ok'){
 window.dispatchEvent(new CustomEvent('adrian-sync-status',{detail:{text,kind,revision:meta.revision}}));
 const hub=location.pathname.startsWith('/adrian-hub');
 // Quiz status is diagnostic only, including offline, conflict and blocked states.
 // Keep emitting events and retrying saves without creating an overlay in games.
 if(!hub){document.getElementById('adrianSyncStatus')?.remove();return;}
 if(!document.body){document.addEventListener('DOMContentLoaded',()=>status(text,kind),{once:true});return;}
 let el=document.getElementById('adrianSyncStatus');
 if(!el){el=document.createElement('div');el.id='adrianSyncStatus';el.style.cssText='position:fixed;right:8px;bottom:8px;z-index:9999;padding:5px 8px;border-radius:999px;background:rgba(9,18,16,.94);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(8px);color:#dce9e2;font:800 9px/1.1 system-ui,sans-serif;letter-spacing:.04em;pointer-events:none;opacity:.86';document.body.appendChild(el);}
 el.textContent=text;el.dataset.kind=kind;
}
function mark(key,value,deleted=false){
 if(!inScope(key)||applying)return;
 const updatedAt=Math.max(Date.now(),(Number(meta.times[key])||0)+1),old=dirty.get(key),baseRevision=old?Math.max(0,Number(old.baseRevision)||0):Math.max(0,Number(meta.baseRevisions[key])||0);
 // A rejected branch stays local until a NEW completed session is recorded.
 // Editing an answer or reloading the same snapshot must not restart the loop.
 const prior=old?.held?progressScore(old.value,key):null,now=old?.held?progressScore(String(value),key):null;
 const newSession=!!(prior&&now&&Number(now.sessions)>Number(old.heldSessions??prior.sessions));
 const held=!!old?.held&&!deleted&&!newSession;
 meta.times[key]=updatedAt;
 dirty.set(key,{value:deleted?null:String(value),deleted,updatedAt,baseRevision,...(held?{held:true,heldSessions:Number(old.heldSessions??prior?.sessions??0)}:{})});saveMeta();
 if(held)return;
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
 clearTimeout(flushTimer);flushTimer=0;if(!dirty.size)return true;if(flushing)return false;
 // Never upload a fresh/blank study record before the remote baseline has been checked.
 if(!baselineReady&&[...dirty.keys()].some(k=>inScope(k)&&GUARDED_KEYS.has(k))){
   const ready=await pull(true);
   if(!ready||!baselineReady){clearTimeout(flushTimer);flushTimer=setTimeout(flush,30000);return false;}
   if(!dirty.size)return true;
 }
 const sentRows=new Map([...dirty].filter(([k,row])=>inScope(k)&&!row.held));
 if(!sentRows.size){status('○ progreso guardado en este dispositivo','local');return false;}
 flushing=true;
 const changes=Object.fromEntries(sentRows),sentKeys=Object.keys(changes);status('☁ guardando…','busy');
 try{
  const enc=await bodyFor({deviceId:meta.deviceId,changes});
  const r=await fetch(ENDPOINT+'/sync',{method:'POST',mode:'cors',cache:'no-store',targetAddressSpace:'local',headers:enc.headers,body:enc.body});if(!r.ok)throw new Error('HTTP '+r.status);
  const x=await r.json(),revision=Math.max(0,Number(x.revision)||0);
  const acknowledged=Array.isArray(x.acceptedKeys)?x.acceptedKeys:(Number(x.accepted)===sentKeys.length?sentKeys:[]);
  for(const k of acknowledged)if(dirty.get(k)===sentRows.get(k)){dirty.delete(k);serverMerged.delete(k);if(GUARDED_KEYS.has(k)&&revision)meta.baseRevisions[k]=revision;}
  for(const k of (Array.isArray(x.mergedKeys)?x.mergedKeys:[]))if(dirty.get(k)===sentRows.get(k))serverMerged.add(k);
  const accepted=Number(x.accepted),needsReconcile=(Number.isFinite(accepted)&&accepted<sentKeys.length)||(Array.isArray(x.mergedKeys)&&x.mergedKeys.length>0)||(Array.isArray(x.conflictKeys)&&x.conflictKeys.length>0);
  if(needsReconcile){
    meta.revision=0;saveMeta();const reconciled=await pull(false);
    if(!reconciled)throw new Error('reconcile-failed');
    // A key still rejected after reconciliation is held *inside its existing
    // pending metadata*, not repeatedly uploaded or copied to ghost saves.
    const rejected=new Set(Array.isArray(x.conflictKeys)?x.conflictKeys:[]);
    for(const k of rejected){
      const row=dirty.get(k),was=sentRows.get(k);
      if(!row||!was||row.held)continue;
      if(Number(row.baseRevision)!==Number(was.baseRevision))continue; // a genuine rebase deserves one retry
      const snapshot=progressScore(row.value,k);
      dirty.set(k,{...row,held:true,heldSessions:Number(snapshot?.sessions)||0});
    }
    saveMeta();
    if([...dirty].some(([k,row])=>inScope(k)&&!row.held)){
      status('○ sincronización pendiente; progreso local conservado','local');
      clearTimeout(flushTimer);flushTimer=setTimeout(flush,30000);return false;
    }
    status(dirty.size?'○ progreso guardado en este dispositivo':'☁ sincronizado',dirty.size?'local':'ok');return !dirty.size;
  }
  meta.revision=Math.max(meta.revision,revision);saveMeta();status('☁ sincronizado','ok');return true;
 }catch(e){status('○ guardado local','offline');clearTimeout(flushTimer);flushTimer=setTimeout(flush,30000);return false;}finally{flushing=false;saveMeta();}
}
async function pull(initial=false,recover=false){
 clearTimeout(pullTimer);pullTimer=0;status('☁ sincronizando…','busy');
 try{
  const before=new Map();if(initial){for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(inScope(k))before.set(k,localStorage.getItem(k));}
    // Classroom v3 lives in IndexedDB and is intentionally absent from localStorage enumeration.
    // Include its virtual value in baseline discovery so a real saved state can sync once.
    const classroom=window.ClassroomProgress?.getItem?.();
    if(classroom!==null&&classroom!==undefined)before.set('classroom_b2_state_v3',classroom);
  }
  const seed=initial&&!localStorage.getItem(BASELINE_KEY),full=recover||!baselineReady||(initial&&(!localStorage.getItem(RECONCILE_KEY)||seed)),since=full?0:meta.revision;
  const r=await fetch(ENDPOINT+'/changes?since='+encodeURIComponent(since),{mode:'cors',cache:'no-store',targetAddressSpace:'local'});if(!r.ok)throw new Error('HTTP '+r.status);
  const x=await r.json(),entries=x.entries||{};let changed=false,restored=0,protectedCount=0;
  applying=true;
  try{
   for(const [k,row] of Object.entries(entries)){
    if(!inScope(k)||!row||(recover&&!RECOVERY_KEY.test(k)))continue;
    if(row.deleted&&GUARDED_KEYS.has(k))continue;
    const remoteTime=Number(row.updatedAt)||0,localTime=Number(meta.times[k])||0,rowRevision=Math.max(0,Number(row.revision)||Number(x.revision)||0);
    const current=localStorage.getItem(k),remoteValue=!row.deleted&&typeof row.value==='string'?decodeStored(row.value):row.value;
    if(recover){
     if(row.deleted)continue;
     if(typeof remoteValue!=='string')continue;
     const more=current!==null&&recoveryDominates(k,remoteValue,current);
     if(current!==null&&!more&&current!==remoteValue){protectedCount++;continue;}
     if(current!==remoteValue){
      if(!preserve(k,current))continue;
      // nativeSet captures the compressed storage wrapper when that wrapper loads first.
      nativeSet.call(localStorage,k,remoteValue);changed=true;restored++;
     }
     dirty.delete(k);serverMerged.delete(k);meta.times[k]=Math.max(localTime,remoteTime);
     if(rowRevision)meta.baseRevisions[k]=rowRevision;
     continue;
    }
    // A queued entry that already matches the server is not a conflict.
    if(!row.deleted&&typeof remoteValue==='string'&&dirty.has(k)&&sameStored(current,remoteValue)){
      dirty.delete(k);serverMerged.delete(k);meta.times[k]=Math.max(localTime,remoteTime);
      if(rowRevision)meta.baseRevisions[k]=rowRevision;
      continue;
    }
    if(serverMerged.has(k)&&!row.deleted&&typeof remoteValue==='string'){
     if(current!==remoteValue){if(!preserve(k,current))continue;nativeSet.call(localStorage,k,remoteValue);changed=true;}
     dirty.delete(k);serverMerged.delete(k);meta.times[k]=Math.max(localTime,remoteTime);if(rowRevision)meta.baseRevisions[k]=rowRevision;continue;
    }
    if(k==='cambridgeB2ExerciseStatsV3'&&!row.deleted&&current!==null&&current!==remoteValue){
     const merged=mergeProgress(k,current,remoteValue);
     if(merged===null){const pending=dirty.get(k),baseRevision=pending?Math.max(0,Number(pending.baseRevision)||0):Math.max(0,Number(meta.baseRevisions[k])||0);dirty.set(k,{value:current,deleted:false,updatedAt:localTime||Date.now(),baseRevision});continue;}
     if(merged!==current){if(!preserve(k,current))continue;nativeSet.call(localStorage,k,merged);changed=true;}
     if(rowRevision)meta.baseRevisions[k]=rowRevision;
     if(merged!==remoteValue){const updatedAt=Math.max(Date.now(),localTime,remoteTime)+1;meta.times[k]=updatedAt;dirty.set(k,{value:merged,deleted:false,updatedAt,baseRevision:rowRevision});}
     else{meta.times[k]=Math.max(localTime,remoteTime);dirty.delete(k);}
     continue;
    }
    if(GUARDED_KEYS.has(k)&&!row.deleted&&typeof remoteValue==='string'){
     if(current===remoteValue){if(dirty.has(k)&&sameStored(dirty.get(k).value,current))dirty.delete(k);meta.times[k]=Math.max(localTime,remoteTime);if(rowRevision)meta.baseRevisions[k]=rowRevision;continue;}
     const remoteDominates=current!==null&&remoteHasMoreProgress(k,remoteValue,current);
     // Quarantined local branches are never replayed on a timer. A strictly
     // richer canonical server snapshot may still safely resolve them.
     if(dirty.get(k)?.held&&!remoteDominates)continue;
     // Resolve a stale baseline before retrying. Never replay the same rejected
     // revision forever: rebase an objectively richer local snapshot onto the
     // current remote revision, or discard a bounded residual (<=2 sessions).
     if(dirty.has(k)&&!remoteDominates&&current!==null){
       if(tinyResidual(k,current,remoteValue,rowRevision)){
         nativeSet.call(localStorage,k,remoteValue);changed=true;
         dirty.delete(k);serverMerged.delete(k);meta.times[k]=remoteTime;
         if(rowRevision)meta.baseRevisions[k]=rowRevision;
         continue;
       }
       if(remoteHasMoreProgress(k,current,remoteValue)&&rowRevision){
         const updatedAt=Math.max(Date.now(),localTime,remoteTime)+1;
         meta.times[k]=updatedAt;meta.baseRevisions[k]=rowRevision;
         dirty.set(k,{value:current,deleted:false,updatedAt,baseRevision:rowRevision});continue;
       }
       // Incomparable branches must not be silently combined or overwritten.
       continue;
     }
     if(current!==null){
      if(remoteDominates){if(!preserve(k,current))continue;nativeSet.call(localStorage,k,remoteValue);changed=true;dirty.delete(k);serverMerged.delete(k);meta.times[k]=remoteTime;if(rowRevision)meta.baseRevisions[k]=rowRevision;continue;}
      const knownBase=Math.max(0,Number(meta.baseRevisions[k])||0);
      if(knownBase){
        const rebased=remoteHasMoreProgress(k,current,remoteValue)&&rowRevision?rowRevision:knownBase;
        if(rebased===rowRevision&&rowRevision)meta.baseRevisions[k]=rowRevision;
        dirty.set(k,{value:current,deleted:false,updatedAt:localTime||Date.now(),baseRevision:rebased});continue;
      }
      if(remoteHasMoreProgress(k,current,remoteValue)){const updatedAt=Math.max(Date.now(),localTime,remoteTime)+1;meta.times[k]=updatedAt;if(rowRevision)meta.baseRevisions[k]=rowRevision;dirty.set(k,{value:current,deleted:false,updatedAt,baseRevision:rowRevision});continue;}
      dirty.set(k,{value:current,deleted:false,updatedAt:localTime||Date.now(),baseRevision:0});continue;
     }
    }
    const forceRemote=!row.deleted&&typeof remoteValue==='string'&&remoteHasMoreProgress(k,remoteValue,current);
    if((remoteTime<localTime&&!forceRemote)||(!row.deleted&&current!==null&&progressRegresses(k,current,remoteValue)&&!forceRemote)){if(current!==null){const baseRevision=Math.max(0,Number(meta.baseRevisions[k])||0);dirty.set(k,{value:current,deleted:false,updatedAt:localTime||Date.now(),baseRevision});}continue;}
    if(row.deleted){if(current!==null){nativeRemove.call(localStorage,k);changed=true;}}
    else if(typeof remoteValue==='string'&&current!==remoteValue){if(!preserve(k,current))continue;nativeSet.call(localStorage,k,remoteValue);changed=true;}
    if(dirty.has(k)&&!sameStored(dirty.get(k).value,localStorage.getItem(k)))dirty.delete(k);
    meta.times[k]=remoteTime;if(GUARDED_KEYS.has(k)&&rowRevision)meta.baseRevisions[k]=rowRevision;
   }
  }finally{applying=false;}
  if(full)baselineReady=true;
  if([...dirty].some(([k,row])=>inScope(k)&&!row.held)&&!flushTimer)flushTimer=setTimeout(flush,5000);
  if(full)try{nativeSet.call(localStorage,RECONCILE_KEY,'1');}catch{}
  if(seed)try{nativeSet.call(localStorage,BASELINE_KEY,'1');}catch{}
  meta.revision=Math.max(meta.revision,Number(x.revision)||0);saveMeta();
  // A saved Classroom IDB record that is absent on the server needs its first
  // upload even when an earlier offline attempt already set a local timestamp.
  if(initial){for(const [k,v] of before){if(!(k in entries)&&!dirty.has(k)&&(!meta.times[k]||k==='classroom_b2_state_v3'))mark(k,v,false);}}
  const ownHeld=[...dirty].some(([k,row])=>inScope(k)&&row.held);
  status(recover?'☁ progreso recuperado: '+restored+' registros':ownHeld?'○ progreso conservado en el dispositivo':'☁ sincronizado',ownHeld?'local':'ok');
  if(changed){
    window.dispatchEvent(new CustomEvent('adrian-sync-updated',{detail:{initial,revision:meta.revision,keys:Object.keys(entries)}}));
    // Refresh an idle application's in-memory state after a late reconnection too.
    const game=document.getElementById('gameScreen'),idle=!game||game.classList.contains('hidden');
    const revKey='adrian_sync_reloaded_revision_110';
    // A remotely recovered Classroom snapshot must be committed to IndexedDB before reload.
    if(Object.prototype.hasOwnProperty.call(entries,'classroom_b2_state_v3'))await window.ClassroomProgress?.flush?.();
    if(idle&&sessionStorage.getItem(revKey)!==String(meta.revision)){
      sessionStorage.setItem(revKey,String(meta.revision));saveMeta();location.reload();
    }else if(!idle)status('☁ progreso recuperado; termina la partida y recarga','conflict');
  }
  return recover?{restored,protected:protectedCount}:true;
 }catch(e){status('○ guardado local','offline');clearTimeout(flushTimer);flushTimer=setTimeout(flush,30000);return false;}
 finally{pullTimer=setTimeout(()=>pull(false),30000);}
}
window.addEventListener('storage',e=>{if(e.storageArea===localStorage&&eligible(e.key))mark(e.key,e.newValue,e.newValue===null);});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')pull(false);else flush();});
window.addEventListener('pagehide',()=>{flush();});
window.AdrianSync=Object.freeze({version:VERSION,pull,recover:()=>pull(true,true),flush,status,baselineChecked:()=>baselineReady,endpoint:ENDPOINT,deviceId:meta.deviceId});
if([...dirty].some(([k,row])=>inScope(k)&&!row.held))flushTimer=setTimeout(flush,5000);
setTimeout(()=>pull(true),0);
})();
