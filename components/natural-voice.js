(function(){
'use strict';
const synth=window.speechSynthesis;
const state={voices:[],voice:null};
const preferred=[
  /Google.*español.*España/i,
  /Google.*Spanish.*Spain/i,
  /Microsoft.*(Elvira|Alvaro|Helena|Dalia)/i,
  /Natural/i,
  /español.*España/i
];
function pickVoice(lang='es-ES'){
  if(!synth)return null;
  const voices=synth.getVoices()||[];
  state.voices=voices;
  const exact=voices.filter(v=>(v.lang||'').toLowerCase()===lang.toLowerCase());
  const family=voices.filter(v=>(v.lang||'').toLowerCase().startsWith(lang.slice(0,2).toLowerCase()));
  const pool=exact.length?exact:family;
  for(const rx of preferred){const hit=pool.find(v=>rx.test(v.name||''));if(hit)return hit;}
  return pool[0]||null;
}
function refresh(){state.voice=pickVoice('es-ES');return state.voice;}
function naturalText(text){
  return String(text??'').replace(/\s*·\s*/g,', ').replace(/\s*:\s*/g,'. ').replace(/\s+/g,' ').trim();
}function rateFor(style,requested){
  const base=style==='cue'?1.16:style==='coach'?1.07:1.02;
  const n=Number(requested);
  if(!Number.isFinite(n)||n>1.25)return base;
  return Math.max(.92,Math.min(1.22,n));
}
function speak(text,opts={}){
  if(!synth||!('SpeechSynthesisUtterance'in window))return false;
  const clean=naturalText(text);if(!clean)return false;
  const style=opts.style||'conversation';
  if(opts.interrupt&&synth.speaking)synth.cancel();
  const u=new SpeechSynthesisUtterance(clean);
  u.lang=opts.lang||'es-ES';
  u.voice=pickVoice(u.lang);
  u.rate=rateFor(style,opts.rate);
  u.pitch=style==='cue'?1.02:1;
  u.volume=Number.isFinite(opts.volume)?Math.max(0,Math.min(1,opts.volume)):.94;
  synth.speak(u);return true;
}
function cancel(){try{synth?.cancel()}catch{}}
function currentVoice(){return state.voice?.name||pickVoice('es-ES')?.name||'';}
if(synth){refresh();if('onvoiceschanged'in synth)synth.addEventListener?.('voiceschanged',refresh);}
window.AdrianVoice={speak,cancel,currentVoice,refresh,pickVoice,version:'1.0.0'};
})();
