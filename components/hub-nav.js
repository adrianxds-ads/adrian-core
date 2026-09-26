(function(){
  if(window.__ADRIAN_HUB_NAV__)return;
  window.__ADRIAN_HUB_NAV__=true;

  const HUB_URL='https://adrianxds-ads.github.io/adrian-hub/';
  const CHATGPT_DEFAULT=HUB_URL+'chatgpt.html';
  const READ_KEY='adrian_readable_large_v1';
  const CHATGPT_KEY='adrian_chatgpt_hub_url';
  const TECH_SCHEMA='ADRIAN_TECH_HANDOFF_V1';
  const TECH_VERSION='1.0';
  const recentErrors=[];

  const css=`
  .adrian-tools{position:sticky;top:0;left:0;z-index:2147483000;box-sizing:border-box;width:100%;min-height:52px;display:flex;gap:8px;align-items:center;justify-content:flex-start;padding:max(6px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) 6px max(10px,env(safe-area-inset-left));background:linear-gradient(180deg,rgba(8,16,19,.97),rgba(8,16,19,.90));border-bottom:1px solid rgba(255,255,255,.10);box-shadow:0 6px 18px rgba(0,0,0,.18);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
  .adrian-hub-nav,.adrian-text-toggle,.adrian-tech-button{min-height:44px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(9,17,20,.92);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 8px 24px rgba(0,0,0,.28);color:#f3f7f8!important;font:850 14px/1 system-ui,-apple-system,"Segoe UI",sans-serif;text-decoration:none!important}
  .adrian-hub-nav{display:inline-flex;align-items:center;gap:7px;padding:0 14px}.adrian-text-toggle,.adrian-tech-button{min-width:50px;padding:0 12px;cursor:pointer}
  .adrian-text-toggle[aria-pressed="true"]{background:#4AA7C8;color:#071014!important;border-color:#96CCDF}
  .adrian-tech-button{border-color:rgba(231,191,87,.48);color:#F1DA9E!important}.adrian-tech-button.copied{background:#E7BF57;color:#191307!important;border-color:#E7BF57}
  .adrian-hub-nav:hover,.adrian-hub-nav:focus-visible,.adrian-text-toggle:hover,.adrian-text-toggle:focus-visible,.adrian-tech-button:hover,.adrian-tech-button:focus-visible{filter:brightness(1.12)}
  :where(.meta,.footerline,.chartmeta,.kicker,.eyebrow,.app-footer,.badge,.history-meta,.live,.metric span,.stat span,.zone span,.zone small,.paper-title span,.timer span){font-size:max(14px,.88em)!important;line-height:1.35!important}
  html[data-adrian-text="large"] :where(.meta,.footerline,.chartmeta,.kicker,.eyebrow,.app-footer,.badge,.history-meta,.live,.metric span,.stat span,.zone span,.zone small,.paper-title span,.timer span,small){font-size:max(16px,.96em)!important;line-height:1.45!important}
  html[data-adrian-text="large"] :where(.subtitle,.intro,.sub,.statusbox,.assessment,.objective,.tasktext,.rowcopy small,.uploadcard small,.secondary,.lede,.small,.message,.answer-note,.review-item p){font-size:max(18px,1em)!important;line-height:1.55!important}
  html[data-adrian-text="large"] :where(button:not(.option):not(.gap-choice),select,input:not(.inline-input):not(.transform-input),textarea){font-size:max(17px,1em)!important}
  html[data-adrian-text="large"] :where(#startScreen,#statsScreen,#coachScreen,#endScreen,#errorsScreen,#home,#study,#flash,#setup,#conflicts,#statistics,#results) :where(p,small,label,summary,.meta,.note,.position,.footerline,.card span,.menu-btn span,.peer-box,.section h3,.progress-label span,.mode span){font-size:clamp(17px,4.2vw,20px)!important;line-height:1.5!important}
  @media(max-width:420px){.adrian-hub-nav__label{display:none}.adrian-hub-nav{padding:0 13px}.adrian-tech-button{min-width:46px;padding:0 10px}}
  `;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);

  function rememberError(entry){
    recentErrors.push({...entry,ts:new Date().toISOString()});
    if(recentErrors.length>8)recentErrors.shift();
  }
  window.addEventListener('error',e=>rememberError({type:'error',message:String(e.message||'Unknown error'),source:e.filename?new URL(e.filename,location.href).pathname:null,line:e.lineno||null,column:e.colno||null}));
  window.addEventListener('unhandledrejection',e=>rememberError({type:'unhandledrejection',message:String(e.reason?.message||e.reason||'Unhandled rejection')}));

  let large;
  try{const v=localStorage.getItem(READ_KEY);large=v===null?true:v==='1';}catch(e){large=true;}
  function applyReadability(){
    document.documentElement.dataset.adrianText=large?'large':'normal';
    const b=document.querySelector('.adrian-text-toggle');
    if(b){b.setAttribute('aria-pressed',String(large));b.textContent=large?'A−':'A+';b.title=large?'Texto grande activado':'Aumentar texto';}
  }

  function detectedAppId(){
    const p=location.pathname.toLowerCase();
    if(p.startsWith('/adaptive-english'))return 'english';
    if(p.startsWith('/adaptive-phrasal-verbs'))return 'phrasal-verbs';
    if(p.startsWith('/b2-multiple-choice-cloze'))return 'b2-cloze';
    if(p.startsWith('/adaptive-exam'))return 'cambridge';
    if(p.startsWith('/adaptive-verbs-catala'))return 'catala';
    if(p.startsWith('/adaptive-hoti0108'))return 'hoti0108';
    if(p.startsWith('/adrian-hub/apps/entrenamiento'))return 'entrenamiento';
    if(p.startsWith('/adrian-hub/apps/dc-inbox'))return 'dcinbox';
    if(p.startsWith('/adrian-hub'))return 'hub';
    if(p.startsWith('/limpieza'))return 'limpieza';
    return 'unknown';
  }
  function chatgptUrl(){
    const onHub=location.hostname==='adrianxds-ads.github.io'&&location.pathname.startsWith('/adrian-hub');
    if(onHub){try{const saved=localStorage.getItem(CHATGPT_KEY);if(saved&&/^https:\/\/chatgpt\.com\//i.test(saved))return saved;}catch(e){}}
    return CHATGPT_DEFAULT;
  }
  function setChatgptUrl(url){
    if(!/^https:\/\/chatgpt\.com\//i.test(String(url||'')))return false;
    try{localStorage.setItem(CHATGPT_KEY,String(url));return true;}catch(e){return false;}
  }
  async function registryProfile(){
    const id=detectedAppId();
    const fallback={
      hub:{id:'hub',name:'Adrián Hub',group:'Sistema',kind:'pwa-hub',url:HUB_URL,repo:'https://github.com/adrianxds-ads/adrian-hub'},
      english:{id:'english',name:'Adaptive English',group:'Estudio',kind:'pwa-study',url:'https://adrianxds-ads.github.io/adaptive-english/',repo:'https://github.com/adrianxds-ads/adaptive-english'},
      'phrasal-verbs':{id:'phrasal-verbs',name:'Phrasal Verbs',group:'Estudio',kind:'pwa-study',url:'https://adrianxds-ads.github.io/adaptive-phrasal-verbs/',repo:'https://github.com/adrianxds-ads/adaptive-phrasal-verbs'},
      'b2-cloze':{id:'b2-cloze',name:'B2 Multiple-Choice Cloze',group:'Estudio',kind:'pwa-study',url:'https://adrianxds-ads.github.io/b2-multiple-choice-cloze/',repo:'https://github.com/adrianxds-ads/b2-multiple-choice-cloze'},
      cambridge:{id:'cambridge',name:'Cambridge B2',group:'Estudio',kind:'pwa-exam',url:'https://adrianxds-ads.github.io/adaptive-exam/',repo:'https://github.com/adrianxds-ads/adaptive-exam'},
      catala:{id:'catala',name:'Català · Verbs',group:'Estudio',kind:'pwa-study',url:'https://adrianxds-ads.github.io/adaptive-verbs-catala/',repo:'https://github.com/adrianxds-ads/adaptive-verbs-catala'},
      hoti0108:{id:'hoti0108',name:'HOTI0108',group:'Estudio',kind:'pwa-study',url:'https://adrianxds-ads.github.io/adaptive-hoti0108/',repo:'https://github.com/adrianxds-ads/adaptive-hoti0108'},
      entrenamiento:{id:'entrenamiento',name:'Entrenamiento 2.0',group:'Salud',kind:'hub-module',url:HUB_URL+'apps/entrenamiento/'},
      dcinbox:{id:'dcinbox',name:'DC Inbox',group:'Sistema',kind:'hub-module',url:HUB_URL+'apps/dc-inbox/'},
      limpieza:{id:'limpieza',name:'Limpieza 2.2',group:'Hogar',kind:'private-pwa',url:location.origin+'/limpieza/',repo:'https://github.com/adrianxds-ads/limpieza-2.0'}
    };
    if(id==='hub')return fallback.hub;
    try{
      const r=await fetch(HUB_URL+'apps.json',{cache:'no-store'});
      if(r.ok){const j=await r.json();const hit=(j.apps||[]).find(x=>x.id===id);if(hit)return hit;}
    }catch(e){}
    return fallback[id]||{id,name:document.title||id,kind:'unknown',url:location.origin+location.pathname};
  }
  async function githubHead(repo){
    const m=String(repo||'').match(/^https:\/\/github\.com\/([^/]+)\/([^/#?]+)/i);if(!m)return null;
    try{const r=await fetch('https://api.github.com/repos/'+m[1]+'/'+m[2]+'/commits/main',{headers:{Accept:'application/vnd.github+json'},cache:'no-store'});if(!r.ok)return {available:false,httpStatus:r.status};const j=await r.json();return {available:true,sha:j.sha?.slice(0,12)||null,message:j.commit?.message?.split('\\n')[0]||null,date:j.commit?.committer?.date||null};}catch(e){return {available:false,error:String(e?.message||e)};}
  }
  async function swInfo(){
    const out={supported:'serviceWorker' in navigator,controlled:!!navigator.serviceWorker?.controller,controllerScript:navigator.serviceWorker?.controller?.scriptURL||null,registrations:[]};
    if(!out.supported)return out;
    try{
      const regs=await navigator.serviceWorker.getRegistrations();
      out.registrations=regs.slice(0,6).map(r=>({scope:r.scope,activeScript:r.active?.scriptURL||null,activeState:r.active?.state||null,waitingScript:r.waiting?.scriptURL||null}));
    }catch(e){out.error=String(e?.message||e);}
    return out;
  }
  function resourceSummary(){
    return performance.getEntriesByType('resource').map(x=>x.name).filter(u=>/\.(js|css|json)(\?|$)/i.test(u)).slice(-40).map(u=>{
      try{const x=new URL(u,location.href);return x.origin===location.origin?x.pathname+x.search:u;}catch(e){return u;}
    });
  }
  function storageKeys(){
    try{return Array.from({length:localStorage.length},(_,i)=>localStorage.key(i)).filter(Boolean).sort().slice(0,80);}catch(e){return [];}
  }
  function buildLabel(){
    const candidates=['#buildVersion','#releaseInfo','.version','.build-version'];
    for(const s of candidates){const el=document.querySelector(s);const t=el?.textContent?.trim();if(t)return t.slice(0,180);}
    return null;
  }
  async function technicalPayload(){
    const profile=await registryProfile();
    let custom=null;
    try{if(typeof window.AdrianTechnicalContext==='function')custom=await window.AdrianTechnicalContext();}catch(e){custom={providerError:String(e?.message||e)};}
    const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
    return {
      schema:TECH_SCHEMA,
      task:'diagnose_or_modify_app',
      note:'Technical handoff only. Learning content, answers and progress history are intentionally excluded.',
      generatedAt:new Date().toISOString(),
      bridgeVersion:TECH_VERSION,
      app:{
        id:profile.id||detectedAppId(),
        name:profile.name||document.title||'Unknown app',
        kind:profile.kind||profile.group||null,
        repo:profile.repo||null,
        publicUrl:profile.url||null,
        currentUrl:location.href,
        title:document.title,
        buildLabel:buildLabel(),
        gitMain:await githubHead(profile.repo)
      },
      core:{
        visualSystemVersion:window.ADRIAN_VISUAL_SYSTEM?.version||null,
        readabilityMode:document.documentElement.dataset.adrianText||null,
        hubUrl:HUB_URL,
        chatgptProjectLinkConfigured:chatgptUrl()!==CHATGPT_DEFAULT
      },
      runtime:{
        online:navigator.onLine,
        visibility:document.visibilityState,
        standalone,
        viewport:{width:innerWidth,height:innerHeight},
        screen:{width:screen.width,height:screen.height,availWidth:screen.availWidth,availHeight:screen.availHeight},
        devicePixelRatio:devicePixelRatio,
        orientation:screen.orientation?.type||null,
        language:navigator.language,
        platform:navigator.userAgentData?.platform||navigator.platform||null,
        userAgent:navigator.userAgent
      },
      pwa:await swInfo(),
      ui:{
        buttons:document.querySelectorAll('button').length,
        inputs:document.querySelectorAll('input,textarea,select').length,
        scripts:document.scripts.length,
        stylesheets:document.styleSheets.length
      },
      assets:resourceSummary(),
      storage:{keyCount:storageKeys().length,keyNames:storageKeys()},
      recentErrors:[...recentErrors],
      appTechnicalContext:custom
    };
  }
  async function writeClipboard(text){
    try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(text);return true;}}catch(e){}
    try{const t=document.createElement('textarea');t.value=text;t.readOnly=true;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();const ok=document.execCommand('copy');t.remove();return !!ok;}catch(e){return false;}
  }
  async function copyTechnicalJson(){
    const payload=await technicalPayload();
    const text=JSON.stringify(payload,null,2);
    const ok=await writeClipboard(text);
    return {ok,text,payload};
  }
  async function copyTechnicalAndOpen(){
    const dest=chatgptUrl();
    const popup=window.open(dest,'_blank','noopener');
    const result=await copyTechnicalJson();
    const b=document.querySelector('.adrian-tech-button');
    if(b){
      const old=b.textContent;
      b.textContent=result.ok?'✓':'!';
      b.classList.toggle('copied',result.ok);
      setTimeout(()=>{b.textContent=old;b.classList.remove('copied');},1600);
    }
    if(!popup&&result.ok)location.href=dest;
    return result;
  }
  function openChatgptHub(){window.open(chatgptUrl(),'_blank','noopener');}

  window.AdrianTech={
    schema:TECH_SCHEMA,
    version:TECH_VERSION,
    technicalPayload,
    copyTechnicalJson,
    copyTechnicalAndOpen,
    openChatgptHub,
    getChatGPTProjectUrl:chatgptUrl,
    setChatGPTProjectUrl:setChatgptUrl
  };

  function mount(){
    if(document.querySelector('.adrian-tools'))return;
    const box=document.createElement('div');box.className='adrian-tools';
    const onHub=location.hostname==='adrianxds-ads.github.io'&&location.pathname.startsWith('/adrian-hub');
    box.innerHTML=(onHub?'':'<a class="adrian-hub-nav" href="'+HUB_URL+'" aria-label="Volver a Adrián Hub"><span aria-hidden="true">⌂</span><span class="adrian-hub-nav__label">Hub</span></a>')+
      '<button class="adrian-text-toggle" type="button" aria-label="Cambiar tamaño de texto">A+</button>'+
      '<button class="adrian-tech-button" type="button" aria-label="Copiar JSON técnico y abrir ChatGPT Hub" title="Copiar JSON técnico → ChatGPT Hub">JSON</button>';
    document.body.appendChild(box);
    box.querySelector('.adrian-text-toggle').onclick=()=>{large=!large;try{localStorage.setItem(READ_KEY,large?'1':'0');}catch(e){}applyReadability();};
    box.querySelector('.adrian-tech-button').onclick=copyTechnicalAndOpen;
    const status=document.querySelector('#chatgptHubLinkStatus');
    const refreshStatus=()=>{if(status){let saved='';try{saved=localStorage.getItem(CHATGPT_KEY)||'';}catch(e){}status.textContent=/^https:\/\/chatgpt\.com\//i.test(saved)?'Proyecto Hub enlazado · todas las apps usarán este acceso':'Falta vincular una vez la URL exacta del proyecto Hub';}};
    const openBtn=document.querySelector('#openChatgptHubBtn');if(openBtn)openBtn.onclick=openChatgptHub;
    const setBtn=document.querySelector('#setChatgptHubUrlBtn');if(setBtn)setBtn.onclick=()=>{const current=chatgptUrl()===CHATGPT_DEFAULT?'':chatgptUrl();const url=prompt('Pega la URL exacta del proyecto Hub de ChatGPT',current);if(url===null)return;if(setChatgptUrl(url)){refreshStatus();setBtn.textContent='ENLACE GUARDADO';setTimeout(()=>setBtn.textContent='VINCULAR PROYECTO',1400);}else{setBtn.textContent='URL NO VÁLIDA';setTimeout(()=>setBtn.textContent='VINCULAR PROYECTO',1400);}};
    const copyBtn=document.querySelector('#copyHubTechBtn');if(copyBtn)copyBtn.onclick=async()=>{const r=await copyTechnicalJson();copyBtn.textContent=r.ok?'JSON TÉCNICO COPIADO':'NO SE PUDO COPIAR';setTimeout(()=>copyBtn.textContent='COPIAR JSON TÉCNICO',1400);};
    refreshStatus();applyReadability();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  applyReadability();
})();