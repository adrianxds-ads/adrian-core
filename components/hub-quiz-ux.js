/* Nucleo UX: retain native yellow segment bars; remove redundant circular clocks. */
(function(){
  "use strict";
  if(window.__NUCLEO_QUIZ_BARS__)return;
  window.__NUCLEO_QUIZ_BARS__=true;
  function mount(){
    const clock=document.getElementById("timerText")||document.getElementById("quizCountdown");
    const timer=document.getElementById("timer")||document.getElementById("quizClock");
    if(!clock||!timer)return;
    const segments=document.getElementById("segments");
    const answers=document.getElementById("answers");
    const question=document.getElementById("questionText");
    const style=document.createElement("style");
    style.id="nucleo-linear-clock-css";
    style.textContent=[
      "#timer.nucleo-clock-hidden{display:none!important}",
      "#segments.nucleo-reading-segments{display:grid!important;grid-template-columns:repeat(60,minmax(0,1fr))!important;gap:2px!important;min-height:12px!important}",
      "#quizClock.nucleo-linear-clock{position:relative!important;inset:auto!important;transform:none!important;flex:1 1 120px!important;display:block!important;width:100%!important;min-width:90px!important;max-width:100%!important;height:14px!important;min-height:14px!important;aspect-ratio:auto!important;margin:6px 0!important;padding:0!important;border:0!important;border-radius:999px!important;background:transparent!important;box-shadow:none!important;overflow:visible!important;animation:none!important}",
      "#quizClock.nucleo-linear-clock::before,#quizClock.nucleo-linear-clock::after{content:none!important;display:none!important}",
      "#quizClock.nucleo-linear-clock > :not(.nucleo-progress){display:none!important}",
      ".nucleo-progress{box-sizing:border-box;position:relative!important;display:block!important;width:100%;height:14px;border-radius:99px;overflow:hidden;border:1px solid #b58c21;background:#dce4e9;box-shadow:inset 0 1px 3px rgba(14,21,27,.2)}",
      ".nucleo-progress-fill{position:absolute;inset:0 auto 0 0;width:0;background:linear-gradient(90deg,#f0ca63,#e7b72c);border-radius:99px;transition:width .22s linear}",
      ".nucleo-progress::after{content:'';position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(90deg,transparent calc(100% - 1px),rgba(37,40,44,.34) calc(100% - 1px));background-size:var(--nucleo-cell,6.6667%) 100%}",
      "#answers.nucleo-soft-reveal .answer{animation:nucleoOptionReveal .22s ease-out both}",
      "@keyframes nucleoOptionReveal{from{opacity:.7;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}",
      "@media(prefers-reduced-motion:reduce){.nucleo-progress-fill{transition:none}#answers.nucleo-soft-reveal .answer{animation:none}}"
    ].join("");
    document.head.appendChild(style);
    let bar=null,fill=null;
    if(segments){
      timer.classList.add("nucleo-clock-hidden");
    }else{
      timer.classList.add("nucleo-linear-clock");
      bar=document.createElement("div");
      bar.className="nucleo-progress";
      bar.setAttribute("role","progressbar");
      bar.setAttribute("aria-label","Progreso del tiempo");
      bar.setAttribute("aria-valuemin","0");
      bar.setAttribute("aria-valuemax","100");
      fill=document.createElement("div");fill.className="nucleo-progress-fill";
      bar.appendChild(fill);timer.appendChild(bar);
    }
    let phase="",questionKey="",started=performance.now();
    let limit=Math.max(1,Math.ceil(Number.parseFloat(clock.textContent)||15));
    function draw(){
      if(document.hidden)return;
      const game=document.getElementById("gameScreen");
      if(game&&(game.classList.contains("hidden")||getComputedStyle(game).display==="none"))return;
      const reading=!!(answers&&(answers.classList.contains("read-first-hidden")||answers.classList.contains("prethink-hidden")));
      const mode=reading?"reading":"answer",key=question?.textContent||"";
      const value=Number.parseFloat(String(clock.textContent).replace(",","."));
      if(mode!==phase||key!==questionKey){
        const revealing=phase==="reading"&&mode==="answer"&&key===questionKey;
        phase=mode;questionKey=key;started=performance.now();
        if(answers){answers.classList.remove("nucleo-soft-reveal");if(revealing){void answers.offsetWidth;answers.classList.add("nucleo-soft-reveal");}}
        if(!reading&&Number.isFinite(value)&&value>0)limit=Math.max(1,Math.ceil(value));
      }
      if(segments){
        if(!reading){segments.classList.remove("nucleo-reading-segments");return;}
        segments.classList.add("seconds-bar","nucleo-reading-segments");
        if(segments.children.length!==60||segments.dataset.secondsTotal!=="60"){
          segments.replaceChildren(...Array.from({length:60},()=>{
            const element=document.createElement("i");element.className="seg";return element;
          }));
          segments.dataset.secondsTotal="60";
          segments.setAttribute("role","progressbar");
          segments.setAttribute("aria-valuemin","0");segments.setAttribute("aria-valuemax","60");
        }
        const elapsed=Math.max(0,Math.min(60,Math.floor((performance.now()-started)/1000)));
        for(let i=0;i<60;i++)segments.children[i].classList.toggle("on",i<elapsed);
        segments.setAttribute("aria-valuenow",String(elapsed));
        segments.setAttribute("aria-valuetext","Lectura previa");
        return;
      }
      if(!bar)return;
      if(!Number.isFinite(value)){bar.hidden=true;return;}
      if(value>limit+.5)limit=Math.ceil(value);
      const pct=Math.min(100,Math.max(0,100*(1-value/Math.max(1,limit))));
      bar.hidden=false;
      bar.style.setProperty("--nucleo-cell",String(100/Math.min(60,Math.round(limit)))+"%");
      fill.style.width=pct.toFixed(2)+"%";
      bar.setAttribute("aria-valuenow",String(Math.round(pct)));
    }
    draw();
    const interval=setInterval(draw,250);
    window.addEventListener("pagehide",()=>clearInterval(interval),{once:true});
    window.NucleoQuizBars={version:"1.1.0",refresh:draw};
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
  else mount();
})();