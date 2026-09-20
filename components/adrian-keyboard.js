(function(){
if(window.AdrianKeyboard)return;
const layouts={
 en:"ABCDEFGHIJKLMNOPQRSTUVWXYZ'-",
 ca:"ABCDEFGHIJKLMNOPQRSTUVWXYZÇ·’ÀÈÉÍÏÒÓÚÜ",
 es:"ABCDEFGHIJKLMNOPQRSTUVWXYZÑÁÉÍÓÚÜ¿?"
};
let active=null,lang='en',root=null;
const css=`
.ad-keyboard{position:fixed;left:0;right:0;bottom:0;z-index:2147482000;background:linear-gradient(180deg,#101b1f,#0b1417 74%);border-top:1px solid rgba(255,255,255,.18);box-shadow:0 -20px 55px rgba(0,0,0,.38);padding:10px max(8px,env(safe-area-inset-right)) calc(10px + env(safe-area-inset-bottom));display:none}
.ad-keyboard.open{display:block}
.ad-keyboard-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 auto 9px;width:min(760px,100%);color:#b8c6c8;font:800 14px/1.2 system-ui}
.ad-keyboard-head b{color:#f3f7f8;font-size:16px;letter-spacing:.04em}.ad-keyboard-head span{font-size:12px;text-align:right}
.ad-keyboard-row{width:min(760px,100%);margin:6px auto;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}
.ad-key{min-width:0;min-height:60px;border:1px solid rgba(255,255,255,.18);border-radius:13px;color:#fff;font:950 27px/1 system-ui;box-shadow:inset 0 1px rgba(255,255,255,.08),inset 0 -3px rgba(0,0,0,.18);touch-action:manipulation;transition:transform .05s ease,filter .06s ease}
.ad-keyboard-row-0 .ad-key{background:#405582}.ad-keyboard-row-1 .ad-key{background:#1f6264}.ad-keyboard-row-2 .ad-key{background:#4f6f43}.ad-keyboard-row-3 .ad-key{background:#77531f}.ad-keyboard-row-4 .ad-key{background:#74405a}.ad-keyboard-row-5 .ad-key{background:#5b4680}
.ad-key[data-special="true"]{background:#9a741d!important;color:#fff8dd;border-color:rgba(255,226,138,.48)}
.ad-key:active{transform:scale(.955);filter:brightness(1.16)}
.ad-keyboard-controls{width:min(760px,100%);margin:9px auto 0;display:grid;grid-template-columns:1.8fr 1fr 1fr 1fr;gap:7px}
.ad-key.control{min-height:56px;font-size:16px;letter-spacing:.03em}.ad-key.space{background:#4AA7C8;color:#071014}.ad-key.back{background:#762F32}.ad-key.next{background:#57965A}.ad-key.close{background:#303d42}
body.ad-keyboard-open{padding-bottom:calc(var(--ad-keyboard-height,360px) + 12px)!important}
@media(max-width:390px){.ad-keyboard{padding-left:6px;padding-right:6px}.ad-keyboard-row{gap:5px;margin:5px auto}.ad-key{min-height:56px;font-size:25px;border-radius:11px}.ad-keyboard-controls{gap:5px}.ad-key.control{min-height:54px;font-size:15px}.ad-keyboard-head span{display:none}}
`;
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
function ensure(){if(root)return root;root=document.createElement('section');root.className='ad-keyboard';root.setAttribute('aria-label','Teclado Adrián');document.body.appendChild(root);return root;}
function chunks(s,n=6){const a=[];for(let i=0;i<s.length;i+=n)a.push([...s.slice(i,i+n)]);return a;}
function isSpecial(k){return /[^A-Z]/.test(k);}
function render(){
 const el=ensure(),rows=chunks(layouts[lang]||layouts.en,6);
 el.innerHTML='<div class="ad-keyboard-head"><b>TECLADO · '+lang.toUpperCase()+'</b><span>Teclas grandes · sin sugerencias</span></div>'+
 rows.map((row,i)=>'<div class="ad-keyboard-row ad-keyboard-row-'+i+'">'+row.map(k=>'<button class="ad-key" type="button" data-char="'+k.replace(/"/g,'&quot;')+'" data-special="'+String(isSpecial(k))+'">'+k+'</button>').join('')+'</div>').join('')+
 '<div class="ad-keyboard-controls"><button class="ad-key control space" type="button" data-action="space">ESPACIO</button><button class="ad-key control back" type="button" data-action="back">⌫</button><button class="ad-key control next" type="button" data-action="next">SIG.</button><button class="ad-key control close" type="button" data-action="close">CERRAR</button></div>';
 el.querySelectorAll('[data-char]').forEach(b=>b.onclick=()=>{try{navigator.vibrate?.(8);}catch(e){}insert(b.dataset.char.toLocaleLowerCase(lang==='ca'?'ca':lang==='es'?'es':'en'));});
 el.querySelector('[data-action="space"]').onclick=()=>insert(' ');
 el.querySelector('[data-action="back"]').onclick=backspace;
 el.querySelector('[data-action="next"]').onclick=next;
 el.querySelector('[data-action="close"]').onclick=close;
}
function fire(){if(!active)return;active.dispatchEvent(new Event('input',{bubbles:true}));active.dispatchEvent(new Event('change',{bubbles:true}));}
function insert(t){if(!active)return;const s=active.selectionStart??active.value.length,e=active.selectionEnd??s;active.value=active.value.slice(0,s)+t+active.value.slice(e);const p=s+t.length;active.setSelectionRange?.(p,p);fire();active.focus({preventScroll:true});}
function backspace(){if(!active)return;let s=active.selectionStart??active.value.length,e=active.selectionEnd??s;if(s===e&&s>0)s--;active.value=active.value.slice(0,s)+active.value.slice(e);active.setSelectionRange?.(s,s);fire();active.focus({preventScroll:true});}
function next(){const list=[...document.querySelectorAll('[data-ad-keyboard]')].filter(x=>!x.disabled&&x.offsetParent!==null),i=list.indexOf(active);if(i>=0&&i<list.length-1)open(list[i+1]);else close();}
function open(el){active=el;lang=el.dataset.adKeyboard||'en';el.setAttribute('inputmode','none');el.setAttribute('autocomplete','off');el.setAttribute('autocorrect','off');el.setAttribute('autocapitalize','none');el.setAttribute('spellcheck','false');render();root.classList.add('open');document.body.classList.add('ad-keyboard-open');requestAnimationFrame(()=>{const h=root.getBoundingClientRect().height;document.documentElement.style.setProperty('--ad-keyboard-height',h+'px');el.scrollIntoView({block:'center',behavior:'smooth'});});el.focus({preventScroll:true});}
function close(){if(root)root.classList.remove('open');document.body.classList.remove('ad-keyboard-open');document.documentElement.style.removeProperty('--ad-keyboard-height');active?.blur();active=null;}
function enhance(scope=document){scope.querySelectorAll?.('[data-ad-keyboard]').forEach(el=>{if(el.dataset.adKeyboardReady)return;el.dataset.adKeyboardReady='1';el.setAttribute('inputmode','none');el.addEventListener('focus',()=>open(el));el.addEventListener('pointerdown',()=>setTimeout(()=>open(el),0));});}
const mo=new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)enhance(n)})));
function boot(){enhance(document);mo.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
document.addEventListener('pointerdown',e=>{if(active&&root&&!root.contains(e.target)&&e.target!==active&&!e.target.closest?.('[data-ad-keyboard]'))close();},true);
window.AdrianKeyboard={enhance,open,close};
})();