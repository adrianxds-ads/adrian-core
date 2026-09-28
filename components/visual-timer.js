/* Adrián Visual Timer · shared Hub component */
(()=>{"use strict";
const FALLBACK=["#422522","#512927","#632D2A","#762F32","#843729","#904311","#90570C","#8B6B05","#798136","#57965A","#32A48F","#4AA7C8","#7AA5EC","#BB9EF0","#E7BF57"];
const NAMES=["UMBER","MAHOGANY","OXBLOOD","WINE","RUST","COPPER","AMBER","OLIVE","MOSS","EMERALD","TEAL","AZURE","INDIGO","VIOLET","GOLD"];
const ranks=()=>window.ADRIAN_VISUAL_SYSTEM?.ranks||[];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fmt=s=>{s=Math.max(0,Number(s)||0);if(s>=3600){const h=Math.floor(s/3600),m=Math.floor((s%3600)/60);return m?`${h}h ${String(m).padStart(2,"0")}`:`${h}h`;}const m=Math.floor(s/60),r=Math.ceil(s%60);return `${String(m).padStart(2,"0")}:${String(r).padStart(2,"0")}`;};
const scaleLabel=sec=>{sec=Math.max(0,sec);if(sec>=3600){const h=sec/3600;return Number.isInteger(h)?`${h}h`:`${h.toFixed(1)}h`;}if(sec>=60)return String(Math.round(sec/60));return `${Math.round(sec)}s`;};
function ensure(el){
 if(!el)return null;if(el.dataset.avtReady==="1")return el;
 el.classList.add("ad-visual-timer");
 el.innerHTML='<div class="ad-visual-timer__pie"></div><div class="ad-visual-timer__ticks"></div><div class="ad-visual-timer__hand"></div><div class="ad-visual-timer__labels"></div><div class="ad-visual-timer__center"><strong class="ad-visual-timer__time">00:00</strong><span class="ad-visual-timer__caption"></span></div><div class="ad-visual-timer__rank"></div>';
 el.dataset.avtReady="1";return el;
}
function labels(el,total){
 const host=el.querySelector(".ad-visual-timer__labels");if(!host)return;
 if(el.classList.contains("ad-visual-timer--mini")){host.innerHTML="";return;}
 const key=String(Math.round(total));if(host.dataset.total===key)return;host.dataset.total=key;
 host.innerHTML=Array.from({length:12},(_,i)=>{const a=i*30,sec=total*i/12;return `<span class="ad-visual-timer__label" style="--a:${a}deg">${scaleLabel(sec)}</span>`;}).join("");
}
function update(target,opt={}){
 const el=typeof target==="string"?document.querySelector(target):target;if(!ensure(el))return;
 const total=Math.max(.001,Number(opt.total)||1),raw=opt.remaining==null?total:Number(opt.remaining),remaining=clamp(raw,0,total),elapsed=1-remaining/total;
 const shown=Math.max(.006,elapsed),pct=clamp(shown*100,0,100),angle=-90+pct*3.6;
 const rank=elapsed>=.9999?15:clamp(1+Math.floor(Math.pow(elapsed,.65)*14),1,15),data=ranks()[rank-1]||{},name=(data.name||NAMES[rank-1]||`R${rank}`).toUpperCase();
 el.style.setProperty("--avt-progress",pct.toFixed(3));el.style.setProperty("--avt-angle",angle.toFixed(2)+"deg");
 el.querySelector(".ad-visual-timer__time").textContent=opt.text??fmt(remaining);
 el.querySelector(".ad-visual-timer__caption").textContent=opt.label||"";
 el.querySelector(".ad-visual-timer__rank").textContent=`${name} · ${rank}/15`;
 el.classList.toggle("is-paused",!!opt.paused);labels(el,total);
 return {elapsed,rank,color:data.color||FALLBACK[rank-1],name};
}
function mount(target,opt={}){const el=typeof target==="string"?document.querySelector(target):target;if(!ensure(el))return null;if(opt.size)el.classList.add(`ad-visual-timer--${opt.size}`);update(el,opt);return el;}
window.AdrianVisualTimer=Object.freeze({version:"1.0.0",mount,update,format:fmt});
})();