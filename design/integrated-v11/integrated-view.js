(()=>{'use strict';
const q=s=>document.querySelector(s),id=x=>document.getElementById(x);
document.addEventListener('click',e=>{const btn=e.target.closest?.('#quizModes [data-part]');if(!btn)return;const text=btn.querySelector('small')?.textContent||'',sec=text.match(/(\d+) segundos/),min=text.match(/(\d+) minutos/);window.IntegratedCambridgeLimit=sec?Number(sec[1]):min?Number(min[1])*60:null;},true);
let components=null;
function active(){return ['gameScreen','quizPlay','kqPlay','paperScreen','game','exam'].map(id).find(x=>x&&!x.hidden&&!x.classList.contains('hidden'));}
function snap(game){
 const answerHost=game.querySelector('#paperHost,#answers,#quizAnswerArea,#kqChoices,#gameCard .options,#examCard .options,.option-grid,.choice-grid');
 let elapsed=null;let n=15,pos=1,remaining=null,total=null,reading=!!answerHost?.matches('.read-first-hidden,.prethink-hidden,.cue-phase');
 const nativeProgress=id('roundProgress');const text=(id('progressMain')||id('qTotal')||(id('quizPosition')||id('kqPosition')))?.textContent||'';
 if(game.id==='game'||game.id==='exam'){const p=id(game.id==='game'?'roundProgress':'examProgress');n=Number(p?.max)||15;pos=Number(p?.value)||0;}
 else {const raw=(id('qIndex')?.textContent||id('progressMain')?.textContent||id('quizPosition')?.textContent||id('kqPosition')?.textContent||'1').match(/\d+/);pos=Number(raw?.[0])||1;const match=text.match(/\/\s*(\d+)/);n=Number(match?.[1])||15;}
 try{
 if(typeof TIME_LIMIT==='number')total=TIME_LIMIT;
 if(typeof secondsPerQuestion==='number')total=secondsPerQuestion||null;
 if(typeof session!=='undefined'&&session){n=session.plan?.length||session.queue?.length||session.questions?.length||session.ids?.length||n; if(session.type==='study'){n=session.minQuestions||8;pos=Math.min(n,session.questionCount||0);} if(session.type==='quick')pos=session.questionCount||0;}
 }catch(_){}
 
 try{if(typeof session!=='undefined'&&session){pos=Array.isArray(session.records)?session.records.length:Array.isArray(session.results)?session.results.length:Array.isArray(session.times)?session.times.length:session.questionCount??session.index??0;}}catch(_){}
 if(game.id==='quizPlay'||game.id==='kqPlay'){const number=(id(game.id==='quizPlay'?'quizPosition':'kqPosition')?.textContent||'1').match(/\d+/);const feedback=id(game.id==='quizPlay'?'quizFeedback':'kqFeedback');pos=Math.max(0,Number(number?.[0]||1)-1)+(feedback&&!feedback.hidden&&!feedback.classList.contains('hidden')&&feedback.textContent.trim()?1:0);}
 const timerText=id('timerText')?.textContent; if(timerText&&Number.isFinite(parseFloat(timerText)))remaining=parseFloat(timerText);
 if(!timerText){const original=game.querySelector('#timer,#quizClock');const raw=original?.textContent?.match(/\d+(?:[.,]\d+)?/);if(raw)remaining=Number(raw[0].replace(',','.'));}
 try{if(typeof deadline==='number'&&deadline>0){const now=deadline>1e10?Date.now():performance.now();remaining=Math.max(0,(deadline-now)/1000);}if(document.body.dataset.integratedApp==='grammar'){total=null;remaining=null;reading=typeof focusAwaiting==='boolean'&&focusAwaiting;if(typeof focusAnswerAt==='number'&&focusAnswerAt>0){const now=typeof focusPausedAt==='number'&&focusPausedAt?focusPausedAt:performance.now();elapsed=Math.max(0,(now-focusAnswerAt)/1000);if(typeof locked==='boolean'&&locked&&typeof session!=='undefined')elapsed=session.times?.at(-1)??elapsed;}}}catch(_){}
 if(game.id==='kqPlay'){remaining=Number.parseFloat(id('kqSeconds')?.textContent);if(!Number.isFinite(remaining))remaining=null;const key=id('kqPosition')?.textContent;if(window.IntegratedKeywordKey!==key){window.IntegratedKeywordKey=key;window.IntegratedKeywordLimit=null;}if(remaining!==null&&!window.IntegratedKeywordLimit)window.IntegratedKeywordLimit=remaining;total=window.IntegratedKeywordLimit;reading=id('kqChoices')?.classList.contains('hidden')||false;}
 const seconds=game.querySelector('#segments');if(!total&&seconds)total=Number(seconds.dataset.secondsTotal)||Number(seconds.getAttribute('aria-valuemax'))||null;
 if(game.id==='quizPlay'){const text=id('quizCountdown')?.textContent;remaining=Number.isFinite(parseFloat(text))?parseFloat(text):null;total=remaining===null?null:window.IntegratedCambridgeLimit||remaining;}
 if(game.id==='game'||game.id==='exam'){try{if(typeof session!=='undefined'){total=session?.sprint?20:session?.limit||null;if(session?.sprint&&typeof sprintDeadline==='number'&&sprintDeadline>0)remaining=Math.max(0,(sprintDeadline-Date.now())/1000);else if(!session?.limit)remaining=null;}}catch(_){}}
 
 if(game.id==='paperScreen'){try{const p=currentPart();n=p.items?.length||p.segments?.filter(x=>x&&typeof x==='object').length||game.querySelectorAll('#paperHost input[data-n]').length||1;pos=Object.values(answers||{}).filter(x=>String(x??'').trim()).length;elapsed=exerciseStartedAt?Math.max(0,(Date.now()-exerciseStartedAt)/1000):0;total=null;remaining=null;reading=false;}catch(_){n=1;pos=0;total=null;remaining=null;}}
 return {answerHost,elapsed,n:Math.max(1,Math.min(100,Number(n)||15)),pos,remaining,total,reading};
}
function mount(game,s){
 const question=game.querySelector('#paperHost,.question,.paper,#quizContext,.kq-question,#kqOriginal,#kqFirst,#gameCard,#examCard');
 if(!question)return null;
 const progress=document.createElement('div');progress.className='integrated-progress';progress.setAttribute('role','progressbar');progress.setAttribute('aria-label','Progreso de la sesión');question.before(progress);
 const timer=document.createElement('section');timer.className='integrated-timer';timer.innerHTML='<div class="integrated-timer-head"><span>Tiempo para responder</span><strong></strong></div><div class="integrated-timer-track" role="progressbar" aria-label="Tiempo restante" aria-valuemin="0"></div>';
 const track=timer.lastElementChild;for(let i=0;i<20;i++)track.append(document.createElement('span'));
 const target=s.answerHost||game.querySelector('.actions')||question;target.after(timer);
 return {game,progress,timer,track,count:0};
}
function sync(){if(document.body.dataset.integratedApp==='classroom'){const next=id('nextClass');if(next&&next.textContent.includes('análisis obligatorio'))next.innerHTML='<b>Clase completada</b>Puedes analizar el JSON con Coach y aplicar un plan, o continuar con la siguiente clase adaptativa.';}const game=active();if(!game)return;
const s=snap(game);
if(!components||components.game!==game||!components.timer.isConnected){components?.timer.remove();components?.progress.remove();components=mount(game,s);}
if(!components)return;const {progress,timer,track}=components;
if(components.count!==s.n){progress.replaceChildren();for(let i=0;i<s.n;i++)progress.append(document.createElement('span'));progress.style.gridTemplateColumns='repeat('+s.n+',minmax(0,1fr))';components.count=s.n;}

 if(game.id==='paperScreen'){progress.setAttribute('aria-label','Respuestas introducidas; corrección al terminar');let note=game.querySelector('.integrated-progress-note');if(!note){note=document.createElement('p');note.className='integrated-progress-note';progress.after(note);}note.textContent='Respuestas introducidas: '+s.pos+' / '+s.n+' · corrección al terminar';}
 const done=Math.max(0,Math.min(s.n,s.pos));[...progress.children].forEach((x,i)=>x.classList.toggle('done',i<done));
progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax',String(s.n));progress.setAttribute('aria-valuenow',String(done));
timer.dataset.urgent=String(s.remaining!==null&&s.total!==null&&s.remaining<=Math.min(3,s.total*.2));const untimed=s.total===null||s.remaining===null;timer.querySelector('span').textContent=s.reading?'Leer antes de responder':s.elapsed!==null?'Tiempo transcurrido · sin límite':untimed?'Tiempo del motor':'Tiempo para responder';
timer.querySelector('strong').textContent=s.reading?'Lectura previa':s.elapsed!==null?s.elapsed.toFixed(1)+' s':untimed?'Sin límite':Math.max(0,s.remaining).toFixed(1)+' s';
const lit=s.reading||untimed?0:Math.ceil(Math.max(0,Math.min(1,s.remaining/s.total))*20);
[...track.children].forEach((x,i)=>x.classList.toggle('active',i<lit));track.setAttribute('aria-valuemax',String(s.total||0));track.setAttribute('aria-valuenow',String(s.remaining||0));
}
function rankLabels(){for(const el of document.querySelectorAll('.skill-rank')){const rgb=(getComputedStyle(el).backgroundColor.match(/[\d.]+/g)||[]).slice(0,3).map(Number);if(rgb.length!==3)continue;const l=rgb.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((n,x,i)=>n+x*[.2126,.7152,.0722][i],0);const color=l>.179?'#000000':'#FFFFFF';if(el.dataset.integratedRankColor!==color){el.style.setProperty('color',color,'important');el.dataset.integratedRankColor=color;}}}
new MutationObserver(rankLabels).observe(document.body,{childList:true,subtree:true});rankLabels();

function reconcilePresentation(){
 const raw=getComputedStyle(document.body).getPropertyValue('--integrated-accent').trim();
 if(raw&&document.body.dataset.integratedAction!==raw){const hex=raw.replace('#','');if(/^[\da-f]{6}$/i.test(hex)){const source=[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16));let rgb=source.slice();const lum=c=>c.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((n,x,i)=>n+x*[.2126,.7152,.0722][i],0);for(let i=0;i<40&&(1.05/(lum(rgb)+.05))<4.5;i++)rgb=rgb.map(x=>Math.floor(x*.92));document.body.style.setProperty('--integrated-action','rgb('+rgb.join(',')+')');document.body.dataset.integratedAction=raw;}}
 for(const host of document.querySelectorAll('#answers,#quizAnswerArea:not(.typing),#kqChoices,#gameCard .options,#examCard .options')){const buttons=[...host.querySelectorAll('button')].filter(x=>!x.classList.contains('nucleo-read-skip'));if(buttons.length===4)buttons.forEach((button,i)=>{const nativeBadge=[...button.children].some(x=>/^[ABCD]$/.test(x.textContent.trim()));if(!nativeBadge&&button.dataset.integratedLetter!=='ABCD'[i])button.dataset.integratedLetter='ABCD'[i];});}
 for(const el of document.querySelectorAll('.ad-medal-stat[title]')){if(!el.hasAttribute('aria-label'))el.setAttribute('aria-label',el.title);}
}
reconcilePresentation();new MutationObserver(reconcilePresentation).observe(document.body,{childList:true,subtree:true});

/* Native modules render secondary labels dynamically; keep the agreed 16px floor.
   Only presentation is changed. SVG charts and the native keyboard keep their own scale. */
let typeFloorJob=null;
function scheduleTypeFloor(){
 if(typeFloorJob!==null)return;
 typeFloorJob=setTimeout(()=>{
  typeFloorJob=null;
  for(const el of document.querySelectorAll('body *')){
   if(el.closest('script,style,svg,select,option,.ad-keyboard')||!el.getClientRects().length||getComputedStyle(el).visibility==='hidden')continue;
   if(![...el.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim()))continue;
   if(parseFloat(getComputedStyle(el).fontSize)<16)el.style.setProperty('font-size','16px','important');
  }
 },150);
}
scheduleTypeFloor();new MutationObserver(scheduleTypeFloor).observe(document.body,{childList:true,subtree:true});

setInterval(sync,100);sync();window.IntegratedView=Object.freeze({sync,snapshot:()=>{const game=active();if(!game)return null;const {answerHost,...s}=snap(game);return s;}});
})();
