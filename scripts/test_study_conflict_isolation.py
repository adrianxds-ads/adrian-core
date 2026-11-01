"""Study-app conflict regression: synthetic snapshots, mocked HTTP, disposable browser."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
CORE=(Path(__file__).resolve().parents[1]/'components'/'adrian-sync.js').read_text('utf-8')
BASE='https://adrianxds-ads.github.io'
URL=BASE+'/b2-multiple-choice-cloze/qa-sync'
END='https://adrin.tail8fd071.ts.net/hub-sync'
CLOZE='adaptive_b2_cloze_campaign1_v1'
OTHER='adaptive_english_campaign1_v1'
def obj(s,a):
 return json.dumps(dict(schemaVersion=1,campaignId='test',sessions=s,totalAttempts=a,level=s+25,history=[],sessionHistory=[]))
def test(browser):
 ctx=browser.new_context(service_workers='block'); posts=[]; errors=[]
 local=obj(130,1750); remote=obj(122,1864); grammar=obj(477,7494)
 def route(r):
  u=r.request.url
  if u==URL:return r.fulfill(status=200,content_type='text/html',body='<html><body><div id="gameScreen"></div></body></html>')
  if u.startswith(END+'/changes?'):
   entries={CLOZE:dict(value=remote,deleted=False,revision=1201,updatedAt=1793507009535),
     OTHER:dict(value=grammar,deleted=False,revision=1179,updatedAt=1793507009535)}
   return r.fulfill(status=200,content_type='application/json',body=json.dumps(dict(revision=1201,entries=entries)))
  if u==END+'/sync':
   data=json.loads(r.request.post_data);posts.append(data)
   assert set(data['changes'])=={CLOZE},set(data['changes'])
   return r.fulfill(status=200,content_type='application/json',
    body=json.dumps(dict(revision=1201,acceptedKeys=[],accepted=0,conflictKeys=[CLOZE])))
  return r.abort()
 ctx.route('**/*',route)
 p=ctx.new_page();p.on('pageerror',lambda e:errors.append(str(e)))
 p.goto(URL)
 p.evaluate("""q=>{
  localStorage.setItem(q.c,q.local);
  localStorage.setItem(q.o,q.grammar);
  localStorage.setItem('adrian_sync_reconciled_102','1');
  localStorage.setItem('adrian_sync_baselines_107','1');
  localStorage.setItem('adrian_sync_meta_v1',JSON.stringify({
   revision:1200,deviceId:'synthetic',times:{[q.c]:1793507099535,[q.o]:1793507099535},
   baseRevisions:{[q.c]:1154,[q.o]:1143},pending:{
    [q.c]:{value:q.local,updatedAt:1793507099535,baseRevision:1154,deleted:false},
    [q.o]:{value:q.grammar,updatedAt:1793507099535,baseRevision:1143,deleted:false}
   }}));
 }""",dict(c=CLOZE,o=OTHER,local=local,grammar=grammar))
 p.add_script_tag(content=CORE)
 p.wait_for_function('window.AdrianSync?.baselineChecked?.()===true',timeout=9000)
 p.evaluate('AdrianSync.flush()')
 p.wait_for_function("""()=>JSON.parse(localStorage.getItem('adrian_sync_meta_v1')).pending.adaptive_b2_cloze_campaign1_v1.held===true""",timeout=9000)
 meta=p.evaluate("JSON.parse(localStorage.getItem('adrian_sync_meta_v1'))")
 assert meta['pending'][OTHER]['value']==grammar,'Unrelated Grammar queue overwritten'
 assert p.evaluate("localStorage.getItem('adaptive_b2_cloze_campaign1_v1')")==local,'Local Cloze save overwritten'
 assert p.evaluate("document.getElementById('adrianSyncStatus')")==None,'Conflict badge remains on quiz'
 assert len(posts)==1,posts
 p.evaluate('AdrianSync.flush()')
 p.wait_for_timeout(150)
 assert len(posts)==1,'Repeated network posting of a held branch'
 p.evaluate("""raw=>localStorage.setItem('adaptive_b2_cloze_campaign1_v1',raw)""",obj(130,1751))
 assert p.evaluate("JSON.parse(localStorage.getItem('adrian_sync_meta_v1')).pending.adaptive_b2_cloze_campaign1_v1.held") is True
 assert len(posts)==1
 p.evaluate("""raw=>localStorage.setItem('adaptive_b2_cloze_campaign1_v1',raw)""",obj(131,1770))
 assert p.evaluate("JSON.parse(localStorage.getItem('adrian_sync_meta_v1')).pending.adaptive_b2_cloze_campaign1_v1.held")==None
 p.evaluate('AdrianSync.flush()')
 p.wait_for_timeout(150)
 assert len(posts)==2,'New completed study session was not retried once'
 assert p.evaluate("JSON.parse(localStorage.getItem('adrian_sync_meta_v1')).pending.adaptive_b2_cloze_campaign1_v1.held") is True
 assert not errors,errors
 print('PASS: Cloze only sends own campaign; Grammar pending intact; rejected state held; no repeated badge/posts; new session wakes sync',flush=True)
 ctx.close()
with sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path=r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',headless=True)
 test(browser)
 browser.close()
