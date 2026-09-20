(function(){
if(window.AdrianKeyboard)return;
const layouts={
 en:["ABCDEFG","HIJKLMN","OPQRSTU","VWXYZ'","-"],
 ca:["ABCDEFG","HIJKLMN","OPQRSTU","VWXYZ","ÀÈÉÍÏÒÓ","ÚÜÇ·’"],
 es:["ABCDEFG","HIJKLMN","OPQRSTU","VWXYZ","ÁÉÍÓÚÜÑ","¿?"]
};
let active=null,lang='en',root=null;
const css=`
.ad-keyboard{position:fixed;left:0;right:0;bottom:0;z-index:2147482000;background:rgba(10,18,21,.98);border-top:1px solid rgba(255,255,255,.18);box-shadow:0 -18px 50px rgba(0,0,0,.35);padding:9px max(8px,env(safe-area-inset-right)) calc(9px + env(safe-area-inset-bottom));display:none}
.ad-keyboard.open{display:block}.ad-keyboard-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 auto 8px;width:min(720px,100%);color:#b8c6c8;font:800 13px/1.2 system-ui}.ad-keyboard-head b{color:#f3f7f8;font-size:15px}
.ad-keyboard-row{width:min(720px,100%);margin:5px auto;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}.ad-key{min-width:0;min-height:54px;border:1px solid rgba(255,255,255,.15);border-radius:11px;background:#20343b;color:#f3f7f8;font:900 24px/1 system-ui;box-shadow:inset 0 1px rgba(255,255,255,.05);touch-action:manipulation}
.ad-key:active{transform:scale(.96);background:#2b4a54}.ad-keyboard-controls{width:min(720px,100%);margin:7px auto 0;display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;gap:6px}.ad-key.control{font-size:16px;min-height:52px}.ad-key.space{letter-spacing:.04em}
body.ad-keyboard-open{padding-bottom:calc(var(--ad-keyboard-height,300px) + 12px)!important}
@media(max-width:380px){.ad-keyboard-row{gap:4px}.ad-key{min-height:50px;font-size:22px}.ad-keyboard-controls{grid-template-columns:1.5fr 1fr 1fr 1fr}}
`;
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
function ensure(){if(root)return root;root=document.createElement('section');root.className='ad-keyboard';root.setAttribute('aria-label','Teclado Adrián');document.body.appendChild(root);return root;}
function chunks(s,n=7){const a=[];for(let i=0;i<s.length;i+=n)a.push([...s.slice(i,i+n)]);return a;}
function render(){
 const el=ensure(),rows=(layouts[lang]||layouts.en).flatMap(x=>chunks(x));
 el.innerHTML='<div class="ad-keyboard-head"><b>TECLADO · '+lang.toUpperCase()+'</b><span>Sin sugerencias ni autocorrección</span></div>'+
 rows.map(row=>'<div class="ad-keyboard-row">'+row.map(k=>'<button class="ad-key" type="button" data-char="'+k.replace(/"/g,'&quot;')+'">'+k+'</button>').join('')+'</div>').join('')+
 '<div class="ad-keyboard-controls"><button class="ad-key control space" type="button" data-action="space">ESPACIO</button><button class="ad-key control" type="button" data-action="back">⌫</button><button class="ad-key control" type="button" data-action="next">SIG.</button><button class="ad-key control" type="button" data-action="close">CERRAR</button></div>';
 el.querySelectorAll('[data-char]').forEach(b=>b.onclick=()=>insert(b.dataset.char.toLocaleLowerCase(lang==='ca'?'ca':'en')));
 el.querySelector('[data-action="space"]').onclick=()=>insert(' ');
 el.querySelector('[data-action="back"]').onclick=backspace;
 el.querySelector('[data-action="next"]').onclick=next;
 el.querySelector('[data-action="close"]').onclick=close;
}
function fire(){if(!active)return;active.dispatchEvent(new Event('input',{bubbles:true}));active.dispatchEvent(new Event('change',{bubbles:true}));}
function insert(t){if(!active)return;const s=active.selectionStart??active.value.length,e=active.selectionEnd??s;active.value=active.value.slice(0,s)+t+active.value.slice(e);const p=s+t.length;active.setSelectionRange?.(p,p);fire();active.focus({preventScroll:true});}
function backspace(){if(!active)return;let s=active.selectionStart??active.value.length,e=active.selectionEnd??s;if(s===e&&s>0)s--;active.value=active.value.slice(0,s)+active.value.slice(e);active.setSelectionRange?.(s,s);fire();active.focus({preventScroll:true});}
function next(){const list=[...document.querySelectorAll('[data-ad-keyboard]')].filter(x=>!x.disabled&&x.offsetParent!==null),i=list.indexOf(active);if(i>=0&&i<list.length-1)open(list[i+1]);else close();}
function open(el){active=el;lang=el.dataset.adKeyboard||'en';el.setAttribute('inputmode','none');el.setAttribute('autocomplete','off');el.setAttribute('autocorrect','off');el.setAttribute('autocapitalize','none');el.setAttribute('spellcheck','false');render();root.classList.add('open');document.body.classList.add('ad-keyboard-open');requestAnimationFrame(()=>{const h=root.getBoundingClientRect().height;document.documentElement.style.setProperty('--ad-keyboard-height',h+'px');const tools=document.querySelector('.adrian-tools');if(tools)tools.style.bottom=`calc(${h}px + 12px)`;el.scrollIntoView({block:'center',behavior:'smooth'});});el.focus({preventScroll:true});}
function close(){if(root)root.classList.remove('open');document.body.classList.remove('ad-keyboard-open');document.documentElement.style.removeProperty('--ad-keyboard-height');const tools=document.querySelector('.adrian-tools');if(tools)tools.style.bottom='';active?.blur();active=null;}
function enhance(scope=document){scope.querySelectorAll?.('[data-ad-keyboard]').forEach(el=>{if(el.dataset.adKeyboardReady)return;el.dataset.adKeyboardReady='1';el.setAttribute('inputmode','none');el.addEventListener('focus',()=>open(el));el.addEventListener('pointerdown',()=>setTimeout(()=>open(el),0));});}
const mo=new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)enhance(n)})));
function boot(){enhance(document);mo.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
document.addEventListener('pointerdown',e=>{if(active&&root&&!root.contains(e.target)&&e.target!==active&&!e.target.closest?.('[data-ad-keyboard]'))close();},true);
window.AdrianKeyboard={enhance,open,close};
})();