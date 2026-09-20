(function(){
  if(window.__ADRIAN_HUB_NAV__)return;
  window.__ADRIAN_HUB_NAV__=true;
  const href='https://adrianxds-ads.github.io/adrian-hub/';
  const style=document.createElement('style');
  style.textContent='.adrian-hub-nav{position:fixed;left:max(10px,env(safe-area-inset-left));bottom:max(10px,env(safe-area-inset-bottom));z-index:2147483000;display:inline-flex;align-items:center;gap:6px;min-height:38px;padding:0 11px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(9,17,20,.86);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 8px 24px rgba(0,0,0,.28);color:#f3f7f8!important;text-decoration:none!important;font:800 11px/1 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.08em;text-transform:uppercase;opacity:.78;transition:opacity .15s ease,transform .15s ease}.adrian-hub-nav:hover,.adrian-hub-nav:focus-visible{opacity:1;transform:translateY(-1px)}.adrian-hub-nav:active{transform:scale(.97)}.adrian-hub-nav__icon{font-size:15px;line-height:1;letter-spacing:0}@media(max-width:420px){.adrian-hub-nav{padding:0 10px}.adrian-hub-nav__label{display:none}}';
  document.head.appendChild(style);
  const link=document.createElement('a');
  link.className='adrian-hub-nav';
  link.href=href;
  link.setAttribute('aria-label','Volver a Adrián Hub');
  link.innerHTML='<span class="adrian-hub-nav__icon" aria-hidden="true">⌂</span><span class="adrian-hub-nav__label">Hub</span>';
  document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(link),{once:true});
  if(document.body)document.body.appendChild(link);
})();