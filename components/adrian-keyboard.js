(function(){
'use strict';
if(window.AdrianKeyboard)return;
const VERSION='4.1.0';
const alphaLayouts={
 en:[['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['Z','X','C','V','B','N','M']],
 es:[['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L','Ñ'],['Z','X','C','V','B','N','M']],
 ca:[['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['Z','X','C','V','B','N','M','Ç']]
};
const accentMap={
 es:{A:['Á'],E:['É'],I:['Í'],O:['Ó'],U:['Ú','Ü'],N:['Ñ']},
 ca:{A:['À','Á'],E:['È','É'],I:['Í','Ï'],O:['Ò','Ó'],U:['Ú','Ü'],C:['Ç']},
 en:{}
};
const numberRows=[['1','2','3','4','5'],['6','7','8','9','0'],[',','!','\'','€','%','&','+','-']];
let active=null,root=null,lang='es',mode='alpha',activeInputHandler=null,longTimer=null,longTriggered=false,popover=null;
const css=`
.ad-keyboard{position:fixed;left:0;right:0;bottom:0;z-index:2147483500;display:none;background:#0b1417;border-top:1px solid rgba(255,255,255,.17);box-shadow:0 -14px 40px rgba(0,0,0,.34);padding:5px max(4px,env(safe-area-inset-right)) calc(6px + env(safe-area-inset-bottom));font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.ad-keyboard.open{display:block}.ad-keyboard *{box-sizing:border-box}.ad-keyboard-inner{width:min(760px,100%);margin:auto}
.ad-keyboard-top{display:flex;align-items:center;justify-content:space-between;gap:6px;min-height:36px;margin-bottom:5px}
.ad-keyboard-langs{display:flex;gap:4px}.ad-lang,.ad-close{min-width:44px;min-height:32px;border:1px solid rgba(255,255,255,.15);border-radius:9px;background:#273238;color:#dbe4e6;font:900 12px/1 system-ui;touch-action:manipulation}
.ad-lang.active{background:#eef5f7;color:#102126;border-color:#96ccdf}.ad-lang[data-lang="es"].active{box-shadow:inset 0 -3px #c59a2b}.ad-lang[data-lang="ca"].active{box-shadow:inset 0 -3px #a65a66}.ad-lang[data-lang="en"].active{box-shadow:inset 0 -3px #5579ad}
.ad-close{font-size:17px;min-width:42px}.ad-keyboard-mode-label{flex:1;text-align:center;color:#9fb0b5;font:850 11px/1 system-ui;letter-spacing:.08em}.ad-keyboard-float-preview{position:absolute;left:max(7px,env(safe-area-inset-left));right:max(7px,env(safe-area-inset-right));bottom:calc(100% + 8px);min-height:76px;max-height:96px;padding:9px 13px 11px;border:2px solid #96ccdf;border-radius:15px;background:rgba(238,245,247,.98);color:#102126;box-shadow:0 12px 34px rgba(0,0,0,.35);pointer-events:none;overflow:hidden}.ad-keyboard-float-preview span{display:block;margin-bottom:4px;color:#42636d;font:950 10px/1 system-ui;letter-spacing:.12em}.ad-keyboard-float-preview b{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;font:950 26px/1.17 system-ui;letter-spacing:.01em;overflow-wrap:anywhere}
.ad-keyboard-row{display:grid;gap:3px;margin:3px auto;width:100%;grid-template-columns:repeat(var(--ad-cols),minmax(0,1fr))}
.ad-keyboard-row.row-1{width:92%}.ad-keyboard-row.row-2{width:78%}.ad-keyboard-row.numeric{width:72%}.ad-keyboard-row.symbols{width:92%}
.ad-key{min-width:0;min-height:59px;border:1px solid rgba(255,255,255,.17);border-radius:11px;color:#fff;font:950 34px/1 system-ui;box-shadow:inset 0 1px rgba(255,255,255,.08),inset 0 -3px rgba(0,0,0,.19);touch-action:manipulation;-webkit-user-select:none;user-select:none}
.ad-keyboard-row.row-0 .ad-key{background:#405582}.ad-keyboard-row.row-1 .ad-key{background:#21686a}.ad-keyboard-row.row-2 .ad-key{background:#597845}.ad-keyboard-row.numeric .ad-key{background:#4f5f86}.ad-keyboard-row.symbols .ad-key{background:#755a2d;font-size:24px}
.ad-key:active,.ad-lang:active,.ad-close:active{filter:brightness(1.16);transform:scale(.97)}
.ad-keyboard-controls{display:grid;grid-template-columns:.8fr .62fr 2.2fr .68fr .62fr .86fr;gap:4px;margin-top:5px}
.ad-key.control{min-height:53px;font-size:18px;letter-spacing:.02em;border-radius:10px}.ad-key.mode{background:#66538e}.ad-key.punct{background:#8b6926;color:#fff8df}.ad-key.at{background:#7a4e76;color:#fff}.ad-key.space{background:#4aa7c8;color:#071014}.ad-key.back{background:#83363d;font-size:27px}
.ad-accent-pop{position:fixed;z-index:2147483600;display:flex;gap:5px;padding:5px;border-radius:12px;background:#eef5f7;border:2px solid #96ccdf;box-shadow:0 10px 28px rgba(0,0,0,.38)}
.ad-accent-pop button{min-width:52px;min-height:52px;border:0;border-radius:9px;background:#315a9e;color:#fff;font:950 27px/1 system-ui;touch-action:manipulation}
body.ad-keyboard-open{padding-bottom:calc(var(--ad-keyboard-height,294px) + var(--ad-keyboard-preview-height,76px) + 18px)!important}
@media(max-width:390px){.ad-keyboard{padding-left:3px;padding-right:3px}.ad-keyboard-row{gap:2px;margin:2px auto}.ad-key{min-height:57px;font-size:33px;border-radius:10px}.ad-keyboard-controls{gap:3px}.ad-key.control{min-height:51px;font-size:17px}.ad-keyboard-float-preview{left:5px;right:5px;min-height:74px;max-height:92px;padding:8px 11px 10px}.ad-keyboard-float-preview b{font-size:25px}}
`;
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
function ensure(){if(root)return root;root=document.createElement('section');root.className='ad-keyboard';root.setAttribute('aria-label','Teclado Adrián');document.body.appendChild(root);return root;}
function locale(){return lang==='ca'?'ca':lang==='es'?'es':'en';}
function haptic(ms=7){try{navigator.vibrate?.(ms);}catch(e){}}
function updatePreview(){const el=root?.querySelector('.ad-keyboard-float-preview');if(!el)return;const value=String(active?.value??'');el.innerHTML='<span>ESCRIBIENDO</span><b>'+escapeHtml(value.slice(-120)||'…')+'</b>';}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function rowHtml(row,i,extra=''){return '<div class="ad-keyboard-row row-'+i+' '+extra+'" style="--ad-cols:'+row.length+'">'+row.map(k=>'<button class="ad-key" type="button" data-char="'+escapeHtml(k)+'">'+escapeHtml(k)+'</button>').join('')+'</div>';}
function render(){
 const el=ensure();
 const rows=mode==='alpha'?(alphaLayouts[lang]||alphaLayouts.es):numberRows;
 const rowClasses=mode==='alpha'?['','','']:['numeric','numeric','symbols'];
 el.innerHTML='<div class="ad-keyboard-float-preview" aria-live="polite"></div><div class="ad-keyboard-inner"><div class="ad-keyboard-top"><div class="ad-keyboard-langs">'+['es','ca','en'].map(x=>'<button type="button" class="ad-lang '+(x===lang?'active':'')+'" data-lang="'+x+'">'+x.toUpperCase()+'</button>').join('')+'</div><div class="ad-keyboard-mode-label">'+(mode==='alpha'?'QWERTY · MAYÚSCULAS':'NÚMEROS · SÍMBOLOS')+'</div><button type="button" class="ad-close" data-action="close" aria-label="Cerrar teclado">×</button></div>'+
 rows.map((r,i)=>rowHtml(r,i,rowClasses[i])).join('')+
 '<div class="ad-keyboard-controls"><button class="ad-key control mode" type="button" data-action="mode">'+(mode==='alpha'?'123':'ABC')+'</button><button class="ad-key control punct" type="button" data-char=".">.</button><button class="ad-key control space" type="button" data-action="space">ESPACIO</button><button class="ad-key control at" type="button" data-char="@">@</button><button class="ad-key control punct" type="button" data-char="?">?</button><button class="ad-key control back" type="button" data-action="back" aria-label="Borrar">⌫</button></div></div>';
 el.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{lang=b.dataset.lang;mode='alpha';render();syncHeight();haptic();}));
 el.querySelectorAll('[data-char]').forEach(bindCharKey);
 el.querySelector('[data-action="space"]').addEventListener('click',()=>{haptic();insert(' ');});
 el.querySelector('[data-action="back"]').addEventListener('click',()=>{haptic();backspace();});
 el.querySelector('[data-action="mode"]').addEventListener('click',()=>{mode=mode==='alpha'?'numeric':'alpha';render();syncHeight();haptic();});
 el.querySelector('[data-action="close"]').addEventListener('click',close);
 updatePreview();
}
function bindCharKey(button){
 button.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  longTriggered=false;clearTimeout(longTimer);
  const key=button.dataset.char,variants=mode==='alpha'?(accentMap[lang]?.[key]||[]):[];
  if(variants.length)longTimer=setTimeout(()=>{longTriggered=true;haptic(18);if(variants.length===1)insert(variants[0]);else showAccentPopover(button,variants);},430);
 });
 button.addEventListener('pointerup',()=>{clearTimeout(longTimer);if(!longTriggered){haptic();insert(button.dataset.char);}});
 button.addEventListener('pointercancel',()=>clearTimeout(longTimer));
 button.addEventListener('contextmenu',e=>e.preventDefault());
}
function showAccentPopover(button,variants){
 hideAccentPopover();popover=document.createElement('div');popover.className='ad-accent-pop';
 variants.forEach(v=>{const b=document.createElement('button');b.type='button';b.textContent=v;b.addEventListener('click',()=>{haptic();insert(v);hideAccentPopover();});popover.appendChild(b);});
 document.body.appendChild(popover);const r=button.getBoundingClientRect(),p=popover.getBoundingClientRect();
 popover.style.left=Math.max(4,Math.min(innerWidth-p.width-4,r.left+r.width/2-p.width/2))+'px';popover.style.top=Math.max(4,r.top-p.height-7)+'px';
}
function hideAccentPopover(){popover?.remove();popover=null;}
function fire(){if(!active)return;active.dispatchEvent(new Event('input',{bubbles:true}));active.dispatchEvent(new Event('change',{bubbles:true}));}
function insert(t){
 if(!active)return;hideAccentPopover();
 const s=active.selectionStart??active.value.length,e=active.selectionEnd??s;
 active.value=active.value.slice(0,s)+t+active.value.slice(e);const p=s+t.length;active.setSelectionRange?.(p,p);
 fire();updatePreview();settleVisibility();active.focus({preventScroll:true});
}
function backspace(){
 if(!active)return;hideAccentPopover();
 let s=active.selectionStart??active.value.length,e=active.selectionEnd??s;if(s===e&&s>0)s--;
 active.value=active.value.slice(0,s)+active.value.slice(e);active.setSelectionRange?.(s,s);
 fire();updatePreview();settleVisibility();active.focus({preventScroll:true});
}
function keepActiveVisible(smooth=false){
 if(!active||!root?.classList.contains('open'))return;
 const kbTop=root.getBoundingClientRect().top,rect=active.getBoundingClientRect();
 const previewH=root.querySelector('.ad-keyboard-float-preview')?.getBoundingClientRect().height||0;
 const topGuard=Math.max(54,document.querySelector('.adrian-tools')?.getBoundingClientRect().bottom||0)+8,bottomLimit=kbTop-previewH-18;
 let delta=0;if(rect.bottom>bottomLimit)delta=rect.bottom-bottomLimit;else if(rect.top<topGuard)delta=rect.top-topGuard;
 if(Math.abs(delta)>1)window.scrollBy({top:delta,left:0,behavior:smooth?'smooth':'auto'});
}
function settleVisibility(){requestAnimationFrame(()=>{keepActiveVisible(false);setTimeout(()=>keepActiveVisible(false),70);setTimeout(()=>keepActiveVisible(false),180);});}
function syncHeight(){requestAnimationFrame(()=>{if(!root)return;const previewH=root.querySelector('.ad-keyboard-float-preview')?.getBoundingClientRect().height||0;document.documentElement.style.setProperty('--ad-keyboard-height',root.getBoundingClientRect().height+'px');document.documentElement.style.setProperty('--ad-keyboard-preview-height',previewH+'px');settleVisibility();});}
function detachActiveHandler(){if(active&&activeInputHandler){active.removeEventListener('input',activeInputHandler);activeInputHandler=null;}}
function normaliseLang(value){
 const x=String(value||'').toLowerCase();
 if(['es','ca','en'].includes(x))return x;
 const doc=(document.documentElement.lang||'es').toLowerCase();
 return doc.startsWith('ca')?'ca':doc.startsWith('en')?'en':'es';
}
function open(el){
 if(!el)return;
 if(active===el&&root?.classList.contains('open'))return;
 if(active!==el)detachActiveHandler();
 active=el;
 lang=normaliseLang(el.dataset.adKeyboard);
 mode=(el.dataset.adKeyboardMode==='numeric'||el.type==='number')?'numeric':'alpha';
 el.setAttribute('inputmode','none');
 el.setAttribute('autocomplete','off');
 el.setAttribute('autocorrect','off');
 el.setAttribute('autocapitalize','characters');
 el.setAttribute('spellcheck','false');
 render();
 root.classList.add('open');
 document.body.classList.add('ad-keyboard-open');
 activeInputHandler=()=>{
  if(mode==='alpha'){
   const s=active.selectionStart??active.value.length,e=active.selectionEnd??s;
   const upper=String(active.value||'').toLocaleUpperCase(locale());
   if(active.value!==upper){active.value=upper;active.setSelectionRange?.(s,e);}
  }
  updatePreview();settleVisibility();
 };
 active.addEventListener('input',activeInputHandler);
 syncHeight();
 el.focus({preventScroll:true});
}
function close(){
 clearTimeout(longTimer);
 hideAccentPopover();
 detachActiveHandler();
 if(root)root.classList.remove('open');
 document.body.classList.remove('ad-keyboard-open');
 document.documentElement.style.removeProperty('--ad-keyboard-height');
 document.documentElement.style.removeProperty('--ad-keyboard-preview-height');
 active?.blur();
 active=null;
}
function enhance(scope=document){
 scope.querySelectorAll?.('[data-ad-keyboard]').forEach(el=>{
  if(el.dataset.adKeyboardReady)return;
  el.dataset.adKeyboardReady='1';
  el.setAttribute('inputmode','none');
  el.addEventListener('focus',()=>setTimeout(()=>{if(document.activeElement===el)open(el);},80));
 });
}
const mo=new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)enhance(n);})));
function boot(){enhance(document);mo.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
document.addEventListener('pointerdown',e=>{if(active&&root&&!root.contains(e.target)&&!popover?.contains(e.target)&&e.target!==active&&!e.target.closest?.('[data-ad-keyboard]'))close();},true);
window.addEventListener('resize',()=>{if(active)syncHeight();});
window.visualViewport?.addEventListener('resize',()=>{if(active)syncHeight();});
window.AdrianKeyboard={version:VERSION,enhance,open,close,keepActiveVisible,setLanguage(value){lang=normaliseLang(value);if(active){render();syncHeight();}},setMode(value){mode=value==='numeric'?'numeric':'alpha';if(active){render();syncHeight();}}};
})();