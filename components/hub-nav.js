(function(){
if(window.__ADRIAN_HUB_NAV__)return;window.__ADRIAN_HUB_NAV__=true;
const HUB='https://adrianxds-ads.github.io/adrian-hub/',KEY='adrian_readable_large_v1';
const css=`
.adrian-tools{position:fixed;left:max(10px,env(safe-area-inset-left));bottom:max(10px,env(safe-area-inset-bottom));z-index:2147483000;display:flex;gap:7px;align-items:center}
.adrian-hub-nav,.adrian-text-toggle{min-height:44px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(9,17,20,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 8px 24px rgba(0,0,0,.28);color:#f3f7f8!important;font:850 14px/1 system-ui,-apple-system,"Segoe UI",sans-serif;text-decoration:none!important}
.adrian-hub-nav{display:inline-flex;align-items:center;gap:7px;padding:0 14px}.adrian-text-toggle{min-width:50px;padding:0 12px;cursor:pointer}
.adrian-text-toggle[aria-pressed="true"]{background:#4AA7C8;color:#071014!important;border-color:#96CCDF}
.adrian-hub-nav:hover,.adrian-hub-nav:focus-visible,.adrian-text-toggle:hover,.adrian-text-toggle:focus-visible{filter:brightness(1.12)}
:where(.meta,.footerline,.chartmeta,.kicker,.eyebrow,.app-footer,.badge,.history-meta,.live,.metric span,.stat span,.zone span,.zone small,.paper-title span,.timer span){font-size:max(14px,.88em)!important;line-height:1.35!important}
html[data-adrian-text="large"] :where(.meta,.footerline,.chartmeta,.kicker,.eyebrow,.app-footer,.badge,.history-meta,.live,.metric span,.stat span,.zone span,.zone small,.paper-title span,.timer span,small){font-size:max(16px,.96em)!important;line-height:1.45!important}
html[data-adrian-text="large"] :where(.subtitle,.intro,.sub,.statusbox,.assessment,.objective,.tasktext,.rowcopy small,.uploadcard small,.secondary,.lede,.small,.message,.answer-note,.review-item p){font-size:max(18px,1em)!important;line-height:1.55!important}
html[data-adrian-text="large"] :where(button:not(.option):not(.gap-choice),select,input:not(.inline-input):not(.transform-input),textarea){font-size:max(17px,1em)!important}
html[data-adrian-text="large"] :where(#startScreen,#statsScreen,#coachScreen,#endScreen,#errorsScreen,#home,#study,#flash,#setup,#conflicts,#statistics,#results) :where(p,small,label,summary,.meta,.note,.position,.footerline,.card span,.menu-btn span,.peer-box,.section h3,.progress-label span,.mode span){font-size:clamp(17px,4.2vw,20px)!important;line-height:1.5!important}
@media(max-width:420px){.adrian-hub-nav__label{display:none}.adrian-hub-nav{padding:0 13px}}
`;
const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
let large;try{const v=localStorage.getItem(KEY);large=v===null?true:v==='1';}catch(e){large=true;}
function apply(){document.documentElement.dataset.adrianText=large?'large':'normal';const b=document.querySelector('.adrian-text-toggle');if(b){b.setAttribute('aria-pressed',String(large));b.textContent=large?'A−':'A+';b.title=large?'Texto grande activado':'Aumentar texto';}}
function mount(){if(document.querySelector('.adrian-tools'))return;const box=document.createElement('div');box.className='adrian-tools';const onHub=location.hostname==='adrianxds-ads.github.io'&&location.pathname.startsWith('/adrian-hub');box.innerHTML=(onHub?'':'<a class="adrian-hub-nav" href="'+HUB+'" aria-label="Volver a Adrián Hub"><span aria-hidden="true">⌂</span><span class="adrian-hub-nav__label">Hub</span></a>')+'<button class="adrian-text-toggle" type="button" aria-label="Cambiar tamaño de texto">A+</button>';document.body.appendChild(box);box.querySelector('.adrian-text-toggle').onclick=()=>{large=!large;try{localStorage.setItem(KEY,large?'1':'0');}catch(e){}apply();};apply();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
apply();
})();