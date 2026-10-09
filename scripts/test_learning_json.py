"""Isolated learning JSON bridge regression (no real user progress)."""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
MODULE=ROOT/"components"/"adrian-learning-json.js"
NAV=ROOT/"components"/"hub-nav.js"
apps={
 "adaptive-english":("english","adaptive_english_campaign1_v1",{"history":[{"qid":"A","correct":False,"ms":2040,"ts":1000000000001},{"qid":"A","correct":True,"ms":1440,"ts":1000000002001}],"sessionHistory":[{"level":1,"correct":13,"total":15,"ts":1000000003001}]}),
 "adaptive-phrasal-verbs":("phrasal-verbs","adaptive_phrasal_verbs_v1",{"answerHistory":[{"id":"P1","ok":False,"time":3.1,"at":1000000000001}],"history":[{"at":1000000002001,"correct":14,"total":15}]}),
 "adaptive-pizarras":("pizarras","pizarras_state_v1",{"answerHistory":[{"id":"C1","ok":False,"time":3.5,"at":1000000000001}],"history":[{"at":1000000002001,"questions":15,"correct":12}]}),
 "b2-multiple-choice-cloze":("b2-cloze","adaptive_b2_cloze_campaign1_v1",{"history":[{"qid":"B1","correct":False,"ms":2200,"ts":1000000000001}],"sessionHistory":[{"level":1,"total":15,"correct":13}]}),
 "adaptive-exam":("cambridge","cambridgeB2ExerciseStatsV3",{"attempts":[{"id":"ex1","paperId":"p1","part":1,"completedAt":"2026-10-09T10:00:00Z","correct":1,"total":2,"items":[{"question":1,"correct":False,"responseSec":4.2},{"question":2,"correct":True,"responseSec":2.7}]}]}),
 "adaptive-keyword-speaking":("keyword-speaking","keywordSpeakingStatsV1",{"sessions":[{"id":"kw1","completedAt":"2026-10-09T10:00:00Z","correct":28,"total":30,"results":[{"qid":"K1","correct":False,"responseSec":5.8,"at":1000000000001}]}],"items":{"K1":{"attempts":1,"correct":0}}}),
 "adaptive-verbs-catala":("catala","adaptive_verbs_catala_campaign1_v1",{"history":[{"qid":"CA","correct":False,"ms":2400,"ts":1000000000001}],"sessionHistory":[{"level":1,"total":15,"correct":11}]}),
 "adaptive-hoti0108":("hoti0108","adaptive_hoti0108_v1",{"studyGame":{"roundHistory":[{"ts":1000000003001,"timedAnswers":[{"id":"H1","kind":"wrong","responseMs":4000,"timestamp":1000000000001}]}]}})
}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe')
 for width in (390,1280):
  context=browser.new_context(viewport={"width":width,"height":844},permissions=[])
  for slug,(app,key,data) in apps.items():
   page=context.new_page()
   page.route("**/*",lambda r:r.fulfill(status=200,content_type="text/html",body="<html><head></head><body><main></main></body></html>"))
   page.goto(f"https://adrianxds-ads.github.io/{slug}/")
   page.evaluate("([key,value])=>localStorage.setItem(key,JSON.stringify(value))",[key,data])
   page.add_script_tag(path=str(MODULE))
   payload=page.evaluate("async()=>await AdrianLearningJSON.build('last_error')")
   assert payload["app"]["id"]==app,(slug,payload)
   assert payload["attempt"] and (payload["attempt"].get("correct",payload["attempt"].get("ok")) is False or payload["attempt"].get("kind")=="wrong"),(slug,payload)
   assert payload["answerTime"]["ms"] is not None,(slug,payload)
   progress=page.evaluate("async()=>await AdrianLearningJSON.build('progress')")
   assert progress["evidence"]["available"],slug
   page.evaluate("()=>AdrianLearningJSON.openPanel()")
   assert page.get_by_role("dialog").is_visible(),slug
   assert page.get_by_role("button",name="Último error").is_visible(),slug
   assert page.evaluate("()=>document.querySelector('.xds-json-panel').getBoundingClientRect().right<=innerWidth+1"),slug
   page.get_by_role("button",name="Cerrar").click()
   assert page.locator("#xds-json-overlay").count()==0,slug
   page.close()
  context.close()
 # History archive dedup and same question with two timestamps.
 context=browser.new_context()
 page=context.new_page()
 page.route("**/*",lambda r:r.fulfill(status=200,content_type="text/html",body="<html><body></body></html>"))
 page.goto("https://adrianxds-ads.github.io/adaptive-english/")
 page.evaluate("([k,v])=>localStorage.setItem(k,JSON.stringify(v))",[apps["adaptive-english"][1],apps["adaptive-english"][2]])
 page.add_script_tag(path=str(MODULE))
 page.evaluate("""async()=>{
  await new Promise((resolve,reject)=>{
   const r=indexedDB.open('xds-learning-history-v1',1);
   r.onupgradeneeded=()=>r.result.createObjectStore('records',{keyPath:'key'});
   r.onsuccess=()=>{const db=r.result,tx=db.transaction('records','readwrite');
    tx.objectStore('records').put({key:'abc',bucket:'adaptive_english_campaign1_v1:answers',
    row:{qid:'A',correct:false,ms:2040,ts:1000000000001}});
    tx.oncomplete=()=>{db.close();resolve()};tx.onerror=reject;};r.onerror=reject;
  })
 }""")
 history=page.evaluate("async()=>await AdrianLearningJSON.build('history')")
 assert len(history["answers"])==2,history["answers"]
 assert history["source"]["archive"]=="ok"
 print("PASS: 8 apps x 2 viewports; latest error, timing, progress, modal; archival dedup")
 browser.close()
