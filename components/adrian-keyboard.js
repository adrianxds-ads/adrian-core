(function(){
if(window.AdrianKeyboard)return;
const layouts={
 en:[["Q","W","E","R","T","Y","U","I","O","P"],["A","S","D","F","G","H","J","K","L"],["Z","X","C","V","B","N","M"],["'","-"]],
 ca:[["Q","W","E","R","T","Y","U","I","O","P"],["A","S","D","F","G","H","J","K","L"],["Z","X","C","V","B","N","M"],["À","È","É","Í","Ï","Ò"],["Ó","Ú","Ü","Ç","·","’"]],
 es:[["Q","W","E","R","T","Y","U","I","O","P"],["A","S","D","F","G","H","J","K","L"],["Z","X","C","V","B","N","M"],["Á","É","Í","Ó","Ú","Ü","Ñ","¿","?"]]
};
let active=null,lang='en',root=null,activeInputHandler=null;
const css=`
.ad-keyboard{position:fixed;left:0;right:0;bottom:0;z-index:2147482000;background:linear-gradient(180deg,#101b1f,#0b1417 74%);border-top:1px solid rgba(255,255,255,.18);box-shadow:0 -20px 55px rgba(0,0,0,.38);padding:10px max(8px,env(safe-area-inset-right)) calc(10px + env(safe-area-inset-bottom));display:none}
.ad-keyboard.open{display:block}
.ad-keyboard-preview{width:min(760px,100%);margin:0 auto 9px;padding:10px 13px;border-radius:13px;background:#eef5f7;color:#0c171a;border:2px solid #96CCDF;box-shadow:0 8px 20px rgba(0,0,0,.18);overflow:hidden}
.ad-keyboard-preview small{display:block;margin-bottom:4px;font:900 11px/1 system-ui;letter-spacing:.10em;color:#42636d}
.ad-keyboard-preview-value{display:block;min-height:31px;font:950 25px/1.2 system-ui;white-space:nowrap;overflow-x:auto;overflow-y:hidden;scrollbar-width:none}
.ad-keyboard-preview-value::-webkit-scrollbar{display:none}
.ad-keyboard-preview-value.empty{color:#75868b;font-weight:800}
.ad-keyboard-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 auto 9px;width:min(760px,100%);color:#b8c6c8;font:800 14px/1.2 system-ui}
.ad-keyboard-head b{color:#f3f7f8;font-size:16px;letter-spacing:.04em}.ad-keyboard-head span{font-size:12px;text-align:right}
.ad-keyboard-row{width:min(760px,100%);margin:6px auto;display:grid;grid-template-columns:repeat(var(--ad-key-cols,10),minmax(0,1fr));gap:6px}.ad-keyboard-row[data-row="1"]{width:min(684px,90%)}.ad-keyboard-row[data-row="2"]{width:min(532px,72%)}.ad-keyboard-row[data-special-row="true"]{width:min(650px,92%)}
.ad-key{min-width:0;min-height:60px;border:1px solid rgba(255,255,255,.18);border-radius:13px;color:#fff;font:950 31px/1 system-ui;box-shadow:inset 0 1px rgba(255,255,255,.08),inset 0 -3px rgba(0,0,0,.18);touch-action:manipulation;transition:transform .05s ease,filter .06s ease}
.ad-keyboard-row-0 .ad-key{background:#405582}.ad-keyboard-row-1 .ad-key{background:#1f6264}.ad-keyboard-row-2 .ad-key{background:#4f6f43}.ad-keyboard-row-3 .ad-key{background:#77531f}.ad-keyboard-row-4 .ad-key{background:#74405a}.ad-keyboard-row-5 .ad-key{background:#5b4680}
.ad-key[data-special="true"]{background:#9a741d!important;color:#fff8dd;border-color:rgba(255,226,138,.48)}
.ad-key:active{transform:scale(.955);filter:brightness(1.16)}
.ad-keyboard-controls{width:min(760px,100%);margin:9px auto 0;display:grid;grid-template-columns:1.8fr 1fr 1fr 1fr;gap:7px}
.ad-key.control{min-height:56px;font-size:17px;letter-spacing:.03em}.ad-key.space{background:#4AA7C8;color:#071014}.ad-key.back{background:#762F32}.ad-key.next{background:#57965A}.ad-key.close{background:#303d42}
body.ad-keyboard-open{padding-bottom:calc(var(--ad-keyboard-height,430px) + 18px)!important}
@media(max-width:390px){.ad-keyboard{padding-left:6px;padding-right:6px}.ad-keyboard-preview{padding:9px 11px;margin-bottom:7px}.ad-keyboard-preview-value{font-size:23px}.ad-keyboard-row{gap:5px;margin:5px auto}.ad-key{min-height:58px;font-size:29px;border-radius:11px}.ad-keyboard-controls{gap:5px}.ad-key.control{min-height:54px;font-size:16px}.ad-keyboard-head span{display:none}}
`;
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

function ensure(){if(root)return root;root=document.createElement('section');root.className='ad-keyboard';root.setAttribute('aria-label','Teclado Adrián');document.body.appendChild(root);return root;}
function isSpecial(k){return /[^A-Z]/.test(k);}
function previewEl(){return root?.querySelector('.ad-keyboard-preview-value')||null;}
function updatePreview(){
 const el=previewEl();if(!el)return;
 const value=String(active?.value??'');
 el.textContent=value||'Empieza a escribir…';
 el.classList.toggle('empty',!value);
 requestAnimationFrame(()=>{el.scrollLeft=el.scrollWidth;});
}
function render(){
 const el=ensure(),rows=layouts[lang]||layouts.en;
 el.innerHTML='<div class="ad-keyboard-preview"><small>ESCRIBIENDO</small><span class="ad-keyboard-preview-value"></span></div>'+
 '<div class="ad-keyboard-head"><b>TECLADO · '+lang.toUpperCase()+'</b><span>QWERTY · MAYÚSCULAS · sin sugerencias</span></div>'+
 rows.map((row,i)=>{const specialRow=row.every(isSpecial),specialWidth=specialRow?';max-width:'+Math.min(650,row.length*74)+'px':'';return '<div class="ad-keyboard-row ad-keyboard-row-'+i+'" data-row="'+i+'" data-special-row="'+String(specialRow)+'" style="--ad-key-cols:'+row.length+specialWidth+'">'+row.map(k=>'<button class="ad-key" type="button" data-char="'+k.replace(/"/g,'&quot;')+'" data-special="'+String(isSpecial(k))+'">'+k+'</button>').join('')+'</div>';}).join('')+
 '<div class="ad-keyboard-controls"><button class="ad-key control space" type="button" data-action="space">ESPACIO</button><button class="ad-key control back" type="button" data-action="back">⌫</button><button class="ad-key control next" type="button" data-action="next">SIG.</button><button class="ad-key control close" type="button" data-action="close">CERRAR</button></div>';
 el.querySelectorAll('[data-char]').forEach(b=>b.onclick=()=>{try{navigator.vibrate?.(8);}catch(e){}insert(b.dataset.char.toLocaleUpperCase(lang==='ca'?'ca':lang==='es'?'es':'en'));});
 el.querySelector('[data-action="space"]').onclick=()=>insert(' ');
 el.querySelector('[data-action="back"]').onclick=backspace;
 el.querySelector('[data-action="next"]').onclick=next;
 el.querySelector('[data-action="close"]').onclick=close;
 updatePreview();
}
function fire(){if(!active)return;active.dispatchEvent(new Event('input',{bubbles:true}));active.dispatchEvent(new Event('change',{bubbles:true}));}
function keepActiveVisible(smooth=false){
 if(!active||!root?.classList.contains('open'))return;
 const kbTop=root.getBoundingClientRect().top;
 const rect=active.getBoundingClientRect();
 const topGuard=Math.max(62,document.querySelector('.adrian-tools')?.getBoundingClientRect().bottom||0)+10;
 const bottomLimit=kbTop-18;
 let delta=0;
 if(rect.bottom>bottomLimit)delta=rect.bottom-bottomLimit;
 else if(rect.top<topGuard)delta=rect.top-topGuard;
 if(Math.abs(delta)>1)window.scrollBy({top:delta,left:0,behavior:smooth?'smooth':'auto'});
}
function settleVisibility(){
 requestAnimationFrame(()=>{keepActiveVisible(false);setTimeout(()=>keepActiveVisible(false),80);setTimeout(()=>keepActiveVisible(false),220);});
}
function insert(t){
 if(!active)return;
 const s=active.selectionStart??active.value.length,e=active.selectionEnd??s;
 active.value=active.value.slice(0,s)+t+active.value.slice(e);
 const p=s+t.length;active.setSelectionRange?.(p,p);
 fire();updatePreview();settleVisibility();active.focus({preventScroll:true});
}
function backspace(){
 if(!active)return;
 let s=active.selectionStart??active.value.length,e=active.selectionEnd??s;if(s===e&&s>0)s--;
 active.value=active.value.slice(0,s)+active.value.slice(e);active.setSelectionRange?.(s,s);
 fire();updatePreview();settleVisibility();active.focus({preventScroll:true});
}
function next(){const list=[...document.querySelectorAll('[data-ad-keyboard]')].filter(x=>!x.disabled&&x.offsetParent!==null),i=list.indexOf(active);if(i>=0&&i<list.length-1)open(list[i+1]);else close();}
function detachActiveHandler(){if(active&&activeInputHandler){active.removeEventListener('input',activeInputHandler);activeInputHandler=null;}}
function open(el){
 if(active!==el)detachActiveHandler();
 active=el;lang=el.dataset.adKeyboard||'en';
 el.setAttribute('inputmode','none');el.setAttribute('autocomplete','off');el.setAttribute('autocorrect','off');el.setAttribute('autocapitalize','characters');el.setAttribute('spellcheck','false');
 render();root.classList.add('open');document.body.classList.add('ad-keyboard-open');
 activeInputHandler=()=>{const s=active.selectionStart??active.value.length,e=active.selectionEnd??s,upper=String(active.value||'').toLocaleUpperCase(lang==='ca'?'ca':lang==='es'?'es':'en');if(active.value!==upper){active.value=upper;active.setSelectionRange?.(s,e);}updatePreview();settleVisibility();};active.addEventListener('input',activeInputHandler);
 requestAnimationFrame(()=>{const h=root.getBoundingClientRect().height;document.documentElement.style.setProperty('--ad-keyboard-height',h+'px');settleVisibility();});
 el.focus({preventScroll:true});
}
function close(){detachActiveHandler();if(root)root.classList.remove('open');document.body.classList.remove('ad-keyboard-open');document.documentElement.style.removeProperty('--ad-keyboard-height');active?.blur();active=null;}
function enhance(scope=document){scope.querySelectorAll?.('[data-ad-keyboard]').forEach(el=>{if(el.dataset.adKeyboardReady)return;el.dataset.adKeyboardReady='1';el.setAttribute('inputmode','none');el.addEventListener('focus',()=>open(el));el.addEventListener('pointerdown',()=>setTimeout(()=>open(el),0));});}
const mo=new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)enhance(n)})));
function boot(){enhance(document);mo.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
document.addEventListener('pointerdown',e=>{if(active&&root&&!root.contains(e.target)&&e.target!==active&&!e.target.closest?.('[data-ad-keyboard]'))close();},true);
window.addEventListener('resize',()=>{if(active)settleVisibility();});
window.visualViewport?.addEventListener('resize',()=>{if(active)settleVisibility();});
window.visualViewport?.addEventListener('scroll',()=>{if(active)settleVisibility();});
window.AdrianKeyboard={enhance,open,close,keepActiveVisible};
})();