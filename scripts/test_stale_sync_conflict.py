"""Regression tests for stale-base reconciliation. Synthetic only; all requests intercepted."""
import json
from pathlib import Path
from urllib.parse import parse_qs,urlparse
from playwright.sync_api import sync_playwright
SOURCE=(Path(__file__).resolve().parents[1]/'components'/'adrian-sync.js').read_text(encoding='utf-8')
KEY='adaptive_phrasal_verbs_v1'
URL='https://adrianxds-ads.github.io/qa-sync'
END='https://adrin.tail8fd071.ts.net/hub-sync'
def state(sessions,answers):
 return json.dumps({'level':sessions+1,'sessions':sessions,'answers':answers,'studySec':sessions*70,'history':[]},separators=(',',':'))
def scenario(browser,name,local,remote,expected,base=1150):
 ctx=browser.new_context(service_workers='block')
 calls=[];errors=[]
 def route(r):
  u=r.request.url
  if u==URL:return r.fulfill(status=200,content_type='text/html',body='<html><body><main>QA</main></body></html>')
  if u.startswith(END+'/changes?'):
   entries={KEY:dict(value=remote,deleted=False,updatedAt=2000,revision=1151)}
   return r.fulfill(status=200,content_type='application/json',body=json.dumps(dict(revision=1151,entries=entries)))
  if u==END+'/sync':
   data=json.loads(r.request.post_data)
   calls.append(data)
   rows=data['changes']
   ok=rows.get(KEY,{}).get('baseRevision')==1151 and name=='rebase_larger_valid_local'
   return r.fulfill(status=200,content_type='application/json',body=json.dumps(dict(revision=1152 if ok else 1151,acceptedKeys=[KEY] if ok else [],accepted=int(ok),conflictKeys=[] if ok else [KEY])))
  return r.abort()
 ctx.route('**/*',route)
 p=ctx.new_page()
 p.on('pageerror',lambda e:errors.append(str(e)))
 p.goto(URL)
 p.evaluate("""arg=>{
  const KEY='adaptive_phrasal_verbs_v1';
  localStorage.setItem(KEY,arg.local);
  localStorage.setItem('adrian_sync_reconciled_102','1');
  localStorage.setItem('adrian_sync_baselines_107','1');
  const pending={};pending[KEY]={value:arg.local,deleted:false,updatedAt:1500,baseRevision:arg.base};
  localStorage.setItem('adrian_sync_meta_v1',JSON.stringify({revision:1150,baseRevisions:{[KEY]:arg.base},times:{[KEY]:1500},deviceId:'qa-device',pending}));
  sessionStorage.setItem('adrian_sync_reloaded_revision_110','1151');
 }""",{'local':local,'base':base})
 p.add_script_tag(content=SOURCE)
 p.wait_for_function('AdrianSync?.baselineChecked?.()===true',timeout=10000)
 p.wait_for_timeout(180)
 actual=p.evaluate("localStorage.getItem('adaptive_phrasal_verbs_v1')")
 assert actual==expected,(name,'wrong authoritative data',json.loads(actual))
 pending=p.evaluate("JSON.parse(localStorage.getItem('adrian_sync_meta_v1')).pending")
 if name=='discard_one_test_session':
  assert KEY not in pending,(name,'residual not discarded',pending)
  assert not calls,(name,'residual was uploaded')
 else:
  assert KEY in pending,(name,'pending valid local disappeared')
  assert pending[KEY]['baseRevision']==1151,(name,'stale base not rebased',pending)
  assert pending[KEY]['value']==local,(name,'real progress modified')
  p.evaluate('AdrianSync.flush()')
  p.wait_for_function("!Object.hasOwn(JSON.parse(localStorage.getItem('adrian_sync_meta_v1')).pending,'adaptive_phrasal_verbs_v1')",timeout=8000)
  assert calls and calls[0]['changes'][KEY]['baseRevision']==1151,(name,calls)
 assert not errors,(name,errors)
 print('PASS',name,flush=True)
 ctx.close()
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',headless=True)
 scenario(browser,'discard_one_test_session',state(54,610),state(53,595),state(53,595))
 scenario(browser,'rebase_larger_valid_local',state(58,660),state(53,595),state(58,660))
 browser.close()
print('STALE_CONFLICT_REGRESSIONS_PASS')
